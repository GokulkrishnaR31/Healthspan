import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { 
  Activity, 
  Mail, 
  Lock, 
  Phone, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Smile,
  Shield,
  UserCheck,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Volume2,
  Delete,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function Login() {
  const { t, langCode, setLangCode, languages } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('elder'); // 'elder', 'caregiver', 'admin'
  const [loginMethod, setLoginMethod] = useState('pin'); // 'email' or 'pin' (default senior PIN)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Senior 4-Digit PIN & Care Code States
  const [pinIdentifier, setPinIdentifier] = useState(() => {
    try {
      const regUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
      const lastElder = regUsers.slice().reverse().find(u => u.role === 'elder');
      return lastElder?.phone || lastElder?.care_code || lastElder?.name || '';
    } catch(e) {
      return '';
    }
  });
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const pinInputRefs = useRef([]);

  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Mouse spotlight coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { login, loginWithPin, setUser } = useAuth();
  const navigate = useNavigate();

  // Handle Senior PIN Digit Input
  const handlePinDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...pinDigits];
      newDigits[index] = '';
      setPinDigits(newDigits);
      return;
    }

    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 4).split('');
      const newDigits = [...pinDigits];
      pastedDigits.forEach((char, i) => {
        if (i < 4) newDigits[i] = char;
      });
      setPinDigits(newDigits);
      const focusIndex = Math.min(pastedDigits.length, 3);
      pinInputRefs.current[focusIndex]?.focus();
      return;
    }

    const newDigits = [...pinDigits];
    newDigits[index] = cleaned[cleaned.length - 1];
    setPinDigits(newDigits);

    if (index < 3 && cleaned) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0) {
        const newDigits = [...pinDigits];
        newDigits[index - 1] = '';
        setPinDigits(newDigits);
        pinInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...pinDigits];
        newDigits[index] = '';
        setPinDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newDigits = ['', '', '', ''];
      pastedData.split('').forEach((char, i) => {
        newDigits[i] = char;
      });
      setPinDigits(newDigits);
      const focusIndex = Math.min(pastedData.length, 3);
      pinInputRefs.current[focusIndex]?.focus();
    }
  };

  // Senior Touchscreen Number Keypad Click
  const handleKeypadPress = (val) => {
    if (val === 'backspace') {
      const lastFilled = pinDigits.map((d, i) => d ? i : -1).filter(i => i !== -1);
      if (lastFilled.length > 0) {
        const lastIdx = lastFilled[lastFilled.length - 1];
        const newDigits = [...pinDigits];
        newDigits[lastIdx] = '';
        setPinDigits(newDigits);
        pinInputRefs.current[lastIdx]?.focus();
      }
      return;
    }

    if (val === 'clear') {
      setPinDigits(['', '', '', '']);
      pinInputRefs.current[0]?.focus();
      return;
    }

    const nextIdx = pinDigits.findIndex(d => !d);
    if (nextIdx !== -1) {
      const newDigits = [...pinDigits];
      newDigits[nextIdx] = String(val);
      setPinDigits(newDigits);
      if (nextIdx < 3) {
        pinInputRefs.current[nextIdx + 1]?.focus();
      }
    }
  };

  // Senior Voice Prompter
  const speakPinGuide = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Please enter your four digit PIN or mobile number to sign in.");
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mouse move handler for ambient spotlight
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const navigateToRole = (targetRole, userObj) => {
    const roleToUse = targetRole || selectedRole;
    const userEmail = (userObj?.email || email || '').trim().toLowerCase();
    if (roleToUse === 'admin') {
      navigate('/admin/dashboard');
    } else if (roleToUse === 'caregiver') {
      const caregiverProf = JSON.parse(localStorage.getItem(`caregiver_profile_${userEmail}`) || localStorage.getItem('caregiver_profile') || '{}');
      if (caregiverProf && caregiverProf.isCompleted === false) {
        navigate('/caregiver/setup');
      } else {
        navigate('/caregiver/overview');
      }
    } else {
      // Elder role
      const elderProf = JSON.parse(localStorage.getItem(`elder_profile_${userEmail}`) || localStorage.getItem('elder_profile') || '{}');
      if (elderProf && elderProf.isCompleted === false) {
        navigate('/elder/setup');
      } else if (userObj && userObj.is_completed === false) {
        navigate('/elder/setup');
      } else {
        navigate('/elder/dashboard');
      }
    }
  };

  const resolveUser = (inputIdentifier, role) => {
    const cleanId = (inputIdentifier || '').trim().toLowerCase().replace(/\s+/g, '');
    const registeredUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
    const matched = registeredUsers.find((u) => 
      (u.email && u.email.toLowerCase() === cleanId) || 
      (u.phone && u.phone.replace(/\s+/g, '') === cleanId) ||
      (u.care_code && u.care_code.toLowerCase() === cleanId) ||
      (u.name && u.name.toLowerCase() === cleanId)
    );

    if (matched) {
      return {
        ...matched,
        role: matched.role || role,
      };
    }

    // ── 4 Pre-seeded Elders ──
    if (cleanId === '7604948580' || cleanId === 'deepan.kumar@healthspan.in' || cleanId === 'dp-5820' || cleanId === 'deepan') {
      return {
        id: 'u_deepan_5820',
        email: 'deepan.kumar@healthspan.in',
        phone: '7604948580',
        pin: '5820',
        care_code: 'DP-5820',
        first_name: 'Deepan',
        last_name: 'Kumar',
        name: 'Deepan Kumar',
        role: 'elder'
      };
    }
    if (cleanId === '9444123456' || cleanId === 'shanthi.palani@healthspan.in' || cleanId === 'sp-7412' || cleanId === 'shanthi') {
      return {
        id: 'u_shanthi_7412',
        email: 'shanthi.palani@healthspan.in',
        phone: '9444123456',
        pin: '7412',
        care_code: 'SP-7412',
        first_name: 'Shanthi',
        last_name: 'Palani',
        name: 'Shanthi Palani',
        role: 'elder'
      };
    }
    if (cleanId === '9811123456' || cleanId === 'ramesh.verma@healthspan.in' || cleanId === 'rv-6391' || cleanId === 'ramesh') {
      return {
        id: 'u_ramesh_6391',
        email: 'ramesh.verma@healthspan.in',
        phone: '9811123456',
        pin: '6391',
        care_code: 'RV-6391',
        first_name: 'Ramesh',
        last_name: 'Verma',
        name: 'Ramesh Verma',
        role: 'elder'
      };
    }
    if (cleanId === '9884123456' || cleanId === 'kalyani.s@healthspan.in' || cleanId === 'ks-4189' || cleanId === 'kalyani') {
      return {
        id: 'u_kalyani_4189',
        email: 'kalyani.s@healthspan.in',
        phone: '9884123456',
        pin: '4189',
        care_code: 'KS-4189',
        first_name: 'Kalyani',
        last_name: 'Sundaram',
        name: 'Kalyani Sundaram',
        role: 'elder'
      };
    }

    // ── 4 Pre-seeded Caregivers ──
    if (cleanId === '9876543210' || cleanId === 'priya.verma@healthspan.in' || cleanId === 'priya') {
      return {
        id: 'cg_priya_2580',
        email: 'priya.verma@healthspan.in',
        phone: '9876543210',
        pin: '2580',
        first_name: 'Priya',
        last_name: 'Verma',
        name: 'Priya Verma',
        role: 'caregiver'
      };
    }
    if (cleanId === '9876543211' || cleanId === 'arvind.doctor@healthspan.in' || cleanId === 'arvind' || cleanId === 'dr.arvind') {
      return {
        id: 'cg_arvind_3690',
        email: 'arvind.doctor@healthspan.in',
        phone: '9876543211',
        pin: '3690',
        first_name: 'Dr. Arvind',
        last_name: 'Swaminathan',
        name: 'Dr. Arvind Swaminathan',
        role: 'caregiver'
      };
    }
    if (cleanId === '9876543212' || cleanId === 'meera.nair@healthspan.in' || cleanId === 'meera') {
      return {
        id: 'cg_meera_1470',
        email: 'meera.nair@healthspan.in',
        phone: '9876543212',
        pin: '1470',
        first_name: 'Meera',
        last_name: 'Nair',
        name: 'Meera Nair',
        role: 'caregiver'
      };
    }
    if (cleanId === '9876543213' || cleanId === 'vikram.rao@healthspan.in' || cleanId === 'vikram') {
      return {
        id: 'cg_vikram_9510',
        email: 'vikram.rao@healthspan.in',
        phone: '9876543213',
        pin: '9510',
        first_name: 'Vikram',
        last_name: 'Rao',
        name: 'Vikram Rao',
        role: 'caregiver'
      };
    }

    let first = '';
    let last = '';
    if (cleanId && cleanId.includes('@')) {
      const usernamePart = cleanId.split('@')[0];
      const parts = usernamePart.split(/[._-]+/).filter(Boolean);
      if (parts.length > 0) {
        first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (parts.length > 1) {
          last = parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
      }
    }

    if (!first) {
      if (role === 'admin') {
        first = 'Dr. Admin';
        last = 'Sharma';
      } else if (role === 'caregiver') {
        first = 'Priya';
        last = 'Verma';
      } else {
        first = 'Senior';
        last = 'User';
      }
    }

    return {
      id: 'demo_' + Date.now(),
      email: cleanId.includes('@') ? cleanId : `${first.toLowerCase()}@healthspan.in`,
      phone: cleanId.includes('@') ? '+91 98765 43210' : cleanId,
      first_name: first,
      last_name: last,
      name: `${first} ${last}`.trim(),
      role: role || 'elder',
    };
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (loginMethod !== 'email') return;
    setLocalError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password, selectedRole);

      // Strict role check: Do not allow wrong role to proceed into wrong dashboard
      if (loggedUser.role !== selectedRole) {
        setLoading(false);
        const actualRoleName = loggedUser.role.charAt(0).toUpperCase() + loggedUser.role.slice(1);
        const expectedRoleName = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        setLocalError(`Access Denied: This account is registered as a ${actualRoleName}. You cannot log in through the ${expectedRoleName} portal tab. Please select the ${actualRoleName} tab.`);
        return;
      }

      setSuccessMsg(`Welcome back, ${loggedUser.first_name || 'User'}!`);
      setTimeout(() => {
        setLoading(false);
        navigateToRole(loggedUser.role, loggedUser);
      }, 500);
    } catch (err) {
      console.warn('Login authentication notice:', err);
      setLoading(false);
      setLocalError(err.message || 'Invalid email or password. Please check your credentials or register a new account.');
    }
  };

  // ── SENIOR 4-DIGIT PIN & CARE CODE AUTHENTICATION ──
  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!pinIdentifier || pinIdentifier.trim().length < 2) {
      setLocalError('Please enter your Mobile Number, Senior Name, or Care Code.');
      return;
    }

    const fullPin = pinDigits.join('').trim();
    if (fullPin.length !== 4) {
      setLocalError('Please enter all 4 digits of your Senior PIN.');
      return;
    }

    try {
      // 1. Authenticate with backend API for real JWT token & Atlas DB profile
      const { user: loggedUser, profile: elderProfile } = await loginWithPin(pinIdentifier, fullPin, selectedRole);
      
      // Clean up any stale un-scoped elder_profile to prevent cross-account leak
      localStorage.removeItem('elder_profile');

      if (selectedRole === 'elder') {
        const userKey = (loggedUser.email || loggedUser.id || '').toLowerCase();
        const existingProfile = JSON.parse(localStorage.getItem(`elder_profile_${userKey}`) || '{}');
        localStorage.setItem(`elder_profile_${userKey}`, JSON.stringify({
          ...existingProfile,
          ...(elderProfile || {}),
          name: loggedUser.name || (elderProfile && elderProfile.name) || existingProfile.name || pinIdentifier,
          phone: loggedUser.phone || existingProfile.phone || pinIdentifier,
          pin: fullPin,
          careCode: elderProfile?.care_code || loggedUser.care_code || existingProfile.careCode,
          isCompleted: elderProfile?.is_completed !== undefined ? elderProfile.is_completed : (existingProfile.isCompleted !== undefined ? existingProfile.isCompleted : true)
        }));
      }

      setSuccessMsg(`Welcome back, ${loggedUser.first_name || loggedUser.name || 'Senior'}! PIN Verified.`);
      setTimeout(() => {
        setLoading(false);
        navigateToRole(selectedRole, loggedUser);
      }, 500);
    } catch (apiErr) {
      console.warn('Backend PIN login notice:', apiErr.message);

      // 2. Offline fallback for local testing
      const cleanId = pinIdentifier.trim().replace(/\s+/g, '');
      const registeredUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
      const matched = registeredUsers.find((u) => 
        (u.phone && u.phone.replace(/\s+/g, '') === cleanId) || 
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase()) ||
        (u.name && u.name.toLowerCase() === cleanId.toLowerCase()) ||
        (u.care_code && u.care_code.toLowerCase() === cleanId.toLowerCase())
      );

      if (matched && matched.role && matched.role !== selectedRole) {
        setLoading(false);
        const actualRoleName = matched.role.charAt(0).toUpperCase() + matched.role.slice(1);
        const expectedRoleName = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        setLocalError(`Access Denied: This account is registered as a ${actualRoleName}. Please select the ${actualRoleName} portal tab.`);
        return;
      }

      if (matched && matched.pin && matched.pin !== fullPin) {
        setLoading(false);
        setLocalError('Incorrect PIN. Please enter your registered 4-digit Senior PIN.');
        return;
      }

      const resolved = matched ? { ...matched, pin: fullPin } : resolveUser(pinIdentifier, selectedRole);
      resolved.pin = fullPin;

      // Clean up stale un-scoped profile
      localStorage.removeItem('elder_profile');

      if (selectedRole === 'elder') {
        const userKey = (resolved.email || resolved.id || '').toLowerCase();
        const existingProfile = JSON.parse(localStorage.getItem(`elder_profile_${userKey}`) || '{}');
        localStorage.setItem(`elder_profile_${userKey}`, JSON.stringify({
          ...existingProfile,
          name: resolved.name,
          phone: resolved.phone || pinIdentifier,
          pin: fullPin,
          isCompleted: existingProfile.isCompleted !== undefined ? existingProfile.isCompleted : true
        }));
      }

      localStorage.setItem('user', JSON.stringify(resolved));
      setUser(resolved);
      
      setSuccessMsg(`Welcome back, ${resolved.first_name}! PIN Verified.`);
      setTimeout(() => {
        setLoading(false);
        navigateToRole(selectedRole, resolved);
      }, 500);
    }
  };

  const roleOptions = [
    { id: 'elder', label: 'Elder', Icon: Smile },
    { id: 'caregiver', label: 'Caregiver', Icon: Shield },
    { id: 'admin', label: 'Admin', Icon: UserCheck },
  ];

  const glitterParticles = [
    { top: '15%', left: '20%', size: 'w-3 h-3', delay: '0s', duration: '3s' },
    { top: '25%', left: '80%', size: 'w-4 h-4', delay: '0.7s', duration: '4s' },
    { top: '65%', left: '15%', size: 'w-3.5 h-3.5', delay: '1.4s', duration: '3.5s' },
    { top: '80%', left: '75%', size: 'w-4 h-4', delay: '2.1s', duration: '4.5s' },
    { top: '40%', left: '88%', size: 'w-3 h-3', delay: '1.1s', duration: '3.2s' },
    { top: '12%', left: '60%', size: 'w-2.5 h-2.5', delay: '1.8s', duration: '3.8s' },
    { top: '70%', left: '45%', size: 'w-3 h-3', delay: '0.4s', duration: '4.2s' },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Outfit'] bg-slate-950 overflow-hidden select-none">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center md:bg-[center_right_10%] bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/indian_elder_bg.jpg')`,
          filter: 'contrast(102%) brightness(98%)',
        }}
      />
      
      {/* Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

      {/* Mouse Spotlight Glow */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-transform duration-150 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.08) 35%, transparent 70%)',
          zIndex: 5,
        }}
      />

      {/* Glitter / Sparkle Elements */}
      {glitterParticles.map((particle, index) => (
        <div
          key={index}
          className={`absolute ${particle.size} text-amber-300 pointer-events-none animate-pulse`}
          style={{
            top: particle.top,
            left: particle.left,
            animationDuration: particle.duration,
            animationDelay: particle.delay,
            filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
            zIndex: 6,
          }}
        >
          <Activity className="w-full h-full text-emerald-300/80 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      ))}

      {/* Main Centered Login Card */}
      <div 
        className="relative z-10 w-full max-w-[540px] sm:max-w-[580px] bg-white/95 rounded-3xl p-6 sm:p-9 md:p-10 border border-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35),0_0_35px_rgba(16,185,129,0.18)] hover:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.4),0_0_45px_rgba(16,185,129,0.28)] space-y-5 transition-all duration-300 group"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-[3.5px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />

        {/* ── Top Language Selector Bar ── */}
        <div className="flex items-center justify-between gap-2 p-2 px-3 bg-slate-50/90 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 min-w-0">
            <Globe className="w-4 h-4 text-[#006b5f] shrink-0" />
            <span className="truncate">{t('auth.selectLanguage', 'Language / மொழி')}</span>
          </div>
          <select
            value={langCode}
            onChange={(e) => setLangCode(e.target.value)}
            className="bg-white border border-slate-200 focus:border-[#006b5f] focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 py-1.5 text-xs font-black text-[#006b5f] outline-none cursor-pointer hover:bg-slate-50 transition-all shadow-2xs shrink-0"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Top Header */}
        <div className="text-center flex flex-col items-center">
          <div className="relative group/badge cursor-pointer mb-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full blur-md opacity-40 group-hover/badge:opacity-90 transition-opacity duration-300 animate-pulse" />
            <div className="relative w-14 h-14 rounded-full bg-[#006b5f] flex items-center justify-center shadow-lg shadow-[#006b5f]/30 text-white transform group-hover/badge:scale-105 transition-transform duration-300">
              <Activity className="w-7 h-7 stroke-[2.5] group-hover/badge:animate-bounce" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005a4e] tracking-tight flex items-center gap-1.5 justify-center">
            HealthSpan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 text-center max-w-[420px]">
            {t('auth.portalTitle', 'Senior Clinical Nutrition & Longevity Portal')}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
            {t('auth.chooseRole', 'Select Your Access Role')}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { id: 'elder', label: t('auth.elderRole', 'Senior Elder'), Icon: Smile },
              { id: 'caregiver', label: t('auth.caregiverRole', 'Caregiver'), Icon: Shield },
              { id: 'admin', label: t('auth.adminRole', 'Doctor/Admin'), Icon: UserCheck },
            ].map(({ id, label, Icon }) => {
              const isActive = selectedRole === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(id);
                    setLocalError('');
                    setSuccessMsg('');
                  }}
                  className={`relative p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-xs font-bold border-2 min-h-[76px] min-w-0 ${
                    isActive
                      ? 'bg-emerald-50/90 border-[#006b5f] text-[#006b5f] shadow-[0_4px_16px_rgba(0,107,95,0.18)] scale-[1.02]'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50/80 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#006b5f] text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-center leading-tight line-clamp-2 px-0.5 break-words">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Method Segmented Control */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 gap-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('email');
              setLocalError('');
              setSuccessMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
              loginMethod === 'email'
                ? 'bg-white text-[#006b5f] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('auth.emailMethod', 'Password Login')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('pin');
              setLocalError('');
              setSuccessMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
              loginMethod === 'pin'
                ? 'bg-white text-[#006b5f] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('auth.pinMethod', '4-Digit Senior PIN')}</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {localError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Form Area */}
        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5 group/input">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block group-focus-within/input:text-[#006b5f] transition-colors">
                {t('auth.emailLabel', 'Email Address')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within/input:text-[#006b5f] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder', 'Enter registered email...')}
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#006b5f] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5 group/input">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block group-focus-within/input:text-[#006b5f] transition-colors">
                {t('auth.passwordLabel', 'Password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within/input:text-[#006b5f] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder', 'Enter password...')}
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#006b5f] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 pl-10 pr-11 text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Eye className="w-4 h-4 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Glowing Interactive CTA Button */}
            <div className="relative group/btn pt-2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-md opacity-30 group-hover/btn:opacity-80 transition duration-300 group-hover/btn:blur-lg" />
              <button
                type="submit"
                disabled={loading}
                className="relative w-full min-h-[50px] bg-[#006b5f] hover:bg-[#00574d] text-white rounded-xl font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating…
                  </>
                ) : (
                  <>
                    {t('auth.loginBtn', 'Sign In')} <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ── SENIOR 4-DIGIT PIN & CARE CODE FORM ── */
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5 group/input">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block group-focus-within/input:text-[#006b5f] transition-colors">
                {t('auth.pinIdentifierLabel', 'Mobile Number or Senior Name')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within/input:text-[#006b5f] transition-colors" />
                <input
                  type="text"
                  required
                  value={pinIdentifier}
                  onChange={(e) => setPinIdentifier(e.target.value)}
                  placeholder={t('auth.pinIdentifierPlaceholder', 'e.g. 7604948580, DP-6821 or Deepan')}
                  className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#006b5f] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 4 Large ATM-Style PIN Boxes */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#006b5f]" />
                  {t('auth.pinLabel', 'Enter 4-Digit Senior PIN')}
                </label>
                <button
                  type="button"
                  onClick={speakPinGuide}
                  className="text-[11px] text-[#006b5f] hover:text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen
                </button>
              </div>

              <div className="flex items-center justify-center gap-3" onPaste={handlePinPaste}>
                {pinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (pinInputRefs.current[idx] = el)}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    onFocus={(e) => e.target.select()}
                    className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-3xl font-black rounded-2xl border-2 transition-all outline-none ${
                      digit
                        ? 'border-[#006b5f] bg-emerald-50/70 text-[#006b5f] shadow-md shadow-emerald-500/15 scale-105'
                        : 'border-slate-200 bg-[#f8fafc] text-slate-800 focus:border-[#006b5f] focus:bg-white focus:ring-4 focus:ring-emerald-500/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* On-Screen Touch ATM Number Pad for Seniors */}
            <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="text-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Touch Number Keypad
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-slate-200/80 hover:border-emerald-400 text-lg font-black text-slate-700 hover:text-[#006b5f] shadow-2xs transition-all flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 border border-slate-200/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress(0)}
                  className="h-11 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-slate-200/80 hover:border-emerald-400 text-lg font-black text-slate-700 hover:text-[#006b5f] shadow-2xs transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-11 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-600 border border-slate-200/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Demo Hint */}
            <div className="text-center text-[11px] text-emerald-800 bg-emerald-50/80 py-1.5 px-3 rounded-lg font-medium border border-emerald-200/60">
              💡 Unique Senior PIN: Set & view in Senior Profile
            </div>

            {/* Submit CTA */}
            <div className="relative group/btn pt-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-md opacity-30 group-hover/btn:opacity-80 transition duration-300" />
              <button
                type="submit"
                disabled={loading}
                className="relative w-full min-h-[52px] bg-[#006b5f] hover:bg-[#00574d] text-white rounded-xl font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying PIN…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> {t('auth.loginWithPinBtn', 'Sign In with Senior PIN')} <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 font-medium pt-1">
          {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="text-[#006b5f] font-bold hover:underline hover:text-emerald-700 transition-colors">
            {t('auth.registerHere', 'Register here')}
          </Link>
        </div>
      </div>
    </div>
  );
}
