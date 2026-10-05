import React, { useState, useEffect } from 'react';
import { Bell, Check, ShieldAlert, AlertTriangle, Info, Moon, Footprints, Utensils } from 'lucide-react';
import { getMissingActivityAlerts, getMissedMeals } from '../../utils/missedMealAlertChecker';
import { activityApi, mealLogApi } from '../../services/api';

const INITIAL_ALERTS = [
  {
    id: 'init_1',
    type: 'missed',
    title: 'Missed Breakfast Meal',
    desc: 'Lakshmi missed logging her breakfast slot on Tuesday, Jul 27.',
    time: '2 days ago',
    seen: false,
    severity: 'rose',
    iconType: 'meal'
  },
  {
    id: 'init_2',
    type: 'nutrient',
    title: 'Critically Low Calcium Intake',
    desc: 'Calcium level was 650mg (target 1000mg) for 3 consecutive days.',
    time: 'Yesterday',
    seen: false,
    severity: 'amber',
    iconType: 'shield'
  },
  {
    id: 'init_3',
    type: 'symptom',
    title: 'Repeated Joint Pain Symptom Reported',
    desc: 'Joint/Knee pain was voice-logged twice this week.',
    time: '3 days ago',
    seen: false,
    severity: 'amber',
    iconType: 'shield'
  },
];

export default function CaregiverAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  useEffect(() => {
    async function loadRealTimeAlerts() {
      try {
        const [actRes, mealRes] = await Promise.allSettled([
          activityApi.getToday(),
          mealLogApi.list()
        ]);

        const dynamicAlerts = [];

        // 1. Missing Activity (Morning Sleep, Evening Walk)
        let actData = {};
        if (actRes.status === 'fulfilled' && actRes.value?.data) {
          actData = actRes.value.data;
        } else {
          const localAct = localStorage.getItem(`activity_${new Date().toISOString().split('T')[0]}`);
          if (localAct) {
            try { actData = JSON.parse(localAct); } catch (e) {}
          }
        }

        const missingAct = getMissingActivityAlerts(actData);
        for (const item of missingAct) {
          dynamicAlerts.push({
            id: `dyn_${item.id}`,
            type: item.type,
            title: `Senior Unlogged: ${item.label}`,
            desc: item.message,
            time: `Today • ${item.triggerTime}`,
            seen: false,
            severity: 'amber',
            iconType: item.type === 'sleep' ? 'sleep' : 'walk'
          });
        }

        // 2. Missed Mandatory Meals
        let todayMeals = [];
        if (mealRes.status === 'fulfilled' && Array.isArray(mealRes.value?.data)) {
          const todayStr = new Date().toISOString().split('T')[0];
          todayMeals = mealRes.value.data.filter(m => (m.date === todayStr || (m.logged_at && m.logged_at.startsWith(todayStr))));
        } else {
          const localMeals = localStorage.getItem('logged_meals');
          if (localMeals) {
            try { todayMeals = JSON.parse(localMeals); } catch (e) {}
          }
        }

        const missed = getMissedMeals(todayMeals);
        for (const m of missed) {
          dynamicAlerts.push({
            id: `dyn_meal_${m.type}`,
            type: 'missed',
            title: `Missed ${m.label} Warning`,
            desc: `Senior has not logged their ${m.label} past ${m.thresholdLabel}. ${m.riskText}`,
            time: `Today (Past ${m.thresholdLabel})`,
            seen: false,
            severity: 'rose',
            iconType: 'meal'
          });
        }

        if (dynamicAlerts.length > 0) {
          setAlerts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const fresh = dynamicAlerts.filter(d => !existingIds.has(d.id));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.warn('Real-time alerts load notice:', err);
      }
    }

    loadRealTimeAlerts();
  }, []);

  const toggleSeen = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, seen: !a.seen } : a));
  };

  return (
    <div className="space-y-6 font-['Outfit'] max-w-3xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#128C7E] uppercase">Notifications & Safety</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Caregiver System Alerts</h1>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-2 rounded-3xl p-5 transition-all flex items-start justify-between gap-4 ${
              alert.seen
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : alert.severity === 'rose'
                ? 'bg-rose-50 border-rose-200 shadow-sm'
                : 'bg-amber-50 border-amber-200 shadow-sm'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {alert.iconType === 'sleep' ? (
                  <Moon className="w-5 h-5 text-amber-600 shrink-0" />
                ) : alert.iconType === 'walk' ? (
                  <Footprints className="w-5 h-5 text-amber-600 shrink-0" />
                ) : alert.iconType === 'meal' ? (
                  <Utensils className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <ShieldAlert className={`w-5 h-5 shrink-0 ${alert.severity === 'rose' ? 'text-rose-600' : 'text-amber-600'}`} />
                )}
                <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>
                <span className="text-xs text-slate-400 font-bold">• {alert.time}</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{alert.desc}</p>
            </div>

            <button
              onClick={() => toggleSeen(alert.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 ${
                alert.seen
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {alert.seen ? <Check className="w-4 h-4 text-emerald-600" /> : null}
              <span>{alert.seen ? 'Marked Seen' : 'Mark as Seen'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
