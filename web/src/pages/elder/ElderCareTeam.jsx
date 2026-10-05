import React from 'react';
import { Users, Phone, MessageCircle, Heart, ShieldCheck, CheckCircle2, UserPlus, PhoneCall } from 'lucide-react';
import { LargeButton } from '../../components/ElderUI';

const CARE_TEAM_MEMBERS = [
  {
    name: 'Ramesh Kumar',
    relationship: 'Son & Primary Caregiver',
    phone: '+91 98765 43210',
    initials: 'RK',
    status: 'Primary Contact • Auto-Linked',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Dr. Ananya Sharma',
    relationship: 'Family Physician & Geriatrician',
    phone: '+91 98123 45678',
    initials: 'AS',
    status: 'Medical Advisor',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
];

export default function ElderCareTeam() {
  const caregiverName = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('caregiver_profile') || '{}');
      if (saved && saved.name) return saved.name;
    } catch (e) {}
    return 'Priya Verma';
  })();

  const careTeamMembers = [
    {
      name: caregiverName,
      relationship: 'Primary Caregiver',
      phone: '+91 98765 43210',
      initials: caregiverName.split(' ').map((p) => p[0]).join('') || 'CG',
      status: 'Primary Contact • Auto-Linked',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Dr. Ananya Sharma',
      relationship: 'Family Physician & Geriatrician',
      phone: '+91 98123 45678',
      initials: 'AS',
      status: 'Medical Advisor',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="space-y-6 font-['Outfit'] max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Elder Support Network</span>
        <h1 className="text-2xl font-bold text-slate-900">Your Care Team</h1>
        <p className="text-[15px] text-slate-500 font-medium">Family members and healthcare professionals linked to your profile.</p>
      </div>

      {/* Caregiver Members Cards */}
      <div className="space-y-4">
        {careTeamMembers.map((member) => (
          <div key={member.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-sm shrink-0">
                {member.initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${member.badgeBg}`}>
                    {member.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600">{member.relationship}</p>
                <p className="text-xs font-medium text-slate-400">{member.phone}</p>
              </div>
            </div>

            {/* Quick Action Call & WhatsApp Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4" /> Call
              </a>

              <a
                href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Sharing Permissions Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800">Caregiver Oversight Active</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">Weekly digests and missed meal alerts are shared automatically with {caregiverName}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
