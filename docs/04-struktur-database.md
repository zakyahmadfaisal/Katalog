# Struktur Database

## Tabel Utama
- `starvision_catalog`
- `lasac_catalog`
- `aoi_provinsi`

## Fungsi Masing-masing Kolom
### `starvision_catalog`
- `gid` - primary key integer.
- `layer` - nama layer citra.
- `satellite` - kode satelit.
- `sensorid` - sensor citra.
- `acq_time` - tanggal akuisisi.
- `cloudperc` - persentase tutupan awan.
- `gsd` - ground sample distance.
- `lon_ctr`, `lat_ctr` - pusat koordinat.
- `url_ql` - URL quicklook.
- `geom` - geometri polygon citra.

### `lasac_catalog`
- `gid` - primary key integer.
- `filename` - nama file citra.
- `satellite` - kode satelit.
- `sensorid` - sensor citra.
- `acquisitio` - tanggal akuisisi.
- `cloudperce` - persentase awan.
- `ul_lon`, `ul_lat`, `lr_lon`, `lr_lat` - batas koordinat citra.
- `img_path` - path quicklook lokal.
- `geom` - geometri polygon citra.

### `aoi_provinsi`
- `provinsi` - nama provinsi.
- `wkb_geometry` - geometri MultiPolygon area provinsi.

## Geometri MultiPolygon
- `geom` pada tabel katalog disimpan sebagai geometri polygon atau multipolygon.
- `wkb_geometry` pada `aoi_provinsi` menyimpan batas provinsi.
- Backend menggunakan `ST_AsGeoJSON(i.geom)` untuk mengembalikan geometri ke frontend.

## Spatial Indexing
- Direkomendasikan: `CREATE INDEX idx_starvision_geom ON starvision_catalog USING GIST (geom);`
- Direkomendasikan: `CREATE INDEX idx_lasac_geom ON lasac_catalog USING GIST (geom);`
- Direkomendasikan: `CREATE INDEX idx_aoi_provinsi_geom ON aoi_provinsi USING GIST (wkb_geometry);`

## BTree Index
- Digunakan untuk kolom non-spasial seperti `satellite`, `layer`, `filename`, `acq_time`.
- Contoh:

```sql
CREATE INDEX idx_starvision_satellite ON starvision_catalog (satellite);
CREATE INDEX idx_starvision_acq_time ON starvision_catalog (acq_time DESC);
```

## Alasan Penggunaan Indexing
- Mengoptimalkan query filter `ST_Intersects` dan bounding box `&& ST_MakeEnvelope(...)`.
- Mengurangi waktu respons pada daftar dan map.
- Menjamin performa saat data bertambah.

## Relasi Data
- Tidak ada relasi foreign key eksplisit di source code.
- Relasi logis adalah `starvision_catalog` / `lasac_catalog` dengan `aoi_provinsi` melalui spatial intersection.

## Optimasi Query Spasial
- Filter provinsi menggunakan `EXISTS (SELECT 1 FROM aoi_provinsi a WHERE ... AND ST_Intersects(...))`.
- Filter bbox menggunakan operator `&&` yang memanfaatkan index GiST.
- Query list dan map dibatasi dengan `LIMIT` dan `OFFSET`.

## Contoh Query SQL Penting
### Query List dengan Filter
```sql
SELECT i.gid, i.layer AS layer_name, i.satellite, i.sensorid AS sensor,
       i.acq_time AS acquisition_date,
       ROUND(CAST(i.cloudperc AS numeric), 0) AS cloud_cover,
       i.gsd, i.lon_ctr, i.lat_ctr, i.url_ql AS quicklook,
       ST_AsGeoJSON(i.geom)::json AS geometry
FROM starvision_catalog i
WHERE i.satellite ILIKE $1
  AND i.layer ILIKE $2
  AND EXISTS (
    SELECT 1
    FROM aoi_provinsi a
    WHERE a.provinsi = $3
      AND ST_Intersects(i.geom, a.wkb_geometry)
  )
  AND i.geom && ST_MakeEnvelope($4, $5, $6, $7, 4326)
ORDER BY i.acq_time DESC
LIMIT $8 OFFSET $9;
```

### Query Provinsi Geometri
```sql
SELECT ST_AsGeoJSON(wkb_geometry) as geometry
FROM aoi_provinsi
WHERE provinsi = $1
LIMIT 1;
```

## Kendala dan Solusi
- Kendala: query provinsi dapat menjadi berat jika ditulis tanpa index.
  - Solusi: operator `&&` dan GiST index memaksimalkan penggunaan spatial index.
- Kendala: offset pagination dapat menyebabkan performa menurun pada page besar.
  - Solusi: page maksimum dibatasi di backend (`page <= 1000`).
