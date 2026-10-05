import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse, Activity, AlertTriangle, CheckCircle2, TrendingUp,
  Bone, Phone, Calendar, ArrowRight, ShieldAlert, Sparkles, User, UserCheck
} from 'lucide-react';
import api from '../../services/api';

export default function CaregiverOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignedElder, setAssignedElder] = useState(null);
  const [recentMealLogs, setRecentMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedElderData();
  }, [user]);

  const loadAssignedElderData = async () => {
    setLoading(true);
    let elder = null;

    // 1. Try reading from backend API
    try {
      const res = await api.get('/elderly-profiles/');
      if (res.data && res.data.length > 0) {
        const p = res.data[0]; // Active assigned elder
        elder = {
          name: p.full_name || `${user?.first_name || 'Lakshmi'} ${user?.last_name || 'Ammal'}`,
          age: p.age || 65,
          region: p.region || 'Tamil Nadu',
          phone: p.emergency_contact_info?.phone || '9876543210',
          score: p.health_score || 82,
        };
      }
    } catch (err) {
      console.log('Backend API read fallback to setup state');
    }

    // 2. Fallback to elder setup state in localStorage if API data not available
    if (!elder) {
      const savedSetup = JSON.parse(localStorage.getItem('elder_health_setup') || '{}');
      const savedPrefs = JSON.parse(localStorage.getItem('elder_diet_preferences') || '{}');
      
      const setupName = savedSetup.fullName || (user ? `${user.first_name} ${user.last_name}` : 'Lakshmi Ammal');
      const setupAge = savedSetup.age || 65;
      const setupRegion = savedSetup.region === 'kl' ? 'Kerala' : savedSetup.region === 'ka' ? 'Karnataka' : savedSetup.region === 'ap' ? 'Andhra Pradesh' : 'Tamil Nadu';
      
      elder = {
        name: setupName,
        age: setupAge,
        region: setupRegion,
        phone: savedPrefs.caregiverPhone || '+91 98765 43210',
        score: 82,
      };
    }

    // Load recent meal logs
    const savedLogs = JSON.parse(localStorage.getItem('elder_meal_logs') || '[]');
    setRecentMealLogs(savedLogs);
    setAssignedElder(elder);
    setLoading(false);
  };

  const lastMealText = recentMealLogs.length > 0 ? recentMealLogs[0].transcript : 'Ragi Dosa & Curd';

  return (
    <div className="space-y-6 font-['Outfit'] max-w-4xl mx-auto">
      {/* Header Banner - Displaying Specific Assigned Elder */}
      <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-950 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#128C7E]" /> Directly Assigned Elder
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2">{assignedElder?.name || 'Lakshmi Ammal'} (Age {assignedElder?.age || 65})</h1>
          <p className="text-emerald-100 text-sm font-bold mt-1">
            {assignedElder?.region || 'Tamil Nadu'} Region • Primary Caregiver View
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="text-3xl font-black">{assignedElder?.score || 82}</span>
            <span className="text-[10px] uppercase font-bold block text-emerald-100">Health Score</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-emerald-950 font-black text-xs">
            +4 pts ↑
          </span>
        </div>
      </div>

      {/* Quick Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Last Meal Logged</span>
          <p className="text-base font-extrabold text-slate-900 truncate" title={lastMealText}>
            {lastMealText}
          </p>
          <span className="text-xs text-emerald-600 font-bold">Today ✓</span>
        </div>

        <div className="bg-white border-2 border-[#25D366]/30 rounded-3xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Meals Logged This Week</span>
          <p className="text-2xl font-extrabold text-[#128C7E]">20 / 21</p>
          <span className="text-xs text-slate-500 font-bold">95% Compliance</span>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Missed Breakfasts</span>
          <p className="text-2xl font-extrabold text-amber-600">1 Missed</p>
          <span className="text-xs text-amber-700 font-bold">Tuesday, Jul 27</span>
        </div>

        <div className="bg-white border-2 border-orange-200 rounded-3xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Bone Risk Badge</span>
          <p className="text-lg font-extrabold text-orange-600">Moderate Risk</p>
          <span className="text-xs text-orange-700 font-bold">Calcium: 65% of target</span>
        </div>
      </div>

      {/* Key Nutrient Status & Symptom Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calcium & Vit D Status Card */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#25D366]" /> Assigned Elder Nutrient Status
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span>Calcium Intake ({assignedElder?.name})</span>
                <span className="text-amber-600">650 / 1000 mg (65%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[65%]" />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span>Vitamin D Intake</span>
                <span className="text-emerald-600">510 / 600 IU (85%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#25D366] h-full rounded-full w-[85%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Symptom Alerts Card */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" /> Recent Symptom Alerts
          </h3>

          <div className="space-y-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-900 text-sm">Knee Pain Reported by {assignedElder?.name}</p>
                <span className="text-xs text-rose-700">Trigger: Low Calcium • Tuesday</span>
              </div>
              <span className="text-xs font-bold bg-rose-200 text-rose-900 px-2.5 py-1 rounded-full">Action Needed</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-amber-900 text-sm">Mild Fatigue</p>
                <span className="text-xs text-amber-700">Trigger: Missed Breakfast • Sunday</span>
              </div>
              <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">Monitored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
