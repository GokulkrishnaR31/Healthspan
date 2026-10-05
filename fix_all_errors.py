import os

aqi_context_code = """import { createContext, useContext, useState, useEffect } from 'react'

const AQIContext = createContext(null)

// ── MASTER CENTRALIZED CITY DATABASE (Single Source of Truth) ───────────────
export const MASTER_CITY_DATA = {
  'Delhi':          { state: 'Delhi',          lat: 28.6139, lng: 77.2090, aqi: 312, status: 'Severe',       pm25: 262.4, pm10: 384.0, nox: 74.2, so2: 16.8, co: 2.14, o3: 42.5, station: 'Anand Vihar CAAQMS (DPCC)', temp: '27.8°C', wind: '4.2 km/h ↖ NW', hum: '64%', mix: '420m (Low)', cat: 'Hazardous', delta: '+18.4%' },
  'Chennai':        { state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, aqi: 78,  status: 'Satisfactory', pm25: 32.1,  pm10: 74.5,  nox: 26.2, so2: 9.8,  co: 0.94, o3: 22.0, station: 'Alandur CAAQMS (TNPCB)',     temp: '28.6°C', wind: '12.4 km/h ➔ E', hum: '81%', mix: '880m (Good)', cat: 'Satisfactory', delta: '-3.1%' },
  'Bengaluru':      { state: 'Karnataka',      lat: 12.9716, lng: 77.5946, aqi: 63,  status: 'Satisfactory', pm25: 24.5,  pm10: 62.0,  nox: 22.4, so2: 8.5,  co: 0.85, o3: 24.2, station: 'BTM Layout CAAQMS (KSPCB)',  temp: '24.5°C', wind: '9.8 km/h ↘ SE', hum: '62%', mix: '950m (High)', cat: 'Satisfactory', delta: '-5.2%' },
  'Mumbai':         { state: 'Maharashtra',    lat: 19.0760, lng: 72.8777, aqi: 172, status: 'Moderate',     pm25: 79.2,  pm10: 164.5, nox: 48.6, so2: 15.2, co: 1.52, o3: 28.4, station: 'Bandra CAAQMS (MPCB)',       temp: '29.4°C', wind: '11.2 km/h ➔ W', hum: '76%', mix: '820m (Good)', cat: 'Moderate', delta: '-1.4%' },
  'Kolkata':        { state: 'West Bengal',    lat: 22.5726, lng: 88.3639, aqi: 208, status: 'Poor',         pm25: 142.0, pm10: 218.0, nox: 54.0, so2: 19.5, co: 1.85, o3: 38.0, station: 'Victoria Memorial (WBPCB)',   temp: '27.2°C', wind: '5.4 km/h ↙ SW', hum: '72%', mix: '520m (Mod)', cat: 'Poor', delta: '+8.6%' },
  'Hyderabad':      { state: 'Telangana',      lat: 17.3850, lng: 78.4867, aqi: 146, status: 'Moderate',     pm25: 64.2,  pm10: 138.0, nox: 38.0, so2: 13.2, co: 1.28, o3: 31.5, station: 'Sanathnagar (TSPCB)',        temp: '28.1°C', wind: '7.5 km/h ➔ E',  hum: '59%', mix: '760m (Good)', cat: 'Moderate', delta: '+1.2%' },
  'Ahmedabad':      { state: 'Gujarat',        lat: 23.0225, lng: 72.5714, aqi: 184, status: 'Moderate',     pm25: 88.5,  pm10: 176.0, nox: 42.1, so2: 14.5, co: 1.45, o3: 36.2, station: 'Maninagar CAAQMS (GPCB)',    temp: '31.2°C', wind: '7.8 km/h ↗ NE', hum: '52%', mix: '680m (Mod)', cat: 'Moderate', delta: '+4.2%' },
  'Pune':           { state: 'Maharashtra',    lat: 18.5204, lng: 73.8567, aqi: 138, status: 'Moderate',     pm25: 58.4,  pm10: 132.0, nox: 35.1, so2: 11.8, co: 1.22, o3: 32.1, station: 'Shivajinagar (MPCB)',       temp: '26.8°C', wind: '8.5 km/h ↗ NE', hum: '58%', mix: '780m (Good)', cat: 'Moderate', delta: '+2.0%' },
  'Jaipur':         { state: 'Rajasthan',      lat: 26.9124, lng: 75.7873, aqi: 228, status: 'Poor',         pm25: 168.0, pm10: 252.0, nox: 61.2, so2: 21.0, co: 1.95, o3: 41.0, station: 'Adarsh Nagar (RSPCB)',       temp: '26.5°C', wind: '5.1 km/h ↖ NW', hum: '44%', mix: '480m (Low)', cat: 'Poor', delta: '+9.4%' },
  'Lucknow':        { state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462, aqi: 298, status: 'Very Poor',    pm25: 235.0, pm10: 345.0, nox: 68.5, so2: 24.1, co: 2.10, o3: 44.2, station: 'Talkatora CAAQMS (UPPCB)',   temp: '25.4°C', wind: '3.8 km/h ↖ NW', hum: '68%', mix: '390m (Low)', cat: 'Very Poor', delta: '+14.2%' },
  'Kanpur':         { state: 'Uttar Pradesh',  lat: 26.4499, lng: 80.3319, aqi: 285, status: 'Very Poor',    pm25: 218.0, pm10: 320.0, nox: 64.0, so2: 22.0, co: 1.98, o3: 41.5, station: 'Nehru Nagar (UPPCB)',         temp: '25.6°C', wind: '4.0 km/h ↖ NW', hum: '66%', mix: '410m (Low)', cat: 'Very Poor', delta: '+12.5%' },
  'Patna':          { state: 'Bihar',          lat: 25.5941, lng: 85.1376, aqi: 258, status: 'Poor',         pm25: 195.0, pm10: 288.0, nox: 62.0, so2: 18.5, co: 1.92, o3: 39.0, station: 'Muradpur CAAQMS (BSPCB)',    temp: '26.0°C', wind: '4.2 km/h ↖ NW', hum: '70%', mix: '430m (Low)', cat: 'Poor', delta: '+11.5%' },
  'Surat':          { state: 'Gujarat',        lat: 21.1702, lng: 72.8311, aqi: 162, status: 'Moderate',     pm25: 74.0,  pm10: 155.0, nox: 36.8, so2: 18.2, co: 1.30, o3: 31.0, station: 'Athwa CAAQMS (GPCB)',        temp: '30.5°C', wind: '9.4 km/h ➔ W',  hum: '68%', mix: '750m (Good)', cat: 'Moderate', delta: '-2.1%' },
  'Visakhapatnam':  { state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, aqi: 112, status: 'Moderate',     pm25: 48.0,  pm10: 108.0, nox: 31.2, so2: 14.0, co: 1.05, o3: 26.5, station: 'GVMCAir CAAQMS (APPCB)',    temp: '28.8°C', wind: '10.5 km/h ➔ E', hum: '78%', mix: '850m (Good)', cat: 'Moderate', delta: '+0.8%' },
  'Coimbatore':     { state: 'Tamil Nadu',     lat: 11.0168, lng: 76.9558, aqi: 68,  status: 'Satisfactory', pm25: 28.0,  pm10: 66.0,  nox: 24.0, so2: 8.0,  co: 0.88, o3: 21.0, station: 'SIDCO CAAQMS (TNPCB)',       temp: '26.2°C', wind: '8.8 km/h ↘ SE', hum: '65%', mix: '920m (High)', cat: 'Satisfactory', delta: '-4.2%' },
  'Kochi':          { state: 'Kerala',         lat:  9.9312, lng: 76.2673, aqi: 58,  status: 'Satisfactory', pm25: 22.0,  pm10: 56.0,  nox: 18.5, so2: 6.8,  co: 0.76, o3: 19.5, station: 'Vyttila CAAQMS (KSPCB)',      temp: '27.5°C', wind: '11.0 km/h ➔ W', hum: '84%', mix: '910m (High)', cat: 'Satisfactory', delta: '-2.8%' },
  'Chandigarh':     { state: 'Chandigarh',     lat: 30.7333, lng: 76.7794, aqi: 175, status: 'Moderate',     pm25: 84.0,  pm10: 162.0, nox: 41.0, so2: 12.5, co: 1.35, o3: 33.0, station: 'Sector 22 CAAQMS (CPCC)',    temp: '23.8°C', wind: '6.2 km/h ↖ NW', hum: '56%', mix: '620m (Mod)', cat: 'Moderate', delta: '+3.4%' },
  'Amritsar':       { state: 'Punjab',          lat: 31.6340, lng: 74.8723, aqi: 242, status: 'Poor',         pm25: 178.0, pm10: 268.0, nox: 58.0, so2: 17.0, co: 1.88, o3: 38.5, station: 'Golden Temple Area (PPCB)',  temp: '24.2°C', wind: '4.8 km/h ↖ NW', hum: '60%', mix: '450m (Low)', cat: 'Poor', delta: '+8.2%' },
  'Guwahati':       { state: 'Assam',           lat: 26.1445, lng: 91.7362, aqi: 114, status: 'Moderate',     pm25: 52.0,  pm10: 112.0, nox: 29.5, so2: 11.0, co: 1.08, o3: 25.0, station: 'Panbazar CAAQMS (PCBA)',     temp: '24.8°C', wind: '5.6 km/h ↗ NE', hum: '74%', mix: '720m (Good)', cat: 'Moderate', delta: '+1.5%' },
  'Shillong':       { state: 'Meghalaya',       lat: 25.5788, lng: 91.8933, aqi: 62,  status: 'Satisfactory', pm25: 23.0,  pm10: 59.0,  nox: 16.0, so2: 5.5,  co: 0.65, o3: 18.0, station: 'Laban CAAQMS (MSPCB)',        temp: '18.2°C', wind: '6.5 km/h ↗ NE', hum: '72%', mix: '1100m (High)', cat: 'Satisfactory', delta: '-3.8%' },
  'Aizawl':         { state: 'Mizoram',         lat: 23.7271, lng: 92.7176, aqi: 24,  status: 'Good',         pm25: 8.5,   pm10: 22.0,  nox: 8.2,  so2: 3.1,  co: 0.32, o3: 14.5, station: 'Bawngkawn CAAQMS (MPCB)',    temp: '19.5°C', wind: '8.5 km/h ↗ NE', hum: '65%', mix: '1200m (High)', cat: 'Good', delta: '-1.5%' },
  'Gangtok':        { state: 'Sikkim',          lat: 27.3314, lng: 88.6138, aqi: 53,  status: 'Satisfactory', pm25: 19.0,  pm10: 51.0,  nox: 14.2, so2: 4.8,  co: 0.55, o3: 16.5, station: 'Deorali CAAQMS (SPCB)',       temp: '16.8°C', wind: '7.2 km/h ↗ NE', hum: '68%', mix: '1150m (High)', cat: 'Satisfactory', delta: '-2.0%' },
}

export const CITY_COORDS = Object.entries(MASTER_CITY_DATA).map(([city, d]) => ({
  city,
  lat: d.lat,
  lng: d.lng,
  state: d.state
}))

export const STATE_CITIES = {
  'All India':           Object.keys(MASTER_CITY_DATA),
  'Delhi':               ['Delhi'],
  'Tamil Nadu':          ['Chennai', 'Coimbatore'],
  'Karnataka':           ['Bengaluru'],
  'Maharashtra':         ['Mumbai', 'Pune'],
  'West Bengal':         ['Kolkata'],
  'Telangana':           ['Hyderabad'],
  'Gujarat':             ['Ahmedabad', 'Surat'],
  'Rajasthan':           ['Jaipur'],
  'Uttar Pradesh':       ['Lucknow', 'Kanpur'],
  'Bihar':               ['Patna'],
  'Andhra Pradesh':      ['Visakhapatnam'],
  'Kerala':              ['Kochi'],
  'Chandigarh':          ['Chandigarh'],
  'Punjab':              ['Amritsar'],
  'Assam':               ['Guwahati'],
  'Meghalaya':           ['Shillong'],
  'Mizoram':             ['Aizawl'],
  'Sikkim':              ['Gangtok'],
}

export const ALL_STATES = Object.keys(STATE_CITIES)
export const ALL_CITIES = Object.keys(MASTER_CITY_DATA)

export const AQI_COLORS = {
  Good:           '#10B981',
  Satisfactory:   '#84CC16',
  Moderate:       '#F59E0B',
  Poor:           '#F97316',
  'Very Poor':    '#EF4444',
  Severe:         '#BE123C',
  Hazardous:      '#881337',
  Unknown:        '#64748B',
}

export function getAQIColor(status) {
  return AQI_COLORS[status] ?? AQI_COLORS.Moderate
}

export function getAQIBadgeClass(status) {
  const map = {
    Good:           'badge-good',
    Satisfactory:   'badge-satisfactory',
    Moderate:       'badge-moderate',
    Poor:           'badge-poor',
    'Very Poor':    'badge-very-poor',
    Severe:         'badge-severe',
  }
  return map[status] ?? 'badge-moderate'
}

export function getCitiesForState(state) {
  if (!state || state === 'All India') return ALL_CITIES
  return STATE_CITIES[state] ?? [ALL_CITIES[0]]
}

export function getCityDetails(cityName) {
  return MASTER_CITY_DATA[cityName] ?? MASTER_CITY_DATA['Delhi']
}

export function AQIProvider({ children }) {
  const [selectedState, setSelectedState] = useState('All India')
  const [selectedCity,  setSelectedCity]  = useState('Delhi')

  useEffect(() => {
    const cities = getCitiesForState(selectedState)
    if (cities.length > 0 && !cities.includes(selectedCity)) {
      setSelectedCity(cities[0])
    }
  }, [selectedState])

  return (
    <AQIContext.Provider value={{
      selectedState, setSelectedState,
      selectedCity,  setSelectedCity,
    }}>
      {children}
    </AQIContext.Provider>
  )
}

export function useAQI() {
  const ctx = useContext(AQIContext)
  if (!ctx) throw new Error('useAQI must be used within AQIProvider')
  return ctx
}
"""

