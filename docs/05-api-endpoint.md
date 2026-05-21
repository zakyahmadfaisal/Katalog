# API Endpoint

## `GET /api/catalog`
- Method: `GET`
- Fungsi: mengambil daftar feature GeoJSON untuk sidebar.
- Parameter:
  - `keyword` (opsional)
  - `satellite` (opsional, default `ALL`)
  - `province` (opsional, default `ALL`)
  - `catalog` (opsional, default `STARVISION`)
  - `page` (opsional, default `0`)
  - `limit` (opsional, default `50`)
  - `bbox` (opsional)
- Response JSON:
  - `page`, `limit`, `returned`, `data`
  - `data` berisi array fitur GeoJSON dengan properti `properties`.

### Contoh Request
```http
GET /api/catalog?keyword=JAKARTA&satellite=SV&province=DKI%20Jakarta&catalog=STARVISION&page=0&limit=50
```

### Contoh Response
```json
{
  "page": 0,
  "limit": 50,
  "returned": 10,
  "data": [
    {
      "type": "Feature",
      "properties": {
        "gid": 123,
        "layer_name": "...",
        "satellite": "SV",
        "sensor": "...",
        "acquisition_date": "2024-05-10",
        "cloud_cover": 10,
        "gsd": 0.5,
        "lon_ctr": 106.8,
        "lat_ctr": -6.2,
        "quicklook": "http://10.18.170.29:3000/quicklook/..."
      }
    }
  ]
}
```

## `GET /api/catalog/map`
- Method: `GET`
- Fungsi: mengambil GeoJSON untuk rendering map layer.
- Parameter:
  - `zoom` (opsional)
  - `bbox` (opsional)
  - `keyword` (opsional)
  - `satellite` (opsional)
  - `province` (opsional)
  - `catalog` (opsional)
- Response JSON: `FeatureCollection` GeoJSON.

### Contoh Request
```http
GET /api/catalog/map?zoom=7&bbox=106.7,-6.4,106.9,-6.1&satellite=BJ&catalog=STARVISION
```

### Contoh Response
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { ... },
      "properties": { ... }
    }
  ]
}
```

## `GET /api/catalog/:id`
- Method: `GET`
- Fungsi: mengambil detail satu fitur berdasarkan `gid`.
- Parameter path:
  - `:id` - nilai integer `gid`.
- Query parameter:
  - `catalog` (opsional)
- Response JSON: fitur GeoJSON.

### Contoh Request
```http
GET /api/catalog/123?catalog=LASAC
```

### Contoh Response
```json
{
  "type": "Feature",
  "geometry": { ... },
  "properties": {
    "gid": 123,
    "layer_name": "...",
    "satellite": "ZY",
    "sensor": "...",
    "acquisition_date": "2024-04-30",
    "cloud_cover": 12,
    "gsd": null,
    "lon_ctr": 103.4,
    "lat_ctr": -2.9,
    "quicklook": "http://10.18.170.29:3000/quicklook/lasac/..."
  }
}
```

## `GET /api/provinces`
- Method: `GET`
- Fungsi: mengambil daftar nama provinsi AOI.
- Response JSON: array objek `{ provinsi: string }`.

### Contoh Request
```http
GET /api/provinces
```

### Contoh Response
```json
[
  { "provinsi": "Aceh" },
  { "provinsi": "DKI Jakarta" },
  { "provinsi": "Jawa Barat" }
]
```

## `GET /api/province-geom`
- Method: `GET`
- Fungsi: mengambil geometri GeoJSON provinsi untuk zoom ke area.
- Parameter query:
  - `name` - nama provinsi.
- Response JSON: fitur GeoJSON dengan `geometry`.

### Contoh Request
```http
GET /api/province-geom?name=Jawa%20Barat
```

### Contoh Response
```json
{
  "type": "Feature",
  "geometry": { ... },
  "properties": {}
}
```

## Catatan Tambahan
- Backend menggunakan sanitasi input untuk `catalog` dan `satellite`.
- Pagination pada `/api/catalog` dibatasi `limit` 1–500 dan `page` maksimal 1000.
- `/api/catalog/map` mempunyai limit dinamis berdasarkan nilai `zoom` dan keberadaan `bbox`.
