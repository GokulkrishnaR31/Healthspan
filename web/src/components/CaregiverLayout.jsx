import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse, LayoutDashboard, Users, UserPlus, Activity,
  Utensils, FileText, Bell, PhoneCall, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Shield
} from 'lucide-react';

const navItems = [
  { to: '/caregiver', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/caregiver/elderly', label: 'Elderly List', icon: Users },
  { to: '/caregiver/elderly/add', label: 'Add Elderly', icon: UserPlus },
  { to: '/caregiver/health-monitoring', label: 'Health Monitoring', icon: Activity },
  { to: '/caregiver/meal-monitoring', label: 'Meal Monitoring', icon: Utensils },
  { to: '/caregiver/reports', label: 'Reports', icon: FileText },
  { to: '/caregiver/emergency-contacts', label: 'Emergency Contacts', icon: PhoneCall },
  { to: '/caregiver/notifications', label: 'Notifications', icon: Bell },
];

const CaregiverLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getPageTitle = () => {
    const sorted = [...navItems].sort((a, b) => b.to.length - a.to.length);
    const match = sorted.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to));
    return match?.label || 'Caregiver Dashboard';
  };

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'CG';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-emerald-900/30 shrink-0">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/30 shrink-0">
          <HeartPulse className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">HealthSpan</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-widest">Caregiver</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-emerald-900/30 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-emerald-400 capitalize truncate">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout"
              className="shrink-0 text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar – desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 border-r border-emerald-900/20 shrink-0 transition-all duration-200 z-20 relative ${
          collapsed ? 'w-[60px]' : 'w-60'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 z-30 bg-slate-800 border border-slate-700 rounded-full p-1 shadow-sm hover:shadow-md transition-all"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-400" /> : <ChevronLeft className="w-3 h-3 text-slate-400" />}
        </button>
      </aside>

      {/* Sidebar – mobile */}
      <aside className={`fixed inset-y-0 left-0 w-60 bg-slate-900 flex flex-col z-40 lg:hidden transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">{getPageTitle()}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-sm">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-semibold">Caregiver</span>
            </div>
            <button onClick={handleLogout} className="lg:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CaregiverLayout;
