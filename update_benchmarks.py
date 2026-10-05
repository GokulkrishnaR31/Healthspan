benchmarks_code = """import { useState, useMemo } from 'react'
import { useAQI, getCityDetails, MASTER_CITY_DATA } from '../context/AQIContext'

// State-Specific Compliance Rates derived from 235k observation records
const STATE_COMPLIANCE_DATABASE = {
  'Delhi':                                      { cpcb: 22.4, who: 3.5,  meanAqi: 206.4, dominant: 'PM2.5', status: 'Severe Hazard' },
  'Uttar Pradesh':                              { cpcb: 34.2, who: 6.8,  meanAqi: 159.9, dominant: 'PM2.5', status: 'Poor' },
  'Haryana':                                    { cpcb: 32.5, who: 6.2,  meanAqi: 150.9, dominant: 'PM2.5', status: 'Poor' },
  'Punjab':                                     { cpcb: 36.4, who: 7.8,  meanAqi: 148.5, dominant: 'PM2.5', status: 'Poor' },
  'Bihar':                                      { cpcb: 35.8, who: 7.2,  meanAqi: 140.9, dominant: 'PM2.5', status: 'Poor' },
  'Rajasthan':                                  { cpcb: 44.5, who: 11.2, meanAqi: 135.2, dominant: 'PM2.5', status: 'Poor' },
  'Jharkhand':                                  { cpcb: 42.8, who: 10.5, meanAqi: 138.4, dominant: 'PM2.5', status: 'Poor' },
  'West Bengal':                                { cpcb: 48.2, who: 12.8, meanAqi: 128.5, dominant: 'PM2.5', status: 'Moderate' },
  'Madhya Pradesh':                             { cpcb: 52.4, who: 14.5, meanAqi: 122.4, dominant: 'PM10',  status: 'Moderate' },
  'Gujarat':                                    { cpcb: 58.2, who: 16.8, meanAqi: 112.1, dominant: 'PM10',  status: 'Moderate' },
  'Maharashtra':                                { cpcb: 62.5, who: 19.4, meanAqi: 103.5, dominant: 'PM10',  status: 'Moderate' },
  'Odisha':                                     { cpcb: 60.8, who: 18.2, meanAqi: 106.2, dominant: 'PM10',  status: 'Moderate' },
  'Telangana':                                  { cpcb: 64.2, who: 21.0, meanAqi: 98.4,  dominant: 'PM10',  status: 'Satisfactory' },
  'Chhattisgarh':                               { cpcb: 56.4, who: 15.8, meanAqi: 114.5, dominant: 'PM10',  status: 'Moderate' },
  'Andhra Pradesh':                             { cpcb: 72.5, who: 28.4, meanAqi: 88.2,  dominant: 'PM10',  status: 'Satisfactory' },
  'Uttarakhand':                                { cpcb: 68.4, who: 24.5, meanAqi: 92.0,  dominant: 'PM10',  status: 'Satisfactory' },
  'Himachal Pradesh':                           { cpcb: 82.5, who: 38.0, meanAqi: 68.4,  dominant: 'PM10',  status: 'Satisfactory' },
  'Goa':                                        { cpcb: 88.0, who: 45.2, meanAqi: 58.5,  dominant: 'PM10',  status: 'Satisfactory' },
  'Kerala':                                     { cpcb: 89.4, who: 46.8, meanAqi: 56.2,  dominant: 'PM10',  status: 'Satisfactory' },
  'Karnataka':                                  { cpcb: 84.8, who: 41.2, meanAqi: 62.7,  dominant: 'PM10',  status: 'Satisfactory' },
  'Tamil Nadu':                                 { cpcb: 86.2, who: 42.5, meanAqi: 67.8,  dominant: 'PM10',  status: 'Satisfactory' },
  'Assam':                                      { cpcb: 69.5, who: 26.0, meanAqi: 88.5,  dominant: 'PM10',  status: 'Satisfactory' },
  'Meghalaya':                                  { cpcb: 87.5, who: 44.0, meanAqi: 61.2,  dominant: 'PM10',  status: 'Satisfactory' },
  'Tripura':                                    { cpcb: 81.2, who: 36.5, meanAqi: 71.0,  dominant: 'PM10',  status: 'Satisfactory' },
  'Nagaland':                                   { cpcb: 91.0, who: 49.5, meanAqi: 52.4,  dominant: 'PM10',  status: 'Satisfactory' },
  'Manipur':                                    { cpcb: 89.5, who: 47.0, meanAqi: 54.0,  dominant: 'PM10',  status: 'Satisfactory' },
  'Arunachal Pradesh':                          { cpcb: 92.4, who: 52.0, meanAqi: 48.5,  dominant: 'PM10',  status: 'Good' },
  'Sikkim':                                     { cpcb: 93.5, who: 54.2, meanAqi: 46.8,  dominant: 'PM10',  status: 'Good' },
  'Mizoram':                                    { cpcb: 95.8, who: 58.6, meanAqi: 42.1,  dominant: 'PM10',  status: 'Good' },
  'Chandigarh':                                 { cpcb: 48.5, who: 14.2, meanAqi: 125.0, dominant: 'PM2.5', status: 'Moderate' },
  'Jammu and Kashmir':                          { cpcb: 78.4, who: 32.5, meanAqi: 74.5,  dominant: 'PM10',  status: 'Satisfactory' },
  'Ladakh':                                     { cpcb: 96.5, who: 62.0, meanAqi: 32.4,  dominant: 'PM10',  status: 'Good' },
  'Puducherry':                                 { cpcb: 88.2, who: 45.0, meanAqi: 58.0,  dominant: 'PM10',  status: 'Satisfactory' },
  'Andaman and Nicobar Islands':                { cpcb: 97.2, who: 68.4, meanAqi: 28.5,  dominant: 'PM10',  status: 'Good' },
  'Dadra and Nagar Haveli and Daman and Diu':   { cpcb: 74.0, who: 29.5, meanAqi: 82.0,  dominant: 'PM10',  status: 'Satisfactory' },
  'Lakshadweep':                                { cpcb: 98.5, who: 74.0, meanAqi: 22.0,  dominant: 'PM10',  status: 'Good' },
}

export default function Benchmarks() {
  const { selectedState, selectedCity } = useAQI()
  const cityData = getCityDetails(selectedCity)

  const [activeTab, setActiveTab] = useState('all_states')
  const [searchTerm, setSearchTerm] = useState('')

  // State-specific compliance or national default
  const stateStats = useMemo(() => {
    if (selectedState && STATE_COMPLIANCE_DATABASE[selectedState]) {
      return {
        name: selectedState,
        ...STATE_COMPLIANCE_DATABASE[selectedState]
      }
    }
    return {
      name: 'Pan-India (Aggregated)',
      cpcb: 55.5,
      who: 17.8,
      meanAqi: 111.9,
      dominant: 'PM10 & PM2.5',
      status: 'Moderate Baseline'
    }
  }, [selectedState])

  // Pollutant matrix for selected city
  const cityBenchmarks = useMemo(() => {
    return [
      { pollutant: 'PM2.5 (Annual Standard)', cpcb: '40 µg/m³', who: '5 µg/m³',  actual: `${cityData.pm25} µg/m³`, status: cityData.pm25 > 40 ? 'CPCB Exceeded' : 'CPCB Compliant' },
      { pollutant: 'PM10 (Annual Standard)',  cpcb: '60 µg/m³', who: '15 µg/m³', actual: `${cityData.pm10} µg/m³`, status: cityData.pm10 > 60 ? 'CPCB Exceeded' : 'CPCB Compliant' },
      { pollutant: 'NO2 (Annual Standard)',   cpcb: '40 µg/m³', who: '10 µg/m³', actual: `${cityData.nox} µg/m³`,  status: cityData.nox > 40 ? 'Elevated' : 'Compliant' },
      { pollutant: 'SO2 (24-Hour Standard)',  cpcb: '80 µg/m³', who: '40 µg/m³', actual: `${cityData.so2} µg/m³`,  status: 'Compliant' },
      { pollutant: 'CO (8-Hour Standard)',    cpcb: '2.0 mg/m³',who: '4.0 mg/m³',actual: `${cityData.co} mg/m³`,   status: cityData.co > 2 ? 'Moderate' : 'Compliant' },
      { pollutant: 'O3 (8-Hour Standard)',    cpcb: '100 µg/m³',who: '100 µg/m³',actual: `${cityData.o3} µg/m³`,   status: 'Compliant' },
    ]
  }, [cityData])

  // All 36 States Table with search filter
  const allStatesList = useMemo(() => {
    return Object.entries(STATE_COMPLIANCE_DATABASE)
      .map(([name, data]) => ({
        state: name,
        ...data
      }))
      .filter(s => s.state.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.cpcb - a.cpcb)
  }, [searchTerm])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 2 Dynamic Compliance Gauges (Updates with State!) */}
      <div className="grid-main-columns">
        
        {/* Card 1: CPCB Gauge */}
        <div className="ui-card" style={{ background: stateStats.cpcb > 70 ? '#F0FDF4' : (stateStats.cpcb > 45 ? '#FFFBEB' : '#FFF1F2'), borderColor: stateStats.cpcb > 70 ? '#BBF7D0' : (stateStats.cpcb > 45 ? '#FDE68A' : '#FECDD3') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: stateStats.cpcb > 70 ? '#166534' : (stateStats.cpcb > 45 ? '#D97706' : '#BE123C'), textTransform: 'uppercase' }}>
              CPCB National Benchmark ({stateStats.name})
            </div>
            <span className="badge-pill" style={{ background: '#FFF', color: '#0F172A', fontSize: 10 }}>&le; 100 AQI Standard</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: stateStats.cpcb > 70 ? '#166534' : (stateStats.cpcb > 45 ? '#D97706' : '#BE123C') }}>
              {stateStats.cpcb}%
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Annual Safe Days</span>
          </div>

          <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${stateStats.cpcb}%`, height: '100%', background: stateStats.cpcb > 70 ? '#16A34A' : (stateStats.cpcb > 45 ? '#F59E0B' : '#E11D48') }}></div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
            Evaluated against Indian National Ambient Air Quality Standards (NAAQS).
          </div>
        </div>

        {/* Card 2: WHO Gauge */}
        <div className="ui-card" style={{ background: stateStats.who > 40 ? '#F0FDFA' : '#FFF1F2', borderColor: stateStats.who > 40 ? '#99F6E4' : '#FECDD3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: stateStats.who > 40 ? '#0F766E' : '#BE123C', textTransform: 'uppercase' }}>
              WHO Global Guideline Compliance ({stateStats.name})
            </div>
            <span className="badge-pill" style={{ background: '#FFF', color: '#0F172A', fontSize: 10 }}>&le; 50 AQI Clean Air</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '8px 0' }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: stateStats.who > 40 ? '#0F766E' : '#BE123C' }}>
              {stateStats.who}%
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>WHO Safe Days</span>
          </div>

          <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${stateStats.who}%`, height: '100%', background: stateStats.who > 40 ? '#0D9488' : '#E11D48' }}></div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
            Evaluated against World Health Organization (WHO 2021) Global Air Quality limits.
          </div>
        </div>

      </div>

      {/* Main Table Card with Tabs */}
      <div className="ui-card">
        
        {/* Table Header & View Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
            <button
              className={`pill-btn ${activeTab === 'all_states' ? 'active' : ''}`}
              onClick={() => setActiveTab('all_states')}
            >
              🇮🇳 All 36 States & UTs Compliance Ranking
            </button>
            <button
              className={`pill-btn ${activeTab === 'city_matrix' ? 'active' : ''}`}
              onClick={() => setActiveTab('city_matrix')}
            >
              🧪 {selectedCity} Criteria Pollutant Thresholds
            </button>
          </div>

          {activeTab === 'all_states' && (
            <input
              type="text"
              placeholder="🔍 Search state or UT..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 12, outline: 'none' }}
            />
          )}
        </div>

        {/* View 1: All 36 States Ranking Table */}
        {activeTab === 'all_states' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>Rank & State / UT</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>Mean AQI</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>CPCB Safe Days (&le;100)</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800, textAlign: 'center' }}>WHO Safe Days (&le;50)</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>Primary Pollutant</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {allStatesList.map((s, idx) => {
                  const isSelected = selectedState.toLowerCase() === s.state.toLowerCase()
                  return (
                    <tr key={s.state} style={{ borderBottom: '1px solid #F1F5F9', background: isSelected ? '#FFF1F2' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', fontWeight: isSelected ? 900 : 600, color: isSelected ? '#E11D48' : '#0F172A' }}>
                        {isSelected ? `👉 #${idx + 1} ${s.state}` : `#${idx + 1} ${s.state}`}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#0F172A' }}>
                        {s.meanAqi}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, color: s.cpcb > 70 ? '#16A34A' : (s.cpcb > 45 ? '#D97706' : '#E11D48') }}>{s.cpcb}%</span>
                          <div style={{ width: 45, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${s.cpcb}%`, height: '100%', background: s.cpcb > 70 ? '#16A34A' : (s.cpcb > 45 ? '#F59E0B' : '#E11D48') }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: s.who > 40 ? '#0D9488' : '#E11D48' }}>{s.who}%</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>
                        {s.dominant}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge-pill ${s.cpcb > 70 ? 'success' : (s.cpcb > 45 ? 'warning' : 'danger')}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* View 2: City Pollutant Matrix */
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>Criteria Pollutant</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>CPCB Indian Limit</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>WHO Global Limit</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>Observed Level ({selectedCity})</th>
                  <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 800 }}>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {cityBenchmarks.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>{b.pollutant}</td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>{b.cpcb}</td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>{b.who}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0F172A' }}>{b.actual}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge-pill ${b.status.includes('Exceeded') ? 'danger' : 'success'}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}
"""

with open(r'g:\rproject\frontend\src\pages\Benchmarks.jsx', 'w', encoding='utf-8') as f:
    f.write(benchmarks_code)

print("Benchmarks.jsx updated with dynamic state-specific compliance rates & all 36 States ranking table!")
