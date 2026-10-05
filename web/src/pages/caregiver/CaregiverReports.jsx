import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, RefreshCw, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { profileApi, reportApi } from '../../services/api';
import {
  Spinner, Card, StatCard, Badge, AlertBanner, SectionHeader,
  GhostButton, PrimaryButton
} from '../../components/UI';

const today = new Date().toISOString().split('T')[0];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;

export default function CaregiverReports() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(THIS_MONTH);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await profileApi.list();
      const list = res.data || [];
      setProfiles(list);
      if (list.length) setSelectedId(list[0].id);
    } catch {
      setError('Could not load profiles.');
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    setError('');
    setReport(null);
    try {
      let res;
      if (reportType === 'daily') res = await reportApi.daily(selectedId, selectedDate);
      else if (reportType === 'weekly') res = await reportApi.weekly(selectedId, selectedDate);
      else res = await reportApi.monthly(selectedId, selectedYear, selectedMonth);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate report. Ensure data exists for the selected period.');
    } finally {
      setGenerating(false);
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedId);
  const profileName = selectedProfile?.full_name || `${selectedProfile?.first_name || ''} ${selectedProfile?.last_name || ''}`.trim() || 'Profile';

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const NutritionStat = ({ label, val, unit, color }) => (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-xl font-extrabold text-slate-800">{val}<span className="text-xs font-normal ml-1">{unit}</span></p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reports"
        subtitle="Generate health and nutrition reports for elderly profiles"
        action={<GhostButton onClick={() => setReport(null)}><RefreshCw className="w-4 h-4" /> Reset</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {profiles.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No profiles available</p>
        </Card>
      ) : (
        <>
          {/* Config Card */}
          <Card className="space-y-5">
            <h3 className="text-base font-bold text-slate-800">Configure Report</h3>

            {/* Profile selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Elderly Profile</label>
              <div className="relative max-w-xs">
                <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setReport(null); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none pr-10">
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Report type tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Report Type</label>
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-fit">
                {['daily', 'weekly', 'monthly'].map(t => (
                  <button key={t} onClick={() => { setReportType(t); setReport(null); }}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                      reportType === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date params */}
            <div className="flex flex-wrap items-end gap-4">
              {reportType !== 'monthly' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {reportType === 'weekly' ? 'Week Start Date' : 'Date'}
                  </label>
                  <input type="date" value={selectedDate} max={today}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}
              {reportType === 'monthly' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</label>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</label>
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      {[THIS_YEAR, THIS_YEAR-1, THIS_YEAR-2].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </>
              )}
              <PrimaryButton onClick={generate} loading={generating}>
                <FileText className="w-4 h-4" /> Generate Report
              </PrimaryButton>
            </div>
          </Card>

          {/* Report Output */}
          {report && (
            <div className="space-y-5">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-emerald-200 text-sm capitalize">{reportType} Report · {profileName}</p>
                    <h2 className="text-xl font-extrabold mt-0.5">{report.title || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Health Report`}</h2>
                    <p className="text-emerald-200 text-sm mt-1">
                      {report.period_start && report.period_end
                        ? `${new Date(report.period_start).toLocaleDateString()} – ${new Date(report.period_end).toLocaleDateString()}`
                        : selectedDate}
                    </p>
                  </div>
                  <Badge label={reportType} color="emerald" />
                </div>
              </div>

              {/* Nutrition Stats */}
              {(report.total_calories != null || report.avg_calories != null || report.nutrition_summary) && (
                <Card className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800">Nutrition Summary</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Calories', val: Math.round(report.total_calories || report.avg_calories || report.nutrition_summary?.total_calories || 0), unit: 'kcal', color: 'bg-amber-50' },
                      { label: 'Protein', val: ((report.total_protein || report.avg_protein || report.nutrition_summary?.total_protein || 0)).toFixed(1), unit: 'g', color: 'bg-violet-50' },
                      { label: 'Carbs', val: ((report.total_carbohydrates || report.avg_carbohydrates || 0)).toFixed(1), unit: 'g', color: 'bg-emerald-50' },
                      { label: 'Fat', val: ((report.total_fat || report.avg_fat || 0)).toFixed(1), unit: 'g', color: 'bg-rose-50' },
                    ].map(s => <NutritionStat key={s.label} {...s} />)}
                  </div>
                </Card>
              )}

              {/* Health Score Summary */}
              {(report.avg_health_score != null || report.health_score_summary) && (
                <Card className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800">Health Score Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Avg Overall', val: report.avg_health_score || report.health_score_summary?.avg_overall_score },
                      { label: 'Avg Nutrition', val: report.avg_nutrition_score || report.health_score_summary?.avg_nutrition_score },
                      { label: 'Avg Activity', val: report.avg_activity_score || report.health_score_summary?.avg_activity_score },
                      { label: 'Avg Mental', val: report.avg_mental_score || report.health_score_summary?.avg_mental_score },
                    ].filter(s => s.val != null).map(s => (
                      <div key={s.label} className="bg-emerald-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-extrabold text-emerald-700">{Math.round((s.val || 0) * 100)}%</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Alerts */}
              {report.alerts?.length > 0 && (
                <Card className="space-y-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> Health Alerts
                  </h3>
                  {report.alerts.map((a, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                      <span className="text-rose-500 mt-0.5">⚠</span>
                      <p className="text-sm text-rose-700">{typeof a === 'string' ? a : a.message || JSON.stringify(a)}</p>
                    </div>
                  ))}
                </Card>
              )}

              {/* Recommendations */}
              {report.recommendations?.length > 0 && (
                <Card className="space-y-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recommendations
                  </h3>
                  {report.recommendations.map((r, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-emerald-50 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-700">{typeof r === 'string' ? r : r.text || r.description || JSON.stringify(r)}</p>
                    </div>
                  ))}
                </Card>
              )}

              {/* Raw fallback */}
              {!report.total_calories && !report.avg_calories && !report.nutrition_summary && !report.alerts && (
                <Card className="space-y-2">
                  <h3 className="text-base font-bold text-slate-800">Report Data</h3>
                  <pre className="text-xs bg-slate-50 p-4 rounded-xl overflow-auto max-h-64 whitespace-pre-wrap text-slate-600">
                    {JSON.stringify(report, null, 2)}
                  </pre>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
