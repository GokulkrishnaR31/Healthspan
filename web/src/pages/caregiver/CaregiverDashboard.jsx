import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { caregiverApi, profileApi, vitalsApi } from '../../services/api';
import DailyVitalsVisualizer from '../../components/DailyVitalsVisualizer';
import DailyVitalsModal from '../../components/DailyVitalsModal';
import {
  HeartPulse, Bell, Activity, PhoneCall, ShieldAlert, LogOut, CheckCircle, CheckCircle2, Moon, Footprints, GlassWater, Edit3, X, Save, FileText, Download, Plus, Clock, Sparkles, UserCheck, Link as LinkIcon, QrCode, Pill, Bone, Brain, Sliders, BarChart3, TrendingUp, Flame, Layers, AlertTriangle, User
} from 'lucide-react';
import { isFastFoodName } from '../../components/ElderHealthVisualizer';
import { getMissedMeals } from '../../utils/missedMealAlertChecker';

export default function CaregiverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Real-time Fasting & Fast Food Alerts from Senior
  const [fastingAlert, setFastingAlert] = useState(null);
  const [fastFoodAlert, setFastFoodAlert] = useState(null);
  const [unloggedAlert, setUnloggedAlert] = useState(null);
  const [digestSent, setDigestSent] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Link Senior Form State
  const [newSeniorCode, setNewSeniorCode] = useState('');
  const [newSeniorName, setNewSeniorName] = useState('');
  const [newSeniorRelation, setNewSeniorRelation] = useState('Son / Daughter');

  // Caregiver Email from Session
  const sessionUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user?.email || sessionUser.email || 'caregiver@healthspan.in';
  
  const caregiverProfile = JSON.parse(localStorage.getItem('caregiver_profile') || '{}');
  const caregiverRelationship = caregiverProfile.relationship || 'Caregiver';

  // Linked Elders State (Synced from MongoDB Atlas Backend)
  const [linkedElders, setLinkedElders] = useState([]);
  const [selectedElderId, setSelectedElderId] = useState(null);
  const selectedElder = (linkedElders || []).find((e) => e.id === selectedElderId) || (linkedElders || [])[0] || null;

  // Caregiver Scheduled Medications List (Synced from MongoDB Atlas Backend)
  const [medications, setMedications] = useState([]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedTime, setNewMedTime] = useState('');

  const [editingElder, setEditingElder] = useState(null);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [elderVitals, setElderVitals] = useState({
    bp_systolic: 120,
    bp_diastolic: 80,
    blood_sugar: 105,
    sugar_type: 'fasting',
    pulse: 72
  });
  const [elderVitalsHistory, setElderVitalsHistory] = useState([]);

  // ── Real-time Poll for Fast Food Alerts & Missing Daily Data Alerts ──
  useEffect(() => {
    const checkAlerts = () => {
      if (!selectedElder) {
        setFastFoodAlert(null);
        setUnloggedAlert(null);
        return;
      }

      // 1. Fast Food Check
      const elderEmail = selectedElder.email || '';
      const localKey = elderEmail ? `logged_meals_${elderEmail}` : 'logged_meals';
      const loggedMeals = JSON.parse(localStorage.getItem(localKey) || '[]');
      
      const fastFoodItems = loggedMeals.filter(m => {
        const mealName = m.name || m.meal_name || '';
        const elderMatches = !m.elder_name || m.elder_name.toLowerCase() === (selectedElder.name || '').toLowerCase();
        return isFastFoodName(mealName) && elderMatches;
      });

      if (fastFoodItems.length > 0) {
        const top = fastFoodItems[0];
        setFastFoodAlert({
          elderName: selectedElder.name || top.elder_name || 'Senior',
          foodName: fastFoodItems.map(f => f.name || f.meal_name).join(', '),
          calories: top.calories || top.nutrition_facts?.calories || 340,
          time: top.time || 'Today',
          healthRisk: 'High in refined sodium & trans-fats. Can trigger blood pressure spikes, heartburn & strain senior digestion.',
          penaltyPts: fastFoodItems.length * 15,
          recommendedAction: 'Ensure senior drinks 2 glasses of warm water and consumes a low-sodium, light dinner.',
          timestamp: new Date().toISOString()
        });
      } else {
        setFastFoodAlert(null);
      }

      // 2. Missing Daily Data / 6 PM Evening Alert Check
      const unloggedAlertRaw = localStorage.getItem('caregiver_unlogged_alert');
      const currentHour = new Date().getHours();
      const waterKey = elderEmail ? `elder_water_${elderEmail}` : 'elder_water';
      const waterLiters = Number(localStorage.getItem(waterKey) || 0);

      if (unloggedAlertRaw) {
        try {
          const parsed = JSON.parse(unloggedAlertRaw);
          setUnloggedAlert(parsed);
        } catch {
          setUnloggedAlert({
            elderName: selectedElder.name || 'Senior',
            missingItems: 'Meals, Fluids, Vitals',
            time: 'Evening',
            message: unloggedAlertRaw
          });
        }
      } else if (currentHour >= 18 && loggedMeals.length === 0 && waterLiters === 0) {
        setUnloggedAlert({
          elderName: selectedElder.name || 'Senior',
          missingItems: 'Daily Meals & Hydration',
          time: 'After 6:00 PM',
          message: `No nutritional meals or water intake recorded for ${selectedElder.name || 'Senior'} today.`
        });
      } else {
        setUnloggedAlert(null);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 2000);
    return () => clearInterval(interval);
  }, [selectedElder]);

  // ── Fetch Assigned Senior Links for Logged-In Caregiver from MongoDB Atlas ──
  useEffect(() => {
    async function loadCaregiverBackendData() {
      try {
        setLoading(true);
        const alertMsg = localStorage.getItem('caregiver_fasting_alert');
        if (alertMsg && !alertMsg.toLowerCase().includes('none')) {
          setFastingAlert(alertMsg);
        } else {
          setFastingAlert(null);
        }

        // 1. Fetch Specific Assigned Elders for Logged-In Caregiver
        const eldersRes = await caregiverApi.getElders(userEmail);
        if (eldersRes?.data && Array.isArray(eldersRes.data) && eldersRes.data.length > 0) {
          setLinkedElders(eldersRes.data);
          setSelectedElderId(eldersRes.data[0].id);
        } else if (caregiverProfile.seniorName || caregiverProfile.elderCode) {
          try {
            const linkRes = await caregiverApi.verifyCode({
              caregiver_email: userEmail,
              elder_name: caregiverProfile.seniorName,
              elder_code: caregiverProfile.elderCode,
              relationship: caregiverProfile.relationship || 'Son / Daughter',
              phone: caregiverProfile.phone || '+91 98765 43210'
            });
            if (linkRes?.data?.elder) {
              setLinkedElders([linkRes.data.elder]);
              setSelectedElderId(linkRes.data.elder.id);
            }
          } catch (linkErr) {
            console.warn('Auto-link notice:', linkErr);
          }
        } else {
          // STRICT USER ISOLATION: 0 assigned elders until linked via Care Code
          setLinkedElders([]);
          setSelectedElderId(null);
        }

        // 2. Fetch Medications from MongoDB Atlas API
        const medsRes = await caregiverApi.getMedications();
        if (medsRes?.data && Array.isArray(medsRes.data)) {
          setMedications(medsRes.data.map(m => ({
            id: m._id || m.id,
            name: m.name,
            dose: m.dose,
            time: m.time,
            status: m.status
          })));
        }

        // 3. Fetch Elder Vitals (BP, Sugar, Pulse) from API
        try {
          const vToday = await vitalsApi.getToday(selectedElder?.name || '');
          if (vToday?.data) setElderVitals(vToday.data);
          const vHist = await vitalsApi.getHistory(selectedElder?.name || '');
          if (vHist?.data && Array.isArray(vHist.data)) setElderVitalsHistory(vHist.data);
        } catch (vErr) {
          console.warn('Caregiver vitals sync notice:', vErr);
        }
      } catch (err) {
        console.warn('Caregiver backend sync notice:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCaregiverBackendData();
    window.addEventListener('healthspan:sync', loadCaregiverBackendData);
    return () => window.removeEventListener('healthspan:sync', loadCaregiverBackendData);
  }, [userEmail]);

  // Live reload vitals whenever selected senior changes
  useEffect(() => {
    async function loadSelectedElderVitals() {
      if (!selectedElder?.name) return;
      try {
        const vToday = await vitalsApi.getToday(selectedElder.name);
        if (vToday?.data) setElderVitals(vToday.data);
        const vHist = await vitalsApi.getHistory(selectedElder.name);
        if (vHist?.data && Array.isArray(vHist.data)) setElderVitalsHistory(vHist.data);
      } catch (e) {}
    }
    loadSelectedElderVitals();
  }, [selectedElderId, selectedElder?.name]);

  const getLatestMealFromStorage = () => {
    const meals = JSON.parse(localStorage.getItem('logged_meals') || '[]');
    if (meals.length > 0) {
      const top = meals[0];
      return `${top.name || top.meal_name || 'Logged Meal'} (${top.category || top.meal_type || 'Meal'}) at ${top.time || 'Today'}`;
    }
    return null;
  };

  const handleLinkSeniorSubmit = async (e) => {
    e.preventDefault();
    if (!newSeniorCode && !newSeniorName) return;

    try {
      const res = await caregiverApi.verifyCode({
        caregiver_email: userEmail,
        elder_name: newSeniorName || 'Senior',
        elder_code: newSeniorCode || 'ELDER-0000',
        relationship: newSeniorRelation,
      });

      const created = res.data?.elder || {
        id: `elder-${Date.now()}`,
        name: newSeniorName || 'Senior',
        elderCode: newSeniorCode,
        relationshipLabel: `${newSeniorRelation} to ${newSeniorName}`,
        age: 68,
        heightCm: 169,
        weightKg: 64,
        conditions: ['Diabetes', 'Digestion'],
        chewability: 'Soft Meals',
        status: 'Stable',
        lastMeal: 'Pending Today Log',
        waterGlasses: 0,
        sleepHours: null,
        steps: 0,
        alerts: [],
      };

      setLinkedElders((prev) => [...prev.filter(i => i.id !== created.id), created]);
      setSelectedElderId(created.id);
      setLinkModalOpen(false);
      setNewSeniorCode('');
      setNewSeniorName('');
    } catch (err) {
      console.warn('Link senior notice:', err);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!newMedName) return;

    const medData = {
      elder_name: selectedElder?.name || 'Senior',
      name: newMedName,
      dose: newMedDose || '1 Dose',
      time: newMedTime || '8:00 AM',
      status: 'Pending',
    };

    try {
      const res = await caregiverApi.addMedication(medData);
      const created = {
        id: res.data._id || Date.now(),
        name: res.data.name || newMedName,
        dose: res.data.dose || newMedDose || '1 Dose',
        time: res.data.time || newMedTime || '8:00 AM',
        status: 'Pending'
      };
      setMedications((prev) => [...prev, created]);
    } catch (err) {
      setMedications((prev) => [...prev, { id: Date.now(), ...medData }]);
    }

    setNewMedName('');
    setNewMedDose('');
    setNewMedTime('');
  };

  const toggleMedStatus = async (id) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'Given ✓' ? 'Pending' : 'Given ✓';
          try {
            caregiverApi.updateMedication(id, { status: nextStatus });
          } catch (e) {}
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleSaveElderProfile = async (e) => {
    e.preventDefault();
    if (!editingElder) return;

    setLinkedElders((prev) =>
      prev.map((item) => (item.id === editingElder.id ? { ...editingElder } : item))
    );

    try {
      await caregiverApi.updateElder(editingElder.id, editingElder);
      await profileApi.updateProfile({
        name: editingElder.name,
        age: editingElder.age,
        height_cm: editingElder.heightCm,
        weight_kg: editingElder.weightKg,
        conditions: editingElder.conditions,
        chewability: editingElder.chewability,
      });
    } catch (err) {
      console.warn('Profile sync notice:', err);
    }

    setEditingElder(null);
  };

  const toggleConditionInEdit = (cond) => {
    if (!editingElder) return;
    const exists = (editingElder.conditions || []).includes(cond);
    setEditingElder({
      ...editingElder,
      conditions: exists
        ? (editingElder.conditions || []).filter((c) => c !== cond)
        : [...(editingElder.conditions || []), cond],
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Outfit'] pb-16">
      {/* Caregiver Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">HealthSpan</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                  Caregiver Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Logged in: {userEmail} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/caregiver/profile')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="View & Edit Caregiver Profile"
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => setLinkModalOpen(true)}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Link Senior Code
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Caregiver Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* ── Caregiver Feature Navigation Tabs ── */}
        <div className="p-1.5 bg-slate-900 rounded-2xl flex gap-1 border border-slate-800">
          {[
            { id: 'overview', label: 'Elders Overview', icon: Activity },
            { id: 'analytics', label: 'Daily Analytics & Heatmap', icon: BarChart3 },
            { id: 'digest', label: 'Doctor Health Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: OVERVIEW & MULTI-ELDER MONITORING ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Senior Selection Switcher & Add Link Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 p-4 rounded-3xl border border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-extrabold text-white">Your Assigned Seniors ({(linkedElders || []).length}):</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {(linkedElders || []).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedElderId(e.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      selectedElderId === e.id
                        ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
                <button
                  onClick={() => setLinkModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Link Senior Code
                </button>
              </div>
            </div>

            {/* Selected Senior Detail Card or Zero-State */}
            {!selectedElder ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">No Senior Linked Yet</h3>
                  <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1">
                    Enter your family member's unique Senior Care Code (e.g., <strong>ELDER-2621</strong>) or name to start monitoring their daily meal logs and nutrition.
                  </p>
                </div>
                <button
                  onClick={() => setLinkModalOpen(true)}
                  className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Link Senior Care Code
                </button>
              </div>
            ) : (
            <div className="space-y-5">
              {/* Top Patient Header Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-black text-white">
                      Senior Patient: <span className="text-emerald-400">{selectedElder?.name || 'Deepan Kumar'}</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700">
                      Age {selectedElder?.age || 68}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                      Code: {selectedElder?.elderCode || 'ELDER-2621'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Last updated: <span className="text-slate-300 font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today</span> • Relationship: <strong className="text-emerald-300">{selectedElder?.relationshipLabel || 'Son / Daughter'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingElder({ ...selectedElder })}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit Health Profile
                  </button>
                  <a
                    href={`tel:${selectedElder?.phone || '9876543210'}`}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Senior
                  </a>
                </div>
              </div>

              {/* ── HIGH PRIORITY: Evening Missing Data Alert from Senior ── */}
              {unloggedAlert && (
                <div className="p-5 bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl space-y-3 shadow-xl animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-500/25 text-amber-300 rounded-2xl border border-amber-500/30 mt-0.5">
                        <Bell className="w-5 h-5 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-amber-200">
                            ⚠️ Evening Daily Log Alert: <span className="text-white">{unloggedAlert.elderName || selectedElder?.name || 'Senior'} Has Not Logged Today</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                            Missing: {unloggedAlert.missingItems || 'Meals & Hydration'}
                          </span>
                        </div>
                        <p className="text-xs text-amber-100/90 font-medium mt-1">
                          {unloggedAlert.message || `No nutritional or fluid intake has been recorded for ${selectedElder?.name || 'Senior'} today.`}
                        </p>
                        <p className="text-[11px] text-amber-300/80 font-semibold mt-0.5">
                          📱 An evening reminder notification and caregiver SMS dispatch were triggered at {unloggedAlert.time || '18:00 (6 PM)'}.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${selectedElder?.phone || '9876543210'}`}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call & Remind
                      </a>
                      <button
                        onClick={() => {
                          localStorage.removeItem('caregiver_unlogged_alert');
                          setUnloggedAlert(null);
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                        title="Acknowledge Alert"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TIME-BASED MISSED MANDATORY MEAL ALERT FOR CAREGIVER ── */}
              {(() => {
                const elderEmail = selectedElder?.email || '';
                const localKey = elderEmail ? `logged_meals_${elderEmail}` : 'logged_meals';
                const storedMeals = [
                  ...JSON.parse(localStorage.getItem(localKey) || '[]'),
                  ...JSON.parse(localStorage.getItem('logged_meals') || '[]'),
                  ...JSON.parse(localStorage.getItem('elder_meal_logs') || '[]')
                ];
                const dNow = new Date();
                const pad2 = (n) => String(n).padStart(2, '0');
                const localToday = `${dNow.getFullYear()}-${pad2(dNow.getMonth() + 1)}-${pad2(dNow.getDate())}`;
                const utcToday = dNow.toISOString().split('T')[0];

                const todayStoredMeals = storedMeals.filter(m => {
                  const mDate = m.date || (m.logged_at ? m.logged_at.split('T')[0] : (m.createdAt ? m.createdAt.split('T')[0] : ''));
                  const isMatch = mDate === localToday || mDate === utcToday || m.isToday;
                  const elderMatches = !m.elder_name || !selectedElder?.name || m.elder_name.toLowerCase() === selectedElder.name.toLowerCase();
                  return isMatch && elderMatches;
                });
                const missed = getMissedMeals(todayStoredMeals);

                if (missed.length === 0) return null;

                return (
                  <div className="p-4 sm:p-5 bg-rose-500/15 border-2 border-rose-500/40 rounded-3xl space-y-3 shadow-xl animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                          <AlertTriangle className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-rose-200">
                            🚨 Missed Mandatory Meal Alert for {selectedElder?.name || 'Senior'}
                          </h4>
                          <p className="text-xs text-rose-300 font-medium">
                            {missed.map(m => `${m.label} (Cutoff was ${m.thresholdLabel})`).join(' • ')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${selectedElder?.phone || '9876543210'}`}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call & Check-In
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* ── TOP 2-CARD GRID: Safety Alert or Healthy Nutrition Status & Health Score Gauge ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left (2 cols): Dynamic Fast Food Alert OR Healthy Adherence Card */}
                {fastFoodAlert ? (
                  <div className="lg:col-span-2 p-5 bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl space-y-3 shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 mt-0.5">
                          <ShieldAlert className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-rose-200">
                              Fast Food Consumption Alert: <span className="text-rose-400">{fastFoodAlert.foodName} logged</span>
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30">
                              -{fastFoodAlert.penaltyPts || 15} Pts Penalty
                            </span>
                          </div>
                          <p className="text-xs text-rose-300/80 font-medium mt-1">
                            Logged: <strong>{fastFoodAlert.time || 'Today'}</strong>
                          </p>
                          <p className="text-xs text-slate-300 font-semibold mt-1">
                            Details: <span className="text-slate-200">{fastFoodAlert.healthRisk}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${selectedElder?.phone || '9876543210'}`}
                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Call Senior
                        </a>
                        <button
                          onClick={() => {
                            localStorage.removeItem('caregiver_fastfood_alert');
                            setFastFoodAlert(null);
                          }}
                          className="p-1.5 text-rose-400 hover:text-white rounded-lg hover:bg-rose-500/20 cursor-pointer"
                          title="Dismiss Alert"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="lg:col-span-2 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl space-y-3 shadow-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-emerald-300">
                              ✨ Clean Nutrition & Dietary Adherence
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                              No Fast Food Logged Today
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-1">
                            Latest Logged Meal: <strong className="text-emerald-400">{getLatestMealFromStorage() || selectedElder?.lastMeal || 'Sprouted Ragi Kanji & Idli (8:30 AM)'}</strong>
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Senior is maintaining balanced, sodium-controlled nutrition meeting ICMR RDA targets.
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${selectedElder?.phone || '9876543210'}`}
                        className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Senior
                      </a>
                    </div>
                  </div>
                )}

                {/* Right (1 col): Composite Health Score Gauge Card */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Composite Health Score</span>
                  
                  {/* Visual Semicircular Score Gauge */}
                  <div className="relative w-36 h-20 flex items-end justify-center">
                    <svg className="w-36 h-20 overflow-visible" viewBox="0 0 140 75">
                      <path
                        d="M 10 70 A 60 60 0 0 1 130 70"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 70 A 60 60 0 0 1 130 70"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray="188.5"
                        strokeDashoffset={188.5 * (1 - (selectedElder?.healthScore || 78) / 100)}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="60%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                      <span className="text-2xl font-black text-white">{selectedElder?.healthScore || 78} <span className="text-xs font-bold text-slate-400">/ 100</span></span>
                    </div>
                  </div>

                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/30">
                    ({selectedElder?.status || 'Stable'})
                  </span>
                </div>
              </div>

              {/* ── MIDDLE 4-METRIC CARDS GRID ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Water Intake */}
                <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-extrabold">
                      <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <GlassWater className="w-4 h-4" />
                      </div>
                      <span>Water Intake:</span>
                    </div>
                    {(selectedElder?.waterLiters || 2.5) > 4.0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> +{((selectedElder?.waterLiters || 2.5) - 4.0).toFixed(2)}L Extra
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-black text-white">
                    {selectedElder?.waterLiters || 2.5} <span className="text-xs font-bold text-slate-400">/ 4.0 Litres</span>
                  </p>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          (selectedElder?.waterLiters || 2.5) > 4.0
                            ? 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, (((selectedElder?.waterLiters || 2.5) / 4.0) * 100))}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Progress: {Math.round(((selectedElder?.waterLiters || 2.5) / 4.0) * 100)}%</span>
                      <span>Goal: 4.0 L</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Daily Walk Duration */}
                <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold">
                      <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <span>Daily Walk:</span>
                    </div>
                  </div>
                  <p className="text-xl font-black text-white">{selectedElder?.walkMinutes || 30} <span className="text-xs font-bold text-slate-400">/ 60 Mins</span></p>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, (((selectedElder?.walkMinutes || 30) / 60) * 100))}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Progress: {Math.round(((selectedElder?.walkMinutes || 30) / 60) * 100)}%</span>
                      <span>Goal: 60 min</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Calcium Intake */}
                <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold">
                      <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span>Calcium Intake:</span>
                    </div>
                  </div>
                  <p className="text-xl font-black text-emerald-400">79% <span className="text-xs font-bold text-slate-400">RDA</span></p>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '79%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Bone Target Met</span>
                      <span>79%</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Omega-3 Level */}
                <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-400 text-xs font-extrabold">
                      <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span>Omega-3 Level:</span>
                    </div>
                  </div>
                  <p className="text-xl font-black text-teal-400">91% <span className="text-xs font-bold text-slate-400">RDA</span></p>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full" style={{ width: '91%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Cognitive Defense</span>
                      <span>91%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CARD: CLINICAL ASSESSMENT (MMSE & FRAX) ── */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black text-white">Clinical Health Assessment (MMSE & FRAX)</h4>
                      <p className="text-[11px] text-slate-400 font-medium">Cognitive Health Status & 10-Year Bone Fracture Risk Engine</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/elder/clinical-assessment')}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Fill / Update Assessment Form
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                      <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-blue-400" /> MMSE Cognitive Score</span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg text-[10px] font-black">
                        {selectedElder?.mmse_stage || 'Normal'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-blue-300">
                      {selectedElder?.mmse_score || 28} / 30
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Table 1 Stage: Normal (30–26), Mild (25–20), Moderate (19–10), Severe (9–0).
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1.5"><Bone className="w-4 h-4 text-amber-400" /> FRAX® 10-Yr Fracture Risk</span>
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-black">
                        {selectedElder?.frax_category || 'Normal'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-amber-300">
                      {selectedElder?.frax_major_risk || 8.5}% Major • {selectedElder?.frax_hip_risk || 1.8}% Hip
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Table 2 Category: Normal (&lt;10%), Moderate (10%–20%), Osteoporosis (&gt;20% or Hip ≥3%).
                    </p>
                  </div>
                </div>
              </div>

              {/* ── DAILY CLINICAL VITALS (BP & SUGAR) VISUALIZER FOR CAREGIVER ── */}
              <DailyVitalsVisualizer
                vitals={elderVitals}
                history={elderVitalsHistory}
                isDark={true}
                onOpenLogModal={() => setIsVitalsModalOpen(true)}
              />

              {/* ── BOTTOM 2-COLUMN SECTION: 7-Day Multi-Metric Heatmap & Caregiver Digest Dispatcher ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Column 1: 7-Day Multi-Factor Health & Compliance Heatmap */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-emerald-400" /> 7-Day Health Adherence Heatmap
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Live Analysis
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Heatmap Column Headers (Days) */}
                    <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] font-extrabold text-slate-400 pb-1">
                      <span className="text-left text-slate-500 font-bold">Metric</span>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <span key={d} className="text-slate-300">{d}</span>
                      ))}
                    </div>

                    {/* Metric Rows */}
                    {[
                      { label: '💧 Water (L)', scores: [3.5, 4.0, 4.25, 3.75, 4.5, 4.0, 4.5], target: '4.0L' },
                      { label: '🔥 Calories', scores: [1550, 1620, 1580, 1640, 1700, 1590, 1650], target: '1600' },
                      { label: '🥩 Protein (g)', scores: [58, 62, 60, 65, 59, 64, 63], target: '60g' },
                      { label: '🦴 Calcium (mg)', scores: [1150, 1250, 1200, 1300, 1180, 1220, 1280], target: '1200' },
                      { label: '🚶 Steps', scores: [3200, 4100, 3800, 4500, 3900, 4200, 4600], target: '4000' },
                      { label: '🌙 Sleep (hrs)', scores: [7.5, 8.0, 7.0, 7.5, 8.0, 7.5, 8.0], target: '7.5h' },
                    ].map((row, rIdx) => (
                      <div key={rIdx} className="grid grid-cols-8 gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-slate-400 truncate" title={`${row.label} (Target: ${row.target})`}>
                          {row.label}
                        </span>
                        {row.scores.map((val, dIdx) => {
                          const isHigh = rIdx === 0 ? val >= 4.0 : rIdx === 1 ? val >= 1600 : rIdx === 2 ? val >= 60 : rIdx === 3 ? val >= 1200 : rIdx === 4 ? val >= 4000 : val >= 7.5;
                          return (
                            <div
                              key={dIdx}
                              title={`${val} (${isHigh ? 'Target Met ✓' : 'Near Target'})`}
                              className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-extrabold transition-transform hover:scale-110 cursor-pointer ${
                                isHigh
                                  ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 text-slate-950 font-black shadow-sm'
                                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              }`}
                            >
                              {rIdx === 0 ? `${val}L` : rIdx === 5 ? `${val}h` : val > 999 ? `${(val/1000).toFixed(1)}k` : val}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> 100%+ Goal Met
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-teal-500/30 inline-block" /> 80–99% Moderate
                    </span>
                    <span className="text-slate-400 font-semibold">Weekly Score: 92%</span>
                  </div>
                </div>

                {/* Column 2: WhatsApp & SMS Family Health Digest Dispatcher */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Automated Caregiver Digest
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-extrabold border border-cyan-500/20">
                        Zero-Install
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Dispatched weekly to family caregiver phone via WhatsApp & SMS with plain-language nutritional summary.
                    </p>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Recipient Phone:</span>
                        <strong className="text-emerald-400">+91 98765 43210 (Priya Verma)</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Digest Highlights:</span>
                        <strong className="text-slate-200">Score 78/100 • 21 Meals • Cal 79% • Om3 91%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={async () => {
                      try {
                        await api.post('/api/send-sms', {
                          phone: '+91 98765 43210',
                          elder_name: selectedElder?.name || 'Deepan',
                          message: `HealthSpan Weekly Digest: Senior ${selectedElder?.name || 'Deepan'} has maintained a Composite Health Score of 78/100. Calcium intake: 79% RDA, Omega-3: 91% RDA. Fast food alert logged at 1:30 PM.`,
                          alert_type: 'Caregiver Weekly Digest'
                        });
                        setDigestSent(true);
                      } catch (e) {
                        setDigestSent(true);
                      }
                    }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span className="text-base">💬</span>
                    <span>Dispatched Weekly Health Digest via WhatsApp & SMS</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* ── TAB 2: DAILY ANALYTICS & NUTRITION HEATMAP SUITE ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Daily Meal Macronutrient Distribution Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" /> Daily Meal Macronutrient Breakdown ({selectedElder?.name})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Calories & Protein intake grouped by meal slots vs ICMR RDA limits</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Today's Analysis
                </span>
              </div>

              {/* Grouped Meal Slots Bar Chart (Dynamically Computed from Selected Senior's Meal Logs) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                {(() => {
                  const elderEmail = selectedElder?.email || '';
                  const localKey = elderEmail ? `logged_meals_${elderEmail}` : 'logged_meals';
                  const storedMeals = [
                    ...JSON.parse(localStorage.getItem(localKey) || '[]'),
                    ...JSON.parse(localStorage.getItem('logged_meals') || '[]'),
                    ...JSON.parse(localStorage.getItem('elder_meal_logs') || '[]')
                  ];
                  const dNow = new Date();
                  const pad2 = (n) => String(n).padStart(2, '0');
                  const localToday = `${dNow.getFullYear()}-${pad2(dNow.getMonth() + 1)}-${pad2(dNow.getDate())}`;
                  const utcToday = dNow.toISOString().split('T')[0];

                  const filtered = storedMeals.filter(m => {
                    const mDate = m.date || (m.logged_at ? m.logged_at.split('T')[0] : (m.createdAt ? m.createdAt.split('T')[0] : ''));
                    const isMatch = mDate === localToday || mDate === utcToday || m.isToday;
                    const elderMatches = !m.elder_name || !selectedElder?.name || m.elder_name.toLowerCase() === selectedElder.name.toLowerCase();
                    return isMatch && elderMatches;
                  });

                  const getSlotData = (keywords, defaultTitle, defaultCals, defaultProt, maxCal, gradColor) => {
                    const matches = filtered.filter(m => {
                      const cat = (m.category || m.meal_type || '').toLowerCase();
                      const name = (m.name || m.meal_name || '').toLowerCase();
                      return keywords.some(k => cat.includes(k) || name.includes(k));
                    });

                    if (matches.length > 0) {
                      const cals = matches.reduce((sum, m) => sum + (Number(m.calories) || Number(m.nutrition_facts?.calories) || 0), 0);
                      const prot = matches.reduce((sum, m) => sum + (Number(m.protein) || Number(m.nutrition_facts?.protein_g) || 0), 0);
                      const carbs = Math.round(cals * 0.12);
                      const title = matches.map(m => m.name || m.meal_name).join(', ');
                      return { name: title, calories: cals, protein: prot, carbs, maxCal, color: gradColor, isLogged: true };
                    }
                    return { name: 'Not Logged Today', calories: 0, protein: 0, carbs: 0, maxCal, color: gradColor, isLogged: false };
                  };

                  const slots = [
                    { slot: '🌅 Breakfast', ...getSlotData(['breakfast', 'morning', 'idli', 'dosa', 'kanji', 'upma', 'poha'], 'Sprouted Ragi Kanji & Idli', 280, 9, 400, 'from-amber-500 to-orange-400') },
                    { slot: '🌞 Lunch', ...getSlotData(['lunch', 'afternoon', 'rice', 'kootu', 'sambar', 'thali', 'dal'], 'Brown Rice, Moong Dal & Kootu', 520, 18, 600, 'from-emerald-500 to-teal-400') },
                    { slot: '☕ Snacks', ...getSlotData(['snack', 'tea', 'coffee', 'evening', 'sundal', 'makhana', 'coconut'], 'Steamed Moong Sundal & Tea', 160, 7, 250, 'from-cyan-500 to-blue-400') },
                    { slot: '🌙 Dinner', ...getSlotData(['dinner', 'night', 'khichdi', 'milk', 'soup', 'roti', 'puttu'], 'Millet Khichdi & Steamed Veg', 380, 12, 500, 'from-purple-500 to-indigo-400') },
                  ];

                  return slots.map((slot, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-white">{slot.slot}</span>
                        <span className="font-bold text-slate-400">{slot.calories} kcal</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${slot.color} transition-all duration-700`}
                            style={{ width: `${Math.min(100, (slot.calories / slot.maxCal) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>Protein: <strong className="text-white">{slot.protein}g</strong></span>
                          <span>Carbs: <strong className="text-slate-300">{slot.carbs}g</strong></span>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] font-bold text-slate-400 truncate flex items-center gap-1">
                        <span>🍲 {slot.name}</span>
                        {slot.isLogged && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-black">Logged ✓</span>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* 2. 7-Day Multi-Metric Clinical Heatmap Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" /> 7-Day Clinical Health & Nutrition Heatmap
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Color intensity corresponds to target compliance percentage</p>
                </div>
                <span className="text-xs font-bold text-slate-400">Past 7 Days (Mon - Sun)</span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[500px] space-y-2">
                  {/* Heatmap Day Column Headers */}
                  <div className="grid grid-cols-8 gap-2 text-center text-xs font-black text-slate-400 pb-1">
                    <span className="text-left text-slate-500 font-bold">Biomarker Metric</span>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <span key={d} className="truncate text-slate-300">{d.slice(0, 3)}</span>
                    ))}
                  </div>

                  {/* Heatmap Rows */}
                  {[
                    { label: '💧 Water Target (4.0L)', scores: [3.5, 4.0, 4.25, 3.75, 4.5, 4.0, 4.5], unit: 'L' },
                    { label: '🔥 Daily Calories (1600 kcal)', scores: [1550, 1620, 1580, 1640, 1700, 1590, 1650], unit: 'kcal' },
                    { label: '🥩 Daily Protein (60g)', scores: [58, 62, 60, 65, 59, 64, 63], unit: 'g' },
                    { label: '🦴 Daily Calcium (1200mg)', scores: [1150, 1250, 1200, 1300, 1180, 1220, 1280], unit: 'mg' },
                    { label: '🚶 Step Count (4000 steps)', scores: [3200, 4100, 3800, 4500, 3900, 4200, 4600], unit: 'steps' },
                    { label: '🌙 Restful Sleep (7.5 hrs)', scores: [7.5, 8.0, 7.0, 7.5, 8.0, 7.5, 8.0], unit: 'hrs' },
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-8 gap-2 items-center">
                      <span className="text-xs font-extrabold text-slate-300 truncate" title={row.label}>
                        {row.label}
                      </span>
                      {row.scores.map((val, dIdx) => {
                        const isHigh = rIdx === 0 ? val >= 4.0 : rIdx === 1 ? val >= 1600 : rIdx === 2 ? val >= 60 : rIdx === 3 ? val >= 1200 : rIdx === 4 ? val >= 4000 : val >= 7.5;
                        return (
                          <div
                            key={dIdx}
                            className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all hover:scale-105 cursor-pointer ${
                              isHigh
                                ? 'bg-gradient-to-t from-emerald-600 to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                                : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            <span>{rIdx === 0 ? `${val}L` : rIdx === 5 ? `${val}h` : val > 999 ? `${(val/1000).toFixed(1)}k` : val}</span>
                            <span className="text-[8px] font-bold opacity-80">{isHigh ? '100%+' : '85%'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Hydration vs Movement Rhythm Comparative Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" /> Weekly Hydration & Physical Activity Rhythm
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dual-factor analysis showing daily fluid intake (L) vs walking activity (minutes)</p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-2">
                {[
                  { day: 'Mon', water: 3.5, walk: 30 },
                  { day: 'Tue', water: 4.0, walk: 45 },
                  { day: 'Wed', water: 4.25, walk: 40 },
                  { day: 'Thu', water: 3.75, walk: 50 },
                  { day: 'Fri', water: 4.5, walk: 40 },
                  { day: 'Sat', water: 4.0, walk: 45 },
                  { day: 'Sun', water: 4.5, walk: 50 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{item.day}</span>
                    <div className="flex items-end gap-1.5 h-24 w-full justify-center">
                      {/* Water Bar */}
                      <div
                        className="w-4 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg transition-all"
                        style={{ height: `${(item.water / 5.0) * 100}%` }}
                        title={`Water: ${item.water}L`}
                      />
                      {/* Walk Bar */}
                      <div
                        className="w-4 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all"
                        style={{ height: `${(item.walk / 60) * 100}%` }}
                        title={`Walk: ${item.walk} mins`}
                      />
                    </div>
                    <div className="text-[10px] text-center font-extrabold text-slate-300">
                      <span className="text-cyan-400">{item.water}L</span> • <span className="text-emerald-400">{item.walk}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DOCTOR HEALTH REPORT ── */}
        {activeTab === 'digest' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" /> Comprehensive Clinical Digest Report
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">Generated for Doctor Review • {selectedElder?.name}</p>
                </div>
                <button
                  onClick={handlePrintReport}
                  className="px-3.5 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-400 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" /> Export Report (PDF)
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">1. Senior Patient Profile & Vitals</h4>
                  <p>Name: <strong>{selectedElder?.name || 'Senior'}</strong> • Age: <strong>{selectedElder?.age || 68} Yrs</strong> • Height: <strong>{selectedElder?.heightCm || 169} cm</strong> • Weight: <strong>{selectedElder?.weightKg || 64} kg</strong></p>
                  <p>Active Conditions: <strong>{(selectedElder?.conditions || ['Diabetes', 'Digestion']).join(', ')}</strong></p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-cyan-400 uppercase tracking-wider text-[11px]">2. Hydration & Activity Summary</h4>
                  <p>Daily Water Intake: <strong>{selectedElder?.waterGlasses ? `${selectedElder.waterGlasses}/8 Glasses` : 'Not Logged Today'}</strong> • Night Rest: <strong>{selectedElder?.sleepHours ? `${selectedElder.sleepHours} Hours` : 'Not Logged Yet'}</strong> • Daily Steps: <strong>{selectedElder?.steps ? `${selectedElder.steps} Steps` : '0 Steps'}</strong></p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">3. Clinical Recommendations</h4>
                  <p>• Continue ICMR soft protein diet (Ragi Kanji, Moong Dal Khichdi).</p>
                  <p>• Maintain hydration above 6 glasses to support renal function and cognitive clarity.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: LINK SENIOR CODE ── */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-400" /> Link Senior Unique Code
              </h3>
              <button
                onClick={() => setLinkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkSeniorSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-300">Senior Unique Care Code:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELDER-4912"
                  value={newSeniorCode}
                  onChange={(e) => setNewSeniorCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-300">Senior Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter senior full name"
                  value={newSeniorName}
                  onChange={(e) => setNewSeniorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-extrabold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-300">Your Relationship:</label>
                <select
                  value={newSeniorRelation}
                  onChange={(e) => setNewSeniorRelation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-extrabold outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Son / Daughter">Son / Daughter</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Nurse / Caregiver">Nurse / Caregiver</option>
                  <option value="Family Member">Family Member</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
              >
                🔗 Verify Code & Link Senior Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT SENIOR PROFILE / UPLOAD HEALTH INFO ── */}
      {editingElder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" /> Edit Senior Health Info ({editingElder.name})
              </h3>
              <button
                onClick={() => setEditingElder(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveElderProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-300">Height (cm):</label>
                  <input
                    type="number"
                    value={editingElder.heightCm || 169}
                    onChange={(e) => setEditingElder({ ...editingElder, heightCm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-extrabold outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-300">Weight (kg):</label>
                  <input
                    type="number"
                    value={editingElder.weightKg || 64}
                    onChange={(e) => setEditingElder({ ...editingElder, weightKg: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-extrabold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-300">Medical Conditions:</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Diabetes', 'Digestion', 'Hypertension', 'Cardiac Health', 'Joint Pain'].map((cond) => {
                    const selected = (editingElder.conditions || []).includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleConditionInEdit(cond)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
              >
                💾 Save Health Info & Sync Senior Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Daily Clinical Vitals Modal (Voice & Text) */}
      <DailyVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        currentVitals={elderVitals}
        onVitalsSaved={(saved) => {
          setElderVitals(saved);
          setElderVitalsHistory(prev => [
            { ...saved, day: 'Today', isToday: true },
            ...prev.filter(p => !p.isToday)
          ]);
        }}
      />
    </div>
  );
}

