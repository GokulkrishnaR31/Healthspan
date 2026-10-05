import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard, Utensils, Pill, Users, TrendingUp, LogOut,
  Bell, HelpCircle, X, Globe, HeartPulse, ChevronLeft, ChevronRight, Menu, Phone
} from 'lucide-react';

const navItems = [
  { to: '/elder/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/elder/voice-log', labelKey: 'nav.healthLog', icon: Utensils },
  { to: '/elder/nutrients', labelKey: 'nav.nutrients', icon: Pill },
  { to: '/elder/care-team', labelKey: 'nav.careTeam', icon: Users },
  { to: '/elder/progress', labelKey: 'nav.progress', icon: TrendingUp },
];

const ElderLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, langCode, setLangCode, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sosOpen, setSosOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/elder/onboarding');
  };

  const displayName = user ? `${user.first_name}`.trim() : 'Friend';
  const initials = displayName.slice(0, 2).toUpperCase();

  const getPageTitle = () => {
    const sorted = [...navItems].sort((a, b) => b.to.length - a.to.length);
    const match = sorted.find(n => location.pathname.startsWith(n.to));
    return match ? t(match.labelKey) : 'Dashboard';
  };

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
              <HeartPulse className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-widest">Elder Care</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ to, labelKey, icon: Icon }) => (
          <NavLink key={to} to={to}
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
                {!collapsed && <span className="truncate">{t(labelKey)}</span>}
                {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
              </>
            )}
          </NavLink>
        ))}

        {/* SOS Button in nav */}
        {!collapsed && (
          <button
            onClick={() => { setSosOpen(true); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group mt-1"
          >
            <HelpCircle className="w-[18px] h-[18px] shrink-0" />
            <span className="truncate">{t('nav.sos')}</span>
          </button>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-emerald-900/30 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-emerald-400 capitalize truncate">Elder</p>
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
    <div className="flex h-screen overflow-hidden bg-slate-100 relative">
      {/* ── Ambient Indian Elder Background Watermark (Subtle Reduced Opacity) ── */}
      <div 
        className="fixed inset-0 bg-cover bg-center md:bg-[center_right_10%] bg-no-repeat pointer-events-none transition-all duration-700 z-0 opacity-12"
        style={{
          backgroundImage: `url('/indian_elder_bg.jpg')`,
          filter: 'contrast(102%) brightness(96%)',
        }}
      />

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
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Elder badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-sm">
              <HeartPulse className="w-3.5 h-3.5" />
              <span className="font-semibold">Elder</span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium border border-slate-200 bg-white"
              >
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="uppercase text-xs hidden sm:inline">{langCode}</span>
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLangCode(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-slate-100 last:border-b-0 ${
                        langCode === l.code ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors hidden sm:block border border-slate-200">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            {/* Mobile logout */}
            <button onClick={handleLogout} className="lg:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all gap-1 ${
                  isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" />
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setSosOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-3 gap-1 text-rose-500 hover:bg-rose-50 rounded-xl"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] font-semibold">SOS</span>
          </button>
        </div>
      </nav>

      {/* SOS Modal */}
      {sosOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-5 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Emergency Help</h3>
                  <p className="text-sm text-slate-500 font-medium">Tap to call for immediate help</p>
                </div>
              </div>
              <button onClick={() => setSosOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <a href="tel:108"
                className="w-full min-h-[52px] text-white text-[16px] font-medium flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors">
                <Phone className="w-4 h-4" /> Call Ambulance (108)
              </a>
              <a href="tel:9876543210"
                className="w-full min-h-[52px] text-white text-[16px] font-medium flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
                <Phone className="w-4 h-4" /> Call My Caregiver
              </a>
            </div>

            <button onClick={() => setSosOpen(false)} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 text-center py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderLayout;
