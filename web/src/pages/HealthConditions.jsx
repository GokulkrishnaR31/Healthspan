import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Tag, AlertCircle, ClipboardList, RefreshCw } from 'lucide-react';
import { profileApi, healthConditionApi, diseaseApi } from '../services/api';
import { Spinner, Card, Badge, AlertBanner, SectionHeader, PrimaryButton, GhostButton, EmptyState } from '../components/UI';

export default function HealthConditions() {
  const [profile, setProfile] = useState(null);
  const [allConditions, setAllConditions] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);
  const [profileConditions, setProfileConditions] = useState([]);
  const [profileDiseases, setProfileDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [condSearch, setCondSearch] = useState('');
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [activeTab, setActiveTab] = useState('conditions');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await profileApi.myProfile();
      const p = profileRes.data;
      setProfile(p);

      const [allCondRes, allDisRes, profCondRes, profDisRes] = await Promise.allSettled([
        healthConditionApi.listAll(),
        diseaseApi.listAll(),
        healthConditionApi.listForProfile(p.id),
        diseaseApi.listForProfile(p.id),
      ]);

      if (allCondRes.status === 'fulfilled') setAllConditions(allCondRes.value.data || []);
      if (allDisRes.status === 'fulfilled') setAllDiseases(allDisRes.value.data || []);
      if (profCondRes.status === 'fulfilled') setProfileConditions(profCondRes.value.data || []);
      if (profDisRes.status === 'fulfilled') setProfileDiseases(profDisRes.value.data || []);
    } catch {
      setError('Could not load health conditions. Please check your profile.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = async (condition) => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const linked = profileConditions.some(pc => pc.id === condition.id);
    try {
      if (linked) {
        await healthConditionApi.remove(profile.id, condition.id);
        setProfileConditions(prev => prev.filter(pc => pc.id !== condition.id));
      } else {
        await healthConditionApi.add(profile.id, condition.id);
        setProfileConditions(prev => [...prev, condition]);
      }
      setSuccess(`${condition.name} ${linked ? 'removed' : 'added'} successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update health condition.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDisease = async (disease) => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const linked = profileDiseases.some(pd => pd.id === disease.id);
    try {
      if (linked) {
        await diseaseApi.remove(profile.id, disease.id);
        setProfileDiseases(prev => prev.filter(pd => pd.id !== disease.id));
      } else {
        await diseaseApi.add(profile.id, disease.id);
        setProfileDiseases(prev => [...prev, disease]);
      }
      setSuccess(`${disease.name} ${linked ? 'removed' : 'added'} successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update chronic disease.');
    } finally {
      setSaving(false);
    }
  };

  const filteredConditions = allConditions.filter(c =>
    c.name?.toLowerCase().includes(condSearch.toLowerCase())
  );
  const filteredDiseases = allDiseases.filter(d =>
    d.name?.toLowerCase().includes(diseaseSearch.toLowerCase())
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const LinkedItems = ({ items, onRemove, label }) => (
    <div className="flex flex-wrap gap-2">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 py-1">No {label} linked yet</p>
      ) : (
        items.map(item => (
          <span key={item.id}
            className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-100">
            {item.name}
            <button onClick={() => onRemove(item)} disabled={saving}
              className="hover:text-rose-500 transition-colors ml-0.5">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Conditions"
        subtitle="Manage health conditions and chronic diseases linked to this profile"
        action={<GhostButton onClick={loadAll}><RefreshCw className="w-4 h-4" /> Refresh</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Active linked items */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-500" />
            Linked Conditions ({profileConditions.length})
          </h3>
          <LinkedItems items={profileConditions} onRemove={toggleCondition} label="conditions" />
        </Card>
        <Card className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            Chronic Diseases ({profileDiseases.length})
          </h3>
          <LinkedItems items={profileDiseases} onRemove={toggleDisease} label="diseases" />
        </Card>
      </div>

      {/* Tabs */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            { key: 'conditions', label: 'Health Conditions', count: allConditions.length },
            { key: 'diseases', label: 'Chronic Diseases', count: allDiseases.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {tab.label}
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'conditions' ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={condSearch} onChange={e => setCondSearch(e.target.value)}
                  placeholder="Search conditions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
              {filteredConditions.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No conditions found" description="Try a different search term" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredConditions.map(cond => {
                    const linked = profileConditions.some(pc => pc.id === cond.id);
                    return (
                      <button key={cond.id} onClick={() => toggleCondition(cond)} disabled={saving}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                          linked
                            ? 'bg-violet-50 border-violet-200 text-violet-700'
                            : 'bg-white border-slate-100 text-slate-700 hover:border-violet-200 hover:bg-violet-50/30'
                        }`}>
                        <div>
                          <p className="font-semibold">{cond.name}</p>
                          {cond.category && <p className="text-xs text-slate-400 mt-0.5">{cond.category}</p>}
                        </div>
                        {linked ? (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <Plus className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={diseaseSearch} onChange={e => setDiseaseSearch(e.target.value)}
                  placeholder="Search diseases..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
              {filteredDiseases.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No diseases found" description="Try a different search term" />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredDiseases.map(disease => {
                    const linked = profileDiseases.some(pd => pd.id === disease.id);
                    return (
                      <button key={disease.id} onClick={() => toggleDisease(disease)} disabled={saving}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                          linked
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-white border-slate-100 text-slate-700 hover:border-rose-200 hover:bg-rose-50/30'
                        }`}>
                        <div>
                          <p className="font-semibold">{disease.name}</p>
                          {disease.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{disease.description}</p>}
                        </div>
                        {linked ? (
                          <span className="shrink-0 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <Plus className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
