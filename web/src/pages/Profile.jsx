import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Heart, ShieldAlert, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodType, setBloodType] = useState('');
  
  // Diseases & Conditions states
  const [allConditions, setAllConditions] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // 1. Fetch conditions & diseases list
        const [condRes, disRes] = await Promise.all([
          api.get('/health-conditions'),
          api.get('/diseases'),
        ]);
        setAllConditions(condRes.data);
        setAllDiseases(disRes.data);

        // 2. Fetch active profile
        try {
          const profRes = await api.get('/elderly-profiles/me');
          const profData = profRes.data;
          setProfile(profData);
          
          if (profData.date_of_birth) setDateOfBirth(profData.date_of_birth.split('T')[0]);
          if (profData.gender) setGender(profData.gender);
          if (profData.height_cm) setHeightCm(profData.height_cm);
          if (profData.weight_kg) setWeightKg(profData.weight_kg);
          if (profData.blood_type) setBloodType(profData.blood_type);

          setSelectedConditions(profData.health_conditions.map(c => c.id));
          setSelectedDiseases(profData.diseases.map(d => d.id));
        } catch (err) {
          console.log('No profile registered yet.');
        }
      } catch (err) {
        console.error('Failed to load listing databases:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        blood_type: bloodType || null,
      };

      let activeProfileId = profile?.id;

      if (!profile) {
        // If no profile, we create a new one. Wait, in auth/register, we automatically created profile!
        // So a profile should always exist. But if not, we can handle it or let it fail gracefully.
        // We'll update the profile:
        const createRes = await api.post('/elderly-profiles', {
          user_id: user.id,
          ...payload
        });
        setProfile(createRes.data);
        activeProfileId = createRes.data.id;
      } else {
        const updateRes = await api.put('/elderly-profiles/me', payload);
        setProfile(updateRes.data);
      }

      // Sync health conditions associations
      const initialConditions = profile?.health_conditions.map(c => c.id) || [];
      const addedConditions = selectedConditions.filter(id => !initialConditions.includes(id));
      const removedConditions = initialConditions.filter(id => !selectedConditions.includes(id));

      await Promise.all([
        ...addedConditions.map(id => api.post(`/health-conditions/elderly-profiles/${activeProfileId}/health-conditions/${id}`)),
        ...removedConditions.map(id => api.delete(`/health-conditions/elderly-profiles/${activeProfileId}/health-conditions/${id}`)),
      ]);

      // Sync diseases associations
      const initialDiseases = profile?.diseases.map(d => d.id) || [];
      const addedDiseases = selectedDiseases.filter(id => !initialDiseases.includes(id));
      const removedDiseases = initialDiseases.filter(id => !selectedDiseases.includes(id));

      await Promise.all([
        ...addedDiseases.map(id => api.post(`/diseases/elderly-profiles/${activeProfileId}/diseases/${id}`)),
        ...removedDiseases.map(id => api.delete(`/diseases/elderly-profiles/${activeProfileId}/diseases/${id}`)),
      ]);

      // Fetch fresh profile state to reflect changes
      const freshProf = await api.get('/elderly-profiles/me');
      setProfile(freshProf.data);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCondition = (id) => {
    setSelectedConditions(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleDisease = (id) => {
    setSelectedDiseases(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-purple-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Elderly Health Profile</h1>
        <p className="text-slate-500 text-sm">Configure weight, height, health conditions, and chronic diseases</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm ${
          message.type === 'success'
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form: Parameters */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
            <User className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-800">Physical Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-md shadow-purple-600/10 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>

        {/* Right Form: Conditions & Diseases checkboxes */}
        <div className="space-y-6">
          {/* Health Conditions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Heart className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-800">Health Conditions</h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {allConditions.map(cond => (
                <label key={cond.id} className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(cond.id)}
                    onChange={() => toggleCondition(cond.id)}
                    className="mt-1 rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500/20"
                  />
                  <span>{cond.name}</span>
                </label>
              ))}
              {allConditions.length === 0 && <p className="text-xs text-slate-400">No conditions configured.</p>}
            </div>
          </div>

          {/* Diseases */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-800">Chronic Diseases</h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {allDiseases.map(dis => (
                <label key={dis.id} className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={selectedDiseases.includes(dis.id)}
                    onChange={() => toggleDisease(dis.id)}
                    className="mt-1 rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500/20"
                  />
                  <span>{dis.name}</span>
                </label>
              ))}
              {allDiseases.length === 0 && <p className="text-xs text-slate-400">No diseases configured.</p>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
