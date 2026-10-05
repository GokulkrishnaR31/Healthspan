import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse, LayoutDashboard, Users, UtensilsCrossed, Sliders,
  FileText, Mic, LogOut, ShieldCheck
} from 'lucide-react';

const adminNavItems = [
  { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/food-db', label: 'Food Database', icon: UtensilsCrossed },
  { to: '/admin/formula', label: 'Formula Editor', icon: Sliders },
  { to: '/admin/research', label: 'Research Data', icon: FileText },
  { to: '/admin/nlp', label: 'NLP Monitor', icon: Mic },
];

export default function AdminPortalLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Project Researcher';

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit']">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#7F77DD] text-white p-2 rounded-xl">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">HealthSpan Admin</h1>
              <p className="text-xs text-[#7F77DD] font-bold">
                Logged in as: <span className="text-white">{adminName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-purple-200 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7F77DD]" /> Admin Verified
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 px-3 py-1.5 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Sub-Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto">
          {adminNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-100 text-[#7F77DD]'
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
