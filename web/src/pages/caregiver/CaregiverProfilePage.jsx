import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { caregiverApi } from '../../services/api';
import {
  Shield, User, Phone, Mail, Bell, Heart, CheckCircle2,
  Save, ArrowLeft, RefreshCw, AlertTriangle, Users, QrCode,
  Lock, Check, Plus, Edit3, Smartphone, FileText, Activity
} from 'lucide-react';

export default function CaregiverProfilePage() {
  const { user, setUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || user?.first_name || 'Priya Verma',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'priya.verma@healthspan.in',
    relationship: 'Daughter',
    alertPhone: '+91 98765 43210',
    enableMissedMealAlerts: true,
    enableFastFoodAlerts: true,
    enableVitalsAlerts: true,
    enableWeeklyDigest: true
  });

  // Load profile data on mount
  useEffect(() => {
    const saved = localStorage.getItem('caregiver_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          name: parsed.name || prev.name,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
        }));
      } catch (e) { }
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter your full name');
      return;
    }

    setSaving(true);
    setSuccessMsg('');

    try {
      // 1. Save locally in caregiver_profile
      const updatedProfile = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('caregiver_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('caregiver_phone', formData.phone);

      // 2. Update registered users directory
      const registeredUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
      const updatedUsers = registeredUsers.map((u) => {
        if (u.email === user?.email || u.phone === user?.phone) {
          return {
            ...u,
            name: formData.name,
            phone: formData.phone,
            email: formData.email
          };
        }
        return u;
      });
      localStorage.setItem('hs_registered_users', JSON.stringify(updatedUsers));

      // 3. Update active user session
      const updatedUserObj = {
        ...(user || {}),
        first_name: formData.name.split(' ')[0],
        last_name: formData.name.split(' ').slice(1).join(' '),
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUserObj));
      if (setUser) setUser(updatedUserObj);

      window.dispatchEvent(new Event('healthspan:sync'));
      setSuccessMsg('Caregiver profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.warn('Caregiver profile save notice:', err);
      setSuccessMsg('Caregiver profile saved locally!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen font-['Outfit'] antialiased p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        {/* ── Top Header Banner ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/caregiver/overview')}
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/25">
                {formData.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white" title="Verified Caregiver">
                <Check className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{formData.name}</h1>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Caregiver Profile
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Relationship: <strong className="text-indigo-600 dark:text-indigo-400">{formData.relationship}</strong> • Phone: <strong className="text-slate-700 dark:text-slate-200">{formData.phone}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
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

          {/* ── CARD 1: Caregiver Contact & Account Info ── */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">1. Caregiver Personal & Contact Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your name, phone number, and relationship to your seniors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Caregiver Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="e.g. Priya Verma"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="+91 98765 43210"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                    placeholder="priya.verma@healthspan.in"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {/* Relationship to Senior */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Relationship to Senior
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Doctor / Physician">Doctor / Physician</option>
                  <option value="Nurse / Clinical Caretaker">Nurse / Clinical Caretaker</option>
                  <option value="Family Relative">Family Relative</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Alert & Notification Preferences ── */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">2. Real-Time Alert & Notification Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure what senior health events trigger automated alerts</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'enableMissedMealAlerts',
                  title: 'Missed Mandatory Meal Alerts',
                  desc: 'Notify if senior misses Breakfast (>12 PM), Lunch (>3 PM), or Dinner (>10 PM)',
                  icon: AlertTriangle,
                  color: 'text-rose-500'
                },
                {
                  id: 'enableFastFoodAlerts',
                  title: 'Ultra-Processed & Fast Food Alerts',
                  desc: 'Instant warning if senior consumes high-sodium or deep-fried foods',
                  icon: Heart,
                  color: 'text-amber-500'
                },
                {
                  id: 'enableVitalsAlerts',
                  title: 'Abnormal Blood Pressure & Sugar Alerts',
                  desc: 'Notify on Stage 2 HTN (BP ≥140/90) or Sugar Spikes (≥180 mg/dL)',
                  icon: Activity,
                  color: 'text-purple-500'
                },
                {
                  id: 'enableWeeklyDigest',
                  title: 'Weekly Clinical Health Digest PDF',
                  desc: 'Receive comprehensive 7-day nutritional gap and adherence report',
                  icon: FileText,
                  color: 'text-indigo-500'
                }
              ].map((item) => {
                const Icon = item.icon;
                const isChecked = formData[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => setFormData({ ...formData, [item.id]: !isChecked })}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Save Action Button ── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/caregiver/overview')}
              className="px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Profile...' : 'Save Caregiver Profile'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
