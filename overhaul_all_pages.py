import os

# 1. CENTRALIZED SOURCE OF TRUTH IN AQIContext.jsx
aqi_context_code = """import { createContext, useContext, useState, useEffect } from 'react'

const AQIContext = createContext(null)

// ── MASTER CENTRALIZED CITY DATABASE (Single Source of Truth) ───────────────
export const MASTER_CITY_DATA = {
  'Delhi':          { state: 'Delhi',          lat: 28.6139, lng: 77.2090, aqi: 312, pm25: 262.4, pm10: 384.0, nox: 74.2, so2: 16.8, co: 2.14, o3: 42.5, station: 'Anand Vihar CAAQMS (DPCC)', temp: '27.8°C', wind: '4.2 km/h ↖ NW', hum: '64%', mix: '420m (Low)', cat: 'Hazardous', delta: '+18.4%' },
  'Chennai':        { state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, aqi: 78,  pm25: 32.1,  pm10: 74.5,  nox: 26.2, so2: 9.8,  co: 0.94, o3: 22.0, station: 'Alandur CAAQMS (TNPCB)',     temp: '28.6°C', wind: '12.4 km/h ➔ E', hum: '81%', mix: '880m (Good)', cat: 'Satisfactory', delta: '-3.1%' },
  'Bengaluru':      { state: 'Karnataka',      lat: 12.9716, lng: 77.5946, aqi: 63,  pm25: 24.5,  pm10: 62.0,  nox: 22.4, so2: 8.5,  co: 0.85, o3: 24.2, station: 'BTM Layout CAAQMS (KSPCB)',  temp: '24.5°C', wind: '9.8 km/h ↘ SE', hum: '62%', mix: '950m (High)', cat: 'Satisfactory', delta: '-5.2%' },
  'Mumbai':         { state: 'Maharashtra',    lat: 19.0760, lng: 72.8777, aqi: 172, pm25: 79.2,  pm10: 164.5, nox: 48.6, so2: 15.2, co: 1.52, o3: 28.4, station: 'Bandra CAAQMS (MPCB)',       temp: '29.4°C', wind: '11.2 km/h ➔ W', hum: '76%', mix: '820m (Good)', cat: 'Moderate', delta: '-1.4%' },
  'Kolkata':        { state: 'West Bengal',    lat: 22.5726, lng: 88.3639, aqi: 208, pm25: 142.0, pm10: 218.0, nox: 54.0, so2: 19.5, co: 1.85, o3: 38.0, station: 'Victoria Memorial (WBPCB)',   temp: '27.2°C', wind: '5.4 km/h ↙ SW', hum: '72%', mix: '520m (Mod)', cat: 'Poor', delta: '+8.6%' },
  'Hyderabad':      { state: 'Telangana',      lat: 17.3850, lng: 78.4867, aqi: 146, pm25: 64.2,  pm10: 138.0, nox: 38.0, so2: 13.2, co: 1.28, o3: 31.5, station: 'Sanathnagar (TSPCB)',        temp: '28.1°C', wind: '7.5 km/h ➔ E',  hum: '59%', mix: '760m (Good)', cat: 'Moderate', delta: '+1.2%' },
  'Ahmedabad':      { state: 'Gujarat',        lat: 23.0225, lng: 72.5714, aqi: 184, pm25: 88.5,  pm10: 176.0, nox: 42.1, so2: 14.5, co: 1.45, o3: 36.2, station: 'Maninagar CAAQMS (GPCB)',    temp: '31.2°C', wind: '7.8 km/h ↗ NE', hum: '52%', mix: '680m (Mod)', cat: 'Moderate', delta: '+4.2%' },
  'Pune':           { state: 'Maharashtra',    lat: 18.5204, lng: 73.8567, aqi: 138, pm25: 58.4,  pm10: 132.0, nox: 35.1, so2: 11.8, co: 1.22, o3: 32.1, station: 'Shivajinagar (MPCB)',       temp: '26.8°C', wind: '8.5 km/h ↗ NE', hum: '58%', mix: '780m (Good)', cat: 'Moderate', delta: '+2.0%' },
  'Jaipur':         { state: 'Rajasthan',      lat: 26.9124, lng: 75.7873, aqi: 228, pm25: 168.0, pm10: 252.0, nox: 61.2, so2: 21.0, co: 1.95, o3: 41.0, station: 'Adarsh Nagar (RSPCB)',       temp: '26.5°C', wind: '5.1 km/h ↖ NW', hum: '44%', mix: '480m (Low)', cat: 'Poor', delta: '+9.4%' },
  'Lucknow':        { state: 'Uttar Pradesh',  lat: 26.8467, lng: 80.9462, aqi: 298, pm25: 235.0, pm10: 345.0, nox: 68.5, so2: 24.1, co: 2.10, o3: 44.2, station: 'Talkatora CAAQMS (UPPCB)',   temp: '25.4°C', wind: '3.8 km/h ↖ NW', hum: '68%', mix: '390m (Low)', cat: 'Very Poor', delta: '+14.2%' },
  'Kanpur':         { state: 'Uttar Pradesh',  lat: 26.4499, lng: 80.3319, aqi: 285, pm25: 218.0, pm10: 320.0, nox: 64.0, so2: 22.0, co: 1.98, o3: 41.5, station: 'Nehru Nagar (UPPCB)',         temp: '25.6°C', wind: '4.0 km/h ↖ NW', hum: '66%', mix: '410m (Low)', cat: 'Very Poor', delta: '+12.5%' },
  'Patna':          { state: 'Bihar',          lat: 25.5941, lng: 85.1376, aqi: 258, pm25: 195.0, pm10: 288.0, nox: 62.0, so2: 18.5, co: 1.92, o3: 39.0, station: 'Muradpur CAAQMS (BSPCB)',    temp: '26.0°C', wind: '4.2 km/h ↖ NW', hum: '70%', mix: '430m (Low)', cat: 'Poor', delta: '+11.5%' },
  'Surat':          { state: 'Gujarat',        lat: 21.1702, lng: 72.8311, aqi: 162, pm25: 74.0,  pm10: 155.0, nox: 36.8, so2: 18.2, co: 1.30, o3: 31.0, station: 'Athwa CAAQMS (GPCB)',        temp: '30.5°C', wind: '9.4 km/h ➔ W',  hum: '68%', mix: '750m (Good)', cat: 'Moderate', delta: '-2.1%' },
  'Visakhapatnam':  { state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, aqi: 112, pm25: 48.0,  pm10: 108.0, nox: 31.2, so2: 14.0, co: 1.05, o3: 26.5, station: 'GVMCAir CAAQMS (APPCB)',    temp: '28.8°C', wind: '10.5 km/h ➔ E', hum: '78%', mix: '850m (Good)', cat: 'Moderate', delta: '+0.8%' },
  'Coimbatore':     { state: 'Tamil Nadu',     lat: 11.0168, lng: 76.9558, aqi: 68,  pm25: 28.0,  pm10: 66.0,  nox: 24.0, so2: 8.0,  co: 0.88, o3: 21.0, station: 'SIDCO CAAQMS (TNPCB)',       temp: '26.2°C', wind: '8.8 km/h ↘ SE', hum: '65%', mix: '920m (High)', cat: 'Satisfactory', delta: '-4.2%' },
  'Kochi':          { state: 'Kerala',         lat:  9.9312, lng: 76.2673, aqi: 58,  pm25: 22.0,  pm10: 56.0,  nox: 18.5, so2: 6.8,  co: 0.76, o3: 19.5, station: 'Vyttila CAAQMS (KSPCB)',      temp: '27.5°C', wind: '11.0 km/h ➔ W', hum: '84%', mix: '910m (High)', cat: 'Satisfactory', delta: '-2.8%' },
  'Chandigarh':     { state: 'Chandigarh',     lat: 30.7333, lng: 76.7794, aqi: 175, pm25: 84.0,  pm10: 162.0, nox: 41.0, so2: 12.5, co: 1.35, o3: 33.0, station: 'Sector 22 CAAQMS (CPCC)',    temp: '23.8°C', wind: '6.2 km/h ↖ NW', hum: '56%', mix: '620m (Mod)', cat: 'Moderate', delta: '+3.4%' },
  'Amritsar':       { state: 'Punjab',          lat: 31.6340, lng: 74.8723, aqi: 242, pm25: 178.0, pm10: 268.0, nox: 58.0, so2: 17.0, co: 1.88, o3: 38.5, station: 'Golden Temple Area (PPCB)',  temp: '24.2°C', wind: '4.8 km/h ↖ NW', hum: '60%', mix: '450m (Low)', cat: 'Poor', delta: '+8.2%' },
  'Guwahati':       { state: 'Assam',           lat: 26.1445, lng: 91.7362, aqi: 114, pm25: 52.0,  pm10: 112.0, nox: 29.5, so2: 11.0, co: 1.08, o3: 25.0, station: 'Panbazar CAAQMS (PCBA)',     temp: '24.8°C', wind: '5.6 km/h ↗ NE', hum: '74%', mix: '720m (Good)', cat: 'Moderate', delta: '+1.5%' },
  'Shillong':       { state: 'Meghalaya',       lat: 25.5788, lng: 91.8933, aqi: 62,  pm25: 23.0,  pm10: 59.0,  nox: 16.0, so2: 5.5,  co: 0.65, o3: 18.0, station: 'Laban CAAQMS (MSPCB)',        temp: '18.2°C', wind: '6.5 km/h ↗ NE', hum: '72%', mix: '1100m (High)', cat: 'Satisfactory', delta: '-3.8%' },
  'Aizawl':         { state: 'Mizoram',         lat: 23.7271, lng: 92.7176, aqi: 24,  pm25: 8.5,   pm10: 22.0,  nox: 8.2,  so2: 3.1,  co: 0.32, o3: 14.5, station: 'Bawngkawn CAAQMS (MPCB)',    temp: '19.5°C', wind: '8.5 km/h ↗ NE', hum: '65%', mix: '1200m (High)', cat: 'Good', delta: '-1.5%' },
  'Gangtok':        { state: 'Sikkim',          lat: 27.3314, lng: 88.6138, aqi: 53,  pm25: 19.0,  pm10: 51.0,  nox: 14.2, so2: 4.8,  co: 0.55, o3: 16.5, station: 'Deorali CAAQMS (SPCB)',       temp: '16.8°C', wind: '7.2 km/h ↗ NE', hum: '68%', mix: '1150m (High)', cat: 'Satisfactory', delta: '-2.0%' },
}

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
print("Updated AQIContext.jsx with MASTER_CITY_DATA")

# 2. Update LiveMonitor.jsx to directly use getCityDetails
live_monitor_code = """import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  AreaChart, Area, ReferenceLine
} from 'recharts'

