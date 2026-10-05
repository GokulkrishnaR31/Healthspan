import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Calendar, Shield, PhoneCall, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { TapChip, LargeButton } from '../../components/ElderUI';
import api from '../../services/api';

const DIET_TYPES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
];

const FASTING_DAYS = [
  'Fasting Today',
  'No Fasting',
];

const ALLERGIES = [
  'Lactose / Milk',
  'Gluten / Wheat',
  'Peanuts / Nuts',
  'None / No Allergies',
];

const DIET_QUALITY = [
  { id: 'Poor', label: 'Poor' },
  { id: 'Average', label: 'Average' },
  { id: 'Good', label: 'Good' },
  { id: 'Excellent', label: 'Excellent' },
];

export default function ElderDietPreferences() {
  const navigate = useNavigate();
  const [dietType, setDietType] = useState('vegetarian');
  const [fastingDays, setFastingDays] = useState(['No Fasting']);
  const [allergies, setAllergies] = useState(['None / No Allergies']);
  const [dietQuality, setDietQuality] = useState('Good');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadExistingPrefs();
  }, []);

  const loadExistingPrefs = async () => {
    try {
      const res = await api.get('/elderly-profiles/me');
      const p = res.data;
      if (p.dietary_preference) setDietType(p.dietary_preference);
      if (p.allergies) {
        const allergyList = p.allergies.split(',').map(s => s.trim()).filter(Boolean);
        if (allergyList.length > 0) setAllergies(allergyList);
      }
      if (p.emergency_contact_info?.caregiver_phone) {
        setCaregiverPhone(p.emergency_contact_info.caregiver_phone);
      }
    } catch (err) {
      // Fresh setup
    }
    const savedPrefs = JSON.parse(localStorage.getItem('elder_diet_preferences') || '{}');
    if (savedPrefs.dietType) setDietType(savedPrefs.dietType);
    if (savedPrefs.fastingDays) setFastingDays(savedPrefs.fastingDays);
    if (savedPrefs.allergies) setAllergies(savedPrefs.allergies);
    if (savedPrefs.dietQuality) setDietQuality(savedPrefs.dietQuality);
    if (savedPrefs.caregiverPhone) setCaregiverPhone(savedPrefs.caregiverPhone);
  };

  const toggleFasting = (f) => {
    setFastingDays([f]);
  };

  const toggleAllergy = (a) => {
    if (a === 'None / No Allergies') {
      setAllergies(['None / No Allergies']);
      return;
    }
    const filtered = allergies.filter(item => item !== 'None / No Allergies');
    setAllergies(
      filtered.includes(a) ? filtered.filter(item => item !== a) : [...filtered, a]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    setSaveStatus('');

    const preferencesData = {
      dietType, fastingDays, allergies, dietQuality, caregiverPhone,
    };
    localStorage.setItem('elder_diet_preferences', JSON.stringify(preferencesData));

    const profileUpdatePayload = {
      dietary_preference: dietType,
      allergies: allergies.filter(a => a !== 'None / No Allergies').join(', ') || 'None',
      daily_calorie_goal: dietType === 'vegan' ? 1600 : dietType === 'vegetarian' ? 1700 : 1800,
      daily_water_goal: 2.5,
      emergency_contact_info: caregiverPhone ? { caregiver_phone: caregiverPhone } : undefined,
    };

    try {
      await api.put('/elderly-profiles/me', profileUpdatePayload);
      setSaveStatus('success');
    } catch (err) {
      console.warn('Backend save failed, using local storage:', err.message);
      setSaveStatus('offline');
    }

    setSaving(false);
    navigate('/elder/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 max-w-md mx-auto font-['Outfit'] space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">Step 2 of 2</span>
        <h1 className="text-2xl font-bold text-slate-900">Dietary Preferences</h1>
        <p className="text-[15px] text-slate-500">Tell us your traditional food habits and fasting status.</p>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> Preferences saved to server ✓
        </div>
      )}
      {saveStatus === 'offline' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600" /> Saved locally (will sync when online)
        </div>
      )}

      {/* Single Select Diet Type */}
      <div className="space-y-3">
        <label className="text-[16px] font-semibold text-slate-800 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-indigo-500" /> Diet Type
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {DIET_TYPES.map(d => (
            <TapChip
              key={d.id}
              label={d.label}
              selected={dietType === d.id}
              onClick={() => setDietType(d.id)}
            />
          ))}
        </div>
      </div>

      {/* Fasting Option */}
      <div className="space-y-3">
        <label className="text-[16px] font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" /> Fasting Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FASTING_DAYS.map(f => (
            <TapChip
              key={f}
              label={f}
              selected={fastingDays.includes(f)}
              onClick={() => toggleFasting(f)}
            />
          ))}
        </div>
      </div>

      {/* Multi-Select Allergies */}
      <div className="space-y-3">
        <label className="text-[16px] font-semibold text-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" /> Food Allergies
        </label>
        <div className="space-y-2">
          {ALLERGIES.map(a => (
            <TapChip
              key={a}
              label={a}
              selected={allergies.includes(a)}
              onClick={() => toggleAllergy(a)}
            />
          ))}
        </div>
      </div>

      {/* Diet Quality Rating */}
      <div className="space-y-3">
        <label className="text-[16px] font-semibold text-slate-800 block">Current Diet Quality</label>
        <div className="grid grid-cols-2 gap-2.5">
          {DIET_QUALITY.map(d => (
            <TapChip
              key={d.id}
              label={d.label}
              selected={dietQuality === d.id}
              onClick={() => setDietQuality(d.id)}
            />
          ))}
        </div>
      </div>

      {/* Caregiver Phone Number */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <label className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-indigo-500" /> Caregiver / Family Phone
        </label>
        <input
          type="tel"
          value={caregiverPhone}
          onChange={(e) => setCaregiverPhone(e.target.value)}
          placeholder="Enter caregiver phone number"
          className="w-full min-h-[48px] px-4 text-[16px] rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow"
        />
        <p className="text-xs text-slate-500">Weekly nutrition digests will be sent to this number via WhatsApp/SMS.</p>
      </div>

      <LargeButton onClick={handleFinish} disabled={saving} icon={saving ? Loader2 : CheckCircle}>
        {saving ? 'Saving Preferences…' : 'Save & View Dashboard'}
      </LargeButton>
    </div>
  );
}
