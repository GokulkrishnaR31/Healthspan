import React, { useState, useEffect } from 'react';
import MobileLayout from '../../components/MobileLayout';
import VoiceMealModal from '../../components/VoiceMealModal';
import { profileApi } from '../../services/api';
import { Users, PhoneCall, UserCheck, AlertTriangle, Share2, Copy, Check, QrCode } from 'lucide-react';

export default function ElderCareTeamPage() {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic Elder Unique Senior Care Code
  const [elderCareCode, setElderCareCode] = useState(() => {
    return localStorage.getItem('elder_care_code') || (`ELDER-${Math.floor(1000 + Math.random() * 9000)}`);
  });

  useEffect(() => {
    async function fetchCode() {
      try {
        const res = await profileApi.getCareCode();
        if (res?.data?.care_code) {
          setElderCareCode(res.data.care_code);
          localStorage.setItem('elder_care_code', res.data.care_code);
        }
      } catch (e) {
        console.warn('Care code fetch notice:', e);
      }
    }
    fetchCode();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(elderCareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const caregiverName = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('caregiver_profile') || '{}');
      if (saved && saved.name) return saved.name;
    } catch (e) {}
    return 'Priya Verma';
  })();

  const careTeam = [
    { name: caregiverName, role: 'Primary Caregiver (Daughter)', phone: '+91 98765 43210', status: 'Active Online' },
    { name: 'Dr. A. K. Sharma', role: 'Senior Geriatric Specialist', phone: '+91 98123 45678', status: 'On Call' },
  ];

  return (
    <MobileLayout onOpenVoiceLog={() => setIsVoiceModalOpen(true)}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-900/5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">My Care Team</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Family caregivers & healthcare specialists linked to your health account</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* ── MY UNIQUE SENIOR CARE LINK CODE CARD ── */}
        <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-white dark:via-slate-900 to-emerald-500/10 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Senior Care Linking Code</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Share this code with your children or caregiver to link accounts</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unique Senior ID</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">{elderCareCode}</p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Team List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-900/5 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Connected Caregivers ({careTeam.length})
          </h2>

          <div className="space-y-3">
            {careTeam.map((member, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">{member.name}</span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {member.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{member.role}</p>
                </div>

                <a
                  href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <PhoneCall className="w-4 h-4" /> Call
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency SOS Drawer Info */}
        <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-sm font-extrabold">
            <AlertTriangle className="w-5 h-5" /> Emergency Support 24/7
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
            In case of emergency, tap the red SOS button in the top navigation bar or dial 108 immediately.
          </p>
        </div>
      </div>

      <VoiceMealModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </MobileLayout>
  );
}
