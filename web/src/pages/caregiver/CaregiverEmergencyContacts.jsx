import React, { useState, useEffect } from 'react';
import { PhoneCall, Plus, Edit2, Trash2, RefreshCw, Star, AlertCircle, ChevronDown, Users } from 'lucide-react';
import { profileApi, emergencyContactApi } from '../../services/api';
import { Spinner, Card, Badge, AlertBanner, SectionHeader, PrimaryButton, GhostButton, Input, Select, EmptyState } from '../../components/UI';

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'other', label: 'Other' },
];

const emptyForm = { name: '', phone_number: '', relationship: '', priority: 1, is_primary: false };

export default function CaregiverEmergencyContacts() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadProfiles(); }, []);
  useEffect(() => { if (selectedId) loadContacts(); }, [selectedId]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await profileApi.list();
      const list = res.data || [];
      setProfiles(list);
      if (list.length) setSelectedId(list[0].id);
    } catch { setError('Could not load profiles.'); }
    finally { setLoading(false); }
  };

  const loadContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await emergencyContactApi.listForProfile(selectedId);
      setContacts(res.data || []);
    } catch { setError('Failed to load contacts.'); }
    finally { setLoading(false); }
  };

  const openEdit = (contact) => {
    setEditContact(contact);
    setForm({
      name: contact.name || '',
      phone_number: contact.phone_number || '',
      relationship: contact.relationship || '',
      priority: contact.priority || 1,
      is_primary: contact.is_primary || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditContact(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone_number.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        elderly_profile_id: selectedId,
        name: form.name,
        phone_number: form.phone_number,
        relationship: form.relationship || null,
        priority: parseInt(form.priority),
        is_primary: form.is_primary,
      };
      if (editContact) {
        await emergencyContactApi.update(editContact.id, payload);
        setSuccess('Contact updated!');
      } else {
        await emergencyContactApi.create(payload);
        setSuccess('Contact added!');
      }
      resetForm();
      await loadContacts();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    try {
      await emergencyContactApi.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      setSuccess('Contact deleted.');
      setTimeout(() => setSuccess(''), 2000);
    } catch { setError('Failed to delete contact.'); }
  };

  const sortedContacts = [...contacts].sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const selectedProfile = profiles.find(p => p.id === selectedId);
  const profileName = selectedProfile?.full_name || `${selectedProfile?.first_name || ''} ${selectedProfile?.last_name || ''}`.trim() || 'Profile';

  if (loading && !profiles.length) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Emergency Contacts"
        subtitle="Manage emergency contacts for elderly profiles"
        action={
          <div className="flex gap-2">
            <GhostButton onClick={loadContacts}><RefreshCw className="w-4 h-4" /></GhostButton>
            {selectedId && (
              <PrimaryButton onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="w-4 h-4" /> Add Contact
              </PrimaryButton>
            )}
          </div>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {profiles.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No profiles available. Add an elderly profile first.</p>
        </Card>
      ) : (
        <>
          {/* Profile selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Viewing contacts for:</label>
            <div className="relative">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none pr-8 min-w-48">
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <Card className="space-y-4 border-emerald-100">
              <h3 className="text-base font-bold text-slate-800">
                {editContact ? 'Edit Contact' : `Add Emergency Contact for ${profileName}`}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Contact full name" required />
                  <Input label="Phone Number *" value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                    placeholder="+1 (555) 000-0000" required />
                  <Select label="Relationship" value={form.relationship}
                    onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                    options={RELATIONSHIP_OPTIONS} />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority (1 = highest)</label>
                    <input type="number" min={1} max={10} value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <input type="checkbox" checked={form.is_primary} onChange={e => setForm(f => ({ ...f, is_primary: e.target.checked }))}
                    className="w-4 h-4 rounded accent-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Primary contact (receives all alerts first)</span>
                </label>
                <div className="flex gap-3">
                  <PrimaryButton type="submit" loading={saving}>
                    {editContact ? <><Edit2 className="w-4 h-4" /> Update</> : <><Plus className="w-4 h-4" /> Add Contact</>}
                  </PrimaryButton>
                  <GhostButton onClick={resetForm}>Cancel</GhostButton>
                </div>
              </form>
            </Card>
          )}

          {/* Contacts List */}
          {loading ? <Spinner className="h-32" /> : sortedContacts.length === 0 ? (
            <EmptyState icon={PhoneCall} title="No emergency contacts"
              description="Add emergency contacts for this elderly profile"
              action={<PrimaryButton onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Contact</PrimaryButton>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedContacts.map(contact => (
                <div key={contact.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 hover:shadow-md transition-shadow ${
                    contact.is_primary ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-100'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 ${
                        contact.is_primary ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        {contact.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{contact.name}</p>
                        {contact.relationship && <p className="text-xs text-slate-400 capitalize">{contact.relationship}</p>}
                      </div>
                    </div>
                    {contact.is_primary && (
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" /> Primary
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{contact.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500">Priority: {contact.priority || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => openEdit(contact)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(contact.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
