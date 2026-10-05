import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  HeartPulse, LayoutDashboard, User, Utensils, TrendingUp,
  FileText, PhoneCall, Bell, Settings, LogOut, Activity,
  ClipboardList, Apple, ChevronLeft, ChevronRight, Menu, X,
  ShieldAlert, Phone, ExternalLink, Heart, PlusCircle, MapPin
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/health-summary', label: 'Health Summary', icon: Activity },
  { to: '/health-conditions', label: 'Health Conditions', icon: ClipboardList },
  { to: '/meal-logs', label: 'Meal Logging', icon: Utensils },
  { to: '/daily-intake', label: 'Daily Intake', icon: Apple },
  { to: '/nutrition-history', label: 'Nutrition History', icon: TrendingUp },
  { to: '/health-scores', label: 'Health Scores', icon: HeartPulse },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Floating Emergency Widget states
  const [profile, setProfile] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [widgetOpen, setWidgetOpen] = useState(false);

  // Geolocation & Hospitals states
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [locError, setLocError] = useState('');

  useEffect(() => {
    const fetchProfileAndCaregiver = async () => {
      if (!user) return;
      try {
        const res = await api.get('/elderly-profiles/me');
        const p = res.data;
        setProfile(p);
        
        // Fetch emergency contacts to find caregiver
        const contactRes = await api.get(`/emergency-contacts/profile/${p.id}`);
        const contacts = contactRes.data;
        if (contacts && contacts.length > 0) {
          const primary = contacts.find(c => c.is_primary) || contacts[0];
          setCaregiver(primary);
        }
      } catch (err) {
        console.error('Failed to load profile/caregiver in layout widget:', err);
      }
    };
    
    fetchProfileAndCaregiver();
  }, [user]);

  const findNearbyHospitals = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    setNearbyHospitals([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        try {
          // Query Overpass API for hospitals within 5km (5000 meters)
          const query = `[out:json][timeout:15];node["amenity"="hospital"](around:5000,${latitude},${longitude});out body;`;
          const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
          
          const res = await fetch(url);
          if (!res.ok) throw new Error('Failed to query hospital records');
          const data = await res.json();
          
          if (data && data.elements && data.elements.length > 0) {
            // Map and calculate distances
            const list = data.elements.map(el => {
              const elLat = el.lat;
              const elLon = el.lon;
              
              // Haversine distance
              const R = 6371; // Earth's radius in km
              const dLat = (elLat - latitude) * Math.PI / 180;
              const dLon = (elLon - longitude) * Math.PI / 180;
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(elLat * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const dist = R * c;

              return {
                id: el.id,
                name: el.tags.name || 'Nearby Hospital',
                phone: el.tags.phone || el.tags['contact:phone'] || el.tags['emergency:phone'] || null,
                lat: elLat,
                lon: elLon,
                distance: dist
              };
            });

            // Sort by distance and select top 3
            list.sort((a, b) => a.distance - b.distance);
            setNearbyHospitals(list.slice(0, 3));
          } else {
            setLocError('No hospitals found within 5km.');
          }
        } catch (err) {
          console.error(err);
          setLocError('Failed to fetch nearby hospital listings.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setLocError('Unable to retrieve your location.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getPageTitle = () => {
    const match = navItems.find(n => n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to));
    return match?.label || 'Dashboard';
  };

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`h-16 flex items-center gap-3 px-5 border-b border-slate-100/60 shrink-0`}>
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-2 rounded-xl shadow-lg shadow-purple-500/20 shrink-0">
          <HeartPulse className="w-5 h-5" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent whitespace-nowrap">
            HealthSpan
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            {({ isActive }) => (
              <>
                <span className={`shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-100/60 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout"
              className="shrink-0 text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar – desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-100 shrink-0 transition-all duration-200 z-20 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute left-full top-14 -translate-x-1/2 z-30 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow"
          style={{ transform: `translateX(${collapsed ? '-50%' : '-50%'})` }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
        </button>
      </aside>

      {/* Sidebar – mobile */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-100 flex flex-col z-40 lg:hidden transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">{getPageTitle()}</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl">
              <span>Hi,</span>
              <span className="font-semibold text-violet-700">{user?.first_name}</span>
            </div>
            <button onClick={handleLogout} className="lg:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
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

      {/* ── Floating Emergency & Profile Widget ── */}
      {user && user.role === 'elderly' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
          {/* Expanded Panel */}
          {widgetOpen && (
            <div className="w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="flex items-center gap-1.5 text-slate-800 font-extrabold text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> Quick Access & Help
                </span>
                <button
                  onClick={() => setWidgetOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Details</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-[11px] text-slate-500">{user.phone || 'No phone registered'}</p>
                  </div>
                </div>
              </div>

              {/* Caregiver Details */}
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-purple-700/20" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Primary Caregiver</p>
                    {caregiver ? (
                      <>
                        <p className="text-xs font-bold text-slate-800">{caregiver.first_name} {caregiver.last_name}</p>
                        <p className="text-[11px] text-slate-500 mb-2">{caregiver.phone}</p>
                        <a
                          href={`tel:${caregiver.phone}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <Phone className="w-3 h-3" /> Call Caregiver
                        </a>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">No caregiver configured.</p>
                        <button
                          onClick={() => { setWidgetOpen(false); navigate('/profile-setup'); }}
                          className="mt-2 text-[11px] font-semibold text-purple-700 hover:underline flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Setup Caregiver
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Reports option */}
              <button
                onClick={() => { setWidgetOpen(false); navigate('/reports'); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-700 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold">Health & Medical Reports</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              {/* Emergency dialers & Nearby Hospital search */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest mb-1.5">Emergency Services</p>
                  <a
                    href="tel:108"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-red-700 font-extrabold text-xs transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 animate-bounce text-red-600" />
                    <span>CALL AMBULANCE (108)</span>
                  </a>
                </div>

                {/* Geolocation & Nearby Hospitals */}
                <div className="border-t border-slate-50 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Nearby Hospitals
                    </span>
                    {!userLocation && !locating && (
                      <button
                        onClick={findNearbyHospitals}
                        type="button"
                        className="text-[10px] font-bold text-violet-600 hover:text-violet-700 cursor-pointer"
                      >
                        Locate
                      </button>
                    )}
                  </div>

                  {locating && (
                    <div className="flex items-center gap-2 py-2 text-xs text-slate-500 justify-center bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                      <span>Locating hospitals near you...</span>
                    </div>
                  )}

                  {locError && (
                    <p className="text-[10px] font-medium text-rose-600 bg-rose-50 p-2 rounded-lg text-center">{locError}</p>
                  )}

                  {nearbyHospitals.length > 0 && (
                    <div className="space-y-2">
                      {nearbyHospitals.map(h => (
                        <div key={h.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-left transition-all hover:border-slate-200">
                          <div className="flex justify-between items-start gap-1">
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{h.name}</p>
                            <span className="text-[9px] font-bold text-slate-400 shrink-0">{h.distance.toFixed(1)} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {h.phone ? (
                              <a
                                href={`tel:${h.phone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold transition-colors border border-emerald-100"
                              >
                                <Phone className="w-2.5 h-2.5" /> Call
                              </a>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">No phone listed</span>
                            )}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}+${h.lat},${h.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-semibold transition-colors border border-sky-100 ml-auto"
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> Map Location
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!locating && !nearbyHospitals.length && !locError && (
                    <button
                      onClick={findNearbyHospitals}
                      type="button"
                      className="w-full flex items-center justify-center gap-2 py-2 border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Search Hospitals Around Me
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trigger FAB (Floating Action Button) */}
          <button
            onClick={() => setWidgetOpen(!widgetOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer relative ${
              widgetOpen
                ? 'bg-slate-700 rotate-90'
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-purple-600 hover:shadow-xl hover:shadow-red-500/20'
            }`}
          >
            {/* Pulsing indicator when closed */}
            {!widgetOpen && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
            )}
            
            {widgetOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
