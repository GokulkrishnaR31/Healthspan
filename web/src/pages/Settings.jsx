import React, { useState, useEffect } from 'react';
import { Settings2, Globe, Moon, Sun, Bell, BellOff, Shield, RefreshCw, Save } from 'lucide-react';
import { settingsApi } from '../services/api';
import { Spinner, Card, AlertBanner, SectionHeader, PrimaryButton, GhostButton, Badge } from '../components/UI';

const LANGUAGES = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'ar', label: '🇸🇦 Arabic' },
  { value: 'zh', label: '🇨🇳 Chinese' },
  { value: 'hi', label: '🇮🇳 Hindi' },
];

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Clean white background' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Settings2, desc: 'Follow OS preference' },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    theme: 'light',
    language: 'en',
    email_notifications: true,
    push_notifications: false,
    weekly_report: true,
    daily_reminder: true,
    health_alerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await settingsApi.get();
      const s = res.data;
      setSettings(s);
      setForm({
        theme: s.theme || 'light',
        language: s.language || 'en',
        email_notifications: s.email_notifications ?? true,
        push_notifications: s.push_notifications ?? false,
        weekly_report: s.weekly_report ?? true,
        daily_reminder: s.daily_reminder ?? true,
        health_alerts: s.health_alerts ?? true,
      });
    } catch {
      setError('Could not load settings. Default values are shown.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await settingsApi.update(form);
      setSettings(res.data);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-violet-600' : 'bg-slate-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader
        title="Settings"
        subtitle="Customize your HealthSpan experience"
        action={<GhostButton onClick={loadSettings}><RefreshCw className="w-4 h-4" /> Reset</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Theme */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" /> Appearance
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.value} onClick={() => setForm(f => ({ ...f, theme: t.value }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.theme === t.value
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50'
                }`}>
                <Icon className={`w-5 h-5 ${form.theme === t.value ? 'text-violet-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${form.theme === t.value ? 'text-violet-700' : 'text-slate-600'}`}>{t.label}</span>
                <span className="text-[10px] text-slate-400 text-center">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Language */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-500" /> Language
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <button key={lang.value} onClick={() => setForm(f => ({ ...f, language: lang.value }))}
              className={`px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all ${
                form.language === lang.value
                  ? 'border-violet-400 bg-violet-50 text-violet-700'
                  : 'border-slate-200 hover:border-violet-200 text-slate-600'
              }`}>
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="space-y-2">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-violet-500" /> Notification Preferences
        </h3>
        <div className="divide-y divide-slate-50">
          <Toggle label="Email Notifications" desc="Receive reports and alerts via email"
            value={form.email_notifications} onChange={v => setForm(f => ({ ...f, email_notifications: v }))} />
          <Toggle label="Push Notifications" desc="Browser push notifications"
            value={form.push_notifications} onChange={v => setForm(f => ({ ...f, push_notifications: v }))} />
          <Toggle label="Weekly Health Report" desc="Auto-generated report every Monday"
            value={form.weekly_report} onChange={v => setForm(f => ({ ...f, weekly_report: v }))} />
          <Toggle label="Daily Meal Reminder" desc="Reminder to log your meals each day"
            value={form.daily_reminder} onChange={v => setForm(f => ({ ...f, daily_reminder: v }))} />
          <Toggle label="Health Alerts" desc="Critical health score and nutrition alerts"
            value={form.health_alerts} onChange={v => setForm(f => ({ ...f, health_alerts: v }))} />
        </div>
      </Card>

      {/* Privacy */}
      <Card className="space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" /> Privacy & Security
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-700">Data Encryption</p>
              <p className="text-xs text-slate-400">All data is encrypted at rest and in transit</p>
            </div>
            <Badge label="Active" color="emerald" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-700">JWT Authentication</p>
              <p className="text-xs text-slate-400">Secure token-based session management</p>
            </div>
            <Badge label="Active" color="emerald" />
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <GhostButton onClick={loadSettings}>Discard Changes</GhostButton>
        <PrimaryButton onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" /> Save Settings
        </PrimaryButton>
      </div>
    </div>
  );
}
