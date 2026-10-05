import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { profileApi } from '../../services/api';
import {
  User, Phone, Lock, Heart, Shield, Sparkles, CheckCircle2,
  Save, KeyRound, AlertCircle, Eye, EyeOff, Scale, Ruler,
  Calendar, Check, ArrowLeft, HeartPulse, Stethoscope, Utensils,
  Layers, Smile, PhoneCall, QrCode, RefreshCw
} from 'lucide-react';

const CONDITIONS_LIST = [
  'Diabetes',
  'Hypertension',
  'Cardiac Health',
  'Digestion / GERD',
  'Arthritis / Joint Pain',
  'Thyroid',
  'High Cholesterol',
  'Kidney Care'
];

const CHEWABILITY_OPTIONS = [
  { id: 'Soft Meals', label: 'Soft Meals (Easy to chew)', desc: 'Idli, Khichdi, Steamed Puttu, Upma' },
  { id: 'Pureed Diet', label: 'Pureed / Mashed', desc: 'Soups, Porridges, Mashed Dal' },
  { id: 'Regular Diet', label: 'Normal / Regular', desc: 'Standard chapatis, crunchy vegetables' }
];

const CUISINES = [
  'Pan-Indian Balanced',
  'South Indian Traditional',
  'North Indian Home Style',
  'Gujarati / Rajasthani',
  'Bengali / Eastern',
  'Maharashtrian'
];

const DIET_TYPES = ['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Jain'];
const FASTING_ROUTINES = ['None', 'Ekadashi (Twice monthly)', 'Pradosham', 'Navratri', 'Intermittent Fasting'];