with open(r'g:\rproject\frontend\src\context\AQIContext.jsx', 'w', encoding='utf-8') as f:
    f.write(aqi_context_code)
print("Updated AQIContext.jsx with all helper functions!")

# Update GISMap.jsx to guarantee no NaN coordinates
gis_map_code = """import { useState } from 'react'
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

const CITIES_LIST = Object.entries(MASTER_CITY_DATA)
  .map(([name, d]) => ({
    city: name,
    lat: Number(d.lat),
    lng: Number(d.lng),
    aqi: Number(d.aqi),
    ...d
  }))
  .filter(c => Number.isFinite(c.lat) && Number.isFinite(c.lng))

export default function GISMap() {
  const [mapRef, setMapRef] = useState(null)
  const [activeView, setActiveView] = useState(0)

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

        {/* Leaflet Map */}
        <div style={{ height: 580, width: '100%', position: 'relative' }}>
          <MapContainer
            center={VIEWS[0].center}
            zoom={VIEWS[0].zoom}
            style={{ height: '100%', width: '100%' }}
            ref={setMapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {CITIES_LIST.map((c, i) => {
              const aqiVal = c.aqi
              const color = getMarkerColor(aqiVal)
              const statusText = getStatusText(aqiVal)
              const radius = Math.max(9, Math.min(22, aqiVal / 14))

              return (
                <CircleMarker
                  key={`${c.city}-${i}`}
                  center={[c.lat, c.lng]}
                  radius={radius}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: color,
                    fillOpacity: 0.92,
                    weight: 2.5,
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
print("Updated GISMap.jsx with finite coordinate filtering")
