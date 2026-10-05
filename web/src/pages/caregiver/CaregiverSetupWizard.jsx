import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caregiverApi } from '../../services/api';
import { HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Bell, Phone, Link as LinkIcon, User, Heart } from 'lucide-react';

export default function CaregiverSetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Caregiver Form State
  const [caregiverData, setCaregiverData] = useState({
    seniorName: '',
    relationship: 'Son / Daughter',
    phone: '+91 98765 43210',
    elderCode: localStorage.getItem('elder_care_code') || '',
    notifications: {
      missedMeal: true,
      lowHydration: true,
      shortSleep: true,
      sosCall: true,
    },
  });

  const toggleAlert = (key) => {
    setCaregiverData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || 'caregiver@healthspan.in';

    const finalProfile = { ...caregiverData, caregiverEmail: userEmail, isCompleted: true };
    localStorage.setItem(`caregiver_profile_${userEmail}`, JSON.stringify(finalProfile));

    try {
      await caregiverApi.verifyCode({
        caregiver_email: userEmail,
        elder_name: caregiverData.seniorName || 'Senior',
        elder_code: caregiverData.elderCode || 'ELDER-0000',
        relationship: caregiverData.relationship || 'Son / Daughter',
        phone: caregiverData.phone,
      });
    } catch (err) {
      console.warn('Backend caregiver setup save notice:', err);
    } finally {
      setSaving(false);
      navigate('/caregiver/overview');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 font-['Outfit'] transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-slate-900/10 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-600/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Caregiver Setup</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Step {step} of 2 • Senior Identity & Relationship</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-6 h-2 rounded-full transition-all ${
                  s === step ? 'bg-emerald-600 dark:bg-emerald-400 w-8' : s < step ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── STEP 1: Senior Name & Caregiver Relationship ── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <User className="w-4 h-4" /> Who Are You Caring For?
            </div>

            {/* Senior Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Senior's Full Name / Alias
              </label>
              <div className="relative">
                <Heart className="absolute left-4 top-3.5 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <input
                  type="text"
                  required
                  value={caregiverData.seniorName}
                  onChange={(e) => setCaregiverData({ ...caregiverData, seniorName: e.target.value })}
                  placeholder="Enter senior's full name"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white font-bold outline-none"
                />
              </div>
            </div>

            {/* Relationship Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Relationship to {caregiverData.seniorName || 'Senior'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Son / Daughter',
                  'Spouse (Husband / Wife)',
                  'Sibling / Family Relative',
                  'Professional Home Nurse',
                  'Doctor / Specialist',
                  'Community Caregiver',
                ].map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setCaregiverData({ ...caregiverData, relationship: rel })}
                    className={`p-3 rounded-2xl text-xs font-extrabold border text-left transition-all cursor-pointer ${
                      caregiverData.relationship === rel
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Card Banner */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Link Established: {caregiverData.relationship} to {caregiverData.seniorName}</span>
            </div>

            {/* Caregiver Mobile / WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Emergency Phone & WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={caregiverData.phone}
                  onChange={(e) => setCaregiverData({ ...caregiverData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Senior Linking & Notification Preferences ── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
              <LinkIcon className="w-4 h-4" /> Link Senior & Alert Settings
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {caregiverData.seniorName}'s Unique App Code / Mobile Number
              </label>
              <input
                type="text"
                value={caregiverData.elderCode}
                onChange={(e) => setCaregiverData({ ...caregiverData, elderCode: e.target.value })}
                placeholder="Enter senior care code or phone number"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Real-Time Alert Notification Preferences for {caregiverData.seniorName}
              </label>

              <div className="space-y-2">
                {[
                  { key: 'missedMeal', label: 'Missed Meal Warning (Notify if lunch isn\'t logged by 2:30 PM)' },
                  { key: 'lowHydration', label: 'Low Hydration Alert (Notify if water intake < 3 glasses)' },
                  { key: 'shortSleep', label: 'Short Sleep Warning (Notify if night rest is < 6 hours)' },
                  { key: 'sosCall', label: 'Emergency SOS Calls (Instant dispatch on SOS button tap)' },
                ].map((item) => {
                  const active = caregiverData.notifications[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleAlert(item.key)}
                      className={`w-full p-3 rounded-2xl text-xs font-extrabold border text-left flex items-center justify-between cursor-pointer transition-all ${
                        active
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span className="pr-2">{item.label}</span>
                      {active && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer hover:scale-[1.02] transition-all"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? 'Linking Senior...' : 'Complete Setup & Link Senior'} <ShieldCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
