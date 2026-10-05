import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit2, ChevronLeft, Save, Loader2 } from 'lucide-react';
import { profileApi } from '../../services/api';
import { Spinner, Card, AlertBanner, SectionHeader, PrimaryButton, GhostButton, Input, Select } from '../../components/UI';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const BLOOD_TYPES = [
  { value: '', label: 'Select blood type' },
  ...['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({ value: b, label: b }))
];

export default function EditElderly() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.get(id);
      const p = res.data;
      setForm({
        full_name: p.full_name || '',
        age: p.age || '',
        gender: p.gender || '',
        blood_type: p.blood_type || '',
        weight_kg: p.weight_kg || '',
        height_cm: p.height_cm || '',
        date_of_birth: p.date_of_birth || '',
        phone_number: p.phone_number || '',
        address: p.address || '',
        medical_notes: p.medical_notes || '',
      });
    } catch {
      setError('Could not load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        full_name: form.full_name,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        blood_type: form.blood_type || null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        date_of_birth: form.date_of_birth || null,
        phone_number: form.phone_number || null,
        address: form.address || null,
        medical_notes: form.medical_notes || null,
      };
      await profileApi.update(id, payload);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/caregiver/elderly'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (!form) return <AlertBanner type="error" message="Profile not found." />;

  const bmi = form.weight_kg && form.height_cm
    ? parseFloat(form.weight_kg) / ((parseFloat(form.height_cm) / 100) ** 2)
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        title="Edit Elderly Profile"
        subtitle="Update profile information"
        action={
          <GhostButton onClick={() => navigate('/caregiver/elderly')}>
            <ChevronLeft className="w-4 h-4" /> Back to List
          </GhostButton>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Information */}
        <Card className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-emerald-500" /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.full_name} onChange={set('full_name')}
              placeholder="Enter full name" required className="sm:col-span-2" />
            <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            <Input label="Age" type="number" value={form.age} onChange={set('age')} placeholder="Years" min={0} max={150} />
            <Select label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTIONS} />
            <Select label="Blood Type" value={form.blood_type} onChange={set('blood_type')} options={BLOOD_TYPES} />
          </div>
        </Card>

        {/* Physical Measurements */}
        <Card className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800">Physical Measurements</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Weight (kg)" type="number" value={form.weight_kg} onChange={set('weight_kg')}
              placeholder="e.g. 65" step="0.1" min={0} />
            <Input label="Height (cm)" type="number" value={form.height_cm} onChange={set('height_cm')}
              placeholder="e.g. 165" step="0.1" min={0} />
          </div>
          {bmi && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3">
              <p className="text-sm text-emerald-700 font-medium">
                BMI: <strong>{bmi.toFixed(1)}</strong>
                {' · '}
                {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese'}
              </p>
            </div>
          )}
        </Card>

        {/* Contact & Medical */}
        <Card className="space-y-5">
          <h3 className="text-sm font-bold text-slate-800">Contact & Medical Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Phone Number" value={form.phone_number} onChange={set('phone_number')} placeholder="Enter phone number" />
            <Input label="Address" value={form.address} onChange={set('address')} placeholder="Home address" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medical Notes</label>
            <textarea value={form.medical_notes} onChange={set('medical_notes')}
              placeholder="Any relevant medical notes, allergies, or special requirements..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <PrimaryButton type="submit" loading={saving}>
            <Save className="w-4 h-4" /> Save Changes
          </PrimaryButton>
          <GhostButton onClick={() => navigate('/caregiver/elderly')}>Cancel</GhostButton>
        </div>
      </form>
    </div>
  );
}
