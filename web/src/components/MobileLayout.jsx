import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePageTransition } from '../context/TransitionContext';
import ParticleBackground from './ParticleBackground';
import SmoothTabs from './SmoothTabs';
import {
  HeartPulse, Home, Utensils, Moon, Users, LogOut, Globe, PhoneCall, AlertTriangle, X, Mic, CheckCircle2, Save, Sun, Activity, Sparkles, Clock, Calendar, FileText, ChevronRight, User
} from 'lucide-react';

export const formatCustomDate = (date = new Date()) => {
  const d = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const m = monthNames[date.getMonth()];
  const y = date.getFullYear();
  return `${d}-${m}-${y}`; // e.g. 07-Sept-2026
};

export const formatLiveTime = (date = new Date()) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`; // e.g. 19:28:45
};

export default function MobileLayout({ children, onOpenVoiceLog }) {
  const { user, logout } = useAuth();
  const { t, langCode, setLangCode, languages } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { navigateWithTransition } = usePageTransition();
  const navigate = useNavigate();
  const location = useLocation();

  const [sosOpen, setSosOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live ticking clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Elder Profile Data
  const [profileData, setProfileData] = useState(() => {
    return JSON.parse(localStorage.getItem('elder_profile') || JSON.stringify({
      age: '68',
      gender: 'Female',
      heightCm: '169',
      weightKg: '64',
      activityLevel: 'Rest / Sedentary',
      conditions: ['Diabetes', 'Digestion', 'Cardiac Health'],
      chewability: 'Soft Meals',
      regionalCuisine: 'Pan-Indian Balanced',
      dietType: 'Vegetarian',
      fastingRoutine: 'Ekadashi',
    }));
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('elder_profile', JSON.stringify(profileData));
    setProfileOpen(false);
  };

  const toggleCondition = (cond) => {
    const exists = profileData.conditions.includes(cond);
    setProfileData({
      ...profileData,
      conditions: exists
        ? profileData.conditions.filter((c) => c !== cond)
        : [...profileData.conditions, cond],
    });
  };

  const formatName = (str) => {
    if (!str) return 'Shanthi Palani';
    if (/gkeditz/i.test(str)) return 'Shanthi Palani';
    const withSpaces = str.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    return withSpaces.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const userEmail = (user?.email || '').toLowerCase();
  const savedProf = JSON.parse(localStorage.getItem(`elder_profile_${userEmail}`) || localStorage.getItem('elder_profile') || '{}');

  const rawName = (userEmail.includes('gkeditz') || (user?.name && /gkeditz/i.test(user.name)) || (user?.email && /gkeditz/i.test(user.email)))
    ? 'Shanthi Palani'
    : (savedProf?.name || profileData?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.name || 'Senior User')));

  const elderName = formatName(rawName);
  const elderAge = savedProf?.age || profileData?.age || user?.age || 68;

  const desktopNavLinks = [
    { to: '/elder/dashboard', label: t('nav.home', 'Dashboard'), icon: Home },
    { to: '/elder/voice-log', label: t('nav.meals', 'Meal Log'), icon: Utensils },
    { to: '/elder/activity-sleep', label: t('nav.sleep', 'Activity & Sleep'), icon: Moon },
    { to: '/elder/diet-plan', label: t('nav.dietPlan', 'AI Diet Plan'), icon: Sparkles },
    { to: '/elder/clinical-assessment', label: t('nav.clinical', 'Clinical Assessment'), icon: FileText },
    { to: '/elder/care-team', label: t('nav.team', 'Care Team'), icon: Users },
    { to: '/elder/profile', label: t('nav.profile', 'My Profile'), icon: User },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-['Outfit'] antialiased relative overflow-x-clip ${
      isDark ? 'bg-[#0B111E] text-slate-100' : 'bg-[#F4F7F6] text-slate-800'
    }`}>
      {/* ── Ambient Indian Elder Background Watermark (Subtle Reduced Opacity for Clean Contrast) ── */}
      <div 
        className="fixed inset-0 bg-cover bg-center md:bg-[center_right_10%] bg-no-repeat pointer-events-none transition-all duration-700 z-0 opacity-12 dark:opacity-8"
        style={{
          backgroundImage: `url('/indian_elder_bg.jpg')`,
          filter: 'contrast(102%) brightness(96%)',
        }}
      />
      
      {/* ── Ambient Vignette Gradient ── */}
      <div className="fixed inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 dark:from-black/40 dark:to-black/60 pointer-events-none z-0" />

      {/* ── Soft Ambient Background Canvas ── */}
      <ParticleBackground isDark={isDark} />

      {/* ── 2-ROW DESKTOP HEADER (Row 1: Branding & Controls, Row 2: Navigation Bar) ── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${
        isDark ? 'bg-slate-900/95 border-slate-800 shadow-xl shadow-black/20' : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        {/* ── ROW 1: App Branding, User Profile, Live Clock, Actions, SOS & Sign Out ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: App Logo & User Profile Badge */}
            <div className="flex items-center gap-3.5">
              <div
                onClick={() => navigateWithTransition('/elder/dashboard')}
                className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#006b5f] flex items-center justify-center text-white shadow-md shadow-[#006b5f]/20 group-hover:scale-105 transition-transform">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-slate-900 dark:text-white tracking-tight leading-none block">HealthSpan</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 leading-none">
                      SENIOR CARE
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 leading-none mt-1 block">
                    Personalized Indian Nutrition & Longevity
                  </span>
                </div>
              </div>

              {/* User Profile Avatar & Greeting Pill */}
              <div
                onClick={() => navigateWithTransition('/elder/profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/90 cursor-pointer hover:border-emerald-500/60 transition-all ml-2"
                title={t('profile.editTitle', 'Click to view & edit health profile and PIN')}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 p-0.5 bg-emerald-50 shrink-0">
                    <img
                      src="/elder_avatar.jpg"
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-slate-900 dark:text-white whitespace-nowrap">{elderName} (Age {elderAge})</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">●</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block leading-none">
                    DAUGHTER NOTIFIED • STABLE
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Live Clock, Voice Log, Theme, Lang, SOS & Sign Out */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* ── LIVE DATE & REAL-TIME CLOCK BADGE ── */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs shadow-inner whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0 hidden sm:inline" />
                <span className="font-extrabold text-slate-700 dark:text-slate-200 text-xs">
                  {formatCustomDate(currentTime)}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <Clock className="w-3.5 h-3.5 text-cyan-500 animate-pulse shrink-0 hidden sm:inline" />
                <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-xs tracking-wider">
                  {formatLiveTime(currentTime)}
                </span>
              </div>

              {/* Voice Log Button */}
              <button
                onClick={() => {
                  if (onOpenVoiceLog) onOpenVoiceLog();
                  else navigateWithTransition('/elder/voice-log');
                }}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#006b5f] text-white text-xs font-black shadow-md shadow-[#006b5f]/20 hover:bg-[#00574d] transition-all cursor-pointer whitespace-nowrap"
                title={t('header.voiceLog', 'Voice Log')}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Log</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
                title="Toggle Light / Dark Mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-emerald-600" />}
              </button>

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className={`p-2 px-3 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span className="capitalize text-xs font-bold">{languages.find(l => l.code === langCode)?.label.split(' ')[0] || 'English'}</span>
                </button>
                {langOpen && (
                  <div className={`absolute top-full right-0 mt-2 w-44 rounded-2xl border shadow-xl z-50 overflow-hidden ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLangCode(l.code);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold border-b last:border-b-0 cursor-pointer ${
                          langCode === l.code
                            ? 'bg-emerald-500/10 text-emerald-500 font-extrabold'
                            : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Emergency SOS HELP Button */}
              <button
                onClick={() => setSosOpen(true)}
                className="px-3.5 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <AlertTriangle className="w-3.5 h-3.5 fill-white text-rose-600 animate-bounce" />
                <span>SOS HELP</span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800/90 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                title={t('header.signOut', 'Sign Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Dedicated Navigation Tab Bar with SmoothTabs ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <SmoothTabs
            tabs={[
              { to: '/elder/dashboard', label: t('nav.home', 'Dashboard'), icon: Home },
              { to: '/elder/voice-log', label: t('nav.meals', 'Meal Log'), icon: Utensils },
              { to: '/elder/activity-sleep', label: t('nav.sleep', 'Walk & Sleep'), icon: Moon },
              { to: '/elder/diet-plan', label: t('nav.dietPlan', 'AI Diet Plan'), icon: Sparkles },
              { to: '/elder/clinical-assessment', label: t('nav.clinical', 'Clinical Assessment'), icon: FileText },
              { to: '/elder/care-team', label: t('nav.team', 'Care Team'), icon: Users },
            ]}
          />
        </div>
      </header>

      {/* ── Main Content Container (Full Desktop Responsive Grid Container) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12 z-10 space-y-6">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation Bar (Shown only on small mobile devices < md) ── */}
      <nav className="md:hidden fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className={`max-w-md mx-auto rounded-3xl p-2 border shadow-2xl backdrop-blur-2xl flex items-center justify-around relative transition-all pointer-events-auto ${
          isDark
            ? 'bg-slate-900/90 border-slate-800/90 text-slate-300 shadow-black/60 shadow-2xl'
            : 'bg-white/90 border-white/80 text-slate-600 shadow-xl shadow-slate-900/10'
        }`}>
          {/* Nav Item 1: Home */}
          <button
            type="button"
            onClick={() => navigateWithTransition('/elder/dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all gap-1 cursor-pointer ${
              location.pathname === '/elder/dashboard'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black scale-105 shadow-sm'
                : 'hover:text-emerald-500 opacity-75 hover:opacity-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-extrabold">{t('nav.home') || 'Home'}</span>
          </button>

          {/* Nav Item 2: Meals */}
          <button
            type="button"
            onClick={() => navigateWithTransition('/elder/voice-log')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all gap-1 cursor-pointer ${
              location.pathname === '/elder/voice-log'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black scale-105 shadow-sm'
                : 'hover:text-emerald-500 opacity-75 hover:opacity-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span className="text-[10px] font-extrabold">{t('nav.meals') || 'Meals'}</span>
          </button>

          {/* Nav Item 3: Center Mic Action Orb */}
          <button
            onClick={() => {
              if (onOpenVoiceLog) onOpenVoiceLog();
              else navigateWithTransition('/elder/voice-log');
            }}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white shadow-xl shadow-emerald-500/40 -translate-y-4 border-4 border-white dark:border-slate-900 transition-all active:scale-95 animate-mic-pulse cursor-pointer group flex flex-col items-center justify-center shrink-0"
            title="Speak to Log Meal or Vitals"
          >
            <Mic className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black text-white tracking-wider uppercase leading-none mt-0.5">
              {t('nav.speak') || 'Speak'}
            </span>
          </button>

          {/* Nav Item 4: Sleep / Activity */}
          <button
            type="button"
            onClick={() => navigateWithTransition('/elder/activity-sleep')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all gap-1 cursor-pointer ${
              location.pathname === '/elder/activity-sleep'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black scale-105 shadow-sm'
                : 'hover:text-emerald-500 opacity-75 hover:opacity-100'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span className="text-[10px] font-extrabold">{t('nav.sleep') || 'Sleep'}</span>
          </button>

          {/* Nav Item 5: Care Team */}
          <button
            type="button"
            onClick={() => navigateWithTransition('/elder/care-team')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all gap-1 cursor-pointer ${
              location.pathname === '/elder/care-team'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black scale-105 shadow-sm'
                : 'hover:text-emerald-500 opacity-75 hover:opacity-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-extrabold">{t('nav.team') || 'Team'}</span>
          </button>
        </div>
      </nav>

      {/* ── Edit Health Profile Modal ── */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t('profile.title', 'Health & Diet Profile')}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t('profile.subtitle', 'Personalized Medical Baseline')}</p>
                </div>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">{t('profile.age', 'Age (Years)')}</label>
                  <input
                    type="number"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm font-bold outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">{t('profile.gender', 'Gender')}</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm font-bold outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Female">{t('profile.female', 'Female')}</option>
                    <option value="Male">{t('profile.male', 'Male')}</option>
                    <option value="Other">{t('profile.other', 'Other')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">{t('profile.height', 'Height (cm)')}</label>
                  <input
                    type="number"
                    value={profileData.heightCm}
                    onChange={(e) => setProfileData({ ...profileData, heightCm: e.target.value })}
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm font-bold outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">{t('profile.weight', 'Weight (kg)')}</label>
                  <input
                    type="number"
                    value={profileData.weightKg}
                    onChange={(e) => setProfileData({ ...profileData, weightKg: e.target.value })}
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm font-bold outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">{t('profile.medicalConditions', 'Medical Conditions')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Diabetes', 'Digestion', 'Cardiac Health', 'Hypertension', 'High Uric Acid', 'Kidney Health'].map((cond) => {
                    const sel = profileData.conditions?.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between cursor-pointer ${
                          sel ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{cond}</span>
                        {sel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-extrabold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> {t('profile.saveChanges', 'Save Profile Changes')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SOS Drawer Modal ── */}
      {sosOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/20 text-rose-600 rounded-2xl border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black dark:text-white text-slate-900">{t('header.emergencySupport', 'Emergency Support')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('header.emergencySubtitle', 'Instant 1-Tap Emergency Call')}</p>
                </div>
              </div>
              <button
                onClick={() => setSosOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="tel:108"
                className="w-full min-h-[54px] text-white font-extrabold text-sm flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-600/30 transition-all"
              >
                <PhoneCall className="w-4 h-4" /> {t('header.callAmbulance', 'Call Ambulance (108)')}
              </a>
              <a
                href="tel:9876543210"
                className="w-full min-h-[54px] text-white font-extrabold text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                <PhoneCall className="w-4 h-4" /> {t('header.callCaregiver', 'Call Caregiver')}
              </a>
            </div>

            <button
              onClick={() => setSosOpen(false)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 text-center cursor-pointer"
            >
              {t('header.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
