import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Edit2, Trash2, UserPlus, RefreshCw, Activity } from 'lucide-react';
import { profileApi, healthScoreApi } from '../../services/api';
import { Spinner, Card, Badge, AlertBanner, SectionHeader, PrimaryButton, GhostButton, EmptyState } from '../../components/UI';

export default function ElderlyList() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await profileApi.list();
      const list = res.data || [];
      setProfiles(list);

      // Load latest scores
      const scoreResults = await Promise.allSettled(list.map(p => healthScoreApi.getLatest(p.id)));
      const scoreMap = {};
      scoreResults.forEach((r, i) => {
        if (r.status === 'fulfilled' && list[i]) scoreMap[list[i].id] = r.value.data;
      });
      setScores(scoreMap);
    } catch {
      setError('Could not load elderly profiles.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    setDeleting(profileId);
    try {
      await profileApi.delete(profileId);
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete profile.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = profiles.filter(p => {
    const name = `${p.full_name || ''} ${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getScoreInfo = (profileId) => {
    const s = scores[profileId];
    if (!s) return { pct: null, color: 'slate', label: 'No Score' };
    const pct = Math.round((s.overall_score || 0) * 100);
    const color = pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose';
    const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'At Risk';
    return { pct, color, label };
  };

  const getBMI = (p) => {
    if (!p.weight_kg || !p.height_cm) return null;
    const bmi = p.weight_kg / ((p.height_cm / 100) ** 2);
    const label = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    return { value: bmi.toFixed(1), label };
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Elderly List"
        subtitle={`${profiles.length} ${profiles.length === 1 ? 'person' : 'people'} under your care`}
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={loadProfiles}><RefreshCw className="w-4 h-4" /></GhostButton>
            <PrimaryButton onClick={() => navigate('/caregiver/elderly/add')}>
              <UserPlus className="w-4 h-4" /> Add Elderly
            </PrimaryButton>
          </div>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No profiles found"
          description={search ? "Try a different search term" : "Add your first elderly profile to get started"}
          action={!search && (
            <PrimaryButton onClick={() => navigate('/caregiver/elderly/add')}>
              <UserPlus className="w-4 h-4" /> Add Elderly
            </PrimaryButton>
          )}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden lg:block overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">BMI</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Score</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(profile => {
                  const scoreInfo = getScoreInfo(profile.id);
                  const bmi = getBMI(profile);
                  const name = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed';
                  return (
                    <tr key={profile.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{name}</p>
                            {profile.blood_type && <p className="text-xs text-slate-400">Blood: {profile.blood_type}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{profile.age || '—'}</td>
                      <td className="px-4 py-4">
                        {bmi ? (
                          <span className="text-slate-700 font-medium">{bmi.value}
                            <span className="text-xs text-slate-400 ml-1">({bmi.label})</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{profile.weight_kg ? `${profile.weight_kg} kg` : '—'}</td>
                      <td className="px-4 py-4">
                        {scoreInfo.pct !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${scoreInfo.color === 'emerald' ? 'bg-emerald-500' : scoreInfo.color === 'amber' ? 'bg-amber-400' : 'bg-rose-500'}`}
                                style={{ width: `${scoreInfo.pct}%` }} />
                            </div>
                            <Badge label={`${scoreInfo.pct}%`} color={scoreInfo.color} />
                          </div>
                        ) : <Badge label="No Score" color="slate" />}
                      </td>
                      <td className="px-4 py-4 text-slate-600 capitalize">{profile.gender || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/caregiver/health-monitoring?profile=${profile.id}`)}
                            title="View Health" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Activity className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/caregiver/elderly/edit/${profile.id}`)}
                            title="Edit" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(profile.id)} disabled={deleting === profile.id}
                            title="Delete" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(profile => {
              const scoreInfo = getScoreInfo(profile.id);
              const bmi = getBMI(profile);
              const name = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed';
              return (
                <Card key={profile.id} padding="p-4" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                        {name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{name}</p>
                        <p className="text-xs text-slate-400">Age {profile.age || '—'}</p>
                      </div>
                    </div>
                    <Badge label={scoreInfo.label} color={scoreInfo.color} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'BMI', val: bmi?.value || '—' },
                      { label: 'Weight', val: profile.weight_kg ? `${profile.weight_kg}kg` : '—' },
                      { label: 'Score', val: scoreInfo.pct != null ? `${scoreInfo.pct}%` : '—' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-xl p-2 text-center">
                        <p className="text-sm font-bold text-slate-700">{s.val}</p>
                        <p className="text-[10px] text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/caregiver/health-monitoring?profile=${profile.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
                      <Activity className="w-3.5 h-3.5" /> Health
                    </button>
                    <button onClick={() => navigate(`/caregiver/elderly/edit/${profile.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(profile.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
