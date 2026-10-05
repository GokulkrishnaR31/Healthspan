import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Activity, HeartPulse, Scale, RefreshCw, ChevronDown,
  TrendingUp, Brain, Moon, Dumbbell, AlertCircle, Users
} from 'lucide-react';
import { profileApi, healthScoreApi, healthConditionApi, diseaseApi } from '../../services/api';
import {
  Spinner, Card, StatCard, Badge, AlertBanner, SectionHeader,
  GhostButton, ScoreRing, NutrientBar
} from '../../components/UI';

export default function HealthMonitoring() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('profile') || '');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadProfiles(); }, []);
  useEffect(() => { if (selectedId && profiles.length) loadProfileData(); }, [selectedId, profiles]);

  const loadProfiles = async () => {
    try {
      const res = await profileApi.list();
      const list = res.data || [];
      setProfiles(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } catch {
      setError('Could not load profiles.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = profiles.find(p => p.id === selectedId);
      setSelectedProfile(profile || null);

      const [scoresRes, condRes, disRes] = await Promise.allSettled([
        healthScoreApi.listForProfile(selectedId, 30),
        healthConditionApi.listForProfile(selectedId),
        diseaseApi.listForProfile(selectedId),
      ]);

      if (scoresRes.status === 'fulfilled') {
        const list = scoresRes.value.data || [];
        setScores(list);
        setLatestScore(list[0] || null);
      }
      if (condRes.status === 'fulfilled') setConditions(condRes.value.data || []);
      if (disRes.status === 'fulfilled') setDiseases(disRes.value.data || []);
    } catch {
      setError('Failed to load health data for this profile.');
    } finally {
      setLoading(false);
    }
  };

  const bmi = selectedProfile?.weight_kg && selectedProfile?.height_cm
    ? (selectedProfile.weight_kg / ((selectedProfile.height_cm / 100) ** 2)).toFixed(1)
    : null;
  const bmiLabel = !bmi ? null
    : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = !bmi ? 'slate'
    : bmi < 18.5 ? 'amber' : bmi < 25 ? 'emerald' : bmi < 30 ? 'amber' : 'rose';

  const scoreHistory = scores.slice(0, 7).reverse();
  const maxScore = Math.max(...scoreHistory.map(s => s.overall_score || 0), 0.01);

  const scoreColor = (v) => {
    const pct = (v || 0) * 100;
    return pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose';
  };

  if (loading && !profiles.length) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Monitoring"
        subtitle="Monitor health scores, BMI, and medical conditions for each elderly"
        action={<GhostButton onClick={loadProfileData}><RefreshCw className="w-4 h-4" /> Refresh</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Profile Selector */}
      {profiles.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No profiles found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Add an elderly profile first</p>
          <GhostButton onClick={() => navigate('/caregiver/elderly/add')}>Add Elderly</GhostButton>
        </Card>
      ) : (
        <>
          <div className="relative w-full max-w-xs">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none pr-10">
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unnamed'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {loading ? <Spinner className="h-32" /> : selectedProfile && (
            <>
              {/* Physical Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="BMI" value={bmi} icon={Activity} color={bmiColor} trend={bmiLabel} />
                <StatCard label="Weight" value={selectedProfile.weight_kg} unit="kg" icon={Scale} color="violet" />
                <StatCard label="Height" value={selectedProfile.height_cm} unit="cm" color="blue" />
                <StatCard label="Age" value={selectedProfile.age} unit="yrs" color="indigo" />
              </div>

              {/* Score Ring + History */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center gap-4 py-6">
                  {latestScore ? (
                    <>
                      <ScoreRing value={latestScore.overall_score} size={140} strokeWidth={12} label="Health Score" />
                      <div className="grid grid-cols-3 gap-2 w-full text-center">
                        {[
                          { label: 'Nutrition', val: latestScore.nutrition_score },
                          { label: 'Activity', val: latestScore.physical_activity_score },
                          { label: 'Mental', val: latestScore.mental_health_score },
                        ].map(s => (
                          <div key={s.label}>
                            <p className="text-base font-extrabold text-slate-700">{Math.round((s.val || 0) * 100)}%</p>
                            <p className="text-[10px] text-slate-400">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {latestScore.sleep_hours && (
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Moon className="w-3.5 h-3.5" />{latestScore.sleep_hours}h sleep</span>
                          {latestScore.physical_activity_level && (
                            <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5" />Level {latestScore.physical_activity_level}</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <HeartPulse className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No score recorded yet</p>
                    </div>
                  )}
                </Card>

                {/* 7-day bar chart */}
                <Card className="lg:col-span-2 space-y-4">
                  <h3 className="text-base font-bold text-slate-800">7-Day Score History</h3>
                  {scoreHistory.length > 0 ? (
                    <div className="flex items-end gap-2 h-28">
                      {scoreHistory.map((s, i) => {
                        const h = Math.max(6, (s.overall_score / maxScore) * 100);
                        const color = s.overall_score >= 0.8 ? 'bg-emerald-500' : s.overall_score >= 0.6 ? 'bg-amber-400' : 'bg-rose-400';
                        return (
                          <div key={s.id || i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {Math.round(s.overall_score * 100)}%
                            </div>
                            <div className="w-full flex items-end" style={{ height: '96px' }}>
                              <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${h}%` }} />
                            </div>
                            <span className="text-[9px] text-slate-400">{formatDate(s.score_date || s.created_at)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8">No score history for this profile</p>
                  )}

                  {scores.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-50">
                      {[
                        { label: 'Latest Score', val: `${Math.round((scores[0]?.overall_score || 0) * 100)}%` },
                        { label: 'Avg (30d)', val: scores.length ? `${Math.round(scores.reduce((a, s) => a + (s.overall_score || 0), 0) / scores.length * 100)}%` : '—' },
                        { label: 'Total Records', val: scores.length },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <p className="text-lg font-extrabold text-slate-700">{s.val}</p>
                          <p className="text-[10px] text-slate-400">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Conditions & Diseases */}
              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Health Conditions ({conditions.length})
                  </h3>
                  {conditions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No health conditions linked</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {conditions.map(c => (
                        <span key={c.id} className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-100">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" /> Chronic Diseases ({diseases.length})
                  </h3>
                  {diseases.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No chronic diseases linked</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {diseases.map(d => (
                        <span key={d.id} className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-100">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Medical notes */}
              {selectedProfile.medical_notes && (
                <Card className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800">Medical Notes</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedProfile.medical_notes}</p>
                </Card>
              )}

              {/* Score History Table */}
              {scores.length > 0 && (
                <Card className="overflow-hidden p-0">
                  <h3 className="text-sm font-bold text-slate-800 p-5 border-b border-slate-50">Full Score History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Overall</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Nutrition</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Activity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Mental</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Sleep</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {scores.map((s, i) => (
                          <tr key={s.id || i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
                              {new Date(s.score_date || s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3">
                              <Badge label={`${Math.round((s.overall_score || 0) * 100)}%`} color={scoreColor(s.overall_score)} />
                            </td>
                            <td className="px-4 py-3 text-slate-600">{Math.round((s.nutrition_score || 0) * 100)}%</td>
                            <td className="px-4 py-3 text-slate-600">{Math.round((s.physical_activity_score || 0) * 100)}%</td>
                            <td className="px-4 py-3 text-slate-600">{Math.round((s.mental_health_score || 0) * 100)}%</td>
                            <td className="px-4 py-3 text-slate-600">{s.sleep_hours || '—'}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
