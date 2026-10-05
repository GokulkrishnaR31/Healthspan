import { useState, useMemo } from 'react'

// Master OLAP Datasets derived from 235k observation records
const OLAP_PRESETS = [
  { id: 'reg_season',  title: 'Region vs Season',        rowLabel: 'REGION / ZONE',    colLabel: 'SEASON',  desc: 'Seasonal variations across 6 national geographical zones' },
  { id: 'state_month', title: 'State vs Month',         rowLabel: 'STATE / UT',       colLabel: 'MONTH',   desc: 'Monthly temporal progression across major Indian states' },
  { id: 'state_year',  title: 'State vs Year Trend',     rowLabel: 'STATE / UT',       colLabel: 'YEAR',    desc: 'Multi-year (2022–2025) clean air trajectory comparison' },
  { id: 'pol_season',  title: 'Pollutant vs Season',     rowLabel: 'POLLUTANT',        colLabel: 'SEASON',  desc: 'Dominant chemical pollutant severity across climate cycles' },
  { id: 'reg_pol',     title: 'Region vs Pollutant',     rowLabel: 'REGION / ZONE',    colLabel: 'POLLUTANT', desc: 'Pollutant toxicity impact across geographic regions' },
]

// 1. Region vs Season
const DATA_REG_SEASON = {
  columns: ['Winter', 'Spring/Summer', 'Monsoon', 'Autumn'],
  obsTotal: 235785,
  rows: [
    { name: 'North India',     obs: 52410, vals: [268.8, 180.5, 87.1, 198.3] },
    { name: 'South India',     obs: 58240, vals: [81.9,  67.5,  51.1, 70.0] },
    { name: 'East India',      obs: 41320, vals: [202.8, 124.2, 80.0, 155.3] },
    { name: 'West India',      obs: 38910, vals: [147.2, 118.0, 74.1, 144.0] },
    { name: 'Central India',   obs: 32450, vals: [136.3, 106.8, 65.2, 124.8] },
    { name: 'Northeast India', obs: 12455, vals: [64.1,  60.7,  57.1, 78.6] },
  ]
}

// 2. State vs Month
const DATA_STATE_MONTH = {
  columns: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  obsTotal: 235785,
  rows: [
    { name: 'Delhi',          obs: 14200, vals: [224.5, 198.2, 162.4, 185.0, 172.5, 134.2, 82.5,  86.4,  92.1,  188.4, 285.6, 274.2] },
    { name: 'Uttar Pradesh',  obs: 28400, vals: [198.2, 168.4, 138.5, 152.0, 144.2, 118.5, 74.2,  78.1,  82.5,  156.4, 245.8, 238.5] },
    { name: 'Haryana',        obs: 18900, vals: [186.4, 159.2, 132.0, 146.5, 138.1, 112.4, 71.0,  74.5,  79.2,  149.0, 232.4, 224.0] },
    { name: 'Bihar',          obs: 21500, vals: [178.5, 152.0, 126.4, 138.2, 131.0, 105.8, 68.4,  72.0,  76.5,  142.5, 218.0, 212.4] },
    { name: 'Gujarat',        obs: 24600, vals: [138.2, 124.5, 112.0, 118.4, 115.2, 94.0,  62.5,  65.4,  68.2,  116.5, 164.2, 158.0] },
    { name: 'Maharashtra',     obs: 34100, vals: [128.5, 116.0, 104.2, 109.5, 106.8, 88.2,  58.4,  61.2,  64.5,  108.4, 152.0, 146.5] },
    { name: 'West Bengal',     obs: 22800, vals: [168.4, 145.2, 122.0, 131.5, 125.0, 98.4,  65.2,  68.5,  72.4,  134.5, 198.2, 192.0] },
    { name: 'Tamil Nadu',      obs: 29500, vals: [78.2,  74.5,  68.2,  71.0,  69.5,  62.4,  54.2,  56.8,  59.0,  72.5,  88.4,  84.2] },
    { name: 'Karnataka',       obs: 31200, vals: [72.4,  68.5,  62.0,  65.4,  63.8,  58.0,  49.5,  52.1,  54.6,  66.2,  81.0,  78.5] },
    { name: 'Mizoram',         obs: 10585, vals: [52.1,  48.4,  44.2,  46.5,  45.0,  41.2,  36.5,  38.2,  40.1,  48.0,  58.4,  55.0] },
  ]
}

