# Latar Belakang

## Permasalahan Awal
Organisasi membutuhkan alat visualisasi katalog citra satelit yang menggabungkan data spasial dan metadata citra secara real time. Pengguna memerlukan akses cepat ke informasi citra berdasarkan provinsi, satelit, dan kata kunci tanpa harus menelusuri database manual.

## Tujuan Sistem
- Menyediakan UI peta interaktif untuk menampilkan polygon citra satelit.
- Menyederhanakan pencarian dan filter metadata citra.
- Menjaga performa render peta dan daftar layer pada skala data spasial besar.
- Mengintegrasikan data GeoJSON, WMS, dan metadata ke dalam satu dashboard.

## Target Pengguna
- Analis GIS internal BRIN.
- Tim pengambil keputusan yang membutuhkan quicklook citra.
- Operator data satelit yang memerlukan referensi area provinsi.
- Mentor atau reviewer teknis yang mengevaluasi katalog spasial.

## Kebutuhan Sistem
- Backend API yang kuat dan aman untuk query spasial.
- Database PostGIS untuk menyimpan geometri polygon dan metadata.
- Frontend Leaflet untuk rendering peta interaktif.
- GeoServer untuk publish layer WMS.
- Mekanisme filter dan pagination untuk menjaga responsif.

## Alasan Menggunakan GeoServer, PostgreSQL/PostGIS, dan Leaflet
- GeoServer: dapat menyajikan WMS secara langsung dari PostGIS, mendukung CQL_FILTER, dan rendering tile yang efisien.
- PostgreSQL/PostGIS: menyediakan indeks spasial, fungsi `ST_Intersects`, `ST_MakeEnvelope`, dan dukungan geometri MultiPolygon untuk data citra.
- Leaflet: library ringan untuk integrasi peta web dan mudah disinkronkan dengan layer GeoJSON/WMS.

## Kendala dan Solusi
- Kendala: potensi beban query spasial pada data besar.
  - Solusi: batasan pagination, bbox filtering, dan limit dinamis berdasarkan zoom.
- Kendala: kebutuhan preview citra cepat tanpa memuat seluruh dataset.
  - Solusi: quicklook overlay dan cache frontend.