export default function ElderProfilePage() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : ''),
    phone: user?.phone || '',
    pin: user?.pin || '',
    careCode: user?.care_code || '',
    age: 65,
    gender: 'Female',
    heightCm: 160,
    weightKg: 60,
    conditions: ['Diabetes', 'Digestion'],
    chewability: 'Soft Meals',
    regionalCuisine: 'Pan-Indian Balanced',
    dietType: 'Vegetarian',
    fastingRoutine: 'None',
    caregiverName: '',
    caregiverPhone: ''
  });

  // Load existing profile from backend + localStorage on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const userEmail = (user?.email || '').toLowerCase();
        const activeName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
        const activePhone = user?.phone || '';
        const activePin = user?.pin || '';
        const activeCareCode = user?.care_code || '';

        // 1. Check user-specific localStorage first
        const userKey = userEmail || activePhone || user?.id;
        const saved = userKey ? localStorage.getItem(`elder_profile_${userKey}`) : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            name: activeName || parsed.name || prev.name,
            phone: activePhone || parsed.phone || prev.phone,
            pin: activePin || parsed.pin || prev.pin,
            careCode: activeCareCode || parsed.careCode || parsed.care_code || prev.careCode,
            conditions: parsed.conditions || prev.conditions,
          }));
        } else {
          // Initialize fresh data for current user
          setFormData((prev) => ({
            ...prev,
            name: activeName || prev.name,
            phone: activePhone || prev.phone,
            pin: activePin || prev.pin,
            careCode: activeCareCode || prev.careCode,
          }));
        }

        // 2. Fetch authenticated profile from backend / MongoDB Atlas
        const res = await api.get('/api/elder/profile', {
          params: { email: userEmail, phone: activePhone, name: activeName }
        });

        if (res?.data) {
          const d = res.data;
          // Guard: Only apply backend name if it matches current user or if current user has no name
          const resolvedName = activeName || d.name || 'Senior User';
          setFormData((prev) => ({
            ...prev,
            name: resolvedName,
            phone: activePhone || d.phone || prev.phone,
            pin: activePin || d.pin || prev.pin,
            careCode: activeCareCode || d.care_code || prev.careCode,
            age: d.age || prev.age,
            gender: d.gender || prev.gender,
            heightCm: d.height_cm || prev.heightCm,
            weightKg: d.weight_kg || prev.weightKg,
            conditions: d.conditions || prev.conditions,
            chewability: d.chewability || prev.chewability,
            regionalCuisine: d.regional_cuisine || prev.regionalCuisine,
            dietType: d.diet_type || prev.dietType,
            fastingRoutine: d.fasting_routine || prev.fastingRoutine,
          }));
        }
      } catch (err) {
        console.warn('Profile fetch notice:', err);
      }
    }
    loadProfile();
  }, [user]);

  // Compute BMI
  const heightInMeters = Number(formData.heightCm) / 100;
  const bmi = heightInMeters > 0 ? (Number(formData.weightKg) / (heightInMeters * heightInMeters)).toFixed(1) : 22.4;
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 24.9 ? 'Normal Healthy' : bmi < 29.9 ? 'Overweight' : 'High BMI';

  const toggleCondition = (cond) => {
    setFormData((prev) => {
      const exists = prev.conditions.includes(cond);
      return {
        ...prev,
        conditions: exists ? prev.conditions.filter((c) => c !== cond) : [...prev.conditions, cond]
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (formData.pin.length !== 4) {
      alert('PIN must be exactly 4 digits');
      return;
    }

    setSaving(true);
    setSuccessMsg('');

    try {
      const updatedProfile = {
        ...formData,
        height_cm: Number(formData.heightCm),
        weight_kg: Number(formData.weightKg),
        age: Number(formData.age),
        is_completed: true,
        updated_at: new Date().toISOString()
      };

      // 1. Save in localStorage
      const userEmail = (user?.email || '').toLowerCase();
      if (userEmail) {
        localStorage.setItem(`elder_profile_${userEmail}`, JSON.stringify(updatedProfile));
      }
      localStorage.setItem('elder_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('caregiver_phone', formData.caregiverPhone);

      // 2. Update user session and hs_registered_users
      const registeredUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
      const updatedUsers = registeredUsers.map((u) => {
        if (u.email === user?.email || (u.phone && u.phone.replace(/\s+/g, '') === formData.phone.replace(/\s+/g, ''))) {
          return {
            ...u,
            name: formData.name,
            phone: formData.phone,
            pin: formData.pin
          };
        }
        return u;
      });
      localStorage.setItem('hs_registered_users', JSON.stringify(updatedUsers));

      const updatedUserObj = {
        ...(user || {}),
        first_name: formData.name.split(' ')[0],
        last_name: formData.name.split(' ').slice(1).join(' '),
        name: formData.name,
        phone: formData.phone,
        pin: formData.pin
      };
      localStorage.setItem('user', JSON.stringify(updatedUserObj));
      if (setUser) setUser(updatedUserObj);

      // 3. Sync to MongoDB Atlas backend
      await profileApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        pin: formData.pin,
        age: Number(formData.age),
        gender: formData.gender,
        height_cm: Number(formData.heightCm),
        weight_kg: Number(formData.weightKg),
        conditions: formData.conditions,
        chewability: formData.chewability,
        regional_cuisine: formData.regionalCuisine,
        diet_type: formData.dietType,
        fasting_routine: formData.fastingRoutine,
        care_code: formData.careCode
      });

      // 4. Dispatch sync event
      window.dispatchEvent(new Event('healthspan:sync'));
      setSuccessMsg('Profile and 4-digit PIN updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.warn('Profile save notice:', err);
      setSuccessMsg('Profile updated locally!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12 font-['Outfit']">
        
        {/* ── Top Header Banner ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-premium p-6 sm:p-7 rounded-3xl border shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/elder/dashboard')}
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-500/25">
                {formData.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white" title="Active Senior">
                <Check className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{formData.name}</h1>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Senior Profile
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Care Code: <strong className="text-indigo-600 dark:text-indigo-400">{formData.careCode}</strong> • Phone: <strong className="text-slate-700 dark:text-slate-200">{formData.phone}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 font-bold text-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── CARD 1: Personal & Login Credentials ── */}
          <div className="glass-card-premium p-6 sm:p-7 rounded-3xl border shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">1. Personal Details & Login Credentials</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update any name or phone mistakes and set your permanent 4-digit PIN</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Senior Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="e.g. Deepan Kumar"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mobile Number (For Login & Alerts)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="e.g. 7604948580"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* 4-Digit Senior PIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    4-Digit Senior PIN (Fixed / Stable)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    No OTP Needed
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-black tracking-widest text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="1234"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Use this 4-digit code to sign into HealthSpan anytime.</p>
              </div>

              {/* Care Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Unique Care Code (For Caregiver Linking)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = `ELDER-${Math.floor(1000 + Math.random() * 9000)}`;
                      setFormData(prev => ({ ...prev, careCode: newCode }));
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Generate New
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.careCode}
                    onChange={(e) => setFormData({ ...formData, careCode: e.target.value.toUpperCase() })}
                    className="w-full bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl py-3 px-4 text-sm font-black text-indigo-700 dark:text-indigo-300 outline-none uppercase tracking-wider"
                    placeholder="e.g. ELDER-2380"
                  />
                  <QrCode className="w-4 h-4 text-indigo-500 absolute right-3.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Age, Gender, Height, Weight Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* BMI Status Pill */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-500" />
                Computed BMI: <strong>{bmi} kg/m²</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black">
                {bmiCategory}
              </span>
            </div>
          </div>

          {/* ── CARD 2: Health Conditions & Dietary Profile ── */}
          <div className="glass-card-premium p-6 sm:p-7 rounded-3xl border shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">2. Medical Conditions & Dietary Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Clinical Engine tailors ICMR meals & safety rules based on these selections</p>
              </div>
            </div>

            {/* Active Medical Conditions Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Senior Conditions (Tap to Toggle):
              </label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS_LIST.map((cond) => {
                  const isSelected = formData.conditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400 shadow-sm shadow-emerald-600/20'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chewability Grade */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Chewability & Dental Texture Grade:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CHEWABILITY_OPTIONS.map((opt) => {
                  const isSelected = formData.chewability === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setFormData({ ...formData, chewability: opt.id })}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-400/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-900 dark:text-white">{opt.label}</span>
                      <span className="text-[11px] text-slate-400 font-medium mt-1">{opt.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regional Cuisine & Diet Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Regional Cuisine
                </label>
                <select
                  value={formData.regionalCuisine}
                  onChange={(e) => setFormData({ ...formData, regionalCuisine: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-3.5 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {CUISINES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Diet Type
                </label>
                <select
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-3.5 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {DIET_TYPES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Fasting Routine
                </label>
                <select
                  value={formData.fastingRoutine}
                  onChange={(e) => setFormData({ ...formData, fastingRoutine: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-3.5 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {FASTING_ROUTINES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── CARD 3: Caregiver & Emergency Contacts ── */}
          <div className="glass-card-premium p-6 sm:p-7 rounded-3xl border shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">3. Caregiver & Emergency Contact</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Who should receive missed meal notifications and emergency SOS alerts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Caregiver Contact Name & Relation
                </label>
                <input
                  type="text"
                  value={formData.caregiverName}
                  onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white"
                  placeholder="e.g. Priya (Daughter)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Caregiver Phone (For Real-Time SMS/Push)
                </label>
                <input
                  type="tel"
                  value={formData.caregiverPhone}
                  onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* ── Save Action Button ── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/elder/dashboard')}
              className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </MobileLayout>
  );
}
