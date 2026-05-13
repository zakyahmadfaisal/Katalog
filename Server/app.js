const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`[${req.method}] ${req.originalUrl} - ${Date.now() - start}ms`);
  });
  next();
});

/* =========================
   DATABASE
========================= */
const pool = new Pool({
  user: "api_user",
  host: "localhost",
  database: "catalog",
  password: "123456",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: "*",
  }),
);

/* =========================
   STATIC QUICKLOOK
========================= */
app.use("/quicklook", express.static("/home/pusdatin/StarVision/QUICKLOOK"));
app.use(
  "/quicklook/lasac",
  express.static("/home/pusdatin/LASAC/Quicklook/JPG"),
);

/* =========================
   HELPERS
========================= */
function sanitizeCatalog(catalog) {
  return ["STARVISION", "LASAC"].includes(catalog) ? catalog : "STARVISION";
}

// FIX #1: validasi input satellite — hanya huruf dan angka, max 10 karakter
function sanitizeSatellite(satellite) {
  if (!satellite || satellite === "ALL") return "ALL";
  return /^[A-Za-z0-9]{1,10}$/.test(satellite)
    ? satellite.toUpperCase()
    : "ALL";
}

// FIX #2: validasi bbox — harus 4 angka valid dalam range koordinat
function parseBBox(bboxStr) {
  if (!bboxStr) return null;
  const parts = bboxStr.split(",").map(Number);
  if (parts.length !== 4) return null;
  const [xmin, ymin, xmax, ymax] = parts;
  if (
    parts.some(isNaN) ||
    xmin < -180 ||
    xmax > 180 ||
    ymin < -90 ||
    ymax > 90 ||
    xmin >= xmax ||
    ymin >= ymax
  ) {
    return null;
  }
  return { xmin, ymin, xmax, ymax };
}

function getCatalogConfig(catalog = "STARVISION") {
  // =====================================================
  // STARVISION
  // =====================================================
  if (catalog === "STARVISION") {
    return {
      table: "starvision_catalog",
      selectFields: `
        i.gid,
        i.layer AS layer_name,
        i.satellite,
        i.sensorid AS sensor,
        i.acq_time AS acquisition_date,
        ROUND(CAST(i.cloudperc AS numeric), 0) AS cloud_cover,
        i.gsd,
        i.lon_ctr,
        i.lat_ctr,
        i.url_ql AS quicklook,
        ST_AsGeoJSON(i.geom)::json AS geometry
      `,
      keywordField: "layer",
      orderField: "acq_time",
      geomField: "geom",
    };
  }

  // =====================================================
  // LASAC
  // =====================================================
  return {
    table: "lasac_catalog",
    selectFields: `
      i.gid,
      i.filename AS layer_name,
      i.satellite,
      i.sensorid AS sensor,
      i.acquisitio AS acquisition_date,
      ROUND(CAST(i.cloudperce AS numeric), 0) AS cloud_cover,
      NULL AS gsd,
      ((i.ul_lon + i.lr_lon) / 2) AS lon_ctr,
      ((i.ul_lat + i.lr_lat) / 2) AS lat_ctr,
      REPLACE(
        i.img_path,
        '/home/pusdatin/LASAC/Quicklook/JPG/',
        'http://localhost:3000/quicklook/lasac/'
      ) AS quicklook,
      ST_AsGeoJSON(i.geom)::json AS geometry
    `,
    keywordField: "filename",
    orderField: "acquisitio",
    geomField: "geom",
  };
}

