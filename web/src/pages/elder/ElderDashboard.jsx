import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Loader2, RefreshCw, AlertCircle, Activity, Heart, Shield, Droplets, Mic, BarChart2, Plus, ArrowRight, Zap, Target } from 'lucide-react';
import api from '../../services/api';

export default function ElderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState({ calories: 0, calorieGoal: 1800, protein: 0, proteinGoal: 88, carbs: 0, carbsGoal: 229, fats: 0, fatsGoal: 60, vitamins: 0, hydration: 0, fiber: 0 });

  useEffect(() => { loadDashboardData(); }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    let elderProfile = null;
    try {
      const profileRes = await api.get('/api/elder/profile');
      elderProfile = profileRes.data;
      setProfile(elderProfile);
    } catch { const saved = localStorage.getItem('elder_health_setup'); if (saved) setProfile(JSON.parse(saved)); }

    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const localToday = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const utcToday = d.toISOString().split('T')[0];

    // Load from user-specific localStorage key for per-user isolation
    const userStorageKey = `logged_meals_${user?.email || user?.id || 'guest'}`;
    const localSaved = JSON.parse(localStorage.getItem(userStorageKey) || '[]');

    let apiMeals = [];
    try {
      const logsRes = await api.get('/api/meals');
      if (logsRes?.data && Array.isArray(logsRes.data)) {
        apiMeals = logsRes.data;
      }
    } catch (e) {
      console.warn('API meals load notice:', e);
    }

    const allMeals = [...localSaved, ...apiMeals];
    const seen = new Set();
    const todayLogs = [];

    for (const m of allMeals) {
      const mDate = m.date || (m.logged_at ? m.logged_at.split('T')[0] : (m.createdAt ? m.createdAt.split('T')[0] : (m.savedAt ? m.savedAt.split('T')[0] : '')));
      const isMatch = mDate === localToday || mDate === utcToday || m.isToday;
      if (isMatch) {
        const uKey = `${(m.name || m.meal_name || '').trim().toLowerCase()}_${(m.category || m.meal_type || '').trim().toLowerCase()}_${m.time || ''}`;
        if (!seen.has(uKey)) {
          seen.add(uKey);
          todayLogs.push(m);
        }
      }
    }

    setMealLogs(todayLogs);
    const calorieGoal = elderProfile?.daily_calorie_goal || 1800;
    const totalCal = todayLogs.reduce((acc, m) => acc + (Number(m.calories) || Number(m.nutrition_facts?.calories) || 0), 0);
    const totalProt = todayLogs.reduce((acc, m) => acc + (Number(m.protein_g || m.protein) || Number(m.nutrition_facts?.protein_g) || 0), 0);
    const totalCarbs = todayLogs.reduce((acc, m) => acc + (Number(m.carbs_g || m.carbs) || Number(m.nutrition_facts?.carbs_g) || 0), 0);
    const totalFats = todayLogs.reduce((acc, m) => acc + (Number(m.fat_g || m.fats) || Number(m.nutrition_facts?.fat_g) || 0), 0);

    const cnt = todayLogs.length;
    setNutrition({
      calories: totalCal,
      calorieGoal,
      protein: totalProt,
      proteinGoal: 88,
      carbs: totalCarbs,
      carbsGoal: 229,
      fats: totalFats,
      fatsGoal: 60,
      vitamins: cnt > 0 ? Math.min(cnt * 30, 100) : 0,
      hydration: cnt > 0 ? Math.min(cnt * 25, 100) : 0,
      fiber: cnt > 0 ? Math.min(cnt * 32, 100) : 0
    });
    setLoading(false);
  };

  const elderName = user ? user.first_name : (profile?.fullName?.split(' ')[0] || 'Friend');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greetingMorning') : hour < 17 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  const pct = (v, max) => Math.min(Math.round((v / max) * 100), 100);
  const statusLabel = (p) => p >= 90 ? 'Excellent' : p >= 70 ? 'Good' : p >= 40 ? 'Fair' : 'Low';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-lg font-medium text-slate-600">Loading dashboard…</p>
    </div>
  );

  const calPct = pct(nutrition.calories, nutrition.calorieGoal);
  const protPct = pct(nutrition.protein, nutrition.proteinGoal);
  const carbPct = pct(nutrition.carbs, nutrition.carbsGoal);
  const fatPct = pct(nutrition.fats, nutrition.fatsGoal);

  // Nutrient cards config
  const nutriCards = [
    { icon: Zap, label: 'Calories', value: nutrition.calories.toLocaleString(), unit: 'kcal', goal: nutrition.calorieGoal.toLocaleString(), pct: calPct, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', barColor: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
    { icon: Activity, label: 'Protein', value: `${nutrition.protein}g`, unit: '', goal: `${nutrition.proteinGoal}g goal`, pct: protPct, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', barColor: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' },
    { icon: Target, label: 'Carbs', value: `${nutrition.carbs}g`, unit: '', goal: `${nutrition.carbsGoal}g goal`, pct: carbPct, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', barColor: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800' },
    { icon: Droplets, label: 'Healthy Fats', value: `${nutrition.fats}g`, unit: '', goal: `${nutrition.fatsGoal}g goal`, pct: fatPct, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', barColor: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-8">

      {/* ── 1. Greeting Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-indigo-600 text-white shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 select-none pointer-events-none">
          <Heart className="w-48 h-48" />
        </div>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">Daily Overview</p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              {greeting}, {elderName}!
            </h2>
            <p className="text-lg font-medium text-indigo-100 mt-2 max-w-xl">
              {mealLogs.length === 0
                ? t('dashboard.noMeals')
                : mealLogs.length === 1
                  ? t('dashboard.oneMealLogged')
                  : `${mealLogs.length} ${t('dashboard.mealsLogged')}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/elder/voice-log')}
            className="shrink-0 px-6 py-4 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Mic className="w-5 h-5" /> Add Meal Log
          </button>
        </div>
      </div>



      {/* ── 2. Nutritional Cards ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" /> {t('dashboard.todaysNutrition')}
          </h3>
          <button onClick={loadDashboardData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100" title="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nutriCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`rounded-2xl p-5 space-y-4 border ${card.border} ${card.bg}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-white bg-opacity-60 border ${card.border}`}>
                    <Icon className={`w-5 h-5 ${card.text}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${card.badge}`}>
                    {statusLabel(card.pct)}
                  </span>
                </div>

                {/* Value */}
                <div>
                  <span className="text-sm font-medium text-slate-500 block mb-1">{card.label}</span>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <span className="text-xs font-medium text-slate-500">Goal: {card.goal}</span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-2 rounded-full bg-white bg-opacity-50 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${card.barColor}`}
                    style={{ width: `${card.pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Your Nutrition Journey Progress Bars ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" /> {t('dashboard.nutritionJourney')}
          </h3>
          <button onClick={() => navigate('/elder/nutrients')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar 1 */}
        {[
          { label: 'Vitamins & Minerals', pct: nutrition.vitamins, color: 'bg-emerald-500', tip: nutrition.vitamins >= 80 ? "Great! You've had all your greens today." : "Consider adding more leafy vegetables." },
          { label: 'Hydration (Water)', pct: nutrition.hydration, color: 'bg-blue-500', tip: nutrition.hydration >= 80 ? 'Excellent hydration! Keep it up!' : 'Try to drink a few more glasses of water.' },
          { label: 'Fiber Intake', pct: nutrition.fiber, color: 'bg-amber-500', tip: nutrition.fiber >= 80 ? 'Excellent fiber intake.' : 'Oats or ragi would boost your fiber.' },
        ].map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-slate-800">{bar.label}</span>
              <span className="text-[15px] font-semibold text-slate-700">{bar.pct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${bar.color}`}
                style={{ width: `${bar.pct}%` }} />
            </div>
            <p className="text-sm font-medium text-slate-500 italic">Tip: {bar.tip}</p>
          </div>
        ))}

        {/* Meal count note */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> 
            {mealLogs.length === 0
              ? 'No meals logged yet today'
              : `${mealLogs.length} meal${mealLogs.length > 1 ? 's' : ''} logged today`}
          </p>
          <button onClick={() => navigate('/elder/voice-log')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>
      </div>

      {/* ── 4. Quick Tip Card ── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm shrink-0">
          <Heart className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-[16px] font-bold text-indigo-900 mb-1">{t('dashboard.healthTip')}</h4>
          <p className="text-sm font-medium text-indigo-700 leading-relaxed">
            Drink warm water with a pinch of turmeric every morning for joint health. 
            Also, a 10-minute walk in the morning sunlight supports natural Vitamin D synthesis.
          </p>
        </div>
      </div>
    </div>
  );
}
