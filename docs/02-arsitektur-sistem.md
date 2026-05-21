# Arsitektur Sistem

## Komponen Utama
- Frontend: `catalog.html`
- Backend API: `Server/app.js`
- Database PostGIS: PostgreSQL dengan ekstensi PostGIS
- GeoServer: publish layer WMS dari PostGIS
- Static Quicklook: folder image yang diakses oleh Express

## Frontend
- Menggunakan Leaflet untuk peta dan overlay.
- Mengelola state lokal pada `STATE` JavaScript.
- Menjalankan request API ke backend untuk data list dan map.
- Menyinkronkan sidebar dengan peta dan panel detail.

## Backend API
- Express melayani endpoint `/api/*`.
- `cors` diatur untuk origin 10.18.170.29.
- Query ke PostgreSQL menggunakan `pg.Pool`.
- Sanitasi input untuk catalog, satellite, bbox, dan pagination.

## Database PostGIS
- Menyimpan katalog citra masing-masing sebagai tabel terpisah.
- Menyimpan geometri area provinsi di `aoi_provinsi`.
- Memanfaatkan fungsi spasial untuk filter provinsi dan bbox.

## Integrasi GeoServer
- GeoServer mempublikasikan layer WMS dari workspace `catalog`.
- Frontend memanggil WMS tile dengan parameter `CQL_FILTER` untuk filter dinamis.
- WMS menayangkan polygon sebagai overlay tile pada peta.

## Komunikasi Antar Komponen
- Frontend → Backend: fetch ke `/api/catalog`, `/api/catalog/map`, `/api/catalog/:id`, `/api/provinces`, `/api/province-geom`.
- Frontend → GeoServer: WMS layer tile dengan `CQL_FILTER`.
- Backend → PostgreSQL: query metadata, geometri, dan daftar provinsi.

## Diagram Arsitektur Sistem

```text
[Browser]                          [GeoServer]
   |                                  |
   |-- GET catalog.html --------------|    
   |-- GET /api/catalog --------------|--> [PostgreSQL/PostGIS]
   |-- GET /api/catalog/map ----------|
   |-- GET /api/catalog/:id ----------|
   |-- GET /api/provinces ------------|
   |-- GET /api/province-geom --------|
   |                                  |
   |<-- WMS Tile / GeoServer Layer ---|
   |                                  |

```

## Alur Request-Response
1. Browser membuka `catalog.html`.
2. Frontend memanggil `/api/provinces` untuk daftar provinsi.
3. Frontend memanggil `/api/catalog/map` dan `/api/catalog` untuk render peta dan daftar awal.
4. Saat zoom/pan, frontend memanggil ulang `/api/catalog/map` dan `/api/catalog` bila region berubah.
5. Saat memilih layer, frontend memanggil `/api/catalog/:id` untuk detail feature.
6. GeoServer menerima permintaan tile WMS dari frontend dan merender layer dengan query filter.

## Kendala dan Solusi
- Kendala komunikasi data spasial antara peta dan list.
  - Solusi: state sinkron seperti `selectedFeatureId`, cache Map, dan event moveend dengan debounce.
- Kendala beban GeoServer saat filter kompleks.
  - Solusi: gunakan `CQL_FILTER` untuk hanya menampilkan layer relevan.
