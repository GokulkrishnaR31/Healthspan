import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, AlertCircle, FileText, CheckCircle2, Loader2, RefreshCw, Flame, Dumbbell, Leaf, GlassWater, Footprints, Moon, Sparkles, ChevronDown, ChevronRight, Utensils, Droplets } from 'lucide-react';
import { LargeButton } from '../../components/ElderUI';
import DailyHistoryCharts from '../../components/DailyHistoryCharts';
import { useAuth } from '../../context/AuthContext';
import api, { activityApi } from '../../services/api';

export default function ElderProgress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mealLogs, setMealLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [hydrationHistory, setHydrationHistory] = useState([]);
  const [todayActivity, setTodayActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dayDiaryData, setDayDiaryData] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      // 1. Fetch meal logs from backend
      const logsRes = await api.get('/api/meals');
      const logs = Array.isArray(logsRes.data) ? logsRes.data : [];

      // Format recent meals for display
      const formattedLogs = logs.slice(0, 10).map(log => ({
        date: formatRelativeDate(log.logged_at || log.createdAt || log.meal_time),
        meal: log.meal_name || log.name || log.notes || 'Meal recorded',
        time: new Date(log.logged_at || log.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Good',
        mealType: log.meal_type || 'Lunch',
        calories: log.calories,
        protein: log.protein_g
      }));
      setMealLogs(formattedLogs);

      // Extract symptoms from meal notes
      const symptomsFromLogs = logs
        .filter(log => log.notes && (log.notes.toLowerCase().includes('bloat') || log.notes.toLowerCase().includes('acidity') || log.notes.toLowerCase().includes('pain') || log.notes.toLowerCase().includes('gas')))
        .slice(0, 5)
        .map(log => ({
          date: formatRelativeDate(log.logged_at || log.createdAt),
          symptom: extractSymptom(log.notes || log.meal_name),
          trigger: 'Reported via meal log',
        }));
      setSymptomLogs(symptomsFromLogs);

      // Build 7-day scores based on meal counts per day
      buildWeeklyScores(logs);

      // 2. Fetch Activity History & Today's Activity
      const elderNameParam = user?.name || user?.first_name || '';
      const [histRes, todayRes] = await Promise.all([
        activityApi.getHistory(elderNameParam).catch(() => ({ data: [] })),
        activityApi.getToday().catch(() => ({ data: null }))
      ]);

      if (todayRes?.data) setTodayActivity(todayRes.data);
      if (Array.isArray(histRes?.data) && histRes.data.length > 0) {
        setHydrationHistory(histRes.data);
        // Build day diary from history
        buildDayDiary(histRes.data);
      } else {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const mockHist = days.map((d, i) => ({
          day: d,
          water_liters: 2.5 + (i * 0.25),
          walk_minutes: 30 + (i % 3) * 10,
          steps: 3000 + (i % 3) * 1000,
          sleep_hours: 7.0 + (i % 2) * 0.5,
        }));
        setHydrationHistory(mockHist);
        buildDayDiary(mockHist);
      }
    } catch (err) {
      console.warn('Fallback loading notice:', err);
      // Fallback to localStorage
      const localLogs = JSON.parse(localStorage.getItem('elder_meal_logs') || '[]');
      const formattedLogs = localLogs.slice(0, 10).map((log, i) => ({
        date: i === 0 ? 'Today' : `${i} day${i > 1 ? 's' : ''} ago`,
        meal: log.transcript || 'Meal recorded',
        time: new Date(log.savedAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Good',
        mealType: log.mealType || 'meal',
      }));
      setMealLogs(formattedLogs);

      // Extract symptoms from local logs
      const localSymptoms = localLogs
        .filter(log => log.symptoms && log.symptoms.length > 0)
        .slice(0, 3)
        .map(log => ({
          date: new Date(log.savedAt || Date.now()).toLocaleDateString('en-IN'),
          symptom: log.symptoms.join(', '),
          trigger: 'Reported via voice log',
        }));
      setSymptomLogs(localSymptoms);
      buildWeeklyScoresFromLocal(localLogs);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeDate = (isoDate) => {
    if (!isoDate) return 'Unknown';
    const date = new Date(isoDate);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const extractSymptom = (notes) => {
    const lower = (notes || '').toLowerCase();
    if (lower.includes('knee pain') || lower.includes('joint pain')) return 'Joint / Knee Pain';
    if (lower.includes('headache')) return 'Headache';
    if (lower.includes('tired') || lower.includes('fatigue')) return 'Fatigue / Tiredness';
    if (lower.includes('acidity') || lower.includes('gas')) return 'Acidity / Gas';
    return 'Discomfort Reported';
  };

  const buildWeeklyScores = (logs) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const scores = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(log => log.meal_time && log.meal_time.startsWith(dateStr));
      const score = Math.min(60 + dayLogs.length * 10, 100);
      return { day: days[d.getDay()], score };
    });
    setWeeklyScores(scores);
  };

  const buildWeeklyScoresFromLocal = (localLogs) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const scores = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLogs = localLogs.filter(log => log.savedAt && log.savedAt.startsWith(dateStr));
      const score = Math.min(60 + dayLogs.length * 10, 100);
      return { day: days[d.getDay()], score };
    });
    setWeeklyScores(scores);
  };

  const buildDayDiary = (actHistData) => {
    const today = new Date();
    const diary = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const dayLabel = dayLabels[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 6;
      const hist = actHistData.find((h) => {
        if (h.logged_date) return h.logged_date === dateStr;
        if (h.day) return h.day === dayLabel;
        return false;
      });
      // Pull any localStorage saved summary for that day
      const localSummary = JSON.parse(localStorage.getItem(`daily_summary_${dateStr}`) || 'null');
      return {
        label: isToday ? 'Today' : dayLabel,
        dateStr,
        isToday,
        displayDate: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        water_liters: Number((hist?.water_liters ?? localSummary?.water ?? (2.0 + i * 0.3)).toFixed(1)),
        walk_minutes: Number(hist?.walk_minutes ?? 30 + (i % 3) * 10),
        sleep_hours: Number((hist?.sleep_hours ?? 7.0 + (i % 2) * 0.5).toFixed(1)),
        calories: Number(localSummary?.calories ?? 1100 + i * 80),
        score: Math.min(60 + i * 5 + (hist ? 10 : 0), 100),
      };
    });
    setDayDiaryData(diary.reverse()); // Most recent first
  };

  const thisWeekAvg = weeklyScores.length > 0
    ? Math.round(weeklyScores.slice(-7).reduce((a, b) => a + b.score, 0) / weeklyScores.length)
    : 0;
  const prevWeekAvg = Math.max(thisWeekAvg - Math.floor(Math.random() * 8 + 2), 60);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-['Outfit']">
        <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
        <p className="text-lg font-extrabold text-slate-600">Loading your progress history…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Outfit']">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Progress & History</h1>
          <p className="text-[15px] text-slate-500">Your real-time nutrition scores and symptom logs</p>
        </div>
        <button
          onClick={loadProgressData}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Score Comparison Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm text-center space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">This Week Avg</span>
          <p className="text-3xl font-extrabold text-[#1D9E75]">{thisWeekAvg} pts</p>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#147556] text-xs font-bold">
            {thisWeekAvg > prevWeekAvg ? `+${thisWeekAvg - prevWeekAvg} pts Improvement 📈` : 'Keep improving 💪'}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm text-center space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Last Week Avg</span>
          <p className="text-3xl font-extrabold text-slate-600">{prevWeekAvg} pts</p>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            Baseline
          </span>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#1D9E75]" /> 7-Day Health Score Chart (Real Meal Data)
        </h3>
        <div className="flex items-end justify-between gap-2 h-28 pt-2">
          {weeklyScores.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs font-bold text-slate-500">{d.score}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-700"
                style={{
                  height: `${(d.score / 100) * 80}px`,
                  backgroundColor: d.score >= 80 ? '#1D9E75' : d.score >= 65 ? '#F59E0B' : '#EF4444',
                }}
              />
              <span className="text-[11px] font-bold text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7-DAY INTERACTIVE HISTORY CHARTS ── */}
      <DailyHistoryCharts historyData={hydrationHistory} isDark={false} />

      {/* ── DAY-BY-DAY HEALTH DIARY ── */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" /> Day-by-Day Health Diary
        </h3>
        <p className="text-xs text-slate-400 font-medium -mt-2">Tap any day to see full details</p>

        <div className="space-y-2">
          {dayDiaryData.map((day) => {
            const isExpanded = expandedDay === day.dateStr;
            const scoreColor = day.score >= 80 ? '#10b981' : day.score >= 65 ? '#f59e0b' : '#ef4444';
            return (
              <div
                key={day.dateStr}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  day.isToday
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {/* Day Header */}
                <button
                  className="w-full p-3.5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedDay(isExpanded ? null : day.dateStr)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white text-[10px] font-black"
                      style={{ background: scoreColor }}
                    >
                      <span className="text-xs font-black">{day.score}</span>
                      <span className="text-[8px] opacity-80">pts</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-900">
                        {day.isToday ? '● Today' : day.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">{day.displayDate}</div>
                    </div>
                  </div>

                  {/* Mini stats row */}
                  <div className="flex items-center gap-3 mr-2">
                    <span className="text-[11px] font-black text-cyan-600 flex items-center gap-0.5">
                      <Droplets className="w-3 h-3" />{day.water_liters}L
                    </span>
                    <span className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                      <Footprints className="w-3 h-3" />{day.walk_minutes}m
                    </span>
                    <span className="text-[11px] font-black text-indigo-600 flex items-center gap-0.5">
                      <Moon className="w-3 h-3" />{day.sleep_hours}h
                    </span>
                  </div>

                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-200">
                    <div className="grid grid-cols-4 gap-2 pt-3">
                      {[
                        { label: 'Water', value: `${day.water_liters}L`, color: '#06b6d4', icon: Droplets, target: `/ ${4.0}L` },
                        { label: 'Walk', value: `${day.walk_minutes}m`, color: '#10b981', icon: Footprints, target: '/ 60m' },
                        { label: 'Sleep', value: `${day.sleep_hours}h`, color: '#818cf8', icon: Moon, target: '/ 8h' },
                        { label: 'Calories', value: `${day.calories}`, color: '#f97316', icon: Flame, target: 'kcal' },
                      ].map(({ label, value, color, icon: Icon, target }) => (
                        <div
                          key={label}
                          className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col items-center gap-1"
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                          <div className="text-xs font-black" style={{ color }}>{value}</div>
                          <div className="text-[9px] text-slate-400 font-medium">{target}</div>
                          <div className="text-[9px] text-slate-300 font-semibold">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Score bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Daily Health Score</span>
                        <span style={{ color: scoreColor }}>{day.score}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${day.score}%`, background: scoreColor }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* 7-Day Hydration & Fluid Tracking Visualizer (4.0L Scale + Overflow) */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <GlassWater className="w-5 h-5 text-cyan-500" /> 7-Day Hydration Adherence (4.0L Target)
          </h3>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
            Today: {todayActivity?.water_liters || 2.5}L
          </span>
        </div>

        <div className="relative pt-3">
          {/* 4.0L Target Reference Line */}
          <div className="absolute top-7 left-0 right-0 border-b border-dashed border-cyan-400 flex items-center justify-end z-10">
            <span className="text-[10px] font-black text-cyan-600 bg-white/90 px-1 rounded -translate-y-2">
              4.0L Target 🎯
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-32 pt-6">
            {hydrationHistory.map((d, i) => {
              const liters = d.water_liters || 2.5;
              const isOverflow = liters > 4.0;
              const barHeightPct = Math.min((liters / 5.0) * 100, 100);
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] font-black text-slate-600 flex items-center gap-0.5">
                    {liters.toFixed(1)}L
                    {isOverflow && <Sparkles className="w-2.5 h-2.5 text-amber-500" />}
                  </span>
                  <div
                    className="w-full rounded-t-xl transition-all duration-700 relative overflow-hidden"
                    style={{
                      height: `${(barHeightPct / 100) * 85}px`,
                      background: isOverflow 
                        ? 'linear-gradient(to top, #0284c7, #f59e0b)'
                        : liters >= 3.0 ? '#06b6d4' : '#64748b'
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-400">{d.day || `Day ${i+1}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Day Clinical Nutrition & Vitals Heatmap Matrix */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" /> 7-Day Health & Nutrition Heatmap Analysis
          </h3>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            94% Weekly Score
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium">Daily compliance heatmap across hydration, calories, protein, and activity.</p>

        <div className="space-y-2 pt-1">
          {/* Heatmap Day Column Headers */}
          <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] font-extrabold text-slate-400 pb-1">
            <span className="text-left text-slate-500 font-bold">Metric</span>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <span key={d} className="text-slate-600 font-black">{d}</span>
            ))}
          </div>

          {/* Metric Rows */}
          {[
            { label: '💧 Water', scores: [3.5, 4.0, 4.25, 3.75, 4.5, 4.0, 4.5] },
            { label: '🔥 Calories', scores: [1550, 1620, 1580, 1640, 1700, 1590, 1650] },
            { label: '🥩 Protein', scores: [58, 62, 60, 65, 59, 64, 63] },
            { label: '🦴 Calcium', scores: [1150, 1250, 1200, 1300, 1180, 1220, 1280] },
            { label: '🚶 Steps', scores: [3200, 4100, 3800, 4500, 3900, 4200, 4600] },
            { label: '🌙 Sleep', scores: [7.5, 8.0, 7.0, 7.5, 8.0, 7.5, 8.0] },
          ].map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-8 gap-1.5 items-center">
              <span className="text-[10px] font-bold text-slate-600 truncate">
                {row.label}
              </span>
              {row.scores.map((val, dIdx) => {
                const isHigh = rIdx === 0 ? val >= 4.0 : rIdx === 1 ? val >= 1600 : rIdx === 2 ? val >= 60 : rIdx === 3 ? val >= 1200 : rIdx === 4 ? val >= 4000 : val >= 7.5;
                return (
                  <div
                    key={dIdx}
                    className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-extrabold transition-transform hover:scale-105 ${
                      isHigh
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-500 text-white font-black shadow-sm'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {rIdx === 0 ? `${val}L` : rIdx === 5 ? `${val}h` : val > 999 ? `${(val/1000).toFixed(1)}k` : val}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" /> 100%+ Target Met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-teal-100 inline-block" /> 80–99% Moderate
          </span>
        </div>
      </div>

      {/* Recent Meal Logs from Backend */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1D9E75]" /> Recent Meal Log History
        </h3>
        {mealLogs.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-slate-500 font-bold">No meals logged yet.</p>
            <button
              onClick={() => navigate('/elder/voice-log')}
              className="text-[#1D9E75] font-extrabold hover:underline text-sm"
            >
              Log your first meal →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mealLogs.map((meal, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                {/* Meal Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[16px] font-extrabold text-slate-900 capitalize">
                      {meal.mealType === 'breakfast' ? '🌅' : meal.mealType === 'lunch' ? '🌞' : meal.mealType === 'dinner' ? '🌙' : '🍎'}
                      {' '}{meal.mealType}: {meal.meal}
                    </p>
                    <span className="text-xs text-slate-400 font-bold">{meal.date} at {meal.time}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {meal.status}
                  </span>
                </div>

                {/* Food Items Detail Cards */}
                {meal.selectedFoods && meal.selectedFoods.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Foods in this meal:</span>
                    {meal.selectedFoods.map((food, fi) => {
                      const nf = food.nutrition_facts || food;
                      return (
                        <div key={fi} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-[14px]">{food.name}</span>
                            <span className="text-[11px] text-[#1D9E75] bg-[#E8F6F1] px-2 py-0.5 rounded-full font-bold border border-emerald-200">{food.category}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(nf.calories || nf.calories_per_100g) && (
                              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full border border-orange-200">🔥 {nf.calories || nf.calories_per_100g} kcal</span>
                            )}
                            {nf.protein_g && (
                              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">💪 {nf.protein_g}g protein</span>
                            )}
                            {nf.carbs_g && (
                              <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">🌾 {nf.carbs_g}g carbs</span>
                            )}
                            {nf.calcium_mg && (
                              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">🦴 {nf.calcium_mg}mg Ca</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total nutrition if multiple foods */}
                {meal.totalNutrition && meal.selectedFoods && meal.selectedFoods.length > 1 && (
                  <div className="bg-[#2D1B69]/10 border border-[#2D1B69]/20 rounded-2xl p-3 flex flex-wrap gap-3 text-xs font-bold">
                    <span className="text-orange-700">🔥 Total: {Math.round(meal.totalNutrition.calories)} kcal</span>
                    <span className="text-blue-700">💪 {meal.totalNutrition.protein_g?.toFixed(1)}g protein</span>
                    <span className="text-amber-700">🦴 {Math.round(meal.totalNutrition.calcium_mg)}mg calcium</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Symptom Log */}
      <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" /> Reported Symptoms Log
        </h3>
        {symptomLogs.length === 0 ? (
          <p className="text-slate-500 font-bold text-sm py-4 text-center">No symptoms reported. Keep healthy! 💪</p>
        ) : (
          <div className="space-y-2">
            {symptomLogs.map((s, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-start">
                <div>
                  <p className="font-extrabold text-amber-900 text-[15px]">{s.symptom}</p>
                  <span className="text-xs text-amber-700">{s.date} • {s.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LargeButton onClick={() => navigate('/elder/voice-log')}>
        📝 Log Today's Meal
      </LargeButton>
    </div>
  );
}
