header_jsx = """import { useState, useEffect } from 'react'
import { useAQI, ALL_STATES, getCitiesForState } from '../context/AQIContext'
import './Header.css'

export default function Header({ activeTab, onTabChange }) {
  const { selectedState, setSelectedState, selectedCity, setSelectedCity } = useAQI()
  const [timeStr, setTimeStr] = useState('')

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
    { id: 'live',        label: 'Live Monitor',         icon: '📍' },
    { id: 'gis',         label: 'GIS Map',              icon: '🗺️' },
    { id: 'olap',        label: 'OLAP Cube',            icon: '🧊' },
    { id: 'forecast',    label: 'Forecast & Anomalies', icon: '📈' },
    { id: 'policy',      label: 'Policy Simulator',     icon: '🌱' },
    { id: 'health',      label: 'Health & Purifier',    icon: '🛡️' },
    { id: 'benchmarks',  label: 'WHO vs CPCB',          icon: '🌐' },
    { id: 'alerts',      label: 'Alerts & Reports',     icon: '📊' },
  ]

  const handleStateChange = (e) => {
    setSelectedState(e.target.value)
  }

  return (
    <header className="pro-header">
      <div className="pro-header-top">
        {/* Brand */}
        <div className="pro-brand">
          <div className="brand-icon-shield">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <p className="brand-subtitle">Real-Time Analytics • GIS Mapping • ML Forecasting • Policy Simulation</p>
          </div>
        </div>

        {/* Controls */}
        <div className="pro-header-controls">
          <div className="select-field">
            <label className="select-label">STATE SELECTION</label>
            <select
              className="pro-select"
              value={selectedState}
              onChange={handleStateChange}
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

          <button className="btn-telemetry">
            <span className="pulse-dot red"></span>
            LIVE TELEMETRY
          </button>

          <div className="pro-clock-badge">
            <div className="clock-time">{timeStr || '16:42:18 IST'}</div>
            <div className="clock-sync">
              <span className="pulse-dot green" style={{ width: 6, height: 6 }}></span>
              synced 2m ago
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="pro-nav-tabs" role="tablist">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`pro-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-text">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}
"""

with open(r'g:\rproject\frontend\src\components\Header.jsx', 'w', encoding='utf-8') as f:
    f.write(header_jsx)
print("Header.jsx updated successfully!")
