# GeoServer

## Konfigurasi Workspace GeoServer
- Workspace: `catalog`
- Layer STARVISION: `catalog:shp_merge`
- Layer LASAC: `catalog:lasac_catalog`
- Format: WMS `image/png` transparan.

## Layer WMS
- Frontend menggunakan `L.tileLayer.wms(...)` untuk mengakses WMS layer.
- Parameter penting:
  - `layers` - layer workspace:layerName
  - `format` - `image/png`
  - `transparent` - `true`
  - `version` - `1.1.1`
  - `CQL_FILTER` - filter dinamis pada server GeoServer.

## Integrasi GeoServer dengan Frontend
- WMS ditambahkan sebagai `wmsLayer` di Leaflet.
- `updateWMSIfNeeded()` memutus dan menambahkan ulang layer saat filter berubah.
- GeoServer bertindak sebagai lapisan tile overlay statis untuk memperlihatkan batas general.

## Penggunaan CQL_FILTER
- Frontend membangun `CQL_FILTER` berdasarkan satelit, keyword, dan provinsi.
- Contoh filter:
  - `satellite ILIKE 'SV%' AND layer ILIKE '%JAKARTA%' AND provinsi = 'DKI Jakarta'`
- CQL_FILTER membatasi rendering tile sebelum dikirim ke browser.

## Render Polygon
- GeoServer merender polygons sebagai layer tile, bukan feature GeoJSON.
- `geoLayer` berbasis Leaflet GeoJSON digunakan untuk interaksi dan seleksi fitur.
- WMS memisahkan rendering peta proses berat dari interaksi klik.

## Tile Loading
- Tile WMS dimuat dari GeoServer setiap kali frontend menambahkan `wmsLayer`.
- Penambahan `CQL_FILTER` mengarahkan GeoServer untuk mengirim hanya tile yang sesuai.
- GeoServer lebih efisien ketika memakai tile cache internal.

## Alasan Penggunaan WMS
- WMS memungkinkan rendering layer geometri besar tanpa memuat semua fitur ke browser.
- GeoServer dapat memanfaatkan pemrosesan server dan cache tile.
- Kombinasi WMS + GeoJSON memberikan keseimbangan performa dan interaktivitas.

## Workflow Publish Layer dari PostGIS ke GeoServer
1. Siapkan PostGIS database `catalog`.
2. Daftarkan datasource PostGIS di GeoServer.
3. Publish layer `starvision_catalog` dan `lasac_catalog` sebagai WMS pada workspace `catalog`.
4. Konfigurasi SRID 4326 (WGS84) untuk kompatibilitas Leaflet.
5. Tes dengan URL WMS di browser.

## Kendala dan Solusi
- Kendala: WMS hanya menyediakan tampilan, tidak metadata properti interaktif.
  - Solusi: `geoLayer` GeoJSON dipadankan untuk interaksi detail dan seleksi.
- Kendala: filter WMS tidak cocok untuk setiap kombinasi query.
  - Solusi: gunakan `CQL_FILTER` yang dikelola secara sentral di frontend.
