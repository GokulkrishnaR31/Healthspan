import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, ShieldCheck } from 'lucide-react';
import { LargeButton } from '../../components/ElderUI';

export default function ElderOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F6F1] via-white to-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto font-['Outfit'] text-center space-y-4">
      {/* Quick Portal Switcher Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center justify-around text-xs font-extrabold w-full">
        <button
          onClick={() => navigate('/elder/onboarding')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D9E75] text-white shadow-xs"
        >
          <span>👵 Elder App</span>
        </button>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-[#E8F6F1] hover:text-[#128C7E] transition-colors"
        >
          <span>🟢 Caregiver</span>
        </button>

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-purple-100 hover:text-[#7F77DD] transition-colors"
        >
          <span>🟣 Admin</span>
        </button>
      </div>

      {/* Top Header / Logo */}
      <div className="pt-4 space-y-4">
        <div className="mx-auto w-24 h-24 bg-[#1D9E75] text-white rounded-3xl flex items-center justify-center shadow-xl shadow-[#1D9E75]/30">
          <HeartPulse className="w-14 h-14" />
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">HealthSpan</h1>
          <p className="text-[19px] font-bold text-[#147556] mt-2 leading-snug px-4">
            Your personalised nutrition guide for healthy ageing in India
          </p>
        </div>
      </div>

      {/* Hero Illustration Card */}
      <div className="bg-white border-3 border-emerald-100 rounded-3xl p-6 shadow-sm my-4 space-y-3">
        <span className="text-4xl">👵 🌾 🥗 🩺</span>
        <h2 className="text-[20px] font-extrabold text-slate-800">Tailored Indian Senior Nutrition</h2>
        <p className="text-slate-600 text-[16px] font-medium">
          Designed specifically for senior dietary needs, regional recipes, and traditional fasting routines.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-4">
        <LargeButton onClick={() => navigate('/elder/setup')} icon={ArrowRight}>
          Get Started (Setup Profile)
        </LargeButton>

        <LargeButton onClick={() => navigate('/login')} variant="secondary">
          Login with Email & Password
        </LargeButton>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold pt-2">
          <ShieldCheck className="w-4 h-4 text-[#1D9E75]" />
          <span>Your health data is private and secure under ICMR standards.</span>
        </div>
      </div>
    </div>
  );
}
