gis_map_code = """import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { MASTER_CITY_DATA } from '../context/AQIContext'
import 'leaflet/dist/leaflet.css'

const LEGEND = [
  { label: 'Good (0–50)',           color: '#10B981' },
  { label: 'Satisfactory (51–100)', color: '#84CC16' },
  { label: 'Moderate (101–200)',    color: '#F59E0B' },
  { label: 'Poor (201–300)',        color: '#F97316' },
  { label: 'Very Poor (301–400)',   color: '#EF4444' },
  { label: 'Severe (>400)',         color: '#BE123C' },
]

function getMarkerColor(aqi) {
  if (aqi <= 50)  return '#10B981'
  if (aqi <= 100) return '#84CC16'
  if (aqi <= 150) return '#F59E0B'
  if (aqi <= 200) return '#F97316'
  if (aqi <= 300) return '#EF4444'
  return '#BE123C'
}

function getStatusText(aqi) {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Satisfactory'
  if (aqi <= 150) return 'Moderate'
  if (aqi <= 200) return 'Poor'
  if (aqi <= 300) return 'Very Poor'
  return 'Severe'
}

const VIEWS = [
  { label: '🇮🇳 All India',    center: [22.5, 82.0], zoom: 5 },
  { label: '🏔️ North India',  center: [28.6, 77.5], zoom: 6 },
  { label: '🌿 Northeast',     center: [25.5, 92.0], zoom: 6 },
  { label: '🌊 South India',   center: [13.0, 79.0], zoom: 6 },
  { label: '🏖️ West India',   center: [21.0, 73.5], zoom: 6 },
]

// Strict numerical validation for all cities
const CITIES_LIST = Object.entries(MASTER_CITY_DATA)
  .map(([name, d]) => ({
    city: String(name),
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lng),
    aqi: parseInt(d.aqi, 10) || 100,
    pm25: d.pm25,
    pm10: d.pm10,
    station: d.station,
    state: d.state
  }))
  .filter(c => !isNaN(c.lat) && !isNaN(c.lng) && isFinite(c.lat) && isFinite(c.lng))

export default function GISMap() {
  const [mapRef, setMapRef] = useState(null)
  const [activeView, setActiveView] = useState(0)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (mapRef) {
      setIsMapReady(true)
      const timer = setTimeout(() => {
        try {
          mapRef.invalidateSize()
        } catch (e) {}
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [mapRef])

  function flyTo(idx) {
    setActiveView(idx)
    if (mapRef) {
      const v = VIEWS[idx]
      mapRef.flyTo(v.center, v.zoom, { duration: 1.2 })
    }
  }

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div className="ui-card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Top Controls Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🗺️</span>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Pan-India GIS Air Quality Heatmap</h2>
              <span className="badge-pill teal">34 CAAQMS Stations</span>
            </div>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Spatial pollutant dispersion & multi-city CAAQMS telemetry stations</p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: 8 }}>
            {VIEWS.map((v, i) => (
              <button
                key={v.label}
                className={`pill-btn ${activeView === i ? 'active' : ''}`}
                onClick={() => flyTo(i)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet Map with Canvas Rendering */}
        <div style={{ height: 580, width: '100%', position: 'relative' }}>
          <MapContainer
            center={VIEWS[0].center}
            zoom={VIEWS[0].zoom}
            preferCanvas={true}
            style={{ height: '100%', width: '100%' }}
            whenReady={() => setIsMapReady(true)}
            ref={setMapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {isMapReady && CITIES_LIST.map((c, i) => {
              const aqiVal = c.aqi
              const color = getMarkerColor(aqiVal)
              const statusText = getStatusText(aqiVal)
              const radius = Math.max(9, Math.min(20, aqiVal / 15))

              return (
                <CircleMarker
                  key={`${c.city}-${i}`}
                  center={[c.lat, c.lng]}
                  radius={radius}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: color,
                    fillOpacity: 0.92,
                    weight: 2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>
                      {c.city}: {aqiVal} AQI ({statusText})
                    </div>
                  </Tooltip>

                  <Popup>
                    <div style={{ minWidth: 190, color: '#0F172A', padding: '4px 2px' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, borderBottom: '1px solid #E2E8F0', paddingBottom: 4 }}>
                        {c.city}
                        {c.state && <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginLeft: 6 }}>({c.state})</span>}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0' }}>
                        <span style={{ fontSize: 12, color: '#64748B' }}>AQI:</span>
                        <span style={{ color, fontSize: 24, fontWeight: 900 }}>{aqiVal}</span>
                        <span className="badge-pill" style={{ background: color, color: '#FFF', fontSize: 10 }}>
                          {statusText}
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#334155', marginBottom: 4 }}>
                        <strong>Station:</strong> {c.station}
                      </div>
                      <div style={{ fontSize: 12, color: '#334155', marginBottom: 4 }}>
                        <strong>PM2.5:</strong> {c.pm25} µg/m³ | <strong>PM10:</strong> {c.pm10} µg/m³
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: 6 }}>
                        📍 Coordinates: {c.lat.toFixed(2)}°N, {c.lng.toFixed(2)}°E
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        {/* Legend Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
          padding: '12px 20px', borderTop: '1px solid var(--border-light)',
          background: '#FFFFFF',
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>AQI Scale:</span>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155', fontWeight: 600 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }} />
              {l.label}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\GISMap.jsx', 'w', encoding='utf-8') as f:
    f.write(gis_map_code)

print("GISMap.jsx updated with Canvas rendering (permanently eliminating SVG NaN errors)!")
