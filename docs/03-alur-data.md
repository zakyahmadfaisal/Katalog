# Alur Data

## 1. Saat Halaman Pertama Kali Dibuka
1. Browser memuat `catalog.html`.
2. JavaScript inisialisasi Leaflet map dan WMS layer.
3. `loadProvinceList()` memanggil `/api/provinces` untuk populate dropdown provinsi.
4. `loadData()` dijalankan untuk mengambil data awal peta dan daftar.

## 2. Alur Request API
- `GET /api/catalog/map?zoom=&bbox=&keyword=&satellite=&province=&catalog=` untuk fitur GeoJSON map.
- `GET /api/catalog?keyword=&satellite=&province=&catalog=&page=&limit=&bbox=` untuk daftar sidebar.
- `GET /api/provinces` untuk list provinsi.
- `GET /api/province-geom?name=` untuk geometri provinsi.

## 3. Alur Render Polygon pada Leaflet
1. Backend mengembalikan GeoJSON (`FeatureCollection`) dari `/api/catalog/map`.
2. `renderMap(features)` menciptakan atau membersihkan `geoLayer`.
3. `L.geoJSON` menambahkan geometri dan event handler click/hover ke polygon.
4. Polygon dirender dengan style interaktif dan diprioritaskan di atas layer WMS.

## 4. Alur BBox Filtering Saat Zoom/Pan Map
1. `map.on('moveend', debounce(...))` dipicu setelah gerakan peta selesai.
2. Bila zoom >= 6, `STATE.useBBoxFilter = true`.
3. Frontend menghitung `bbox` dari `map.getBounds()`.
4. Request API dikirim dengan parameter `bbox=`.
5. Backend melakukan query `&& ST_MakeEnvelope(...)` untuk membatasi fitur dalam tampilan.
6. Hasil dirender ulang di peta dan sidebar.

## 5. Alur Pagination List
1. Sidebar `#list-wrap` memiliki listener `scroll`.
2. Ketika mendekati akhir scroll dan `STATE.hasMore=true`, request tambahan dikirim.
3. Backend menggunakan `page` dan `limit` untuk offset.
4. Data baru ditambahkan ke daftar tanpa mereset konten.
5. `STATE.listOffset` diperbarui sesuai jumlah fitur yang sudah termuat.

## 6. Alur Pencarian/Filter
1. Input pencarian `#search` memicu `oninput` dengan `debounce(300)`.
2. Dropdown satelit atau provinsi memicu change event.
3. Setiap perubahan membersihkan cache dan memanggil `loadData()`.
4. Backend memfilter berdasarkan `satellite`, `keyword`, `province`, dan `bbox` jika diperlukan.
5. UI menampilkan hasil baru dan count layer.

## 7. Alur Klik Polygon
1. User klik polygon di peta atau item di sidebar.
2. Event handler memilih fitur dan `selectFeature(f, layer)` dipanggil.
3. Polygon mendapat style terpilih, list disorot, dan panel detail dibuka.
4. Jika fitur tidak tersedia di frontend, `zoomToFeatureAndSelect` memanggil `/api/catalog/:id`.

## 8. Alur Quicklook Overlay
1. Saat feature selected, `showQuicklookOverlay(feature, layer)` dibuat.
2. Frontend menambahkan `L.imageOverlay` pada bounds feature.
3. Quicklook overlay ditampilkan pada pane khusus dengan opacity 0.9.
4. Jika load overlay gagal, ada fallback log di konsol.

## 9. Sinkronisasi Map dan Sidebar
- `highlightList(id)` menyelaraskan item sidebar saat fitur dipilih.
- `div.item.onclick` memanggil `zoomToFeatureAndSelect` dan memberi class `active`.
- `hidePanel()` membersihkan selection dan overlay saat area luar diklik.
- `STATE.selectedFeatureId`, `STATE.selectedLayer`, dan `STATE.isSelectingFeature` menjaga sinkronisasi.

## Kendala dan Solusi
- Kendala: double-click dan event map bisa menyebabkan dua permintaan bersamaan.
  - Solusi: `STATE.isSelectingFeature`, `STATE.selectedFeatureId`, `map.once('moveend', ...)`, dan AbortController.
- Kendala: list pagination dan filter bisa melakukan request berulang.
  - Solusi: cache per `bbox|filter` dan `pageKey` untuk mengurangi fetch duplikat.
