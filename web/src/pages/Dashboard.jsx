import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, Apple, TrendingUp, Activity, Bell, ChevronRight,
  Flame, Droplets, Dumbbell, Scale, Calendar, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi, dailyIntakeApi, healthScoreApi, notificationApi, mealLogApi } from '../services/api';
import { StatCard, NutrientBar, Spinner, Card, Badge, AlertBanner } from '../components/UI';

const today = new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [intake, setIntake] = useState(null);
  const [score, setScore] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentMeals, setRecentMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await profileApi.myProfile();
      const p = profileRes.data;

      // Redirect if the profile is not fully set up
      if (!p || !p.date_of_birth || !p.gender) {
        navigate('/profile-setup');
        return;
      }

      setProfile(p);

      const [intakeRes, scoreRes, notifRes, mealRes] = await Promise.allSettled([
        dailyIntakeApi.getByDate(p.id, today),
        healthScoreApi.getLatest(p.id),
        notificationApi.list(0, 5),
        mealLogApi.listByDate(p.id, today),
      ]);

      if (intakeRes.status === 'fulfilled') setIntake(intakeRes.value.data);
      if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.filter(n => !n.is_read)?.slice(0, 3) || []);
      if (mealRes.status === 'fulfilled') setRecentMeals(mealRes.value.data?.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        navigate('/profile-setup');
      } else {
        setError('Could not load profile. Please set up your elderly profile first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const scoreVal = score?.overall_score ?? 0;
  const scoreColor = scoreVal >= 0.8 ? 'text-emerald-600' : scoreVal >= 0.6 ? 'text-amber-600' : 'text-rose-600';
  const scoreBg = scoreVal >= 0.8 ? 'bg-emerald-50' : scoreVal >= 0.6 ? 'bg-amber-50' : 'bg-rose-50';
  const scoreLabel = scoreVal >= 0.8 ? 'Excellent' : scoreVal >= 0.6 ? 'Good' : scoreVal > 0 ? 'Needs Attention' : 'Not Scored';

  const calGoal = profile?.daily_calorie_goal ?? 2000;
  const cal = intake?.total_calories ?? 0;
  const protein = intake?.total_protein ?? 0;
  const carbs = intake?.total_carbohydrates ?? 0;
  const fat = intake?.total_fat ?? 0;

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <AlertBanner type="warning" message={error} />
      )}

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-sm font-medium">Good {getTimeOfDay()},</p>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">{user?.first_name} {user?.last_name}</h2>
            <p className="text-violet-200 text-sm mt-1">
              {profile ? `Monitoring: ${profile.full_name || 'Profile Active'}` : 'No profile set up'}
            </p>
          </div>
          <div className={`flex flex-col items-center px-6 py-4 rounded-xl ${scoreBg} bg-opacity-20 backdrop-blur-sm border border-white/20`}>
            <p className="text-3xl font-extrabold text-white">{Math.round(scoreVal * 100)}</p>
            <p className="text-violet-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Health Score</p>
            <span className="mt-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{scoreLabel}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Calories Today" value={Math.round(cal)} unit="kcal" icon={Flame} color="amber" trend={`Goal: ${calGoal} kcal`} />
        <StatCard label="Protein" value={protein.toFixed(1)} unit="g" icon={Dumbbell} color="violet" />
        <StatCard label="Carbs" value={carbs.toFixed(1)} unit="g" icon={Apple} color="emerald" />
        <StatCard label="Fat" value={fat.toFixed(1)} unit="g" icon={Droplets} color="rose" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Nutrition Progress */}
        <Card className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Today's Nutrition Progress</h3>
            <button onClick={() => navigate('/daily-intake')} className="text-xs text-violet-600 hover:underline font-semibold flex items-center gap-1">
              Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            <NutrientBar label="Calories" current={cal} goal={calGoal} unit="kcal" color="bg-amber-400" />
            <NutrientBar label="Protein" current={protein} goal={60} unit="g" color="bg-violet-500" />
            <NutrientBar label="Carbohydrates" current={carbs} goal={250} unit="g" color="bg-emerald-500" />
            <NutrientBar label="Fat" current={fat} goal={65} unit="g" color="bg-rose-400" />
          </div>
          <div className="pt-3 border-t border-slate-50">
            <button
              onClick={() => navigate('/meal-logs')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-sm transition-colors"
            >
              <Utensils className="w-4 h-4" /> Log a Meal
            </button>
          </div>
        </Card>

        {/* Right Column: Notifications + Quick Links */}
        <div className="space-y-4">
          {/* Unread Notifications */}
          <Card padding="p-5" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Alerts
                {notifications.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </h3>
              <button onClick={() => navigate('/notifications')} className="text-xs text-violet-600 hover:underline font-semibold">View all</button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No new alerts 🎉</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </Card>

          {/* Quick Actions */}
          <Card padding="p-5" className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
            {[
              { label: 'View Health Summary', icon: Activity, path: '/health-summary', color: 'text-violet-600 bg-violet-50' },
              { label: 'Health Conditions', icon: HeartPulse, path: '/health-conditions', color: 'text-rose-600 bg-rose-50' },
              { label: 'Log Health Score', icon: TrendingUp, path: '/health-scores', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'View Reports', icon: Calendar, path: '/reports', color: 'text-blue-600 bg-blue-50' },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors text-left">
                <span className={`p-1.5 rounded-lg ${item.color}`}><item.icon className="w-4 h-4" /></span>
                {item.label}
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
              </button>
            ))}
          </Card>
        </div>
      </div>

      {/* Recent Meals */}
      {recentMeals.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Today's Meals</h3>
            <button onClick={() => navigate('/meal-logs')} className="text-xs text-violet-600 hover:underline font-semibold">View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentMeals.map(meal => (
              <div key={meal.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{meal.food_item_name || 'Meal'}</p>
                  <p className="text-xs text-slate-400 capitalize">{meal.meal_type} · {meal.quantity}g</p>
                </div>
                <Badge label={meal.meal_type || 'snack'} color="violet" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function Utensils({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M8 7c0-1.657 1.79-3 4-3s4 1.343 4 3v4H8V7z" />
    </svg>
  );
}
