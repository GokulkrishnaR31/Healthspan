import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PhoneCall, UserPlus, Trash2, Heart, ShieldAlert, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const EmergencyContacts = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const fetchContacts = async (profId) => {
    try {
      const res = await api.get(`/emergency-contacts/profile/${profId}`);
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to retrieve contact records:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const profRes = await api.get('/elderly-profiles/me');
        const profData = profRes.data;
        setProfile(profData);
        await fetchContacts(profData.id);
      } catch (err) {
        console.error('Failed to load profile context:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initialize();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        elderly_profile_id: profile.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        relationship: relationship,
        is_primary: isPrimary,
      };

      await api.post('/emergency-contacts', payload);
      setMessage({ type: 'success', text: 'Emergency contact added successfully!' });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setPhone('');
      setRelationship('');
      setIsPrimary(false);
      setShowAddForm(false);
      
      // Refresh contacts
      await fetchContacts(profile.id);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to add emergency contact.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to remove this emergency contact?')) return;
    try {
      await api.delete(`/emergency-contacts/${contactId}`);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      setMessage({ type: 'success', text: 'Emergency contact removed.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete emergency contact.' });
    }
  };

  const handleTogglePrimary = async (contact) => {
    try {
      await api.put(`/emergency-contacts/${contact.id}`, {
        is_primary: !contact.is_primary,
      });
      setMessage({ type: 'success', text: 'Primary contact status updated.' });
      await fetchContacts(profile.id);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update contact priority.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-purple-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4 mt-12">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
        <h2 className="text-xl font-bold text-slate-800">Profile Required</h2>
        <p className="text-sm text-slate-500">Please set up your elderly health profile first in the profile settings tab.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Emergency Contacts</h1>
          <p className="text-slate-500 text-sm">Add primary and backup caregivers to notify during critical events</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-md shadow-purple-600/10 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? 'View Contacts' : 'Add Contact'}
        </button>
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

      {showAddForm ? (
        /* Form Card */
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <PhoneCall className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-800">New Contact Details</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relationship</label>
              <input
                type="text"
                required
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Enter relationship (e.g. Daughter, Caregiver)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all duration-200"
              />
            </div>

            <div className="col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded-sm border-slate-300 text-purple-600 focus:ring-purple-500/20"
              />
              <label htmlFor="isPrimary" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                Mark as Primary Emergency Contact
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 disabled:opacity-50 shadow-md shadow-purple-600/10 cursor-pointer text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Contact...
              </>
            ) : (
              'Save Contact'
            )}
          </button>
        </form>
      ) : (
        /* List Contacts Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-lg">
                      {contact.first_name} {contact.last_name}
                    </h3>
                    {contact.is_primary && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-red-700" />
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{contact.relationship}</p>
                </div>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 cursor-pointer"
                  title="Remove Contact"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="text-sm font-semibold text-slate-600">
                  <span className="text-slate-400 font-normal">Phone:</span> {contact.phone}
                </div>

                <button
                  onClick={() => handleTogglePrimary(contact)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    contact.is_primary
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {contact.is_primary ? 'Demote Primary' : 'Make Primary'}
                </button>
              </div>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-xs text-slate-400 space-y-2">
              <PhoneCall className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No emergency contacts logged.</p>
              <p className="text-xs">Add a contact to receive instant alert notifications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
