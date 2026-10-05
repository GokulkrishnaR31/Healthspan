import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse, LayoutDashboard, FileText, Activity, Utensils, Bell, LogOut, Phone, User
} from 'lucide-react';

const caregiverNavItems = [
  { to: '/caregiver/overview', label: 'Elder Overview', icon: LayoutDashboard },
  { to: '/caregiver/weekly-digest', label: 'Weekly Digest', icon: FileText },
  { to: '/caregiver/nutrient-history', label: 'Nutrient History', icon: Activity },
  { to: '/caregiver/meal-history', label: 'Meal History', icon: Utensils },
  { to: '/caregiver/alerts', label: 'Alerts', icon: Bell },
];

export default function CaregiverPortalLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const caregiverName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Primary Caregiver';

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit']">
      {/* Caregiver Sticky Navigation Header Container */}
      <div className="sticky top-0 z-40 shadow-sm">
        {/* Caregiver Top Header */}
        <header className="bg-slate-900 text-white px-6 py-4 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#25D366] text-white p-2 rounded-xl">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">HealthSpan</h1>
                <p className="text-xs text-slate-300 font-medium">
                  Caregiver Portal • Logged in as: <span className="text-[#25D366] font-bold">{caregiverName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Phone className="w-3.5 h-3.5 text-[#25D366]" /> Phone OTP Session
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Sub-Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto">
          {caregiverNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E8F6F1] text-[#128C7E]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
