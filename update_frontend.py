import os

header_jsx = """import { useState, useEffect } from 'react'
import { useAQI } from '../context/AQIContext'
import './Header.css'

export default function Header({ activeTab, onTabChange }) {
  const { selectedState, setSelectedState, selectedCity, setSelectedCity, cityOptions, ALL_STATES } = useAQI()
  const [timeStr, setTimeStr] = useState('')

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
              {ALL_STATES.filter(s => s !== 'All India').map(s => (
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

header_css = """/* Header CSS for v2.0-PRO Theme */
.pro-header {
  background: #FFFFFF;
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.pro-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 8px;
  gap: 16px;
  flex-wrap: wrap;
}

.pro-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon-shield {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #F0FDFA;
  border: 1px solid #99F6E4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  font-size: 17px;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.2px;
}

.badge-vpro {
  background: #EEF2F6;
  color: #2563EB;
  border: 1px solid #DBEAFE;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  letter-spacing: 0.4px;
}

.brand-subtitle {
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
  margin-top: 1px;
}

.pro-header-controls {
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
  font-size: 9px;
  font-weight: 800;
  color: #94A3B8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.pro-select {
  background: #FFFFFF;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
  outline: none;
  cursor: pointer;
  min-width: 170px;
  transition: border-color 0.2s;
}

.pro-select:hover, .pro-select:focus {
  border-color: var(--accent-teal);
}

.btn-telemetry {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #E11D48;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 14px;
  border-radius: 999px;
  letter-spacing: 0.4px;
  cursor: pointer;
}

.pro-clock-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 8px;
  border-left: 1px solid var(--border-light);
}

.clock-time {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
}

.clock-sync {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #10B981;
  font-weight: 600;
}

/* Tabs */
.pro-nav-tabs {
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-top: 1px solid var(--border-subtle);
  overflow-x: auto;
  gap: 4px;
}

.pro-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-bottom: 2.5px solid transparent;
  color: #64748B;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.pro-tab-btn:hover {
  color: #0F172A;
  background: #F8FAFC;
}

.pro-tab-btn.active {
  color: #0D9488;
  border-bottom-color: #0D9488;
  background: #F0FDFA;
  font-weight: 700;
}

.tab-icon {
  font-size: 14px;
}
"""

live_monitor_jsx = """import { useState, useEffect, useCallback } from 'react'
import { useAQI } from '../context/AQIContext'
import { fetchLiveAQI, getErrorMessage } from '../api/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  AreaChart, Area, ReferenceLine
} from 'recharts'

// Top 15 States Data directly matching the user's screenshot
const TOP15_STATES = [
  { state: 'Karnataka',       aqi: 63,  cat: 'good' },
  { state: 'Andhra Pradesh',  aqi: 112, cat: 'mod' },
  { state: 'Telangana',       aqi: 146, cat: 'mod' },
  { state: 'Odisha',          aqi: 158, cat: 'poor' },
  { state: 'Maharashtra',     aqi: 172, cat: 'poor' },
  { state: 'Gujarat',         aqi: 184, cat: 'poor' },
  { state: 'Madhya Pradesh',  aqi: 196, cat: 'poor' },
  { state: 'West Bengal',     aqi: 208, cat: 'severe' },
  { state: 'Jharkhand',       aqi: 214, cat: 'severe' },
  { state: 'Rajasthan',       aqi: 228, cat: 'severe' },
  { state: 'Punjab',          aqi: 242, cat: 'severe' },
  { state: 'Bihar',           aqi: 258, cat: 'severe' },
  { state: 'Haryana',         aqi: 276, cat: 'severe' },
  { state: 'Uttar Pradesh',   aqi: 298, cat: 'severe' },
  { state: '🔴 Delhi (NCR)',  aqi: 312, cat: 'hazardous' },
]

// 24h Trajectory curve data
const TRAJECTORY_DATA = [
  { time: '00:00', aqi: 245 },
  { time: '03:00', aqi: 228 },
  { time: '06:00', aqi: 360, label: 'Rush Spike' },
  { time: '09:00', aqi: 382, label: 'Max Peak' },
  { time: '12:00', aqi: 295 },
  { time: '15:00', aqi: 260 },
  { time: '18:00', aqi: 340, label: 'Evening Peak' },
  { time: '21:00', aqi: 325 },
  { time: 'Now',   aqi: 312 },
]

