import React, { useState, useEffect } from 'react';
import { FileText, Calendar, RefreshCw, Download, ChevronDown } from 'lucide-react';
import { profileApi, reportApi } from '../services/api';
import { Spinner, Card, AlertBanner, SectionHeader, PrimaryButton, GhostButton, StatCard, Badge } from '../components/UI';

const today = new Date().toISOString().split('T')[0];
const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;

export default function Reports() {
  const [profile, setProfile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [selectedMonth, setSelectedMonth] = useState(thisMonth);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.myProfile();
      setProfile(res.data);
    } catch {
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!profile) return;
    setGenerating(true);
    setError('');
    setReport(null);
    try {
      let res;
      if (reportType === 'daily') {
        res = await reportApi.daily(profile.id, selectedDate);
      } else if (reportType === 'weekly') {
        res = await reportApi.weekly(profile.id, selectedDate);
      } else {
        res = await reportApi.monthly(profile.id, selectedYear, selectedMonth);
      }
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate report. Ensure meals and scores are logged for the selected period.');
    } finally {
      setGenerating(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Reports"
        subtitle="Generate detailed daily, weekly, and monthly health analytics"
        action={<GhostButton onClick={() => setReport(null)}><RefreshCw className="w-4 h-4" /> Reset</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Report Configuration */}
      <Card className="space-y-5">
        <h3 className="text-base font-bold text-slate-800">Configure Report</h3>
        {/* Type Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-fit">
          {['daily', 'weekly', 'monthly'].map(type => (
            <button key={type} onClick={() => setReportType(type)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                reportType === type ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {type}
            </button>
          ))}
        </div>

        {/* Date Params */}
        <div className="flex flex-wrap items-end gap-4">
          {reportType !== 'monthly' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {reportType === 'weekly' ? 'Week Start Date' : 'Date'}
              </label>
              <input type="date" value={selectedDate} max={today}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          )}
          {reportType === 'monthly' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                  {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</label>
                <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                  {[thisYear, thisYear - 1, thisYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}
          <PrimaryButton onClick={generateReport} loading={generating}>
            <FileText className="w-4 h-4" /> Generate Report
          </PrimaryButton>
        </div>
      </Card>

      {/* Report Output */}
      {report && (
        <div className="space-y-5">
          {/* Header */}
          <Card className="bg-gradient-to-r from-violet-600 to-purple-700 text-white border-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-violet-200 text-sm capitalize">{reportType} Report</p>
                <h2 className="text-xl font-extrabold mt-0.5">{report.title || report.report_type || `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Health Report`}</h2>
                <p className="text-violet-200 text-sm mt-1">
                  {report.period_start && report.period_end
                    ? `${new Date(report.period_start).toLocaleDateString()} – ${new Date(report.period_end).toLocaleDateString()}`
                    : selectedDate
                  }
                </p>
              </div>
              <Badge label={reportType} color="violet" />
            </div>
          </Card>

          {/* Nutrition Summary */}
          {(report.total_calories != null || report.avg_calories != null || report.nutrition_summary) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Calories', val: Math.round(report.total_calories || report.avg_calories || report.nutrition_summary?.total_calories || 0), unit: 'kcal', color: 'amber' },
                { label: 'Protein', val: ((report.total_protein || report.avg_protein || report.nutrition_summary?.total_protein || 0)).toFixed(1), unit: 'g', color: 'violet' },
                { label: 'Carbs', val: ((report.total_carbohydrates || report.avg_carbohydrates || report.nutrition_summary?.total_carbohydrates || 0)).toFixed(1), unit: 'g', color: 'emerald' },
                { label: 'Fat', val: ((report.total_fat || report.avg_fat || report.nutrition_summary?.total_fat || 0)).toFixed(1), unit: 'g', color: 'rose' },
              ].map(s => <StatCard key={s.label} label={s.label} value={s.val} unit={s.unit} color={s.color} />)}
            </div>
          )}

          {/* Health Score Summary */}
          {(report.avg_health_score != null || report.health_score_summary) && (
            <Card className="space-y-3">
              <h3 className="text-base font-bold text-slate-800">Health Score Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Avg Overall Score', val: report.avg_health_score || report.health_score_summary?.avg_overall_score },
                  { label: 'Avg Nutrition', val: report.avg_nutrition_score || report.health_score_summary?.avg_nutrition_score },
                  { label: 'Avg Activity', val: report.avg_activity_score || report.health_score_summary?.avg_activity_score },
                  { label: 'Avg Mental', val: report.avg_mental_score || report.health_score_summary?.avg_mental_score },
                ].filter(s => s.val != null).map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xl font-extrabold text-slate-800">{Math.round((s.val || 0) * 100)}%</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Alerts / Flags */}
          {report.alerts && report.alerts.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Health Alerts
              </h3>
              {report.alerts.map((alert, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <span className="text-rose-500 mt-0.5">⚠</span>
                  <p className="text-sm text-rose-700 leading-relaxed">{typeof alert === 'string' ? alert : alert.message || JSON.stringify(alert)}</p>
                </div>
              ))}
            </Card>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <Card className="space-y-3">
              <h3 className="text-base font-bold text-slate-800">Recommendations</h3>
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <p className="text-sm text-emerald-700 leading-relaxed">{typeof rec === 'string' ? rec : rec.text || rec.description || JSON.stringify(rec)}</p>
                </div>
              ))}
            </Card>
          )}

          {/* Raw data fallback */}
          {!report.total_calories && !report.avg_calories && !report.nutrition_summary && !report.alerts && (
            <Card className="space-y-3">
              <h3 className="text-base font-bold text-slate-800">Report Data</h3>
              <pre className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl overflow-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify(report, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
