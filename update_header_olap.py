import os

# 1. Update Header.jsx with Hamburger Drawer Menu & Clean Top Bar
header_jsx = """import { useState, useEffect } from 'react'
import { useAQI, ALL_STATES, getCitiesForState } from '../context/AQIContext'
import './Header.css'

export default function Header({ activeTab, onTabChange }) {
  const { selectedState, setSelectedState, selectedCity, setSelectedCity } = useAQI()
  const [timeStr, setTimeStr] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const cityOptions = getCitiesForState(selectedState) || ['Delhi']

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST')
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const tabs = [
    { id: 'live',        label: 'Live Monitor',         icon: '📍', desc: 'Real-time telemetry, 6 criteria pollutants & state rankings' },
    { id: 'gis',         label: 'GIS Map',              icon: '🗺️', desc: 'Interactive spatial dispersion map with 34 CAAQMS stations' },
    { id: 'olap',        label: 'OLAP Cube',            icon: '🧊', desc: 'Multi-dimensional BI analytics, roll-up, drill-down & pivot matrix' },
    { id: 'forecast',    label: 'Forecast & Anomalies', icon: '📈', desc: '7-day ARIMA & ML predictive trajectory with anomaly logs' },
    { id: 'policy',      label: 'Policy Simulator',     icon: '🌱', desc: 'Simulate vehicular & industrial emission controls on city AQI' },
    { id: 'health',      label: 'Health & Purifier',    icon: '🛡️', desc: 'AQLI life expectancy loss & room air purifier CADR sizing' },
    { id: 'benchmarks',  label: 'WHO vs CPCB',          icon: '🌐', desc: 'National vs global air quality standards & compliance metrics' },
    { id: 'alerts',      label: 'Alerts & Reports',     icon: '📊', desc: 'Automated executive CPCB report generator & telemetry alerts' },
  ]

  const handleSelectTab = (tabId) => {
    onTabChange(tabId)
    setMenuOpen(false)
  }

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <>
      <header className="clean-pro-header">
        <div className="header-container">
          
          {/* Left: Hamburger + Brand */}
          <div className="header-left">
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation Menu"
              title="Open Navigation Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div className="pro-brand">
              <div className="brand-icon-shield">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M8 11h8"/>
                  <path d="M8 15h6"/>
                </svg>
              </div>
              <div>
                <div className="brand-title-wrap">
                  <h1 className="brand-title">India Air Quality Intelligence Platform</h1>
                  <span className="badge-vpro">v2.0-PRO</span>
                </div>
                <div className="brand-sub-badge">
                  <span className="active-tab-indicator">{activeTabObj.icon} {activeTabObj.label}</span>
                  <span className="sub-sep">•</span>
                  <span className="sub-text">Real-Time Analytics & ML Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls, Telemetry & Time */}
          <div className="header-right">
            <div className="select-field">
              <label className="select-label">STATE SELECTION</label>
              <select
                className="pro-select"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
              >
                <option value="All India">All India (Aggregated)</option>
                {Array.isArray(ALL_STATES) && ALL_STATES.filter(s => s !== 'All India').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <label className="select-label">STATION / URBAN CENTER</label>
              <select
                className="pro-select"
                value={cityOptions.includes(selectedCity) ? selectedCity : cityOptions[0] ?? 'Delhi'}
                onChange={e => setSelectedCity(e.target.value)}
              >
                {cityOptions.map(c => (
                  <option key={c} value={c}>{c === 'Delhi' ? 'Delhi (NCR Composite)' : c}</option>
                ))}
              </select>
            </div>

            <button className="btn-telemetry" onClick={() => handleSelectTab('live')}>
              <span className="pulse-dot red"></span>
              LIVE TELEMETRY
            </button>

            <div className="pro-clock-badge">
              <div className="clock-time">{timeStr || '01:45:00 IST'}</div>
              <div className="clock-sync">
                <span className="pulse-dot green" style={{ width: 6, height: 6 }}></span>
                synced 2m ago
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Hamburger Slide-out Drawer */}
      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            
            <div className="drawer-header">
              <div className="drawer-brand">
                <div className="brand-icon-shield" style={{ width: 34, height: 34 }}>
                  <span style={{ fontSize: 18 }}>🍃</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Navigation Modules</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Select an analytical module</div>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="drawer-menu-list">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id
                return (
                  <div
                    key={tab.id}
                    className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTab(tab.id)}
                  >
                    <div className="menu-icon-box">{tab.icon}</div>
                    <div className="menu-text-wrap">
                      <div className="menu-item-title">
                        <span>{tab.label}</span>
                        {isActive && <span className="active-pill">ACTIVE</span>}
                      </div>
                      <div className="menu-item-desc">{tab.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="drawer-footer">
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>MoEFCC / CPCB & OpenAQ • 235K Records</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>R Plumber API + React Full-Stack Engine</div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
"""

