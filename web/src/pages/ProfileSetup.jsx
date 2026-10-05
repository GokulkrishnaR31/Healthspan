import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Card, PrimaryButton, GhostButton, Input, Select, Spinner, AlertBanner
} from '../components/UI';
import {
  User, Heart, Activity, Phone, Mail, MapPin, ShieldAlert,
  Calendar, Check, ChevronLeft, ChevronRight, Save
} from 'lucide-react';

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State metadata
  const [profile, setProfile] = useState(null);
  const [allDiseases, setAllDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Form states - Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Form states - Medical
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyContactId, setEmergencyContactId] = useState(null);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Child');

  // Form states - Lifestyle
  const [activityLevel, setActivityLevel] = useState('Sedentary');
  const [dietaryPreference, setDietaryPreference] = useState('None');
  const [waterGoal, setWaterGoal] = useState('2000');
  const [calorieGoal, setCalorieGoal] = useState('2000');

  // Calculate age from Date of Birth
  useEffect(() => {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge : '');
    } else {
      setAge('');
    }
  }, [dateOfBirth]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load static list of diseases
        const diseasesRes = await api.get('/diseases');
        setAllDiseases(diseasesRes.data);

        // Pre-fill user data
        if (user) {
          setFirstName(user.first_name || '');
          setLastName(user.last_name || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        }

        // Load active profile
        try {
          const profileRes = await api.get('/elderly-profiles/me');
          const p = profileRes.data;
          setProfile(p);

          // Fill existing profile info
          if (p.date_of_birth) setDateOfBirth(p.date_of_birth.split('T')[0]);
          if (p.gender) setGender(p.gender);
          if (p.height_cm) setHeightCm(p.height_cm.toString());
          if (p.weight_kg) setWeightKg(p.weight_kg.toString());
          if (p.blood_type) setBloodType(p.blood_type);
          
          // Custom columns
          if (p.address) setAddress(p.address);
          if (p.allergies) setAllergies(p.allergies);
          if (p.medications) setMedications(p.medications);
          if (p.activity_level) setActivityLevel(p.activity_level);
          if (p.dietary_preference) setDietaryPreference(p.dietary_preference);
          if (p.daily_water_goal) setWaterGoal(p.daily_water_goal.toString());
          if (p.daily_calorie_goal) setCalorieGoal(p.daily_calorie_goal.toString());

          // Load diseases
          if (p.diseases) {
            setSelectedDiseases(p.diseases.map(d => d.id));
          }

          // Fetch emergency contacts
          const contactRes = await api.get(`/emergency-contacts/profile/${p.id}`);
          const contacts = contactRes.data;
          if (contacts && contacts.length > 0) {
            const primaryContact = contacts.find(c => c.is_primary) || contacts[0];
            setEmergencyContactId(primaryContact.id);
            setEmergencyName(`${primaryContact.first_name} ${primaryContact.last_name}`.trim());
            setEmergencyPhone(primaryContact.phone);
            setEmergencyRelationship(primaryContact.relationship || 'Child');
          }
        } catch (err) {
          console.log('No profile exists yet or failed to load. Will create new profile on submit.');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to fetch required database values.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  const toggleDisease = (id) => {
    setSelectedDiseases(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // 1. Update user details (Name & Phone)
      await api.put('/users/me', {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      });

      // 2. Prepare profile payload
      const profilePayload = {
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        blood_type: bloodType || null,
        address: address || null,
        allergies: allergies || null,
        medications: medications || null,
        activity_level: activityLevel || null,
        dietary_preference: dietaryPreference || null,
        daily_water_goal: waterGoal ? parseFloat(waterGoal) : null,
        daily_calorie_goal: calorieGoal ? parseFloat(calorieGoal) : null,
      };

      let activeProfile = null;
      if (profile) {
        // Update existing profile
        const res = await api.put('/elderly-profiles/me', profilePayload);
        activeProfile = res.data;
      } else {
        // Create profile
        const res = await api.post('/elderly-profiles', {
          user_id: user.id,
          ...profilePayload,
        });
        activeProfile = res.data;
      }

      const activeProfileId = activeProfile.id;

      // 3. Save Emergency Contact details
      if (emergencyName && emergencyPhone) {
        // Split full name into first and last name
        const nameParts = emergencyName.trim().split(/\s+/);
        const contactFirstName = nameParts[0] || 'Contact';
        const contactLastName = nameParts.slice(1).join(' ') || 'Emergency';

        const contactPayload = {
          elderly_profile_id: activeProfileId,
          first_name: contactFirstName,
          last_name: contactLastName,
          phone: emergencyPhone,
          relationship: emergencyRelationship,
          is_primary: true,
        };

        if (emergencyContactId) {
          // Update existing
          await api.put(`/emergency-contacts/${emergencyContactId}`, contactPayload);
        } else {
          // Create new
          await api.post('/emergency-contacts', contactPayload);
        }
      }

      // 4. Sync chronic diseases
      const initialDiseases = profile?.diseases?.map(d => d.id) || [];
      const addedDiseases = selectedDiseases.filter(id => !initialDiseases.includes(id));
      const removedDiseases = initialDiseases.filter(id => !selectedDiseases.includes(id));

      await Promise.all([
        ...addedDiseases.map(id => api.post(`/diseases/elderly-profiles/${activeProfileId}/diseases/${id}`)),
        ...removedDiseases.map(id => api.delete(`/diseases/elderly-profiles/${activeProfileId}/diseases/${id}`)),
      ]);

      // Redirect back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.detail || 'An error occurred while saving your profile. Please check validation limits.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Set Up Your Profile</h1>
        <p className="text-slate-500 text-sm">Please tell us more about your health and lifestyle metrics to calibrate calculations</p>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center max-w-md mx-auto px-4">
        {[
          { stepNum: 1, label: 'Personal', icon: User },
          { stepNum: 2, label: 'Medical', icon: Heart },
          { stepNum: 3, label: 'Lifestyle', icon: Activity },
        ].map(item => (
          <div key={item.stepNum} className="flex flex-col items-center gap-1.5 relative flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm transition-all duration-300 ${
              step >= item.stepNum
                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {step > item.stepNum ? <Check className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-semibold tracking-wide uppercase ${step >= item.stepNum ? 'text-purple-600' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <Card padding="p-8" className="shadow-lg border-slate-100/50">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
              <Input
                label="Email (Read-only)"
                type="email"
                disabled
                value={email}
                placeholder="Enter email address"
                className="opacity-70"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 leading-tight h-10.5 flex items-center">
                  {age ? `${age} years old` : 'Select Date of Birth'}
                </div>
              </div>
              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
              <Select
                label="Blood Group"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                options={[
                  { value: '', label: 'Select Blood Group' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
              />
              <Input
                label="Height (cm)"
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
              />
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                min="5"
                max="500"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="70"
              />
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, City, Zipcode"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <PrimaryButton type="submit" className="px-6 py-3">
                Next Step <ChevronRight className="w-4 h-4" />
              </PrimaryButton>
            </div>
          </form>
        )}

        {/* Step 2: Medical Information */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800">Medical Information</h3>
            </div>

            <div className="space-y-5">
              {/* Chronic Diseases checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Existing Chronic Diseases
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
                  {allDiseases.map(disease => (
                    <label key={disease.id} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedDiseases.includes(disease.id)}
                        onChange={() => toggleDisease(disease.id)}
                        className="rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500/20"
                      />
                      <span>{disease.name}</span>
                    </label>
                  ))}
                  {allDiseases.length === 0 && <p className="text-xs text-slate-400 col-span-3">No chronic diseases configured in system database.</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Allergies</label>
                  <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="List food, environmental, or chemical allergies (e.g. Peanuts, Lactose, Penicillin)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all h-20 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Medications</label>
                  <textarea
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="List daily medications, doses, and schedules (e.g. Lisinopril 10mg once daily)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all h-20 resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <h4 className="text-md font-bold text-slate-800">Primary Emergency Contact</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Input
                  label="Contact Full Name"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Enter contact full name"
                  className="md:col-span-1"
                />
                <Input
                  label="Contact Phone"
                  required
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Enter contact phone number"
                  className="md:col-span-1"
                />
                <Select
                  label="Relationship"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  options={[
                    { value: 'Child', label: 'Child' },
                    { value: 'Spouse', label: 'Spouse' },
                    { value: 'Caregiver', label: 'Caregiver' },
                    { value: 'Relative', label: 'Other Relative' },
                    { value: 'Friend', label: 'Friend' },
                  ]}
                  className="md:col-span-1"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <GhostButton onClick={handleBack} className="px-5 py-3">
                <ChevronLeft className="w-4 h-4" /> Back
              </GhostButton>
              <PrimaryButton type="submit" className="px-6 py-3">
                Next Step <ChevronRight className="w-4 h-4" />
              </PrimaryButton>
            </div>
          </form>
        )}

        {/* Step 3: Lifestyle & Goals */}
        {step === 3 && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800">Lifestyle & Goals</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Physical Activity Level"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                options={[
                  { value: 'Sedentary', label: 'Sedentary (Little/no exercise)' },
                  { value: 'Lightly Active', label: 'Lightly Active (Light exercise 1-3 days/week)' },
                  { value: 'Moderately Active', label: 'Moderately Active (Moderate exercise 3-5 days/week)' },
                  { value: 'Very Active', label: 'Very Active (Hard exercise 6-7 days/week)' },
                ]}
              />
              <Select
                label="Dietary Preference"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                options={[
                  { value: 'None', label: 'None (Eat everything)' },
                  { value: 'Vegetarian', label: 'Vegetarian' },
                  { value: 'Vegan', label: 'Vegan' },
                  { value: 'Gluten-Free', label: 'Gluten-Free' },
                  { value: 'Diabetic-Friendly', label: 'Diabetic-Friendly' },
                ]}
              />
              <Input
                label="Daily Water Goal (ml)"
                type="number"
                min="500"
                max="10000"
                required
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                placeholder="2000"
              />
              <Input
                label="Daily Calorie Goal (kcal)"
                type="number"
                min="500"
                max="8000"
                required
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                placeholder="2000"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <GhostButton onClick={handleBack} className="px-5 py-3">
                <ChevronLeft className="w-4 h-4" /> Back
              </GhostButton>
              <PrimaryButton type="submit" loading={saving} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 shadow-purple-600/10">
                <Save className="w-4 h-4" /> Save Profile Details
              </PrimaryButton>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