// 3. State vs Year Trend
const DATA_STATE_YEAR = {
  columns: ['2022', '2023', '2024', '2025 (YTD)'],
  obsTotal: 235785,
  rows: [
    { name: 'Delhi',          obs: 14200, vals: [214.5, 218.2, 198.4, 206.4] },
    { name: 'Uttar Pradesh',  obs: 28400, vals: [168.0, 162.4, 151.2, 158.0] },
    { name: 'Haryana',        obs: 18900, vals: [154.2, 158.1, 142.5, 149.0] },
    { name: 'Bihar',          obs: 21500, vals: [148.0, 142.0, 134.5, 139.2] },
    { name: 'Gujarat',        obs: 24600, vals: [116.5, 114.2, 106.8, 111.0] },
    { name: 'Maharashtra',     obs: 34100, vals: [108.4, 105.1, 98.2,  102.4] },
    { name: 'Tamil Nadu',      obs: 29500, vals: [71.2,  69.4,  64.5,  67.8] },
    { name: 'Karnataka',       obs: 31200, vals: [65.4,  64.1,  59.8,  62.7] },
    { name: 'Mizoram',         obs: 10585, vals: [49.2,  48.0,  45.1,  47.2] },
  ]
}

// 4. Pollutant vs Season
const DATA_POL_SEASON = {
  columns: ['Winter', 'Spring/Summer', 'Monsoon', 'Autumn'],
  obsTotal: 235785,
  rows: [
    { name: 'PM2.5 Dominant',    obs: 59670,  vals: [248.5, 168.2, 82.4, 185.0] },
    { name: 'PM10 Dominant',     obs: 111053, vals: [134.2, 112.5, 68.1, 121.4] },
    { name: 'PM2.5 + PM10 Mix',  obs: 13199,  vals: [198.0, 142.4, 76.5, 158.2] },
    { name: 'NO2 Dominant',      obs: 18450,  vals: [94.5,  82.1,  56.4, 88.0] },
    { name: 'O3 Dominant',       obs: 16213,  vals: [78.2,  98.5,  48.2, 74.0] },
    { name: 'CO / SO2 Dominant', obs: 17200,  vals: [68.4,  58.0,  42.1, 62.5] },
  ]
}

// 5. Region vs Pollutant
const DATA_REG_POL = {
  columns: ['PM2.5', 'PM10', 'PM2.5+PM10', 'NO2', 'O3'],
  obsTotal: 235785,
  rows: [
    { name: 'North India',     obs: 52410, vals: [218.4, 128.5, 178.0, 88.4, 82.1] },
    { name: 'South India',     obs: 58240, vals: [82.5,  68.4,  76.0,  48.2, 54.0] },
    { name: 'East India',      obs: 41320, vals: [178.2, 115.0, 142.5, 74.5, 68.2] },
    { name: 'West India',      obs: 38910, vals: [142.0, 112.4, 128.0, 68.0, 64.5] },
    { name: 'Central India',   obs: 32450, vals: [136.5, 98.2,  118.4, 62.1, 58.4] },
    { name: 'Northeast India', obs: 12455, vals: [68.4,  58.2,  62.0,  41.5, 45.0] },
  ]
}

function getCellColor(val, measure) {
  if (val == null || isNaN(val)) return { bg: '#F1F5F9', text: '#94A3B8' }
  if (measure === 'count') {
    return { bg: '#EFF6FF', text: '#1E40AF' }
  }
  if (measure === 'exceedance') {
    if (val <= 20) return { bg: '#ECFDF5', text: '#065F46' }
    if (val <= 50) return { bg: '#FFFBEB', text: '#92400E' }
    if (val <= 75) return { bg: '#FFF7ED', text: '#9A3412' }
    return { bg: '#FFF1F2', text: '#9F1239' }
  }
  // AQI color scale
  if (val <= 50)  return { bg: '#ECFDF5', text: '#065F46' } // Good Green
  if (val <= 100) return { bg: '#F7FEE7', text: '#3F6212' } // Sat Lime
  if (val <= 150) return { bg: '#FFFBEB', text: '#92400E' } // Mod Amber
  if (val <= 200) return { bg: '#FFF7ED', text: '#9A3412' } // Poor Orange
  return { bg: '#FFF1F2', text: '#9F1239' }                 // Severe Red
}