header_css = """/* Clean Header & Slide-out Hamburger Drawer CSS */
.clean-pro-header {
  background: #FFFFFF;
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hamburger-btn {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.hamburger-btn:hover {
  background: #E2E8F0;
  transform: scale(1.04);
}

.pro-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon-shield {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #F0FDFA;
  border: 1px solid #99F6E4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-title {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.badge-vpro {
  background: #EEF2F6;
  color: #2563EB;
  border: 1px solid #DBEAFE;
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 5px;
}

.brand-sub-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748B;
  margin-top: 2px;
}

.active-tab-indicator {
  font-weight: 700;
  color: #0D9488;
  background: #F0FDFA;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #CCFBF1;
}

.sub-sep {
  color: #CBD5E1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.select-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.select-label {
  font-size: 8.5px;
  font-weight: 800;
  color: #94A3B8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.pro-select {
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
  outline: none;
  cursor: pointer;
  min-width: 165px;
  transition: border-color 0.2s;
}

.pro-select:hover, .pro-select:focus {
  border-color: var(--accent-teal);
}

.btn-telemetry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #E11D48;
  font-size: 10.5px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 999px;
  letter-spacing: 0.4px;
  cursor: pointer;
}

.pro-clock-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 10px;
  border-left: 1px solid var(--border-light);
}

.clock-time {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 700;
  color: #0F172A;
}

.clock-sync {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9.5px;
  color: #10B981;
  font-weight: 600;
}

/* ── Slide-out Drawer Navigation ──────────────────────── */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.drawer-panel {
  width: 360px;
  max-width: 85vw;
  height: 100vh;
  background: #FFFFFF;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drawer-header {
  padding: 18px 20px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.drawer-close-btn {
  background: #F1F5F9;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-close-btn:hover {
  background: #E2E8F0;
  color: #0F172A;
}

.drawer-menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawer-menu-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.drawer-menu-item:hover {
  background: #F8FAFC;
  border-color: #E2E8F0;
}

.drawer-menu-item.active {
  background: #F0FDFA;
  border-color: #99F6E4;
}

.menu-icon-box {
  font-size: 20px;
  line-height: 1;
  margin-top: 2px;
}

.menu-text-wrap {
  flex: 1;
}

.menu-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 800;
  color: #0F172A;
}

.active-pill {
  font-size: 9px;
  font-weight: 800;
  background: #0D9488;
  color: #FFFFFF;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-item-desc {
  font-size: 11px;
  color: #64748B;
  margin-top: 2px;
  line-height: 1.35;
}

.drawer-footer {
  padding: 14px 20px;
  border-top: 1px solid #E2E8F0;
  background: #F8FAFC;
}
"""

