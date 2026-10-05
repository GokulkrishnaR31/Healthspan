import React, { useState, useEffect, useMemo } from 'react';
import MobileLayout from '../../components/MobileLayout';
import VoiceMealModal from '../../components/VoiceMealModal';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Utensils, 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  History, 
  Plus, 
  Trash2, 
  RefreshCw,
  Calendar,
  Flame,
  Dumbbell,
  Clock,
  Filter,
  Check
} from 'lucide-react';

const MEAL_ICONS = {
  'Breakfast': '🌅',
  'Lunch': '☀️',
  'Evening Snacks': '☕',
  'Snacks': '☕',
  'Dinner': '🌙',
  'Meal': '🍽️'
};

export default function ElderVoiceLogPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'yesterday', 'past'

  const userName = (user?.email && /gkeditz/i.test(user.email)) || (user?.name && /gkeditz/i.test(user.name))
    ? 'Shanthi Palani'
    : (user?.first_name || user?.name || 'Senior');
  const userStorageKey = `logged_meals_${(user?.email || user?.id || 'guest').toLowerCase()}`;

  // Helper for Date String formatting (YYYY-MM-DD)
  const getTodayKey = () => new Date().toISOString().split('T')[0];
  const getYesterdayKey = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  // ── Helper to Normalize and Date-Stamp Meal Logs ──
  const normalizeMeal = (m, idx, source = 'local') => {
    let rawDate = m.logged_at || m.createdAt || m.timestamp || m.rawDate;
    let dateKey = m.date;
    
    // If no explicit date was saved, try to derive from timestamp or default
    if (!dateKey) {
      if (rawDate) {
        try {
          dateKey = new Date(rawDate).toISOString().split('T')[0];
        } catch (e) {
          dateKey = todayKey;
        }
      } else {
        dateKey = todayKey;
      }
    }

    const isToday = dateKey === todayKey;
    const isYesterday = dateKey === yesterdayKey;

    let dateLabel = 'Today';
    if (isToday) {
      dateLabel = 'Today';
    } else if (isYesterday) {
      dateLabel = 'Yesterday';
    } else {
      try {
        const parts = dateKey.split('-');
        if (parts.length === 3) {
          const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          dateLabel = dObj.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
        } else {
          dateLabel = dateKey;
        }
      } catch (e) {
        dateLabel = dateKey;
      }
    }

    let timeStr = m.time;
    if (!timeStr && rawDate) {
      try {
        timeStr = new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        timeStr = '12:30 PM';
      }
    } else if (!timeStr) {
      timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const cat = m.meal_type || m.category || 'Meal';

    return {
      id: m._id || m.id || `${source}_${idx}_${dateKey}`,
      name: m.meal_name || m.name || 'Logged Meal',
      category: cat,
      categoryIcon: MEAL_ICONS[cat] || '🍽️',
      time: timeStr,
      date: dateKey,
      dateLabel,
      isToday,
      isYesterday,
      isPast: !isToday && !isYesterday,
      calories: Number(m.calories || 280),
      protein: Number(m.protein_g || m.protein || 8),
      carbs: Number(m.carbs_g || m.carbs || 40),
      timestamp: rawDate || new Date().toISOString()
    };
  };

  // ── Fetch Meal History from Backend API + User-Isolated Local Storage ──
  const loadMealLogs = async () => {
    try {
      setLoading(true);
      let apiMeals = [];
      try {
        const res = await api.get(`/api/meals?elder_name=${encodeURIComponent(userName)}`);
        if (res?.data && Array.isArray(res.data)) {
          apiMeals = res.data.map((m, idx) => normalizeMeal(m, idx, 'api'));
        }
      } catch (mErr) {
        console.warn('Meal API list notice:', mErr);
      }

      const stored = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
      const localMeals = stored.map((m, idx) => normalizeMeal(m, idx, 'local'));

      const combined = [...localMeals, ...apiMeals];
      const seen = new Set();
      const uniqueMeals = [];

      for (const m of combined) {
        const uniqueKey = `${(m.name || '').trim().toLowerCase()}_${(m.category || '').trim().toLowerCase()}_${m.date}_${m.time}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          uniqueMeals.push(m);
        }
      }

      // Sort by newest first
      uniqueMeals.sort((a, b) => {
        const tA = new Date(a.timestamp || a.date).getTime() || 0;
        const tB = new Date(b.timestamp || b.date).getTime() || 0;
        return tB - tA;
      });

      setLogs(uniqueMeals);
    } catch (err) {
      console.warn('Meal log fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMealLogs();
  }, [userStorageKey, userName]);

  const handleMealSaved = (newFoods) => {
    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = getTodayKey();

    const formatted = newFoods.map((f, i) => normalizeMeal({
      id: 'local_' + Date.now() + '_' + i,
      name: f.name,
      meal_name: f.name,
      category: f.category || 'Meal',
      meal_type: f.category || 'Meal',
      time: nowTime,
      date: nowDate,
      timestamp: nowIso,
      calories: f.nutrition_facts?.calories || 250,
      protein: f.nutrition_facts?.protein_g || 8,
      carbs: f.nutrition_facts?.carbs_g || 40,
    }, i, 'new'));

    setLogs((prev) => [...formatted, ...prev]);

    // Save to namespaced localStorage
    const existingLocal = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    localStorage.setItem(userStorageKey, JSON.stringify([...formatted, ...existingLocal]));
  };

  const handleDeleteItem = (idToDelete) => {
    const updated = logs.filter(l => l.id !== idToDelete);
    setLogs(updated);
    const existingLocal = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    const updatedLocal = existingLocal.filter(l => l.id !== idToDelete);
    localStorage.setItem(userStorageKey, JSON.stringify(updatedLocal));
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your meal history?')) {
      try {
        localStorage.removeItem(userStorageKey);
        await api.delete(`/api/meals?elder_name=${encodeURIComponent(userName)}`);
        setLogs([]);
      } catch (e) {
        setLogs([]);
      }
    }
  };

  // ── Compute Today's Stats & Grouped Logs ──
  const todayMeals = useMemo(() => logs.filter(l => l.isToday), [logs]);
  const yesterdayMeals = useMemo(() => logs.filter(l => l.isYesterday), [logs]);
  const pastMeals = useMemo(() => logs.filter(l => l.isPast), [logs]);

  const todayStats = useMemo(() => {
    return todayMeals.reduce((acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.carbs += m.carbs || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, count: todayMeals.length });
  }, [todayMeals]);

  // Filtered logs based on active tab
  const displayedLogs = useMemo(() => {
    if (activeFilter === 'today') return todayMeals;
    if (activeFilter === 'yesterday') return yesterdayMeals;
    if (activeFilter === 'past') return pastMeals;
    return logs;
  }, [activeFilter, logs, todayMeals, yesterdayMeals, pastMeals]);

  // Group by Date for grouped display
  const groupedSections = useMemo(() => {
    const groups = {};
    for (const item of displayedLogs) {
      const groupKey = item.dateLabel || item.date || 'Earlier';
      if (!groups[groupKey]) {
        groups[groupKey] = {
          label: groupKey,
          isToday: item.isToday,
          isYesterday: item.isYesterday,
          items: []
        };
      }
      groups[groupKey].items.push(item);
    }
    return Object.values(groups);
  }, [displayedLogs]);

  return (
    <MobileLayout onOpenVoiceLog={() => setIsModalOpen(true)}>
      <div className="space-y-6 font-['Outfit']">
        
        {/* ── Top Header Banner ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('log.title', 'Voice Meal & Food Logger')}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
              Logged in as: <strong className="text-emerald-600 dark:text-emerald-400">{userName}</strong> • {t('log.subtitle', 'Speak in Tamil, Hindi, or English to log meals automatically')}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4 animate-pulse" /> {t('log.tapToSpeak', 'Tap to Speak')}
          </button>
        </div>

        {/* ── Today's Quick Nutritional Summary Card ── */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{t('log.totalToday', "Today's Intake Summary")} • {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-black">
              {todayStats.count} {todayStats.count === 1 ? 'Meal' : 'Meals'} Logged Today
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-emerald-100 uppercase font-extrabold block">Calories</span>
              <span className="text-lg sm:text-xl font-black">{todayStats.calories} <span className="text-xs font-normal">kcal</span></span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-emerald-100 uppercase font-extrabold block">Protein</span>
              <span className="text-lg sm:text-xl font-black">{todayStats.protein} <span className="text-xs font-normal">g</span></span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-emerald-100 uppercase font-extrabold block">Carbohydrates</span>
              <span className="text-lg sm:text-xl font-black">{todayStats.carbs} <span className="text-xs font-normal">g</span></span>
            </div>
          </div>
        </div>

        {/* ── Filter Pills: Today vs Yesterday vs Past vs All ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            📋 {t('log.all', 'All Meals')} ({logs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('today')}
            className={`px-4 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeFilter === 'today'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-emerald-500/10'
            }`}
          >
            🌟 {t('log.today', 'Today')} ({todayMeals.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('yesterday')}
            className={`px-4 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeFilter === 'yesterday'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-blue-500/10'
            }`}
          >
            📅 {t('log.yesterday', 'Yesterday')} ({yesterdayMeals.length})
          </button>

          {pastMeals.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('past')}
              className={`px-4 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'past'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-indigo-500/10'
              }`}
            >
              🗓️ {t('log.pastDays', 'Past History')} ({pastMeals.length})
            </button>
          )}
        </div>

        {/* ── Meal History Stream Grouped by Date ── */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-900/5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('log.loggedHistory', 'Logged Meal History')} ({displayedLogs.length})</span>
            </h2>

            {logs.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear Meal History"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('log.clearHistory', 'Clear All')}
              </button>
            )}
          </div>

          {displayedLogs.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
              <Utensils className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {t('log.noMeals', 'No Meals Logged in this Period')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t('log.noMealsSub', 'Tap "Tap to Speak" or use voice input to log your breakfast, lunch, or dinner!')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedSections.map((group) => (
                <div key={group.label} className="space-y-3">
                  {/* Date Group Header Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-xs ${
                      group.isToday
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : group.isYesterday
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {group.isToday ? `🌟 Today • ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : group.label}
                    </span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* Meal Cards within this Date */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {group.items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          item.isToday 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40' 
                            : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base">{item.categoryIcon}</span>
                            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white capitalize truncate">
                              {item.name}
                            </span>
                            
                            {/* Time & Date Tag */}
                            <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              {item.time}
                            </span>

                            {item.isToday && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-md">
                                Today
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                            {t('log.category', 'Category')}: <span className="text-slate-800 dark:text-slate-200 font-bold">{item.category}</span> • {t('log.protein', 'Protein')}: <strong className="text-slate-800 dark:text-slate-200">{item.protein}g</strong> • {t('log.carbs', 'Carbs')}: <strong className="text-slate-800 dark:text-slate-200">{item.carbs}g</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 block">
                              {item.calories} <span className="text-xs font-bold">kcal</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete this meal log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VoiceMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMealSaved={handleMealSaved}
      />
    </MobileLayout>
  );
}