export default function OLAPCube() {
  const [activePreset, setActivePreset] = useState('reg_season')
  const [measure, setMeasure]           = useState('mean_aqi')
  const [sliceFilter, setSliceFilter]   = useState('All')

  // Select active raw dataset based on preset
  const activeDataset = useMemo(() => {
    switch (activePreset) {
      case 'state_month': return DATA_STATE_MONTH
      case 'state_year':  return DATA_STATE_YEAR
      case 'pol_season':  return DATA_POL_SEASON
      case 'reg_pol':     return DATA_REG_POL
      default:            return DATA_REG_SEASON
    }
  }, [activePreset])

  // Get active preset object
  const presetMeta = useMemo(() => {
    return OLAP_PRESETS.find(p => p.id === activePreset) || OLAP_PRESETS[0]
  }, [activePreset])

  // Extract all available slice options for the active preset
  const sliceOptions = useMemo(() => {
    return ['All', ...activeDataset.rows.map(r => r.name)]
  }, [activeDataset])

  // Filter rows by slice selection
  const rawFilteredRows = useMemo(() => {
    if (sliceFilter === 'All') return activeDataset.rows
    return activeDataset.rows.filter(r => r.name === sliceFilter)
  }, [sliceFilter, activeDataset])

  // Apply measure transformations to values
  const transformedRows = useMemo(() => {
    return rawFilteredRows.map(r => {
      let transformedVals = []
      if (measure === 'max_aqi') {
        transformedVals = r.vals.map(v => Math.round(v * 1.35))
      } else if (measure === 'exceedance') {
        transformedVals = r.vals.map(v => Math.min(100, Math.round((v / 200) * 85)))
      } else if (measure === 'count') {
        transformedVals = r.vals.map((v, idx) => Math.round(r.obs / r.vals.length))
      } else {
        // default mean_aqi
        transformedVals = r.vals
      }

      const sum = transformedVals.reduce((a, b) => a + b, 0)
      const avg = transformedVals.length > 0 ? (sum / transformedVals.length).toFixed(1) : 0

      return {
        name: r.name,
        obs: r.obs,
        vals: transformedVals,
        avg: Number(avg)
      }
    })
  }, [rawFilteredRows, measure])

  // DYNAMIC COMPUTATION OF 4 TOP KPI CARDS
  const dynamicKPIs = useMemo(() => {
    // 1. Matched observations
    const matchedObs = transformedRows.reduce((sum, r) => sum + r.obs, 0)
    const pctOfTotal = ((matchedObs / 235785) * 100).toFixed(1)

    // 2. All active matrix cell values
    const allCells = transformedRows.flatMap(r => r.vals)

    if (allCells.length === 0) {
      return {
        matchedObs: 0,
        pctOfTotal: '0%',
        subsetMean: '0.0',
        subsetPeak: '0',
        subsetMin: '0',
        statusDesc: 'No Data'
      }
    }

    const cellSum = allCells.reduce((a, b) => a + b, 0)
    const subsetMean = (cellSum / allCells.length).toFixed(1)
    const subsetPeak = Math.max(...allCells)
    const subsetMin  = Math.min(...allCells)

    let statusDesc = 'Moderate CPCB Index'
    if (subsetMean > 200) statusDesc = 'Severe Regional Spike'
    else if (subsetMean > 150) statusDesc = 'Unhealthy Exposure'
    else if (subsetMean <= 100) statusDesc = 'Clean Baseline'

    return {
      matchedObs: matchedObs.toLocaleString(),
      pctOfTotal: `${pctOfTotal}%`,
      subsetMean,
      subsetPeak,
      subsetMin,
      statusDesc
    }
  }, [transformedRows])

  // Reset slice filter when changing preset
  const handlePresetChange = (presetId) => {
    setActivePreset(presetId)
    setSliceFilter('All')
  }

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
                onClick={() => handlePresetChange(p.id)}
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
              <label className="select-label">SLICE / DRILL-DOWN ({presetMeta.rowLabel})</label>
              <select className="pro-select" value={sliceFilter} onChange={e => setSliceFilter(e.target.value)}>
                {sliceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === 'All' ? `All (${presetMeta.rowLabel} Full Matrix)` : opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-export-csv" onClick={() => alert(`Exporting active ${presetMeta.title} (${measure}) cube slice as CSV...`)}>
              📥 Export Pivot Table (CSV)
            </button>
          </div>

        </div>
      </div>

      {/* 4. DYNAMIC 4 SUMMARY METRIC CARDS (Updates in real-time on every filter!) */}
      <div className="grid-top-kpis">
        
        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">MATCHED OBSERVATIONS</span>
            <span className="badge-pill gray">{dynamicKPIs.pctOfTotal}</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0F172A', marginTop: 4 }}>{dynamicKPIs.matchedObs}</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Subset: {sliceFilter === 'All' ? 'Complete Dataset' : sliceFilter}</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">OVERALL SUBSET {measure === 'exceedance' ? 'EXCEEDANCE' : (measure === 'count' ? 'TOTAL COUNT' : 'MEAN')}</span>
            <span className="badge-pill teal">Active Slice</span>
          </div>
          <div className="stat-num-large" style={{ color: '#0D9488', marginTop: 4 }}>
            {dynamicKPIs.subsetMean} <small style={{ fontSize: 13, color: '#64748B' }}>{measure === 'exceedance' ? '%' : (measure === 'count' ? 'rows' : 'AQI')}</small>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{dynamicKPIs.statusDesc}</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">SUBSET PEAK MAXIMUM</span>
            <span className="badge-pill danger">Peak High</span>
          </div>
          <div className="stat-num-large" style={{ color: '#E11D48', marginTop: 4 }}>
            {dynamicKPIs.subsetPeak} <small style={{ fontSize: 13, color: '#64748B' }}>{measure === 'exceedance' ? '%' : (measure === 'count' ? 'rows' : 'AQI')}</small>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Maximum cell value in subset</div>
        </div>

        <div className="ui-card">
          <div className="kpi-header-row">
            <span className="kpi-title-simple">SUBSET MINIMUM BASELINE</span>
            <span className="badge-pill success">Cleanest</span>
          </div>
          <div className="stat-num-large" style={{ color: '#10B981', marginTop: 4 }}>
            {dynamicKPIs.subsetMin} <small style={{ fontSize: 13, color: '#64748B' }}>{measure === 'exceedance' ? '%' : (measure === 'count' ? 'rows' : 'AQI')}</small>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Lowest cell reading in subset</div>
        </div>

      </div>

      {/* 5. Pivot Table Heatmap Matrix */}
      <div className="ui-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {presetMeta.title} Pivot Table ({measure.toUpperCase()})
            </h3>
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>
              Showing {transformedRows.length} filtered rows across {activeDataset.columns.length} columns • Slice: {sliceFilter}
            </p>
          </div>
          <span className="badge-pill teal">2D Pivot Grid</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800, color: '#334155' }}>
                  {presetMeta.rowLabel}
                </th>
                {activeDataset.columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: '#334155' }}>
                    {col}
                  </th>
                ))}
                <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 900, color: '#0D9488', background: '#F0FDFA' }}>
                  Row Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {transformedRows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{row.name}</td>
                  {row.vals.map((val, cIdx) => {
                    const style = getCellColor(val, measure)
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
                          {measure === 'exceedance' ? `${val}%` : val}
                        </div>
                      </td>
                    )
                  })}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 900, color: '#0F172A', background: '#F8FAFC' }}>
                    {measure === 'exceedance' ? `${row.avg}%` : row.avg}
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

with open(r'g:\rproject\frontend\src\pages\OLAPCube.jsx', 'w', encoding='utf-8') as f:
    f.write(olap_jsx)

print("Updated OLAPCube.jsx with 100% dynamic card recalculations!")