/* =========================
   PROVINCE LIST API
========================= */
app.get("/api/provinces", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT provinsi
      FROM aoi_provinsi
      ORDER BY provinsi
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PROVINCE GEOMETRY API
========================= */
app.get("/api/province-geom", async (req, res) => {
  try {
    const name = req.query.name;

    // FIX #3: validasi nama provinsi tidak boleh kosong
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Parameter name wajib diisi" });
    }

    const result = await pool.query(
      `
      SELECT ST_AsGeoJSON(wkb_geometry) as geometry
      FROM aoi_provinsi
      WHERE provinsi = $1
      LIMIT 1
      `,
      [name.trim()],
    );

    if (!result.rows.length) {
      return res.json({});
    }

    res.json({
      type: "Feature",
      geometry: JSON.parse(result.rows[0].geometry),
      properties: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LIST API
========================= */
app.get("/api/catalog", async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim().toUpperCase();
    const satellite = sanitizeSatellite(req.query.satellite);
    const province = req.query.province || "ALL";
    const bbox = parseBBox(req.query.bbox);
    const catalog = sanitizeCatalog(req.query.catalog);
    const cfg = getCatalogConfig(catalog);

    let page = parseInt(req.query.page) || 0;
    if (page < 0) page = 0;

    let limit = parseInt(req.query.limit) || 50;
    // FIX #4: batasi limit maksimum untuk mencegah request berlebihan
    if (limit < 1 || limit > 500) limit = 50;

    let offset = page * limit;

    let where = [];
    let values = [];

    /* Satellite filter */
    if (satellite !== "ALL") {
      values.push(satellite + "%");
      where.push(`i.satellite ILIKE $${values.length}`);
    }

    /* Keyword filter */
    if (keyword) {
      values.push("%" + keyword + "%");
      where.push(`i.${cfg.keywordField} ILIKE $${values.length}`);
    }

    /* Province AOI filter */
    if (province !== "ALL") {
      values.push(province);
      where.push(`
        EXISTS (
          SELECT 1
          FROM aoi_provinsi a
          WHERE a.provinsi = $${values.length}
          AND ST_Intersects(i.${cfg.geomField}, a.wkb_geometry)
        )
      `);
    }

    /* BBox filter */
    // FIX #5: gunakan parseBBox yang sudah divalidasi
    if (bbox) {
      values.push(bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax);
      where.push(`
        i.${cfg.geomField} && ST_MakeEnvelope(
          $${values.length - 3},
          $${values.length - 2},
          $${values.length - 1},
          $${values.length},
          4326
        )
      `);
    }

    const whereSQL = where.length > 0 ? "WHERE " + where.join(" AND ") : "";

    const sql = `
      SELECT ${cfg.selectFields}
      FROM ${cfg.table} i
      ${whereSQL}
      ORDER BY i.${cfg.orderField} DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    const result = await pool.query(sql, values);

    res.json({
      page,
      limit,
      returned: result.rows.length,
      data: result.rows.map((r) => ({
        type: "Feature",
        properties: r,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   MAP API (BBOX)
========================= */
app.get("/api/catalog/map", async (req, res) => {
  try {
    // FIX #6: bbox wajib ada dan valid untuk endpoint map
    const bbox = parseBBox(req.query.bbox);

    const keyword = (req.query.keyword || "").trim().toUpperCase();
    const satellite = sanitizeSatellite(req.query.satellite);
    const province = req.query.province || "ALL";
    const catalog = sanitizeCatalog(req.query.catalog);
    const cfg = getCatalogConfig(catalog);

    let where = [];
    let values = [];

    // FIX #7: hapus duplikasi destructure — langsung gunakan bbox dari parseBBox
    if (bbox) {
      values.push(bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax);
      where.push(`
        i.${cfg.geomField} && ST_MakeEnvelope(
          $1, $2, $3, $4, 4326
        )
      `);
    }

    /* Satellite filter */
    if (satellite !== "ALL") {
      values.push(satellite + "%");
      where.push(`i.satellite ILIKE $${values.length}`);
    }

    /* Keyword filter */
    if (keyword) {
      values.push("%" + keyword + "%");
      where.push(`i.${cfg.keywordField} ILIKE $${values.length}`);
    }

    /* AOI Province filter */
    if (province !== "ALL") {
      values.push(province);
      where.push(`
        EXISTS (
          SELECT 1
          FROM aoi_provinsi a
          WHERE a.provinsi = $${values.length}
          AND ST_Intersects(i.${cfg.geomField}, a.wkb_geometry)
        )
      `);
    }

    /* Dynamic limit by zoom */
    let zoom = parseInt(req.query.zoom) || 5;
    let limit;
    if (zoom <= 5) {
      limit = 100;
    } else if (zoom <= 8) {
      limit = 300;
    } else {
      limit = 600;
    }

    values.push(limit);

    const sql = `
      SELECT ${cfg.selectFields}
      FROM ${cfg.table} i
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY i.${cfg.orderField} DESC
      LIMIT $${values.length}
    `;

    const result = await pool.query(sql, values);

    const features = result.rows.map((r) => ({
      type: "Feature",
      geometry: r.geometry,
      properties: r,
    }));

    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DETAIL FEATURE API
========================= */
app.get("/api/catalog/:gid", async (req, res) => {
  try {
    const gid = req.params.gid;

    // FIX #8: validasi gid harus berupa angka positif
    if (!gid || !/^\d+$/.test(gid)) {
      return res.status(400).json({ error: "GID tidak valid" });
    }

    const catalog = sanitizeCatalog(req.query.catalog);
    const cfg = getCatalogConfig(catalog);

    const sql = `
      SELECT ${cfg.selectFields}
      FROM ${cfg.table} i
      WHERE i.gid = $1
      LIMIT 1
    `;

    const result = await pool.query(sql, [parseInt(gid)]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Feature not found" });
    }

    const r = result.rows[0];

    res.json({
      type: "Feature",
      geometry: r.geometry,
      properties: r,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
      service: "catalog-api",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message,
    });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("API running on port 3000");
});
