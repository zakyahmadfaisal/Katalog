# Optimasi

## BBox Filtering
- `STATE.useBBoxFilter` aktif saat map zoom >= 6.
- Backend melakukan filter ruang dengan `i.geom && ST_MakeEnvelope(...)`.
- Mengurangi data yang dikirim ke browser ketika area peta fokus.

## Dynamic Limit Berdasarkan Zoom
- Backend `/api/catalog/map` menggunakan limit dinamis:
  - `zoom <= 5` → 200 tanpa bbox / 100 dengan bbox
  - `zoom <= 8` → 400 tanpa bbox / 300 dengan bbox
  - `zoom > 8` → 600
- Frontend menyesuaikan `STATE.limit` berdasarkan zoom peta.

## Cache `Map()`
- Hasil request disimpan pada `STATE.cache`.
- Kunci cache: `bboxKey|filterKey` dan `pageKey`.
- Menghindari fetch ulang saat filter atau area peta belum berubah.

## Request Abort
- `fetchJSON()` menggunakan `AbortController` untuk `map` dan `list`.
- Request lama dibatalkan saat permintaan baru dikirim.
- Mencegah data lama muncul setelah permintaan baru selesai.

## Debounce Input
- `search` menggunakan `debounce(300)`.
- `map.moveend` menggunakan `debounce(1200)`.
- Mengurangi frekuensi update saat pengguna menggeser peta atau mengetik.

## Lazy Loading
- `img-preview` menggunakan atribut `loading="lazy"`.
- Quicklook hanya dimuat saat fitur dipilih.

## Pagination
- Infinite scrolling di sidebar memuat data bertahap.
- `STATE.hasMore` menghentikan fetch ketika data habis.
- `listOffset` memastikan offset konsisten.

## Selective Rendering
- `buildList()` hanya menambahkan item baru ke sidebar.
- `renderMap()` membersihkan `geoLayer` dan hanya menambahkan fitur baru.
- `highlightText()` memproses string kata kunci secara selektif.

## Race Condition Prevention
- `STATE.mapRequestId` dan `STATE.listRequestId` membedakan request valid.
- Request yang tidak lagi relevan diabaikan.
- `STATE.isSelectingFeature` mencegah interaksi ganda pada fitur terpilih.

## Render Optimization
- Map tile WMS dipisahkan dari layer GeoJSON.
- GeoJSON hanya ditampilkan untuk fitur yang diperlukan.
- Layer WMS tetap berada di belakang geoLayer interaktif.

## WMS Usage
- GeoServer WMS dipakai untuk menampilkan batas polygon secara efisien.
- Mengurangi beban render browser dibanding memuat semua fitur GeoJSON sekaligus.

## Problem yang Diselesaikan
- Latensi saat search dan pan peta berkurang.
- Beban backend berkurang dengan cache dan filter bounding box.
- UI tetap responsif saat data banyak karena pagination dan selective rendering.

## Kendala dan Solusi
- Kendala: multiple request pada event peta.
  - Solusi: `AbortController`, `debounce`, dan request id guard.
- Kendala: rendering ulang list dari cache.
  - Solusi: `STATE.loadedIds` menghindari duplikasi item list.