const TOP15_BASE = [
  { state: 'Karnataka',       hist: 63,  peak: 115, winter: 88 },
  { state: 'Andhra Pradesh',  hist: 112, peak: 185, winter: 145 },
  { state: 'Telangana',       hist: 146, peak: 220, winter: 182 },
  { state: 'Odisha',          hist: 158, peak: 240, winter: 195 },
  { state: 'Maharashtra',     hist: 172, peak: 265, winter: 215 },
  { state: 'Gujarat',         hist: 184, peak: 278, winter: 230 },
  { state: 'Madhya Pradesh',  hist: 196, peak: 295, winter: 248 },
  { state: 'West Bengal',     hist: 208, peak: 320, winter: 265 },
  { state: 'Jharkhand',       hist: 214, peak: 335, winter: 272 },
  { state: 'Rajasthan',       hist: 228, peak: 360, winter: 295 },
  { state: 'Punjab',          hist: 242, peak: 385, winter: 320 },
  { state: 'Bihar',           hist: 258, peak: 410, winter: 345 },
  { state: 'Haryana',         hist: 276, peak: 435, winter: 370 },
  { state: 'Uttar Pradesh',   hist: 298, peak: 460, winter: 395 },
  { state: 'Delhi',           hist: 312, peak: 495, winter: 425 },
]

