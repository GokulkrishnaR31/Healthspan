import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Share2, Send, Download, CheckCircle, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';

export default function CaregiverWeeklyDigest() {
  const { user } = useAuth();
  const [elderName, setElderName] = useState('Lakshmi Ammal');

  useEffect(() => {
    const savedSetup = JSON.parse(localStorage.getItem('elder_health_setup') || '{}');
    const name = savedSetup.fullName || (user ? `${user.first_name} ${user.last_name}` : 'Lakshmi Ammal');
    setElderName(name);
  }, [user]);

  const whatsappText = encodeURIComponent(
    `🌿 HealthSpan Weekly Nutrition Digest for ${elderName}:\n\n` +
    "• Health Score: 82/100 (+4 pts improvement!)\n" +
    "• Days Logged: 6/7 days\n" +
    "• Calcium: 65% (Add ragi porridge for dinner)\n" +
    "• Vitamin D: 85%\n" +
    "• Missed Meals: 1 missed breakfast on Tuesday\n\n" +
    "Generated via HealthSpan Personalized Nutrition System."
  );

  return (
    <div className="space-y-6 font-['Outfit'] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#128C7E] uppercase tracking-wider">Weekly Report for {elderName}</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Caregiver Digest</h1>
          <p className="text-sm text-slate-500">Week of July 26 – August 1, 2026</p>
        </div>

        {/* Share & Download Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
          >
            <MessageCircle className="w-4 h-4" /> Send WhatsApp
          </a>

          <a
            href={`sms:?body=HealthSpan Digest for ${elderName}: Score 82/100.`}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" /> Send SMS
          </a>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main Digest Summary Card */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Score & Days Logged Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-6">
          <div className="bg-slate-50 p-4 rounded-2xl text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Health Score</span>
            <p className="text-3xl font-extrabold text-[#128C7E]">82 / 100</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">+4 pts vs last week</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Days Logged</span>
            <p className="text-3xl font-extrabold text-slate-800">6 / 7 Days</p>
            <span className="text-xs font-bold text-slate-500">High Compliance</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Missed Meals</span>
            <p className="text-3xl font-extrabold text-amber-600">1 Meal</p>
            <span className="text-xs font-bold text-amber-700">Tuesday Breakfast</span>
          </div>
        </div>

        {/* Nutrient Summary */}
        <div className="space-y-3">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#25D366]" /> Weekly Nutrient Gap Summary for {elderName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-[#E8F6F1] rounded-2xl border border-emerald-200">
              <span className="font-bold text-[#147556]">Calcium: 65% (Low)</span>
              <p className="text-xs text-slate-600 mt-0.5">Average intake 650mg vs 1000mg ICMR target.</p>
            </div>
            <div className="p-3 bg-[#E8F6F1] rounded-2xl border border-emerald-200">
              <span className="font-bold text-[#147556]">Vitamin D: 85% (Good)</span>
              <p className="text-xs text-slate-600 mt-0.5">Optimal morning sunlight exposure recorded.</p>
            </div>
          </div>
        </div>

        {/* Auto-Generated Caregiver Plain Language Tips */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 space-y-2">
          <h3 className="text-base font-extrabold text-[#147556] flex items-center gap-2">
            💡 Auto-Generated Caregiver Tips for {elderName}
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-700 font-medium list-disc list-inside">
            <li>Ensure {elderName} eats ragi porridge or curd with dinner to boost calcium.</li>
            <li>Encourage 1 glass of warm milk at bedtime for sleep and bone strength.</li>
            <li>Monitor Tuesday breakfasts — setting a 8:00 AM reminder helps avoid missed meals.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
