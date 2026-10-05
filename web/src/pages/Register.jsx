import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HeartPulse, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react';

export default function Register() {
  const { t, langCode, setLangCode, languages } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [role, setRole] = useState('elder');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify your confirm password field.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'elder' && pin && pin.trim().length !== 4) {
      setLocalError('Senior PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const chosenPin = (pin && pin.trim().length === 4) 
        ? pin.trim() 
        : (cleanPhone.length >= 4 
            ? cleanPhone.replace(/\D/g, '').slice(-4) 
            : String(Math.floor(1000 + Math.random() * 9000)));

      const regResult = await register(
        cleanEmail,
        password,
        firstName.trim(),
        lastName.trim(),
        role,
        cleanPhone,
        chosenPin
      );

      const resolvedPin = regResult?.user?.pin || chosenPin;
      const resolvedCareCode = regResult?.user?.care_code || `ELDER-${Math.floor(1000 + Math.random() * 9000)}`;

      // Save to local registered users directory for consistent role checking
      const registeredUsers = JSON.parse(localStorage.getItem('hs_registered_users') || '[]');
      const filtered = registeredUsers.filter(u => u.email !== cleanEmail);
      filtered.push({
        email: cleanEmail,
        phone: cleanPhone,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        role: role,
        pin: resolvedPin,
        care_code: resolvedCareCode
      });
      localStorage.setItem('hs_registered_users', JSON.stringify(filtered));

      // Initialize initial uncompleted profile for the new user
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (role === 'elder') {
        const initialElderProfile = {
          name: fullName,
          email: cleanEmail,
          phone: cleanPhone,
          pin: resolvedPin,
          careCode: resolvedCareCode,
          age: '',
          gender: 'Female',
          heightCm: '',
          weightKg: '',
          activityLevel: 'Light Walk',
          conditions: [],
          chewability: 'Soft Meals',
          regionalCuisine: 'Pan-Indian Balanced',
          dietType: 'Vegetarian',
          fastingRoutine: 'None',
          isCompleted: false
        };
        localStorage.setItem(`elder_profile_${cleanEmail}`, JSON.stringify(initialElderProfile));
        localStorage.setItem('elder_profile', JSON.stringify(initialElderProfile));
        // Reset any leftover shared meal logs or water for fresh experience
        localStorage.removeItem(`logged_meals_${cleanEmail}`);
        localStorage.removeItem(`today_water_${cleanEmail}_liters`);
      } else if (role === 'caregiver') {
        const initialCaregiverProfile = {
          caregiverName: fullName,
          caregiverEmail: cleanEmail,
          phone: cleanPhone,
          isCompleted: false
        };
        localStorage.setItem(`caregiver_profile_${cleanEmail}`, JSON.stringify(initialCaregiverProfile));
        localStorage.setItem('caregiver_profile', JSON.stringify(initialCaregiverProfile));
      }

      setSuccess(true);
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'caregiver') {
          navigate('/caregiver/setup');
        } else {
          // Direct senior elder to Setup Wizard to fill health details
          navigate('/elder/setup');
        }
      }, 700);
    } catch (err) {
      console.warn('Registration error:', err);
      setLocalError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

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
      
      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-[540px] sm:max-w-[580px] bg-white/95 rounded-3xl p-6 sm:p-9 md:p-10 border border-white/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35),0_0_35px_rgba(16,185,129,0.18)] hover:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.4),0_0_45px_rgba(16,185,129,0.28)] space-y-5 transition-all duration-300 group">
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

        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <div className="relative group/badge cursor-pointer mb-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full blur-md opacity-40 group-hover/badge:opacity-90 transition-opacity duration-300 animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-[#006b5f] flex items-center justify-center shadow-lg shadow-[#006b5f]/30 text-white transform group-hover/badge:scale-105 transition-transform duration-300">
              <HeartPulse className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005a4e] tracking-tight">{t('auth.registerBtn', 'Create Account')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">{t('auth.portalSubtitle', 'Join HealthSpan Senior Care Network')}</p>
        </div>

        {localError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Account created! Opening Setup Wizard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('auth.firstNameLabel', 'First Name')}</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('auth.firstNamePlaceholder', 'Enter first name...')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('auth.lastNameLabel', 'Last Name')}</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('auth.lastNamePlaceholder', 'Enter last name...')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('auth.phoneLabel', 'Mobile Phone Number')}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder', '10-digit phone...')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {role === 'elder' ? '4-Digit Senior PIN (Optional)' : 'Security PIN (Optional)'}
              </label>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 5820"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all tracking-widest text-center"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('auth.emailLabel', 'Email Address')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder', 'Enter registered email...')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('auth.passwordLabel', 'Password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder', 'Enter password (min 6 characters)')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-emerald-600" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('auth.confirmPasswordLabel', 'Confirm Password')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter password')}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white font-semibold outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg cursor-pointer"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-emerald-600" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('auth.chooseRole', 'Registering As')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('elder')}
                className={`py-3 px-3 rounded-2xl font-extrabold text-xs border-2 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-0 ${
                  role === 'elder'
                    ? 'bg-emerald-50/90 text-[#006b5f] border-[#006b5f] shadow-xs scale-[1.01]'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <span>👵</span>
                <span className="truncate">{t('auth.elderRole', 'Senior / Elder')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                className={`py-3 px-3 rounded-2xl font-extrabold text-xs border-2 transition-all cursor-pointer flex items-center justify-center gap-2 min-w-0 ${
                  role === 'caregiver'
                    ? 'bg-emerald-50/90 text-[#006b5f] border-[#006b5f] shadow-xs scale-[1.01]'
                    : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <span>🟢</span>
                <span className="truncate">{t('auth.caregiverRole', 'Caregiver')}</span>
              </button>
            </div>
          </div>

          <div className="relative group/btn pt-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-md opacity-30 group-hover/btn:opacity-80 transition duration-300" />
            <button
              type="submit"
              disabled={loading}
              className="relative w-full min-h-[50px] bg-[#006b5f] hover:bg-[#00574d] text-white rounded-xl font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering…
                </>
              ) : (
                <>
                  {t('auth.registerBtn', 'Create Account')} <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium pt-1">
          {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="text-[#006b5f] font-bold hover:underline hover:text-emerald-700 transition-colors">
            {t('auth.signInHere', 'Sign In')}
          </Link>
        </div>
      </div>
    </div>
  );
}
