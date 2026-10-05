import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Activity, MapPin, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { TapChip, LargeButton } from '../../components/ElderUI';
import api from '../../services/api';

const REGIONS = [
  { id: 'Tamil Nadu', label: 'Tamil Nadu 🌴' },
  { id: 'Kerala', label: 'Kerala 🥥' },
  { id: 'Karnataka', label: 'Karnataka 🌾' },
  { id: 'Andhra Pradesh', label: 'Andhra Pradesh 🌶️' },
];

const HEALTH_CONDITIONS = [
  'Osteoporosis risk',
  'Diabetes',
  'Joint pain',
  'Hypertension',
  'Cognitive concern',
];

export default function ElderHealthSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('65');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('160');
  const [weight, setWeight] = useState('62');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [region, setRegion] = useState('Tamil Nadu');
  const [isSmoker, setIsSmoker] = useState(false);
  const [hasChronicDisease, setHasChronicDisease] = useState(false);
  const [alcohol, setAlcohol] = useState('None');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill from logged in user + load existing profile data
  useEffect(() => {
    if (user?.first_name || user?.last_name) {
      setFullName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
    }
    // Load existing profile from backend
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    try {
      const res = await api.get('/elderly-profiles/me');
      const p = res.data;
      if (p.gender) setGender(p.gender);
      if (p.height_cm) setHeight(String(p.height_cm));
      if (p.weight_kg) setWeight(String(p.weight_kg));
      if (p.date_of_birth) {
        const dob = new Date(p.date_of_birth);
        const today = new Date();
        const calculatedAge = today.getFullYear() - dob.getFullYear();
        setAge(String(calculatedAge));
      }
      if (p.address) setRegion(p.address);
      if (p.allergies) {
        // Store allergies in conditions state for display
      }
      if (p.activity_level) {
        // map activity level
      }
      // Load saved local state as fallback supplement
      const savedSetup = JSON.parse(localStorage.getItem('elder_health_setup') || '{}');
      if (savedSetup.selectedConditions) setSelectedConditions(savedSetup.selectedConditions);
      if (savedSetup.isSmoker !== undefined) setIsSmoker(savedSetup.isSmoker);
      if (savedSetup.hasChronicDisease !== undefined) setHasChronicDisease(savedSetup.hasChronicDisease);
      if (savedSetup.alcohol) setAlcohol(savedSetup.alcohol);
    } catch (err) {
      // No existing profile — fresh setup
      const savedSetup = JSON.parse(localStorage.getItem('elder_health_setup') || '{}');
      if (savedSetup.selectedConditions) setSelectedConditions(savedSetup.selectedConditions);
      if (savedSetup.isSmoker !== undefined) setIsSmoker(savedSetup.isSmoker);
      if (savedSetup.hasChronicDisease !== undefined) setHasChronicDisease(savedSetup.hasChronicDisease);
      if (savedSetup.alcohol) setAlcohol(savedSetup.alcohol);
    }
  };

  const toggleCondition = (cond) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const handleNext = async () => {
    setSaving(true);
    setSaveStatus('');
    setErrorMsg('');

    // Calculate DOB from age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age, 10);
    const dateOfBirth = `${birthYear}-01-01`;

    const profilePayload = {
      date_of_birth: dateOfBirth,
      gender: gender,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      address: region,
      activity_level: hasChronicDisease ? 'limited' : 'moderate',
      medications: selectedConditions.join(', '),
    };

    // Save to backend
    try {
      await api.put('/elderly-profiles/me', profilePayload);
      setSaveStatus('success');
    } catch (err) {
      console.warn('Backend save failed, using local storage fallback:', err.message);
      setSaveStatus('offline');
    }

    // Always save to localStorage as local state
    const setupData = {
      fullName: fullName || (user ? `${user.first_name} ${user.last_name}` : 'User'),
      age: parseInt(age, 10),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      silentBmi: (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1),
      selectedConditions,
      region,
      isSmoker,
      hasChronicDisease,
      alcohol,
    };
    localStorage.setItem('elder_health_setup', JSON.stringify(setupData));

    setSaving(false);
    navigate('/elder/diet-preferences');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 max-w-2xl mx-auto font-['Outfit'] space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs font-extrabold uppercase text-[#1D9E75] tracking-wider">Step 1 of 2</span>
        <h1 className="text-2xl font-extrabold text-slate-900">Health Profile Setup</h1>
        <p className="text-[16px] text-slate-600 font-medium">Help us tailor your nutrition plan to your body and region.</p>
      </div>

      {/* Save Status Banners */}
      {saveStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Profile saved to server ✓
        </div>
      )}
      {saveStatus === 'offline' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600" /> Saved locally (will sync when online)
        </div>
      )}

      {/* Basic Inputs */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <label className="text-[17px] font-bold text-slate-800 block mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full min-h-[48px] px-4 text-[17px] font-bold rounded-2xl border-2 border-slate-200 focus:border-[#1D9E75] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[17px] font-bold text-slate-800 block mb-1">Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="40"
              max="110"
              className="w-full min-h-[48px] px-4 text-[17px] font-bold rounded-2xl border-2 border-slate-200 focus:border-[#1D9E75] outline-none"
            />
          </div>

          <div>
            <label className="text-[17px] font-bold text-slate-800 block mb-1">Gender</label>
            <div className="flex gap-1">
              {['Female', 'Male', 'Other'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 min-h-[48px] text-[14px] font-bold rounded-xl border-2 transition-all ${
                    gender === g ? 'border-[#1D9E75] bg-[#E8F6F1] text-[#147556]' : 'border-slate-200 bg-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[17px] font-bold text-slate-800 block mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="100"
              max="220"
              className="w-full min-h-[48px] px-4 text-[17px] font-bold rounded-2xl border-2 border-slate-200 focus:border-[#1D9E75] outline-none"
            />
          </div>

          <div>
            <label className="text-[17px] font-bold text-slate-800 block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="20"
              max="200"
              className="w-full min-h-[48px] px-4 text-[17px] font-bold rounded-2xl border-2 border-slate-200 focus:border-[#1D9E75] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Multi-Select Health Conditions */}
      <div className="space-y-3">
        <label className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#1D9E75]" /> Health Concerns (Tap to select)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HEALTH_CONDITIONS.map(cond => (
            <TapChip
              key={cond}
              label={cond}
              selected={selectedConditions.includes(cond)}
              onClick={() => toggleCondition(cond)}
            />
          ))}
        </div>
      </div>

      {/* Regional Select Chips */}
      <div className="space-y-3">
        <label className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#1D9E75]" /> State / Region
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {REGIONS.map(r => (
            <TapChip
              key={r.id}
              label={r.label}
              selected={region === r.id}
              onClick={() => setRegion(r.id)}
            />
          ))}
        </div>
      </div>

      {/* Yes/No Tap Buttons */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold text-slate-800">Do you smoke?</span>
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setIsSmoker(v)}
                className={`min-h-[48px] px-5 rounded-2xl font-bold border-2 transition-all ${
                  isSmoker === v
                    ? v ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-[#1D9E75] bg-[#E8F6F1] text-[#147556]'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold text-slate-800">Chronic condition history?</span>
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setHasChronicDisease(v)}
                className={`min-h-[48px] px-5 rounded-2xl font-bold border-2 transition-all ${
                  hasChronicDisease === v
                    ? 'border-[#1D9E75] bg-[#E8F6F1] text-[#147556]'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alcohol Consumption */}
      <div className="space-y-3">
        <label className="text-[18px] font-bold text-slate-900 block">Alcohol Intake</label>
        <div className="grid grid-cols-2 gap-2">
          {['None', 'Low', 'Moderate', 'High'].map(opt => (
            <TapChip
              key={opt}
              label={opt}
              selected={alcohol === opt}
              onClick={() => setAlcohol(opt)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={saving}
        className="w-full min-h-[56px] bg-[#1D9E75] hover:bg-[#147556] text-white rounded-3xl font-extrabold text-[18px] flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70"
      >
        {saving ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Saving Profile…</>
        ) : (
          <>Continue to Diet Preferences <ArrowRight className="w-5 h-5" /></>
        )}
      </button>
    </div>
  );
}
