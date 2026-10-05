import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../services/api';
import { HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Activity, ShieldAlert, Utensils, Users, UserCheck } from 'lucide-react';

export default function ElderSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [setupMode, setSetupMode] = useState('self'); // 'self' or 'caregiver'
  const [saving, setSaving] = useState(false);

  // Dynamic Elder Unique Senior Care Code
  const [elderCareCode] = useState(() => {
    const existing = localStorage.getItem('elder_care_code');
    if (existing) return existing;
    const generated = `ELDER-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('elder_care_code', generated);
    return generated;
  });

  // Form State
  const [formData, setFormData] = useState({
    age: '68',
    gender: 'Male',
    heightCm: '169',
    weightKg: '64',
    activityLevel: 'Light Walk',
    conditions: ['Diabetes', 'Hypertension'],
    chewability: 'Soft Meals',
    regionalCuisine: 'Pan-Indian Balanced',
    dietType: 'Vegetarian',
    fastingRoutine: 'None',
  });

  const toggleCondition = (cond) => {
    setFormData((prev) => {
      const exists = prev.conditions.includes(cond);
      return {
        ...prev,
        conditions: exists ? prev.conditions.filter((c) => c !== cond) : [...prev.conditions, cond],
      };
    });
  };

  // Load existing profile baseline if available
  useEffect(() => {
    const userEmail = user?.email || '';
    const existing = JSON.parse(localStorage.getItem(`elder_profile_${userEmail}`) || localStorage.getItem('elder_profile') || '{}');
    if (existing && Object.keys(existing).length > 0) {
      setFormData(prev => ({
        ...prev,
        age: existing.age ? String(existing.age) : prev.age,
        gender: existing.gender || prev.gender,
        heightCm: existing.heightCm ? String(existing.heightCm) : prev.heightCm,
        weightKg: existing.weightKg ? String(existing.weightKg) : prev.weightKg,
        activityLevel: existing.activityLevel || prev.activityLevel,
        conditions: Array.isArray(existing.conditions) && existing.conditions.length > 0 ? existing.conditions : prev.conditions,
        chewability: existing.chewability || prev.chewability,
        regionalCuisine: existing.regionalCuisine || prev.regionalCuisine,
        dietType: existing.dietType || prev.dietType,
        fastingRoutine: existing.fastingRoutine || prev.fastingRoutine,
      }));
    }
  }, [user]);

  // ── SAVE HEALTH DETAILS DIRECTLY TO MONGODB ATLAS DATABASE ──
  const handleFinish = async () => {
    setSaving(true);
    const userEmail = user?.email || '';
    const userKey = userEmail || user?.id || 'senior_elder';
    const existing = JSON.parse(localStorage.getItem(`elder_profile_${userKey}`) || localStorage.getItem('elder_profile') || '{}');
    const finalProfile = { 
      ...existing, 
      ...formData, 
      name: user?.name || user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (existing.name || 'Senior User'),
      email: userEmail || existing.email,
      elderCode: elderCareCode, 
      isCompleted: true 
    };
    localStorage.setItem(`elder_profile_${userKey}`, JSON.stringify(finalProfile));
    localStorage.setItem('elder_profile', JSON.stringify(finalProfile));

    try {
      await profileApi.updateProfile({
        name: finalProfile.name,
        age: Number(formData.age),
        gender: formData.gender,
        height_cm: Number(formData.heightCm),
        weight_kg: Number(formData.weightKg),
        conditions: formData.conditions,
        chewability: formData.chewability,
        regional_cuisine: formData.regionalCuisine,
        diet_type: formData.dietType,
        fasting_routine: formData.fastingRoutine,
        is_completed: true,
      });
    } catch (err) {
      console.warn('Backend setup profile save notice:', err);
    } finally {
      setSaving(false);
      navigate('/elder/dashboard');
    }
  };

  const handleDelegateToCaregiver = async () => {
    setSaving(true);
    const userEmail = user?.email || '';
    const userKey = userEmail || user?.id || 'senior_elder';
    const existing = JSON.parse(localStorage.getItem(`elder_profile_${userKey}`) || localStorage.getItem('elder_profile') || '{}');
    const delegatedProfile = {
      ...existing,
      name: user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (existing.name || 'Senior User')),
      email: userEmail || existing.email,
      elderCode: elderCareCode,
      delegateCaregiver: true,
      isCompleted: true, // Allows login to home
    };
    localStorage.setItem(`elder_profile_${userKey}`, JSON.stringify(delegatedProfile));
    localStorage.setItem('elder_profile', JSON.stringify(delegatedProfile));

    try {
      await profileApi.updateProfile({
        name: delegatedProfile.name,
        is_completed: true,
      });
    } catch (err) {
      console.warn('Backend profile delegation notice:', err);
    } finally {
      setSaving(false);
      navigate('/elder/dashboard');
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

      <div className="relative z-10 w-full max-w-lg bg-white/95 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),0_0_35px_rgba(16,185,129,0.2)] border border-white/90">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Health Profile Setup</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Step {step} of 3 • Custom ICMR Diet Guide</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-2 rounded-full transition-all ${
                  s === step ? 'bg-emerald-600 dark:bg-emerald-400 w-8' : s < step ? 'bg-emerald-500/40' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── DUAL ENTRY SELECTION (Self Entry vs Caregiver Code Entry) ── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Choose How Health Baseline Details Are Entered
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSetupMode('self')}
                  className={`p-4 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'self'
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">👵</span>
                    {setupMode === 'self' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-extrabold">Fill Details Myself</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Enter height, weight, and medical rules now.</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupMode('caregiver')}
                  className={`p-4 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'caregiver'
                      ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    {setupMode === 'caregiver' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-extrabold">Delegate to Caregiver</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Caregiver configures details via Code {elderCareCode}.</div>
                  </div>
                </button>
              </div>
            </div>

            {setupMode === 'caregiver' ? (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Unique Senior Care Code: <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg">{elderCareCode}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Share code <strong>{elderCareCode}</strong> with your daughter, son, or caregiver. They can log into the Caregiver Portal and fill all health metrics (height, weight, medical conditions) remotely on your behalf.
                </p>
                <button
                  type="button"
                  onClick={handleDelegateToCaregiver}
                  disabled={saving}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving to Database...' : 'Confirm Caregiver Delegation & Go to App ➔'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider pt-2">
                  <Activity className="w-4 h-4" /> Personal Health Baseline
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Age (Years)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-base font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-base font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-base font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daily Activity Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Light Walk', 'Yoga / Gentle', 'Rest / Sedentary'].map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setFormData({ ...formData, activityLevel: act })}
                        className={`py-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                          formData.activityLevel === act
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Health Conditions & Texture ── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Medical & Dietary Restrictions
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Health Conditions / Diseases (Select all that apply)</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Diabetes', label: 'Diabetes (Low Sugar)' },
                  { id: 'Hypertension', label: 'Hypertension (Low Sodium)' },
                  { id: 'High Uric Acid', label: 'High Uric Acid (Low Purine)' },
                  { id: 'Cardiac Health', label: 'Cardiac Care (Low Fat)' },
                  { id: 'Kidney Health', label: 'Kidney Health (Low Potas)' },
                  { id: 'Digestion', label: 'Sensitive Digestion' },
                ].map((item) => {
                  const isSelected = formData.conditions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCondition(item.id)}
                      className={`p-3 rounded-2xl text-xs font-extrabold border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Food Texture Preference</label>
              <div className="grid grid-cols-2 gap-2.5">
                {['Normal Meals', 'Soft Meals', 'Semi-Liquid Digest', 'Pureed Meals'].map((tex) => (
                  <button
                    key={tex}
                    type="button"
                    onClick={() => setFormData({ ...formData, chewability: tex })}
                    className={`py-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                      formData.chewability === tex
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Pan-Indian & Regional Cuisine & Fasting ── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Utensils className="w-4 h-4" /> All-India Cuisine Preference & Fasting
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Indian Cuisine Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Tamil Nadu (South Indian)',
                  'Kerala (South Indian)',
                  'Karnataka (South Indian)',
                  'Andhra & Telangana',
                  'Punjab & Haryana',
                  'UP & Delhi',
                  'Rajasthan',
                  'Maharashtra (West Indian)',
                  'Gujarat (West Indian)',
                  'West Bengal (East Indian)',
                  'Odisha (East Indian)',
                  'Pan-Indian Balanced',
                ].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setFormData({ ...formData, regionalCuisine: reg })}
                    className={`p-3 rounded-2xl text-xs font-extrabold border text-left transition-all cursor-pointer ${
                      formData.regionalCuisine === reg
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Diet Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['Vegetarian', 'Eggetarian', 'Non-Veg'].map((dt) => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setFormData({ ...formData, dietType: dt })}
                    className={`py-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                      formData.dietType === dt
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {/* SIMPLIFIED FASTING OPTION */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fasting Routine</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'None', label: 'No Fasting' },
                  { id: 'Fasting', label: 'Fasting Today' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, fastingRoutine: item.id })}
                    className={`py-3.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                      formData.fastingRoutine === item.id
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer Navigation Buttons ── */}
        {setupMode === 'self' && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer hover:scale-[1.02] transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {saving ? 'Saving to Database...' : 'Save Profile to Database'} <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