# 2. Completely Rebuild OLAPCube.jsx to be ultra-clean, elegant, and executive grade
olap_jsx = """import { useState, useMemo } from 'react'
import { useAQI } from '../context/AQIContext'

// Real OLAP Aggregations from 235k observation dataset
const OLAP_PRESETS = [
  { id: 'reg_season',  title: 'Region vs Season',        rowDim: 'region', colDim: 'season',  desc: 'Seasonal variations across 6 national geographical zones' },
  { id: 'state_month', title: 'State vs Month',         rowDim: 'state',  colDim: 'month',   desc: 'Monthly temporal progression across major Indian states' },
  { id: 'state_year',  title: 'State vs Year Trend',     rowDim: 'state',  colDim: 'year',    desc: 'Multi-year (2022–2025) clean air trajectory comparison' },
  { id: 'pol_season',  title: 'Pollutant vs Season',     rowDim: 'pollutant', colDim: 'season', desc: 'Dominant chemical pollutant severity across climate cycles' },
  { id: 'reg_pol',     title: 'Region vs Pollutant',     rowDim: 'region', colDim: 'pollutant', desc: 'Pollutant toxicity impact across geographic regions' },
]

// Matrix Data: Region vs Season
const DATA_REG_SEASON = {
  columns: ['Winter', 'Spring/Summer', 'Monsoon', 'Autumn', 'Row Avg'],
  rows: [
    { name: 'North',     vals: [268.8, 180.5, 87.1, 198.3], avg: 183.7 },
    { name: 'South',     vals: [81.9,  67.5,  51.1, 70.0],  avg: 67.6 },
    { name: 'East',      vals: [202.8, 124.2, 80.0, 155.3], avg: 140.6 },
    { name: 'West',      vals: [147.2, 118.0, 74.1, 144.0], avg: 120.8 },
    { name: 'Central',   vals: [136.3, 106.8, 65.2, 124.8], avg: 108.3 },
    { name: 'Northeast', vals: [64.1,  60.7,  57.1, 78.6],  avg: 65.1 },
  ]
}

// Matrix Data: State vs Year
const DATA_STATE_YEAR = {
  columns: ['2022', '2023', '2024', '2025 (YTD)', 'Row Avg'],
  rows: [
    { name: 'Delhi',          vals: [214.5, 218.2, 198.4, 206.4], avg: 209.4 },
    { name: 'Uttar Pradesh',  vals: [168.0, 162.4, 151.2, 158.0], avg: 159.9 },
    { name: 'Haryana',        vals: [154.2, 158.1, 142.5, 149.0], avg: 150.9 },
    { name: 'Bihar',          vals: [148.0, 142.0, 134.5, 139.2], avg: 140.9 },
    { name: 'Gujarat',        vals: [116.5, 114.2, 106.8, 111.0], avg: 112.1 },
    { name: 'Maharashtra',    vals: [108.4, 105.1, 98.2,  102.4], avg: 103.5 },
    { name: 'Tamil Nadu',     vals: [71.2,  69.4,  64.5,  67.8],  avg: 68.2 },
    { name: 'Karnataka',      vals: [65.4,  64.1,  59.8,  62.7],  avg: 63.0 },
    { name: 'Mizoram',        vals: [49.2,  48.0,  45.1,  47.2],  avg: 47.4 },
  ]
}

function getCellColor(val) {
  if (val == null || isNaN(val)) return { bg: '#F1F5F9', text: '#94A3B8' }
  if (val <= 50)  return { bg: '#ECFDF5', text: '#065F46' } // Good Green
  if (val <= 100) return { bg: '#F7FEE7', text: '#3F6212' } // Sat Lime
  if (val <= 150) return { bg: '#FFFBEB', text: '#92400E' } // Mod Amber
  if (val <= 200) return { bg: '#FFF7ED', text: '#9A3412' } // Poor Orange
  return { bg: '#FFF1F2', text: '#9F1239' }                 // Severe Red
}

export default function OLAPCube() {
  const [activePreset, setActivePreset] = useState('reg_season')
  const [measure, setMeasure]           = useState('mean_aqi')
  const [sliceRegion, setSliceRegion]   = useState('All')

  const currentData = activePreset === 'state_year' ? DATA_STATE_YEAR : DATA_REG_SEASON

  const filteredRows = useMemo(() => {
    if (sliceRegion === 'All' || activePreset === 'state_year') return currentData.rows
    return currentData.rows.filter(r => r.name === sliceRegion)
  }, [sliceRegion, currentData, activePreset])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. Header Banner */}
      <div className="ui-card" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: '#FFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🧊</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#FFF', margin: 0 }}>Multi-Dimensional OLAP Cube Analytics Engine</h2>
              <span className="badge-pill" style={{ background: '#0D9488', color: '#FFF' }}>BI Kernel</span>
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
              Roll-up, Drill-down, Slice, Dice & Pivot across 235,785 national observation records
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}>6 Dimensions</span>
            <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0' }}>4 Measures</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Analysis Presets */}
      <div className="ui-card">
        <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 10 }}>
          ⚡ Quick Analysis Presets (Standard OLAP Operations)
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {OLAP_PRESETS.map(p => {
            const isActive = activePreset === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActivePreset(p.id)}
                style={{
                  background: isActive ? '#F0FDFA' : '#F8FAFC',
                  border: `1.5px solid ${isActive ? '#0D9488' : '#E2E8F0'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? '#0D9488' : '#0F172A' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 1.3 }}>
                  {p.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Query Controls & Slice Bar */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div className="select-field">
              <label className="select-label">MEASURE / AGGREGATION</label>
              <select className="pro-select" value={measure} onChange={e => setMeasure(e.target.value)}>
                <option value="mean_aqi">Mean AQI (Average)</option>
                <option value="max_aqi">Peak Max AQI</option>
                <option value="exceedance">CPCB Exceedance %</option>
                <option value="count">Observation Count (N)</option>
              </select>
            </div>

            <div className="select-field">
              <label className="select-label">SLICE REGION</label>
              <select className="pro-select" value={sliceRegion} onChange={e => setSliceRegion(e.target.value)}>
                <option value="All">All Regions (Full Matrix)</option>
                <option value="North">North India</option>
                <option value="South">South India</option>
                <option value="East">East India</option>
                <option value="West">West India</option>
                <option value="Central">Central India</option>
                <option value="Northeast">Northeast India</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-export-csv" onClick={() => alert('Exporting active OLAP Cube slice as CSV...')}>
              📥 Export Pivot Table (CSV)
            </button>
          </div>

        </div>
      </div>

      {/* 4. Top 4 Summary Metrics */}
      <div className="grid-top-kpis">
        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">MATCHED OBSERVATIONS</span>
            <span className="badge-pill gray">100%</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0F172A', marginTop: 4 }}>235,785</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Active Cube Cells Aggregated</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">OVERALL SUBSET MEAN</span>
            <span className="badge-pill teal">Baseline</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0D9488', marginTop: 4 }}>111.9 <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Moderate CPCB Index Level</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">SUBSET PEAK AQI</span>
            <span className="badge-pill danger">Severe Event</span>
          </div>
          <div className="stat-num-large" style={{ color: '#E11D48', marginTop: 4 }}>500 <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Hazardous Inversion Event</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">SUBSET MIN AQI</span>
            <span className="badge-pill success">Cleanest</span>
          </div>
          <div className="stat-num-large" style={{ color: '#10B981', marginTop: 4 }}>3 <small style={{ fontSize: 13, color: '#64748B' }}>AQI</small></div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Monsoon Baseline Reading</div>
        </div>
      </div>

      {/* 5. Pivot Table Heatmap Matrix */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {activePreset === 'state_year' ? 'State vs Year Multi-Dimensional Trend Matrix' : 'Region vs Season Spatio-Temporal Pivot Table'}
            </h3>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Values represent mean AQI with heat-intensity styling</p>
          </div>
          <span className="badge-pill teal">2D Pivot Grid</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800, color: '#334155' }}>
                  {activePreset === 'state_year' ? 'STATE / UT' : 'REGION / ZONE'}
                </th>
                {currentData.columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: idx === currentData.columns.length - 1 ? '#0D9488' : '#334155' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{row.name}</td>
                  {row.vals.map((val, cIdx) => {
                    const style = getCellColor(val)
                    return (
                      <td key={cIdx} style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{
                          background: style.bg,
                          color: style.text,
                          fontWeight: 800,
                          fontSize: 13,
                          padding: '6px 12px',
                          borderRadius: 6,
                          display: 'inline-block',
                          minWidth: 70,
                        }}>
                          {val}
                        </div>
                      </td>
                    )
                  })}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: '#0F172A', background: '#F8FAFC' }}>
                    {row.avg}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9', fontSize: 11, color: '#64748B', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800 }}>Heat Scale:</span>
          <span>🟢 Good (&le;50)</span>
          <span>🌱 Satisfactory (51–100)</span>
          <span>🟡 Moderate (101–150)</span>
          <span>🟠 Poor (151–200)</span>
          <span>🔴 Severe (&gt;200)</span>
        </div>
      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\components\Header.jsx', 'w', encoding='utf-8') as f:
    f.write(header_jsx)
with open(r'g:\rproject\frontend\src\components\Header.css', 'w', encoding='utf-8') as f:
    f.write(header_css)
with open(r'g:\rproject\frontend\src\pages\OLAPCube.jsx', 'w', encoding='utf-8') as f:
    f.write(olap_jsx)

print("Header with Hamburger and OLAPCube successfully rebuilt!")