function getSeverityColor(aqi) {
  if (aqi <= 50)  return '#10B981'
  if (aqi <= 100) return '#84CC16'
  if (aqi <= 150) return '#F59E0B'
  if (aqi <= 200) return '#F97316'
  if (aqi <= 300) return '#EF4444'
  return '#BE123C'
}

function getAdvisory(aqi, city) {
  if (aqi > 300) return `Emergency Advisory: Hazardous levels in ${city}. Wear N95 masks outdoors.`
  if (aqi > 200) return `Health Warning: High pollution in ${city}. Vulnerable groups avoid outdoor exertion.`
  if (aqi > 100) return `Moderate Advisory: Air quality acceptable in ${city}; sensitive individuals limit exertion.`
  return `Clean Air: Conditions in ${city} are safe and optimal for outdoor exercise.`
}

export default function LiveMonitor() {
  const { selectedState, selectedCity } = useAQI()
  const [filterMode, setFilterMode] = useState('Historical Mean')
  const [refreshKey, setRefreshKey] = useState(0)

  const currentCityData = useMemo(() => {
    return getCityDetails(selectedCity)
  }, [selectedCity, refreshKey])

  const trajectoryData = useMemo(() => {
    const base = currentCityData.aqi
    return [
      { time: '00:00', aqi: Math.round(base * 0.78) },
      { time: '03:00', aqi: Math.round(base * 0.72) },
      { time: '06:00', aqi: Math.round(base * 1.15), label: 'Rush Spike' },
      { time: '09:00', aqi: Math.round(base * 1.22), label: 'Max Peak' },
      { time: '12:00', aqi: Math.round(base * 0.94) },
      { time: '15:00', aqi: Math.round(base * 0.83) },
      { time: '18:00', aqi: Math.round(base * 1.09), label: 'Evening Peak' },
      { time: '21:00', aqi: Math.round(base * 1.04) },
      { time: 'Now',   aqi: base },
    ]
  }, [currentCityData])

  const chartData = useMemo(() => {
    return TOP15_BASE.map(item => {
      let val = item.hist
      if (filterMode === 'Last 24h Peak') val = item.peak
      if (filterMode === 'Winter Smog Index') val = item.winter
      const isSel = item.state.toLowerCase() === selectedState.toLowerCase() || (selectedState === 'Delhi' && item.state === 'Delhi') || (currentCityData.state.toLowerCase() === item.state.toLowerCase())
      return {
        state: item.state,
        aqi: val,
        isSelected: isSel
      }
    })
  }, [filterMode, selectedState, currentCityData])

  return (
    <div className="live-monitor-v2">
      {/* 4 Top KPI Cards Grid */}
      <div className="grid-top-kpis">
        
        {/* Card 1: Selected State/City AQI */}
        <div className="ui-card card-kpi-highlight">
          <div className="kpi-header-row">
            <div className="kpi-title-tag">
              <span className="pulse-dot red"></span>
              <span className="tag-text">{selectedCity ? `${selectedCity.toUpperCase()} FOCUS` : 'REGIONAL FOCUS'}</span>
            </div>
            <span className="badge-pill danger" style={{ background: currentCityData.aqi > 200 ? '#FFF1F2' : '#FFFBEB', color: currentCityData.aqi > 200 ? '#BE123C' : '#D97706' }}>
              {currentCityData.aqi > 300 ? 'SEVERE / HAZARDOUS' : (currentCityData.aqi > 200 ? 'VERY POOR' : (currentCityData.aqi > 100 ? 'MODERATE / UNHEALTHY' : 'GOOD / CLEAN'))}
            </span>
          </div>
          <div className="kpi-sub">Continuous Monitoring Index • {currentCityData.state}</div>
          <div className="kpi-main-stat">
            <span className="stat-num-huge" style={{ color: getSeverityColor(currentCityData.aqi) }}>{currentCityData.aqi}</span>
            <div className="stat-units-box">
              <span className="stat-unit">AQI (CPCB / EPA Scale)</span>
              <span className="stat-delta danger">{currentCityData.delta} vs baseline</span>
            </div>
          </div>
          <div className="kpi-footer-alert">
            <span className="alert-icon">⚠️</span>
            <span>{getAdvisory(currentCityData.aqi, selectedCity)}</span>
          </div>
        </div>

        {/* Card 2: Pan-India Snapshot */}
        <div className="ui-card">
          <div className="kpi-header-row">
            <div className="kpi-title-simple">PAN-INDIA SNAPSHOT</div>
            <span className="badge-pill gray">32 States Active</span>
          </div>
          <div className="kpi-sub">National Mean AQI</div>
          <div className="kpi-main-stat">
            <span className="stat-num-large" style={{ color: '#D97706' }}>178</span>
            <span className="stat-qualifier" style={{ color: '#D97706' }}>Moderate to Poor</span>
          </div>
          <div className="kpi-progress-wrap">
            <div className="progress-labels">
              <span>Critical Stations (&gt;200)</span>
              <strong>41.2%</strong>
            </div>
            <div className="multi-seg-bar">
              <div className="seg good" style={{ width: '22%' }}></div>
              <div className="seg mod" style={{ width: '36%' }}></div>
              <div className="seg severe" style={{ width: '42%' }}></div>
            </div>
            <div className="seg-legend">
              <span>• Good 22%</span>
              <span>• Mod 36%</span>
              <span>• Severe 42%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Station Outliers */}
        <div className="ui-card">
          <div className="kpi-header-row">
            <div className="kpi-title-simple">STATION OUTLIERS</div>
            <span className="badge-pill teal">Realtime CPCB</span>
          </div>
          <div className="outlier-list">
            <div className="outlier-row">
              <div className="outlier-meta">
                <div className="outlier-name">🍃 Aizawl, Mizoram</div>
                <div className="outlier-sub">Lowest Recorded Station</div>
              </div>
              <div className="outlier-val-box good">
                <span className="outlier-val">24</span>
                <span className="outlier-badge-text">AQI • GOOD</span>
              </div>
            </div>
            <div className="outlier-divider"></div>
            <div className="outlier-row">
              <div className="outlier-meta">
                <div className="outlier-name">⚠️ Bhiwadi, Rajasthan</div>
                <div className="outlier-sub">Peak Industrial Spike</div>
              </div>
              <div className="outlier-val-box danger">
                <span className="outlier-val">346</span>
                <span className="outlier-badge-text">AQI • HAZARDOUS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Dispersion Vector */}
        <div className="ui-card">
          <div className="kpi-header-row">
            <div className="kpi-title-simple">DISPERSION VECTOR</div>
            <span className="badge-pill warning">{currentCityData.aqi > 200 ? 'Inversion Trap: High' : 'Dispersion: Normal'}</span>
          </div>
          <div className="dispersion-grid">
            <div className="disp-metric">
              <span className="disp-label">Surface Temp</span>
              <span className="disp-val">{currentCityData.temp}</span>
              <span className="disp-sub">Dew Point: 19°C</span>
            </div>
            <div className="disp-metric">
              <span className="disp-label">Wind Velocity</span>
              <span className="disp-val">{currentCityData.wind}</span>
              <span className="disp-sub">Directional Flow</span>
            </div>
          </div>
          <div className="disp-footer-row">
            <span>Rel. Humidity: <strong>{currentCityData.hum}</strong></span>
            <span>Mixing Height: <strong style={{ color: currentCityData.aqi > 200 ? '#E11D48' : '#10B981' }}>{currentCityData.mix}</strong></span>
          </div>
        </div>

      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid-main-columns">
        
        {/* LEFT COLUMN: Live Station Intelligence */}
        <div className="left-col-stack">
          
          <div className="ui-card station-intel-card">
            {/* Header */}
            <div className="station-header-bar">
              <div>
                <div className="station-title-row">
                  <span className="pulse-dot red"></span>
                  <h2 className="station-title">Live Station Intelligence</h2>
                </div>
                <div className="station-subtitle">{currentCityData.station}</div>
              </div>
              <span className="badge-pill danger" style={{ fontSize: 13, padding: '4px 10px', background: getSeverityColor(currentCityData.aqi), color: '#FFF' }}>
                AQI: {currentCityData.aqi}
              </span>
            </div>

            {/* 6 Pollutants Grid */}
            <div className="pollutants-6-grid">
              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">PM 2.5</span>
                  <span className="pol-badge danger">{currentCityData.pm25 > 60 ? `${(currentCityData.pm25/15).toFixed(1)}x WHO` : 'Normal'}</span>
                </div>
                <div className="pol-val danger">{currentCityData.pm25}</div>
                <div className="pol-meta">µg/m³ (CPCB: 60)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">PM 10</span>
                  <span className="pol-badge warning">{currentCityData.pm10 > 100 ? `${(currentCityData.pm10/100).toFixed(1)}x CPCB` : 'Normal'}</span>
                </div>
                <div className="pol-val warning">{currentCityData.pm10}</div>
                <div className="pol-meta">µg/m³ (CPCB: 100)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">NOx</span>
                  <span className="pol-badge yellow">{currentCityData.nox > 60 ? 'Elevated' : 'Normal'}</span>
                </div>
                <div className="pol-val text-dark">{currentCityData.nox}</div>
                <div className="pol-meta">µg/m³ (CPCB: 80)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">SO₂</span>
                  <span className="pol-badge good">Good</span>
                </div>
                <div className="pol-val text-good">{currentCityData.so2}</div>
                <div className="pol-meta">µg/m³ (CPCB: 80)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">CO</span>
                  <span className="pol-badge warning">{currentCityData.co > 2 ? 'Moderate' : 'Good'}</span>
                </div>
                <div className="pol-val text-dark">{currentCityData.co}</div>
                <div className="pol-meta">mg/m³ (CPCB: 2.0)</div>
              </div>

              <div className="pollutant-card">
                <div className="pol-top">
                  <span className="pol-name">O₃</span>
                  <span className="pol-badge good">Normal</span>
                </div>
                <div className="pol-val text-good">{currentCityData.o3}</div>
                <div className="pol-meta">µg/m³ (CPCB: 100)</div>
              </div>
            </div>

            {/* 24-Hour Concentration Trajectory */}
            <div className="trajectory-box">
              <div className="traj-header">
                <div className="traj-title">24-Hour Concentration Trajectory ({selectedCity})</div>
                <div className="traj-peaks">
                  <span className="peak-label">🔴 Peak: <strong>{Math.round(currentCityData.aqi * 1.22)}</strong></span>
                  <span className="low-label">• Low: <strong>{Math.round(currentCityData.aqi * 0.72)}</strong></span>
                </div>
              </div>

              <div style={{ width: '100%', height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aqiGradDynamic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getSeverityColor(currentCityData.aqi)} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={getSeverityColor(currentCityData.aqi)} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} hide={true} />
                    <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy 200', fill: '#EF4444', fontSize: 9, position: 'right' }} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11 }} />
                    <Area type="monotone" dataKey="aqi" stroke={getSeverityColor(currentCityData.aqi)} strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGradDynamic)" dot={{ r: 2, fill: getSeverityColor(currentCityData.aqi) }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sensor Network Failover Card */}
            <div className="failover-box">
              <div className="failover-header">
                <div className="failover-title">
                  <span className="shield-icon">🛡️</span>
                  <span>Sensor Network Failover Active</span>
                </div>
                <span className="badge-pill teal">Dual-Feed</span>
              </div>
              <p className="failover-desc">
                Primary node load-balanced with backup CPCB CAAQMS ingestion channel. Sub-second streaming active for {selectedCity}.
              </p>
              <div className="failover-footer">
                <span className="failover-latency">Latency: 18ms • Protocol: HTTP/2 websocket</span>
                <button className="btn-refresh-telemetry" onClick={() => setRefreshKey(k => k + 1)}>
                  🔄 Force Refresh Telemetry
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Top 15 Most Polluted States */}
        <div className="right-col-stack">
          
          <div className="ui-card top-states-card">
            {/* Header & Controls */}
            <div className="states-header-bar">
              <div>
                <div className="states-title-row">
                  <span className="icon">📊</span>
                  <h2 className="states-title">Top 15 Most Polluted States</h2>
                </div>
                <p className="states-subtitle">Multi-Year Mean AQI Aggregation (2022–2025)</p>
              </div>

              {/* Filter Pills */}
              <div className="filter-pills">
                {['Historical Mean', 'Last 24h Peak', 'Winter Smog Index'].map(pill => (
                  <button
                    key={pill}
                    className={'pill-btn ' + (filterMode === pill ? 'active' : '')}
                    onClick={() => setFilterMode(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend Bar */}
            <div className="chart-legend-bar">
              <div className="legend-item">
                <span className="legend-box mod"></span>
                <span>Moderate (90–150)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box unhealthy"></span>
                <span>Unhealthy (151–250)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box severe"></span>
                <span>Severe Hazard (&gt;200)</span>
              </div>
              <div className="legend-baseline">
                CPCB Baseline: 100 | WHO: 25
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div style={{ width: '100%', height: 490 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 35, left: 10, bottom: 0 }}
                  barCategoryGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 500]}
                    ticks={[0, 100, 200, 300, 400, 500]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    width={130}
                    tick={(props) => {
                      const isSel = props.payload.value.toLowerCase() === selectedState.toLowerCase() || (selectedState === 'Delhi' && props.payload.value.includes('Delhi')) || (currentCityData.state.toLowerCase() === props.payload.value.toLowerCase())
                      return (
                        <text
                          x={props.x - 6}
                          y={props.y + 4}
                          textAnchor="end"
                          fill={isSel ? '#E11D48' : '#334155'}
                          fontWeight={isSel ? 900 : 500}
                          fontSize={11}
                        >
                          {isSel ? `👉 ${props.payload.value}` : props.payload.value}
                        </text>
                      )
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div style={{ background: '#0F172A', color: '#FFF', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>
                          <strong style={{ display: 'block', marginBottom: 2 }}>{label}</strong>
                          <span>Mean AQI: <strong>{payload[0].value}</strong></span>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="aqi" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={entry.isSelected ? '#E11D48' : getSeverityColor(entry.aqi)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scale Label & Footer Note */}
            <div className="scale-label-row">
              <div className="scale-text">Scale (AQI): 0 ------- 100 ------- 200 ------- 300 ------- 400 ------- 500</div>
            </div>

            <div className="states-footer-row">
              <div className="methodology-text">
                ℹ️ Methodology: Continuous Ambient Air Quality Monitoring Stations (CAAQMS) weighted median.
              </div>
              <button className="btn-export-csv" onClick={() => alert('Exporting Top 15 AQI State Aggregation as CSV...')}>
                Export CSV 📥
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\LiveMonitor.jsx', 'w', encoding='utf-8') as f:
    f.write(live_monitor_code)
print("Updated LiveMonitor.jsx")

# 3. Update GISMap.jsx to read from MASTER_CITY_DATA (Chennai is 78 everywhere!)
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

const CITIES_LIST = Object.entries(MASTER_CITY_DATA).map(([name, d]) => ({
  city: name,
  ...d
}))

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
print("Updated GISMap.jsx")

# 4. Redesign ForecastAnomalies.jsx
forecast_code = """import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

export default function ForecastAnomalies() {
  const { selectedState, selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)
  const baseAQI = cityData.aqi

  const forecastData = useMemo(() => {
    const days = ['Day 1 (Tomorrow)', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
    const multipliers = [1.02, 1.05, 0.98, 0.92, 0.88, 0.95, 1.01]
    return days.map((d, i) => {
      const pred = Math.round(baseAQI * multipliers[i])
      return {
        day: d,
        predicted: pred,
        lower: Math.round(pred * 0.85),
        upper: Math.round(pred * 1.18),
      }
    })
  }, [baseAQI])

  const anomalies = [
    { date: '2025-11-14', aqi: Math.round(baseAQI * 1.55), z: '+3.42', event: 'Post-Diwali & Stubble Inversion Spike', status: 'Extreme Outlier' },
    { date: '2025-10-28', aqi: Math.round(baseAQI * 1.38), z: '+2.85', event: 'Stagnant Meteorological High',       status: 'Severe Anomaly' },
    { date: '2025-07-18', aqi: Math.round(baseAQI * 0.42), z: '-2.91', event: 'Heavy Monsoon Precipitation Washout', status: 'Clean Spike' },
    { date: '2025-01-08', aqi: Math.round(baseAQI * 1.45), z: '+3.10', event: 'Winter Ground-Level Cold Inversion', status: 'Severe Anomaly' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 4 Top Metric Cards */}
      <div className="grid-top-kpis">
        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">CURRENT BASELINE</span>
            <span className="badge-pill teal">{selectedCity}</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0D9488', marginTop: 6 }}>{baseAQI} <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Model: ARIMA (2,1,2) + Random Forest</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">7-DAY FORECAST MEAN</span>
            <span className="badge-pill warning">Projected</span>
          </div>
          <div className="stat-num-large" style={{ color: '#F59E0B', marginTop: 6 }}>{Math.round(baseAQI * 0.98)} <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Confidence Interval: 95% Bound</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">ANOMALIES DETECTED</span>
            <span className="badge-pill danger">Z-Score &gt; 2.5</span>
          </div>
          <div className="stat-num-large" style={{ color: '#E11D48', marginTop: 6 }}>1,125 <small style={{ fontSize: 13, color: '#64748B' }}>Events</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Algorithm: Tukey IQR + Rolling Z-Score</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">PEAK RISK PROBABILITY</span>
            <span className="badge-pill danger">Critical</span>
          </div>
          <div className="stat-num-large" style={{ color: '#BE123C', marginTop: 6 }}>{baseAQI > 200 ? '78.4%' : '24.1%'}</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Likelihood of &gt;200 AQI spike this week</div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>7-Day Predictive AQI Trajectory with 95% Confidence Bounds</h2>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Ensemble Time-Series Forecasting for {selectedCity} ({cityData.state})</p>
          </div>
          <span className="badge-pill teal">Machine Learning Forecast</span>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Unhealthy Threshold (200)', fill: '#EF4444', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="upper" stroke="#93C5FD" fill="#EFF6FF" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="predicted" stroke="#2563EB" strokeWidth={3} fill="url(#foreGrad)" />
              <Area type="monotone" dataKey="lower" stroke="#93C5FD" fill="#FFFFFF" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Anomaly Events Table */}
      <div className="ui-card">
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Historical Spatio-Temporal Anomaly Log ({selectedCity})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Date</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Peak AQI</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Z-Score Deviation</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Identified Root Cause</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Severity Category</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{a.date}</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: a.aqi > 200 ? '#E11D48' : '#10B981' }}>{a.aqi}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#64748B' }}>{a.z} σ</td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>{a.event}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge-pill ${a.aqi > 200 ? 'danger' : 'success'}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\ForecastAnomalies.jsx', 'w', encoding='utf-8') as f:
    f.write(forecast_code)
print("Updated ForecastAnomalies.jsx")

# 5. Redesign PolicySimulator.jsx
policy_code = """import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

export default function PolicySimulator() {
  const { selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)
  const baseAQI = cityData.aqi

  const [trafficRed, setTrafficRed] = useState(25)
  const [indFilter, setIndFilter]   = useState(30)
  const [stubbleCtrl, setStubble]   = useState(40)
  const [greenCanopy, setGreen]     = useState(15)

  // Simulation calculation
  const simResults = useMemo(() => {
    const trafficDrop = (trafficRed * 0.35)
    const indDrop     = (indFilter * 0.45)
    const stubbleDrop = (stubbleCtrl * 0.50)
    const greenDrop   = (greenCanopy * 0.20)
    
    const totalDropPct = Math.min(65, trafficDrop + indDrop + stubbleDrop + greenDrop)
    const newAQI = Math.max(25, Math.round(baseAQI * (1 - totalDropPct / 100)))
    const aqiReduction = baseAQI - newAQI
    const avoidedER = Math.round((aqiReduction / baseAQI) * 48.5)

    return {
      newAQI,
      aqiReduction,
      pctDrop: totalDropPct.toFixed(1),
      avoidedER,
    }
  }, [baseAQI, trafficRed, indFilter, stubbleCtrl, greenCanopy])

  const chartComparison = [
    { name: 'Baseline AQI (Current)', aqi: baseAQI, fill: '#E11D48' },
    { name: 'Simulated Policy AQI',   aqi: simResults.newAQI, fill: '#10B981' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Top Banner */}
      <div className="ui-card" style={{ background: 'linear-gradient(135deg, #0D9488, #1E293B)', color: '#FFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#FFF' }}>🏛️ Municipal Policy Impact & Intervention Simulator</h2>
            <p style={{ fontSize: 12, color: '#CCFBF1', margin: '4px 0 0' }}>
              Simulate emission controls and calculate health impact for <strong>{selectedCity} ({cityData.state})</strong>
            </p>
          </div>
          <span className="badge-pill" style={{ background: '#CCFBF1', color: '#0F766E' }}>Empirical Response Model</span>
        </div>
      </div>

      {/* 2-Column: Sliders on Left, Results on Right */}
      <div className="grid-main-columns">
        
        {/* Left Column: Sliders */}
        <div className="ui-card">
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Intervention Controls & Levers</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🚗 Vehicular Traffic Curtailment (Odd-Even / EV Subsidy)</span>
                <strong style={{ color: '#0D9488' }}>{trafficRed}%</strong>
              </div>
              <input type="range" min="0" max="60" value={trafficRed} onChange={e => setTrafficRed(Number(e.target.value))} style={{ width: '100%', accentColor: '#0D9488' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🏭 Industrial Emission Stack Scrubbers & Bag Filters</span>
                <strong style={{ color: '#2563EB' }}>{indFilter}%</strong>
              </div>
              <input type="range" min="0" max="80" value={indFilter} onChange={e => setIndFilter(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563EB' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🌾 Agricultural Biomass & Stubble Management</span>
                <strong style={{ color: '#F59E0B' }}>{stubbleCtrl}%</strong>
              </div>
              <input type="range" min="0" max="90" value={stubbleCtrl} onChange={e => setStubble(Number(e.target.value))} style={{ width: '100%', accentColor: '#F59E0B' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>🌳 Urban Green Canopy & Water Mist Spraying</span>
                <strong style={{ color: '#10B981' }}>{greenCanopy}%</strong>
              </div>
              <input type="range" min="0" max="50" value={greenCanopy} onChange={e => setGreen(Number(e.target.value))} style={{ width: '100%', accentColor: '#10B981' }} />
            </div>

          </div>

          <div style={{ marginTop: 24, padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11, color: '#64748B' }}>
            ℹ️ Response coefficients calibrated against 2022–2025 seasonal regression and CPCB interventions.
          </div>
        </div>

        {/* Right Column: Simulated Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div className="ui-card" style={{ background: '#F0FDFA', borderColor: '#99F6E4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase' }}>Simulated Outcome ({selectedCity})</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: '#0F766E' }}>{simResults.newAQI}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0D9488' }}>AQI (Down from {baseAQI})</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge-pill success" style={{ fontSize: 12 }}>-{simResults.pctDrop}% Reduction</span>
                <div style={{ fontSize: 12, color: '#0F766E', fontWeight: 700, marginTop: 4 }}>🔻 {simResults.aqiReduction} AQI Units Dropped</div>
              </div>
            </div>
          </div>

          <div className="ui-card">
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>Baseline vs Simulated Comparison</h3>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartComparison} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" domain={[0, Math.max(350, baseAQI + 50)]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <Tooltip />
                  <Bar dataKey="aqi" radius={[0, 6, 6, 0]}>
                    {chartComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ui-card" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🏥</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1E40AF' }}>Avoided Hospitalization & Emergency Visits</div>
                <div style={{ fontSize: 11, color: '#3B82F6' }}>Estimated <strong>{simResults.avoidedER} daily respiratory hospital admissions avoided</strong> under this policy mix.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\PolicySimulator.jsx', 'w', encoding='utf-8') as f:
    f.write(policy_code)
print("Updated PolicySimulator.jsx")

# 6. Redesign HealthCalc.jsx
health_code = """import { useState, useMemo } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'

export default function HealthCalc() {
  const { selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)
  
  // AQLI State
  const [pm25Input, setPm25Input] = useState(cityData.pm25)
  const [roomSqft, setRoomSqft]   = useState(250)
  const [ceilingFt, setCeilingFt] = useState(10)

  // Recalculate AQLI
  const aqliResults = useMemo(() => {
    const whoStandard = 5.0
    const excess = Math.max(0, pm25Input - whoStandard)
    const yearsLost = (excess * 0.098).toFixed(1)
    const monthsLost = Math.round(yearsLost * 12)

    return {
      yearsLost,
      monthsLost,
      risk: pm25Input > 100 ? 'Severe Health Hazard' : (pm25Input > 50 ? 'High Risk' : 'Moderate Risk'),
    }
  }, [pm25Input])

  // Recalculate CADR
  const cadrResults = useMemo(() => {
    const roomVolumeCuFt = roomSqft * ceilingFt
    const cadrCFM = Math.round((roomVolumeCuFt * 5) / 60)
    const cadrM3H = Math.round(cadrCFM * 1.699)
    const indoorClean = Math.round(pm25Input * 0.12)

    return {
      cadrCFM,
      cadrM3H,
      indoorClean,
    }
  }, [pm25Input, roomSqft, ceilingFt])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2-Column Main Layout */}
      <div className="grid-main-columns">
        
        {/* Left: AQLI Life Expectancy Calculator */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🫁</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>AQLI Life Expectancy Impact Calculator</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>University of Chicago Air Quality Life Index Formula</p>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
              Annual Average PM2.5 Concentration (µg/m³) for {selectedCity}:
            </label>
            <input
              type="number"
              value={pm25Input}
              onChange={e => setPm25Input(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
            />
          </div>

          <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>Estimated Longevity Reduction</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#BE123C' }}>{aqliResults.yearsLost}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#E11D48' }}>Years Lost</span>
            </div>
            <div style={{ fontSize: 12, color: '#9F1239', marginTop: 4 }}>
              ≈ <strong>{aqliResults.monthsLost} months</strong> shorter life expectancy compared to WHO guideline standard (5 µg/m³).
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
            🛡️ <strong>Health Advisory:</strong> Long-term sustained exposure to {pm25Input} µg/m³ PM2.5 increases coronary artery disease, stroke, and chronic respiratory illness risk.
          </div>
        </div>

        {/* Right: Room Air Purifier CADR Sizing Tool */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Smart Air Purifier CADR Sizing Engine</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>AHAM AC-1 Certified Clean Air Delivery Rate Sizing</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Room Area (sq. ft.):</label>
              <input
                type="number"
                value={roomSqft}
                onChange={e => setRoomSqft(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Ceiling Height (ft.):</label>
              <input
                type="number"
                value={ceilingFt}
                onChange={e => setCeilingFt(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Recommended CADR Rating</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#166534' }}>{cadrResults.cadrCFM}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#15803D' }}>CFM ({cadrResults.cadrM3H} m³/h)</span>
            </div>
            <div style={{ fontSize: 12, color: '#14532D', marginTop: 4 }}>
              Delivers <strong>5 Air Changes per Hour (ACH)</strong> in your {roomSqft} sq.ft room.
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Outdoor Ambient PM2.5:</span>
              <strong style={{ color: '#E11D48' }}>{pm25Input} µg/m³</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Expected Indoor PM2.5 with H13 HEPA:</span>
              <strong style={{ color: '#10B981' }}>{cadrResults.indoorClean} µg/m³ (Safe Zone)</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\HealthCalc.jsx', 'w', encoding='utf-8') as f:
    f.write(health_code)
print("Updated HealthCalc.jsx")

# 7. Redesign Benchmarks.jsx
benchmarks_code = """import { useState } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'

export default function Benchmarks() {
  const { selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)

  const benchmarks = [
    { pollutant: 'PM2.5 (Annual)', cpcb: '40 µg/m³', who: '5 µg/m³', actual: `${cityData.pm25} µg/m³`, status: cityData.pm25 > 40 ? 'CPCB Exceeded' : 'CPCB Compliant' },
    { pollutant: 'PM10 (Annual)',  cpcb: '60 µg/m³', who: '15 µg/m³', actual: `${cityData.pm10} µg/m³`, status: cityData.pm10 > 60 ? 'CPCB Exceeded' : 'CPCB Compliant' },
    { pollutant: 'NO2 (Annual)',   cpcb: '40 µg/m³', who: '10 µg/m³', actual: `${cityData.nox} µg/m³`, status: cityData.nox > 40 ? 'Elevated' : 'Compliant' },
    { pollutant: 'SO2 (24-Hour)',  cpcb: '80 µg/m³', who: '40 µg/m³', actual: `${cityData.so2} µg/m³`, status: 'Compliant' },
    { pollutant: 'CO (8-Hour)',    cpcb: '2.0 mg/m³', who: '4.0 mg/m³', actual: `${cityData.co} mg/m³`, status: cityData.co > 2 ? 'Moderate' : 'Compliant' },
    { pollutant: 'O3 (8-Hour)',    cpcb: '100 µg/m³', who: '100 µg/m³', actual: `${cityData.o3} µg/m³`, status: 'Compliant' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2 Top Compliance Gauges */}
      <div className="grid-main-columns">
        
        <div className="ui-card" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>National CPCB Compliance Benchmark</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#D97706' }}>55.5%</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>Compliant Days (&le;100 AQI)</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#FDE68A', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '55.5%', height: '100%', background: '#D97706' }}></div>
          </div>
          <div style={{ fontSize: 11, color: '#92400E', marginTop: 8 }}>Based on 130,868 compliant observations across 235,785 national sensor readings.</div>
        </div>

        <div className="ui-card" style={{ background: '#FFF1F2', borderColor: '#FECDD3' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>Global WHO Guideline Compliance</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#BE123C' }}>17.8%</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#9F1239' }}>Compliant Days (&le;50 AQI)</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#FECDD3', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: '17.8%', height: '100%', background: '#E11D48' }}></div>
          </div>
          <div style={{ fontSize: 11, color: '#9F1239', marginTop: 8 }}>Only 41,971 out of 2.35 lakh daily logs satisfy WHO strict clean air standards.</div>
        </div>

      </div>

      {/* Comparison Matrix Table */}
      <div className="ui-card">
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
          Standard Threshold Matrix vs Observed Levels ({selectedCity}, {cityData.state})
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Criteria Pollutant</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>CPCB Indian Limit</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>WHO Global Limit</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Observed Level</th>
              <th style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0F172A' }}>{b.pollutant}</td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>{b.cpcb}</td>
                <td style={{ padding: '10px 12px', color: '#334155' }}>{b.who}</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>{b.actual}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge-pill ${b.status.includes('Exceeded') ? 'danger' : 'success'}`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\Benchmarks.jsx', 'w', encoding='utf-8') as f:
    f.write(benchmarks_code)
print("Updated Benchmarks.jsx")

# 8. Redesign AlertsReports.jsx
alerts_code = """import { useState } from 'react'
import { useAQI, getCityDetails } from '../context/AQIContext'

export default function AlertsReports() {
  const { selectedCity, selectedState } = useAQI()
  const cityData = getCityDetails(selectedCity)

  const [alertSent, setAlertSent] = useState(false)

  const handleSendAlert = () => {
    setAlertSent(true)
    setTimeout(() => setAlertSent(false), 4000)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2-Column Main Layout */}
      <div className="grid-main-columns">
        
        {/* Left: Report Generator */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Executive Air Quality Report Generator</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Formatted CPCB Compliance Documentation & Statistical Summary</p>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, marginBottom: 16 }}>
            Generate and export comprehensive statistical reports containing 16 ggplot2 visualizations, ANOVA hypothesis test outputs, Random Forest variable importance scores, and municipal policy recommendations for <strong>{selectedState}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn-telemetry"
              style={{ background: '#0D9488', borderColor: '#0D9488', color: '#FFF', justifyContent: 'center', padding: '10px 16px' }}
              onClick={() => window.open(`/api/report?state=${encodeURIComponent(selectedState)}`, '_blank')}
            >
              📥 View & Download HTML Executive Report
            </button>
            <button
              className="btn-export-csv"
              style={{ padding: '10px 16px', textAlign: 'center' }}
              onClick={() => alert(`Exporting 235,785 clean CPCB observation records for ${selectedState} as CSV...`)}
            >
              📊 Export Full Clean Dataset (CSV)
            </button>
          </div>
        </div>

        {/* Right: Emergency Telemetry Dispatcher */}
        <div className="ui-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Automated Emergency Advisory Dispatcher</h2>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Trigger municipal public health notifications</p>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Active City Target: {selectedCity} ({cityData.state})</div>
            <div style={{ fontSize: 12, color: '#E11D48', fontWeight: 800, marginTop: 4 }}>Current Index: {cityData.aqi} AQI ({cityData.cat})</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Primary Trigger: PM2.5 ({cityData.pm25} µg/m³)</div>
          </div>

          {alertSent ? (
            <div style={{ padding: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, color: '#166534', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
              ✅ Emergency Telemetry Advisory successfully dispatched to municipal monitoring network!
            </div>
          ) : (
            <button
              className="btn-telemetry"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}
              onClick={handleSendAlert}
            >
              🚨 Dispatch Real-Time Health Advisory Alert
            </button>
          )}
        </div>

      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\AlertsReports.jsx', 'w', encoding='utf-8') as f:
    f.write(alerts_code)
print("Updated AlertsReports.jsx")

print("All pages successfully upgraded to v2.0-PRO clean design system!")
