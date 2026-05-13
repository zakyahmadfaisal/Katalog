# Frontend

## Struktur `catalog.html`
- Header HTML dan CSS custom untuk layout sidebar dan map.
- Sidebar berisi filter, search, count, dan list item.
- `#map` sebagai kontainer Leaflet.
- Panel detail `#panel` untuk menampilkan metadata.
- Skrip JavaScript inline menangani state, event, dan rendering.

## State Management JavaScript
- `STATE` objek utama menyimpan:
  - `keyword`, `satellite`, `catalog`, `province`
  - `listOffset`, `limit`, `isLoading`, `hasMore`
  - `selectedLayer`, `selectedFeatureId`, `cache`, `useBBoxFilter`
- `cache` bertipe `Map()` menyimpan hasil request berdasarkan `bbox` dan filter.
- `getFilterKey()` membuat kunci unik untuk kondisi filter.

## Filtering Logic
- Filter pada frontend memicu `loadData()`.
- `setSatellite()` dan change listener dropdown provinsi/katalog mengosongkan cache.
- `STATE.useBBoxFilter` aktif saat zoom >= 6.
- `bbox` disertakan dalam API saat map menunjukkan area terbatas.

## Debounce
- `debounce(fn, delay)` mencegah request berulang cepat.
- Digunakan untuk input search dan event `map.moveend`.
- Menjaga performa dengan meminimalkan lintasan jaringan.

## Cache Mechanism
- `STATE.cache` menyimpan hasil map dan list per `bbox|filter`.
- `setCache()` menjaga ukuran cache maksimum 20 entry.
- Cache mencegah render ulang ketika kondisi filter sama.

## AbortController
- `fetchJSON()` menggunakan `AbortController` terpisah untuk `map` dan `list`.
- Jika permintaan baru dibutuhkan, request lama dibatalkan.
- Mencegah race condition dan memastikan data terbaru ditampilkan.

## Rendering List
- `buildList(features, reset)` menambahkan item sidebar.
- Items dibuat dengan `innerHTML` dan class `item`.
- `highlightText()` menyorot kata kunci pencarian.
- `formatDate()` dan `formatCloud()` memformat metadata.

## Dynamic Pagination
- Scroll listener pada `#list-wrap` memicu fetch lebih banyak data.
- Backend menggunakan `page` dan `offset` untuk pagination.
- `STATE.hasMore` false menghentikan pemanggilan selanjutnya.

## BBox Filtering
- `shouldUseBBoxFilter()` memeriksa zoom map.
- Saat zoom tinggi, API menerima `bbox` untuk membatasi data.
- Mode ini mengurangi jumlah fitur yang dikirim ke browser.

## Map Synchronization
- `renderMap(features)` memuat geoLayer GeoJSON.
- `highlightList(id)` menyinkronkan sidebar ketika fitur dipilih.
- Klik polygon atau item list memicu `selectFeature()`.
- `hidePanel()` membersihkan selection saat area peta diklik.

## Panel Detail
- `showPanel(html)` menampilkan drawer detail citra.
- `selectFeature()` menyiapkan HTML metadata dan panel stat.
- `zoomToFeatureAndSelect()` memanggil detail API jika perlu.

## Quicklook Overlay
- `showQuicklookOverlay(feature, layer)` menampilkan image overlay di peta.
- Overlay ditambahkan ke pane `quicklookPane` dengan opacity 0.9.
- Jika image gagal, ditangani oleh event `error`.

## Event Handling Leaflet
- `map.on('moveend', ...)` mendeteksi pan/zoom.
- `map.on('click', ...)` menutup panel kecuali klik pada polygon, sidebar, atau panel.
- `layer.on('mouseover')` dan `mouseout` memberi highlight visual.

## Fungsi Penting
- `fetchJSON(params, type)` - request API dengan abort dan error handling.
- `loadProvinceList()` - populate dropdown provinsi.
- `loadData()` - core data load, cache, dan render.
- `selectFeature()` - update pemilihan fitur dan panel.
- `updateWMSIfNeeded()` - rebuild WMS layer bila filter berubah.
- `highlightText()` - highlight keyword search dalam nama layer.

## Kendala dan Solusi
- Kendala: tampilan panel dapat menumpuk jika tidak ditutup secara benar.
  - Solusi: `hidePanel()` dan cleaning state `selectedFeatureId`.
- Kendala: request map dan list saling tumpang tindih.
  - Solusi: pemisahan controller `mapController` dan `listController` dengan AbortController.