function getBarColor(aqi, isDelhi) {
  if (isDelhi) return '#E11D48'
  if (aqi <= 90)  return '#F59E0B'
  if (aqi <= 150) return '#F59E0B'
  if (aqi <= 200) return '#F97316'
  if (aqi <= 280) return '#EF4444'
  return '#BE123C'
}

export default function LiveMonitor() {
  const { selectedCity } = useAQI()
  const [liveData, setLiveData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterMode, setFilterMode] = useState('Historical Mean')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchLiveAQI(selectedCity)
      setLiveData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedCity])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className=\"live-monitor-v2\">
      {/* 4 Top KPI Cards Grid */}
      <div className=\"grid-top-kpis\">
        
        {/* Card 1: Focus City AQI */}
        <div className=\"ui-card card-kpi-highlight\">
          <div className=\"kpi-header-row\">
            <div className=\"kpi-title-tag\">
              <span className=\"pulse-dot red\"></span>
              <span className=\"tag-text\">DELHI NCR FOCUS</span>
            </div>
            <span className=\"badge-pill danger\">SEVERE / HAZARDOUS</span>
          </div>
          <div className=\"kpi-sub\">Continuous Monitoring Index</div>
          <div className=\"kpi-main-stat\">
            <span className=\"stat-num-huge\">312</span>
            <div className=\"stat-units-box\">
              <span className=\"stat-unit\">AQI (US-EPA Standard)</span>
              <span className=\"stat-delta danger\">▲ +18.4% vs yesterday peak</span>
            </div>
          </div>
          <div className=\"kpi-footer-alert\">
            <span className=\"alert-icon\">⚠️</span>
            <span>Emergency Advisory: Wear N95 outdoors (PM2.5 dominant)</span>
          </div>
        </div>

        {/* Card 2: Pan-India Snapshot */}
        <div className=\"ui-card\">
          <div className=\"kpi-header-row\">
            <div className=\"kpi-title-simple\">PAN-INDIA SNAPSHOT</div>
            <span className=\"badge-pill gray\">32 States Active</span>
          </div>
          <div className=\"kpi-sub\">National Mean AQI</div>
          <div className=\"kpi-main-stat\">
            <span className=\"stat-num-large\" style={{ color: '#D97706' }}>178</span>
            <span className=\"stat-qualifier\" style={{ color: '#D97706' }}>Moderate to Poor</span>
          </div>
          <div className=\"kpi-progress-wrap\">
            <div className=\"progress-labels\">
              <span>Critical Stations (&gt;200)</span>
              <strong>41.2%</strong>
            </div>
            <div className=\"multi-seg-bar\">
              <div className=\"seg good\" style={{ width: '22%' }}></div>
              <div className=\"seg mod\" style={{ width: '36%' }}></div>
              <div className=\"seg severe\" style={{ width: '42%' }}></div>
            </div>
            <div className=\"seg-legend\">
              <span>• Good 22%</span>
              <span>• Mod 36%</span>
              <span>• Severe 42%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Station Outliers */}
        <div className=\"ui-card\">
          <div className=\"kpi-header-row\">
            <div className=\"kpi-title-simple\">STATION OUTLIERS</div>
            <span className=\"badge-pill teal\">Realtime CPCB</span>
          </div>
          <div className=\"outlier-list\">
            <div className=\"outlier-row\">
              <div className=\"outlier-meta\">
                <div className=\"outlier-name\">🍃 Aizawl, Mizoram</div>
                <div className=\"outlier-sub\">Lowest Recorded Station</div>
              </div>
              <div className=\"outlier-val-box good\">
                <span className=\"outlier-val\">24</span>
                <span className=\"outlier-badge-text\">AQI • GOOD</span>
              </div>
            </div>
            <div className=\"outlier-divider\"></div>
            <div className=\"outlier-row\">
              <div className=\"outlier-meta\">
                <div className=\"outlier-name\">⚠️ Bhiwadi, Rajasthan</div>
                <div className=\"outlier-sub\">Peak Industrial Spike</div>
              </div>
              <div className=\"outlier-val-box danger\">
                <span className=\"outlier-val\">346</span>
                <span className=\"outlier-badge-text\">AQI • HAZARDOUS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Dispersion Vector */}
        <div className=\"ui-card\">
          <div className=\"kpi-header-row\">
            <div className=\"kpi-title-simple\">DISPERSION VECTOR</div>
            <span className=\"badge-pill warning\">Inversion Trap: High</span>
          </div>
          <div className=\"dispersion-grid\">
            <div className=\"disp-metric\">
              <span className=\"disp-label\">Surface Temp</span>
              <span className=\"disp-val\">27.8°C</span>
              <span className=\"disp-sub\">Dew Point: 19°C</span>
            </div>
            <div className=\"disp-metric\">
              <span className=\"disp-label\">Wind Velocity</span>
              <span className=\"disp-val\">4.2 <small>km/h</small></span>
              <span className=\"disp-sub\">↖ NW (stagnant)</span>
            </div>
          </div>
          <div className=\"disp-footer-row\">
            <span>Rel. Humidity: <strong>64%</strong></span>
            <span>Mixing Height: <strong style={{ color: '#E11D48' }}>420m (Low)</strong></span>
          </div>
        </div>

      </div>

      {/* Main 2-Column Content Layout */}
      <div className=\"grid-main-columns\">
        
        {/* LEFT COLUMN: Live Station Intelligence */}
        <div className=\"left-col-stack\">
          
          <div className=\"ui-card station-intel-card\">
            {/* Header */}
            <div className=\"station-header-bar\">
              <div>
                <div className=\"station-title-row\">
                  <span className=\"pulse-dot red\"></span>
                  <h2 className=\"station-title\">Live Station Intelligence</h2>
                </div>
                <div className=\"station-subtitle\">Anand Vihar CAAQMS - Delhi NCR (DPCC)</div>
              </div>
              <span className=\"badge-pill danger\" style={{ fontSize: 13, padding: '4px 10px' }}>AQI: 312</span>
            </div>

            {/* 6 Pollutants Grid */}
            <div className=\"pollutants-6-grid\">
              <div className=\"pollutant-card\">
                <div className=\"pol-top\">
                  <span className=\"pol-name\">PM 2.5</span>
                  <span className=\"pol-badge danger\">6.8x WHO</span>
                </div>
                <div className=\"pol-val danger\">262.4</div>
                <div className=\"pol-meta\">µg/m³ (CPCB: 60)</div>
              </div>

              <div className=\"pollutant-card\">
                <div className=\"pol-top\">
                  <span className=\"pol-name\">PM 10</span>
                  <span className=\"pol-badge warning\">3.8x CPCB</span>
                </div>
                <div className=\"pol-val warning\">384.0</div>
                <div className=\"pol-meta\">µg/m³ (CPCB: 100)</div>
              </div>

              <div className=\"pollutant-card\">
                <div className=\"pol-top\">
                  <span className=\"pol-name\">NOx</span>
                  <span className=\"pol-badge yellow\">Elevated</span>
                </div>
                <div className=\"pol-val text-dark\">74.2</div>
                <div className=\"pol-meta\">µg/m³ (CPCB: 80)</div>
              </div>

              <div className=\"pollutant-card\">
                <div className=\"pol-top\">
                  <span className=\"pol-name\">SO₂</span>
                  <span className=\"pol-badge good\">Good</span>
                </div>
                <div className=\"pol-val text-good\">16.8</div>
                <div className=\"pol-meta\">µg/m³ (CPCB: 80)</div>
              </div>

              <div className=\"pollutant-card\">
                <div className=\"pol-top\">
                  <span className=\"pol-name\">CO</span>
                  <span className=\"pol-badge warning\">Moderate</span>
                </div>
                <div className=\"pol-val text-dark\">2.14</div>
                <div className=\"pol-meta\">mg/m³ (CPCB: 2.0)</div>
              </div>

              <div className=\"pollutant-card\">
                <div className=\"pol-top\">
                  <span className=\"pol-name\">O₃</span>
                  <span className=\"pol-badge good\">Normal</span>
                </div>
                <div className=\"pol-val text-good\">42.5</div>
                <div className=\"pol-meta\">µg/m³ (CPCB: 100)</div>
              </div>
            </div>

            {/* 24-Hour Concentration Trajectory */}
            <div className=\"trajectory-box\">
              <div className=\"traj-header\">
                <div className=\"traj-title\">24-Hour Concentration Trajectory (AQI)</div>
                <div className=\"traj-peaks\">
                  <span className=\"peak-label\">🔴 Max Peak: <strong>382</strong></span>
                  <span className=\"low-label\">• Low: <strong>218</strong></span>
                </div>
              </div>

              <div style={{ width: '100%', height: 110 }}>
                <ResponsiveContainer width=\"100%\" height=\"100%\">
                  <AreaChart data={TRAJECTORY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id=\"aqiGradient\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                        <stop offset=\"5%\" stopColor=\"#E11D48\" stopOpacity={0.35}/>
                        <stop offset=\"95%\" stopColor=\"#E11D48\" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#F1F5F9\" vertical={false} />
                    <XAxis dataKey=\"time\" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[150, 420]} hide={true} />
                    <ReferenceLine y={300} stroke=\"#EF4444\" strokeDasharray=\"3 3\" label={{ value: 'Severe Level 300', fill: '#EF4444', fontSize: 9, position: 'right' }} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11 }} />
                    <Area type=\"monotone\" dataKey=\"aqi\" stroke=\"#E11D48\" strokeWidth={2.5} fillOpacity={1} fill=\"url(#aqiGradient)\" dot={{ r: 2, fill: '#E11D48' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sensor Network Failover Card */}
            <div className=\"failover-box\">
              <div className=\"failover-header\">
                <div className=\"failover-title\">
                  <span className=\"shield-icon\">🛡️</span>
                  <span>Sensor Network Failover Active</span>
                </div>
                <span className=\"badge-pill teal\">Dual-Feed</span>
              </div>
              <p className=\"failover-desc\">
                Primary WAQI node load-balanced with backup CPCB CAAQMS ingestion channel. Sub-second streaming guaranteed.
              </p>
              <div className=\"failover-footer\">
                <span className=\"failover-latency\">Latency: 18ms • Protocol: HTTP/2 websocket</span>
                <button className=\"btn-refresh-telemetry\" onClick={fetchData} disabled={loading}>
                  {loading ? 'Fetching...' : '🔄 Force Refresh Telemetry'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Top 15 Most Polluted States */}
        <div className=\"right-col-stack\">
          
          <div className=\"ui-card top-states-card\">
            {/* Header & Controls */}
            <div className=\"states-header-bar\">
              <div>
                <div className=\"states-title-row\">
                  <span className=\"icon\">📊</span>
                  <h2 className=\"states-title\">Top 15 Most Polluted States</h2>
                </div>
                <p className=\"states-subtitle\">Multi-Year Mean AQI Aggregation (2022–2025)</p>
              </div>

              {/* Filter Pills */}
              <div className=\"filter-pills\">
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
            <div className=\"chart-legend-bar\">
              <div className=\"legend-item\">
                <span className=\"legend-box mod\"></span>
                <span>Moderate (90–150)</span>
              </div>
              <div className=\"legend-item\">
                <span className=\"legend-box unhealthy\"></span>
                <span>Unhealthy (151–250)</span>
              </div>
              <div className=\"legend-item\">
                <span className=\"legend-box severe\"></span>
                <span>Severe Hazard (&gt;200)</span>
              </div>
              <div className=\"legend-baseline\">
                CPCB Baseline: 100 | WHO: 25
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div style={{ width: '100%', height: 490 }}>
              <ResponsiveContainer width=\"100%\" height=\"100%\">
                <BarChart
                  data={TOP15_STATES}
                  layout=\"vertical\"
                  margin={{ top: 10, right: 35, left: 10, bottom: 0 }}
                  barCategoryGap={3}
                >
                  <CartesianGrid strokeDasharray=\"3 3\" stroke=\"#F1F5F9\" horizontal={false} />
                  <XAxis
                    type=\"number\"
                    domain={[0, 350]}
                    ticks={[0, 90, 180, 270, 350]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    type=\"category\"
                    dataKey=\"state\"
                    width={130}
                    tick={(props) => {
                      const isDelhi = props.payload.value.includes('Delhi')
                      return (
                        <text
                          x={props.x - 6}
                          y={props.y + 4}
                          textAnchor=\"end\"
                          fill={isDelhi ? '#E11D48' : '#334155'}
                          fontWeight={isDelhi ? 800 : 500}
                          fontSize={11}
                        >
                          {props.payload.value}
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
                  <Bar dataKey=\"aqi\" radius={[0, 6, 6, 0]}>
                    {TOP15_STATES.map((entry, idx) => {
                      const isDelhi = entry.state.includes('Delhi')
                      return (
                        <Cell
                          key={idx}
                          fill={getBarColor(entry.aqi, isDelhi)}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scale Label & Footer Note */}
            <div className=\"scale-label-row\">
              <div className=\"scale-text\">Scale (AQI): 0 ------- 90 ------- 180 ------- 270 ------- 350</div>
            </div>

            <div className=\"states-footer-row\">
              <div className=\"methodology-text\">
                ℹ️ Methodology: Continuous Ambient Air Quality Monitoring Stations (CAAQMS) weighted median.
              </div>
              <button className=\"btn-export-csv\" onClick={() => alert('Exporting Top 15 AQI State Aggregation as CSV...')}>
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

live_monitor_css = """/* Styles for LiveMonitor v2.0-PRO matching screenshot */

.live-monitor-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card 1 Highlight */
.card-kpi-highlight {
  background: #FFFBFB;
  border-color: #FECDD3;
}

.kpi-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.kpi-title-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kpi-title-tag .tag-text {
  font-size: 11px;
  font-weight: 800;
  color: #BE123C;
  letter-spacing: 0.5px;
}

.kpi-title-simple {
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  letter-spacing: 0.5px;
}

.kpi-sub {
  font-size: 11px;
  color: #64748B;
  margin-bottom: 8px;
}

.kpi-main-stat {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-num-huge {
  font-size: 40px;
  font-weight: 900;
  color: #0F172A;
  line-height: 1;
}

.stat-num-large {
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.stat-qualifier {
  font-size: 13px;
  font-weight: 700;
}

.stat-units-box {
  display: flex;
  flex-direction: column;
}

.stat-unit {
  font-size: 11px;
  color: #64748B;
  font-weight: 600;
}

.stat-delta.danger {
  font-size: 11px;
  font-weight: 800;
  color: #E11D48;
}

.kpi-footer-alert {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: #BE123C;
  font-weight: 600;
  background: #FFF1F2;
  padding: 6px 10px;
  border-radius: 6px;
}

/* Pan-India Progress */
.kpi-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: #64748B;
}

.multi-seg-bar {
  height: 8px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  background: #E2E8F0;
}

.multi-seg-bar .seg.good { background: #10B981; }
.multi-seg-bar .seg.mod { background: #F59E0B; }
.multi-seg-bar .seg.severe { background: #EF4444; }

.seg-legend {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748B;
  font-weight: 600;
}

/* Outliers */
.outlier-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.outlier-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.outlier-name {
  font-size: 12px;
  font-weight: 700;
  color: #1E293B;
}

.outlier-sub {
  font-size: 10px;
  color: #64748B;
}

.outlier-val-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.outlier-val-box.good .outlier-val { font-size: 18px; font-weight: 800; color: #10B981; }
.outlier-val-box.good .outlier-badge-text { font-size: 9px; font-weight: 800; color: #10B981; }

.outlier-val-box.danger .outlier-val { font-size: 18px; font-weight: 800; color: #EF4444; }
.outlier-val-box.danger .outlier-badge-text { font-size: 9px; font-weight: 800; color: #EF4444; }

.outlier-divider {
  height: 1px;
  background: var(--border-subtle);
}

/* Dispersion Vector */
.dispersion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.disp-metric {
  display: flex;
  flex-direction: column;
}

.disp-label { font-size: 10px; color: #64748B; font-weight: 600; }
.disp-val { font-size: 16px; font-weight: 800; color: #0F172A; }
.disp-sub { font-size: 10px; color: #94A3B8; }

.disp-footer-row {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: #64748B;
  padding-top: 6px;
  border-top: 1px solid var(--border-subtle);
}

/* Station Intel Card */
.station-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.station-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.station-title {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.station-subtitle {
  font-size: 11px;
  color: #64748B;
  font-weight: 500;
}

/* 6 Pollutants */
.pollutants-6-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.pollutant-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px 10px;
}

.pol-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.pol-name {
  font-size: 11px;
  font-weight: 800;
  color: #334155;
}

.pol-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
}

.pol-badge.danger { background: #FFE4E6; color: #BE123C; }
.pol-badge.warning { background: #FEF3C7; color: #D97706; }
.pol-badge.yellow { background: #FEF9C3; color: #CA8A04; }
.pol-badge.good { background: #D1FAE5; color: #047857; }

.pol-val {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.1;
}

.pol-val.danger { color: #E11D48; }
.pol-val.warning { color: #D97706; }
.pol-val.text-good { color: #10B981; }
.pol-val.text-dark { color: #1E293B; }

.pol-meta {
  font-size: 9px;
  color: #94A3B8;
  margin-top: 2px;
}

/* Trajectory */
.trajectory-box {
  background: #FAFAFC;
  border: 1px solid #EDF2F7;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 14px;
}

.traj-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.traj-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #1E293B;
}

.traj-peaks {
  font-size: 10.5px;
  color: #64748B;
}

.traj-peaks strong {
  color: #0F172A;
}

/* Failover Box */
.failover-box {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
  padding: 12px;
}

.failover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.failover-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  color: #166534;
}

.failover-desc {
  font-size: 10.5px;
  color: #15803D;
  line-height: 1.4;
  margin-bottom: 8px;
}

.failover-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.failover-latency {
  font-size: 10px;
  color: #16A34A;
  font-weight: 600;
}

.btn-refresh-telemetry {
  background: #0D9488;
  color: #FFFFFF;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh-telemetry:hover {
  background: #0F766E;
}

/* Top States Right Card */
.states-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.states-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.states-title {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
}

.states-subtitle {
  font-size: 11px;
  color: #64748B;
}

.filter-pills {
  display: flex;
  gap: 4px;
  background: #F1F5F9;
  padding: 3px;
  border-radius: 8px;
}

.pill-btn {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn.active {
  background: #FFFFFF;
  color: #0F172A;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* Legend */
.chart-legend-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 12px;
  background: #F8FAFC;
  border-radius: 6px;
  font-size: 10.5px;
  color: #475569;
  margin-bottom: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-box {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-box.mod { background: #F59E0B; }
.legend-box.unhealthy { background: #F97316; }
.legend-box.severe { background: #EF4444; }

.legend-baseline {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  color: #64748B;
}

.scale-label-row {
  text-align: center;
  font-size: 10px;
  color: #94A3B8;
  margin-top: 4px;
}

.states-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
}

.methodology-text {
  font-size: 10.5px;
  color: #64748B;
}

.btn-export-csv {
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-export-csv:hover {
  background: #F1F5F9;
}
"""

app_jsx = """import { useState, Component } from 'react'
import { AQIProvider } from './context/AQIContext'
import Header           from './components/Header'
import LiveMonitor      from './pages/LiveMonitor'
import GISMap           from './pages/GISMap'
import OLAPCube         from './pages/OLAPCube'
import ForecastAnomalies from './pages/ForecastAnomalies'
import PolicySimulator  from './pages/PolicySimulator'
import HealthCalc       from './pages/HealthCalc'
import Benchmarks       from './pages/Benchmarks'
import AlertsReports    from './pages/AlertsReports'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32, background: '#FFF1F2', border: '1px solid #FECDD3',
          borderRadius: 12, margin: 24, color: '#BE123C',
        }}>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>Component Error</h2>
          <p style={{ fontSize: 13, marginBottom: 12 }}>{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#E11D48', color: '#fff', border: 'none',
              borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Retry Component
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('live')

  const renderContent = () => {
    switch (activeTab) {
      case 'live':       return <LiveMonitor />
      case 'gis':        return <GISMap />
      case 'olap':       return <OLAPCube />
      case 'forecast':   return <ForecastAnomalies />
      case 'policy':     return <PolicySimulator />
      case 'health':     return <HealthCalc />
      case 'benchmarks': return <Benchmarks />
      case 'alerts':     return <AlertsReports />
      default:           return <LiveMonitor />
    }
  }

  return (
    <AQIProvider>
      <div className="app-container">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          <ErrorBoundary key={activeTab}>
            {renderContent()}
          </ErrorBoundary>
        </main>
        <footer className="platform-footer">
          <div className="footer-left">
            <span className="pulse-dot green" style={{ width: 7, height: 7 }}></span>
            <span>India AQI Intelligence Platform • R Plumber API + React Kernel Engine • 2022–2025</span>
          </div>
          <div className="footer-right">
            <span>MoEFCC / CPCB & OpenAQ Aggregation • 32 States • 235K records • 81 continuous monitoring stations</span>
          </div>
        </footer>
      </div>
    </AQIProvider>
  )
}
"""

with open(r'g:\rproject\frontend\src\components\Header.jsx', 'w', encoding='utf-8') as f:
    f.write(header_jsx)
with open(r'g:\rproject\frontend\src\components\Header.css', 'w', encoding='utf-8') as f:
    f.write(header_css)
with open(r'g:\rproject\frontend\src\pages\LiveMonitor.jsx', 'w', encoding='utf-8') as f:
    f.write(live_monitor_jsx + '\n' + '/* CSS */\n')
with open(r'g:\rproject\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_jsx)

# Append live monitor CSS to index.css
with open(r'g:\rproject\frontend\src\index.css', 'a', encoding='utf-8') as f:
    f.write('\n' + live_monitor_css)

print("All frontend files updated successfully!")
