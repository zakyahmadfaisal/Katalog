# Katalog Citra Satelit BRIN

**Katalog Citra Satelit BRIN** adalah aplikasi Web GIS untuk menampilkan koleksi citra satelit dari katalog STARVISION dan LASAC, dengan integrasi peta, filter provinsi, filter satelit, dan quicklook overlay.

## Deskripsi Singkat
Aplikasi ini menyediakan antarmuka peta interaktif berbasis Leaflet dan backend Node.js/Express yang melayani data GeoJSON dari basis data PostgreSQL/PostGIS. GeoServer digunakan untuk overlay WMS pada layer citra satelit.

## Fitur Utama
- Menampilkan polygon citra satelit pada peta.
- Filter berdasarkan sumber katalog (STARVISION / LASAC).
- Filter berdasarkan satelit tertentu.
- Filter berdasarkan provinsi dan keyword.
- Sinkronisasi list sidebar dengan fitur peta.
- Bounding box filtering saat zoom/pan peta.
- Infinite scroll pagination pada daftar layer.
- Quicklook image overlay pada polygon terpilih.
- Panel detail metadata citra.
- Integrasi WMS GeoServer untuk rendering layer tile.
- Cache frontend untuk meminimalkan permintaan API berulang.

## Arsitektur Sistem Sederhana
- Frontend: `catalog.html` menggunakan Leaflet, Vanilla JS, CSS.
- Backend API: `Server/app.js` dengan Express, PostgreSQL, PostGIS.
- Database: PostgreSQL + PostGIS menyimpan `starvision_catalog`, `lasac_catalog`, dan `aoi_provinsi`.
- GeoServer: menyediakan layer WMS untuk rendering peta tile.

## Tech Stack
- HTML/CSS/Vanilla JavaScript
- Leaflet.js
- Node.js + Express
- PostgreSQL + PostGIS
- GeoServer
- WMS / GeoJSON

## Struktur Folder Project
- `catalog.html` - frontend utama
- `Server/app.js` - backend API server
- `Server/db.js` - konfigurasi koneksi PostgreSQL (modul helper)
- `Server/package.json` - dependensi Node.js
- `.env` - konfigurasi database lokal
- `docs/` - dokumentasi teknis

## Cara Instalasi dan Menjalankan Project
1. Pasang dependency backend:

```bash
cd Server
npm install
```

2. Pastikan PostgreSQL dan PostGIS telah terpasang dan database `catalog` tersedia.
3. Pastikan GeoServer telah terkonfigurasi dan workspace/layer sudah diterbitkan.
4. Sesuaikan file `.env` di root project.
5. Jalankan server API:

```bash
cd Server
node app.js
```

6. Buka `catalog.html` melalui browser atau web server lokal yang mengarah ke root project.


## Endpoint API Utama
- `GET /api/catalog` - daftar fitur GeoJSON dengan pagination dan filter.
- `GET /api/catalog/map` - fitur GeoJSON untuk map dengan filter bbox dan zoom.
- `GET /api/catalog/:id` - detail satu fitur berdasarkan `gid`.
- `GET /api/provinces` - daftar provinsi AOI.
- `GET /api/province-geom` - geometri provinsi untuk zoom.

## Struktur Database Utama
- `starvision_catalog` - katalog STARVISION.
- `lasac_catalog` - katalog LASAC.
- `aoi_provinsi` - area provinsi untuk filter dan geometri.

## Known Issues / Limitation
- `.env` ada tetapi tidak dimuat otomatis oleh `app.js`.
- Static quicklook path di backend masih hardcoded ke `/home/pusdatin/...`.
- CORS hanya mengizinkan origin localhost.
- No unit test untuk API atau frontend.
- Data WMS bergantung pada GeoServer eksternal.

## Future Improvement
- Tambahkan loader `.env` di `Server/app.js`.
- Implementasi authentication untuk API.
- Tambah tes otomatis backend dan integrasi.
- Tambah media query / responsive UI pada `catalog.html`.
- Tambah validasi dan fallback pada layer GeoServer.
- Buat halaman deployment/dokumentasi operasional tambahan.
