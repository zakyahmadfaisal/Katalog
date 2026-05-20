# PENDAHULUAN

## Deskripsi Singkat

Sistem “Katalog Citra Satelit BRIN” adalah aplikasi Web GIS yang menggabungkan antarmuka peta interaktif dengan backend API dan basis data spasial. Frontend menggunakan Leaflet untuk menampilkan peta dan polygon citra, sementara backend Node.js/Express melayani data GeoJSON dari PostgreSQL/PostGIS. GeoServer juga diintegrasikan untuk menyediakan layer WMS yang menampilkan overlay peta berbasis tile.

## Tujuan Sistem

Tujuan sistem ini adalah menyediakan platform visualisasi katalog citra satelit yang:

- Menampilkan polygon citra satelit secara spasial pada peta.
- Memfasilitasi filter berdasarkan sumber katalog, satelit, provinsi, dan keyword.
- Menyediakan mekanisme preview quicklook serta panel metadata yang informatif.
- Mengoptimalkan performa melalui bounding box filtering, pagination, dan mekanisme caching.

## Manfaat Sistem

Manfaat utama sistem meliputi:

- Memudahkan pengguna dalam memilih citra satelit berdasarkan area dan metadata.
- Memberikan akses cepat ke informasi citra tanpa perlu menelusuri database manual.
- Menyajikan data spasial dan atribut secara bersamaan dalam satu antarmuka.
- Meningkatkan efisiensi kerja analis GIS melalui preview visual dan filter dinamis.

## Ruang Lingkup Sistem

Ruang lingkup implementasi sistem mencakup:

- Frontend antarmuka pengguna dengan layout sidebar dan peta Leaflet.
- Backend API REST untuk menyajikan data provinsi, daftar citra, peta GeoJSON, dan detail fitur.
- Basis data PostgreSQL dengan ekstensi PostGIS untuk penyimpanan geometri dan query spasial.
- Integrasi GeoServer untuk publish layer WMS dan rendering tile.
- Deployment lokal pada lingkungan Ubuntu/Linux dengan konfigurasi port dan static quicklook.

