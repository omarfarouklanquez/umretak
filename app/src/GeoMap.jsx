import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Real interactive map: Leaflet + OpenStreetMap standard tiles (free, no API key).
// OSM's tile server is for light use (see operations.osmfoundation.org/policies/tiles);
// at scale, self-host tiles or point TILES at another free/OSM-based provider.
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const HARAM = {
  makkah: { latlng: [21.4225, 39.8262], name: 'المسجد الحرام' },
  madinah: { latlng: [24.4672, 39.6112], name: 'المسجد النبوي' },
}

// Verified coordinates where known; others are placed by their walking distance from
// the Haram (demo data). Add `lat`/`lng` on a hotel record to override.
const KNOWN = { h1: [21.4187, 39.8256], h2: [21.4183, 39.8263], h15: [21.4193, 39.8269], h10: [24.4693, 39.6098], h11: [24.4683, 39.6102] }
export function hotelLatLng(h) {
  if (h.lat && h.lng) return [h.lat, h.lng]
  if (KNOWN[h.id]) return KNOWN[h.id]
  const [lat, lng] = HARAM[h.city].latlng
  const b = ((parseInt(h.id.slice(1), 10) * 137.5) % 360) * (Math.PI / 180)
  return [lat + (h.distanceM * Math.cos(b)) / 111320, lng + (h.distanceM * Math.sin(b)) / (111320 * Math.cos((lat * Math.PI) / 180))]
}

export const STATION_LATLNG = {
  'مكة المكرمة (الرصيفة)': [21.4009, 39.7883],
  'جدة (السليمانية)': [21.5093, 39.2386],
  'مطار جدة (KAIA)': [21.6869, 39.1564],
  'رابغ (KAEC)': [22.4318, 39.1218],
  'المدينة المنورة': [24.5306, 39.5588],
}

const icon = (m, active) => {
  if (m.type === 'haram') return L.divIcon({ className: '', html: '<div class="pin-haram" title="' + m.title + '"><span></span></div>', iconSize: [34, 34], iconAnchor: [17, 17] })
  if (m.type === 'station') return L.divIcon({ className: '', html: `<div class="pin-station${active ? ' on' : ''}">${m.label}</div>`, iconSize: null })
  return L.divIcon({ className: '', html: `<div class="pin-price${active ? ' on' : ''}">${m.label}</div>`, iconSize: null })
}

/**
 * markers: [{ id, latlng: [lat, lng], label, title, type: 'price' | 'haram' | 'station' }]
 * line: optional [[lat,lng], ...] polyline (e.g. train route)
 */
export default function GeoMap({ markers, active, onPick, height = 340, line, zoom }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false, attributionControl: true, zoomControl: true })
    L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => { map.current.remove(); map.current = null }
  }, [])

  const key = JSON.stringify(markers.map((m) => [m.id, m.latlng, m.label])) + JSON.stringify(line || [])
  useEffect(() => {
    const g = layer.current
    g.clearLayers()
    markers.forEach((m) => {
      const mk = L.marker(m.latlng, { icon: icon(m, m.id === active), zIndexOffset: m.id === active ? 1000 : m.type === 'haram' ? 500 : 0, title: m.title })
      if (m.title) mk.bindTooltip(m.title, { direction: 'top', offset: [0, -14] })
      if (onPick && m.type !== 'haram') mk.on('click', () => onPick(m.id))
      mk.addTo(g)
    })
    if (line) L.polyline(line, { color: '#ff4f00', weight: 4, opacity: .85, dashArray: '8 6' }).addTo(g)
    const pts = [...markers.map((m) => m.latlng), ...(line || [])]
    if (pts.length === 1) map.current.setView(pts[0], zoom || 16)
    else if (pts.length) map.current.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: zoom || 17 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active])

  return <div ref={el} className="geomap" style={{ height }} dir="ltr" role="region" aria-label="خريطة" />
}

// Helper: Haram + hotels as price pins.
export const hotelMarkers = (hotels, city, priceOf = (h) => h.rooms[0].price) => [
  ...(city ? [city] : [...new Set(hotels.map((h) => h.city))]).map((c) => ({ id: 'haram-' + c, latlng: HARAM[c].latlng, title: HARAM[c].name, type: 'haram' })),
  ...hotels.map((h) => ({ id: h.id, latlng: hotelLatLng(h), label: priceOf(h), title: h.name, type: 'price' })),
]
