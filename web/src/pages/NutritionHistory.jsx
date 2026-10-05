import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight, BarChart3, RefreshCw } from 'lucide-react';
import { profileApi, dailyIntakeApi } from '../services/api';
import { Spinner, Card, AlertBanner, SectionHeader, GhostButton, StatCard } from '../components/UI';

export default function NutritionHistory() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'

  // Track week/month offset for pagination
  const [offset, setOffset] = useState(0);

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { if (profile) loadHistory(); }, [profile, offset, viewMode]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.myProfile();
      setProfile(res.data);
    } catch {
      setError('Could not load profile.');
      setLoading(false);
    }
  };

  const getDates = () => {
    const dates = [];
    const base = new Date();
    if (viewMode === 'week') {
      base.setDate(base.getDate() - offset * 7);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(base);
        d.setDate(base.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
    } else {
      base.setMonth(base.getMonth() - offset);
      const year = base.getFullYear();
      const month = base.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
      }
    }
    return dates;
  };

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    const dates = getDates();
    try {
      const results = await Promise.allSettled(
        dates.map(d => dailyIntakeApi.getByDate(profile.id, d))
      );
      const data = results.map((r, i) => ({
        date: dates[i],
        intake: r.status === 'fulfilled' ? r.value.data : null,
      }));
      setHistory(data);
    } catch {
      setError('Failed to load nutrition history.');
    } finally {
      setLoading(false);
    }
  };

  const presentData = history.filter(h => h.intake);
  const avgCalories = presentData.length
    ? Math.round(presentData.reduce((a, h) => a + (h.intake.total_calories || 0), 0) / presentData.length)
    : 0;
  const avgProtein = presentData.length
    ? (presentData.reduce((a, h) => a + (h.intake.total_protein || 0), 0) / presentData.length).toFixed(1)
    : 0;
  const avgCarbs = presentData.length
    ? (presentData.reduce((a, h) => a + (h.intake.total_carbohydrates || 0), 0) / presentData.length).toFixed(1)
    : 0;
  const avgFat = presentData.length
    ? (presentData.reduce((a, h) => a + (h.intake.total_fat || 0), 0) / presentData.length).toFixed(1)
    : 0;

  const maxCal = Math.max(...history.map(h => h.intake?.total_calories || 0), 1);

  const getLabel = () => {
    const base = new Date();
    if (viewMode === 'week') {
      const end = new Date(base);
      end.setDate(end.getDate() - offset * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      base.setMonth(base.getMonth() - offset);
      return base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Nutrition History"
        subtitle="Visualize your daily nutrition trends over time"
        action={<GhostButton onClick={loadHistory}><RefreshCw className="w-4 h-4" /> Refresh</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {['week', 'month'].map(mode => (
            <button key={mode} onClick={() => { setViewMode(mode); setOffset(0); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                viewMode === mode ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {mode}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(o => o + 1)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-48 text-center">{getLabel()}</span>
          <button onClick={() => setOffset(o => Math.max(0, o - 1))} disabled={offset === 0}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Calories" value={avgCalories} unit="kcal" icon={BarChart3} color="amber" />
        <StatCard label="Avg Protein" value={avgProtein} unit="g" color="violet" />
        <StatCard label="Avg Carbs" value={avgCarbs} unit="g" color="emerald" />
        <StatCard label="Avg Fat" value={avgFat} unit="g" color="rose" />
      </div>

      {/* Bar Chart */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Calorie Intake</h3>
        <div className="flex items-end gap-1.5 h-40 overflow-x-auto pb-1">
          {history.map(({ date, intake }) => {
            const cal = intake?.total_calories || 0;
            const heightPct = maxCal > 0 ? Math.max(4, (cal / maxCal) * 100) : 4;
            const isToday = date === new Date().toISOString().split('T')[0];
            const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            });
            return (
              <div key={date} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                {intake && (
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {Math.round(cal)} kcal
                  </div>
                )}
                <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      !intake ? 'bg-slate-100' : isToday ? 'bg-violet-600' : 'bg-violet-400 hover:bg-violet-500'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`text-[9px] text-center leading-tight ${isToday ? 'text-violet-600 font-bold' : 'text-slate-400'}`}>
                  {viewMode === 'week' ? label : new Date(date + 'T00:00:00').getDate()}
                </span>
              </div>
            );
          })}
        </div>
        {viewMode === 'week' && (
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-600" /><span>Today</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-400" /><span>Logged</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100" /><span>No data</span></div>
          </div>
        )}
      </Card>

      {/* Daily Data Table */}
      <Card className="overflow-hidden">
        <h3 className="text-base font-bold text-slate-800 p-5 border-b border-slate-50">Daily Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Calories</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Protein</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Carbs</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fat</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fiber</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map(({ date, intake }) => (
                <tr key={date} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-amber-600">{intake ? `${Math.round(intake.total_calories || 0)} kcal` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{intake ? `${(intake.total_protein || 0).toFixed(1)}g` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{intake ? `${(intake.total_carbohydrates || 0).toFixed(1)}g` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{intake ? `${(intake.total_fat || 0).toFixed(1)}g` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{intake ? `${(intake.total_fiber || 0).toFixed(1)}g` : '—'}</td>
                  <td className="px-4 py-3">
                    {intake ? (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">Logged</span>
                    ) : (
                      <span className="bg-slate-50 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">No data</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
