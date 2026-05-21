# Deployment

## Setup PostgreSQL/PostGIS
1. Pasang PostgreSQL dan ekstensi PostGIS.
2. Buat database `catalog`.
3. Buat user `api_user` dengan password dari `.env`.
4. Aktifkan ekstensi PostGIS:

```sql
CREATE EXTENSION postgis;
```

5. Buat tabel `starvision_catalog`, `lasac_catalog`, dan `aoi_provinsi`.
6. Impor data geometris ke basis data.

## Setup GeoServer
1. Pasang GeoServer versi stabil.
2. Tambahkan datastore PostGIS dengan koneksi ke database `catalog`.
3. Publish layer:
   - `catalog:shp_merge` untuk STARVISION.
   - `catalog:lasac_catalog` untuk LASAC.
4. Pastikan CRS layer menggunakan EPSG:4326.
5. Konfigurasi WMS tile format `image/png` transparan.

## Setup Node.js Backend
1. Pasang Node.js 18+.
2. Masuk folder `Server`.
3. Jalankan `npm install`.
4. Pastikan `.env` berada di root project.

## Konfigurasi Port
- Backend API ditetapkan di `http://127.0.0.1:3000`.
- Frontend `catalog.html` dapat diakses melalui browser lokal.
- GeoServer biasanya berjalan di `http://10.18.170.29:8082`.

## Struktur Static Quicklook
- API backend menyajikan file static:
  - `/quicklook` pada direktori `/home/pusdatin/StarVision/QUICKLOOK`
  - `/quicklook/lasac` pada `/home/pusdatin/LASAC/Quicklook/JPG`
- Pada deployment Linux, pastikan path tersebut tersedia atau sesuaikan dengan direktori quicklook.

## Deployment Ubuntu/Linux
1. Pasang PostgreSQL, PostGIS, Node.js, dan GeoServer.
2. Perbarui `.env` dengan kredensial database.
3. Pastikan folder quicklook dapat diakses dari server Node.js.
4. Jalankan backend:

```bash
cd /path/to/Katalog/Server
node app.js
```

5. Buka `catalog.html` di browser.

## Cara Menjalankan Service
- Backend:
  - `cd Server`
  - `node app.js`
- Frontend: buka `catalog.html` dari file system atau jalankan web server statis.

## Dependency Project
- Node.js: `express`, `cors`, `pg`, `dotenv`.
- Frontend: `leaflet@1.9.4`.
- Database: `postgresql`, `postgis`.
- GIS: `GeoServer`, `WMS`.

## Kendala dan Solusi
- Kendala: path static quicklook absolute hardcoded.
  - Solusi: gunakan symlink atau konfigurasi path environment di `app.js`.
- Kendala: API terikat ke `127.0.0.1` sehingga hanya dapat diakses lokal.
  - Solusi: untuk akses remote, ubah binding pada `app.listen` dan atur firewall.
- Kendala: `.env` tidak dimuat otomatis.
  - Solusi: tambahkan `require('dotenv').config()` di awal `Server/app.js`.
