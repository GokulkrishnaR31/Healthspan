import React, { useState, useEffect } from 'react';
import { HeartPulse, Plus, RefreshCw, TrendingUp, Moon, Dumbbell, Brain } from 'lucide-react';
import { profileApi, healthScoreApi } from '../services/api';
import { Spinner, Card, AlertBanner, SectionHeader, PrimaryButton, GhostButton, StatCard, ScoreRing, Badge } from '../components/UI';

const today = new Date().toISOString().split('T')[0];

export default function HealthScores() {
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    sleep_hours: 7,
    physical_activity_level: 3,
    mental_health_index: 70,
    score_date: today,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await profileApi.myProfile();
      const p = profileRes.data;
      setProfile(p);
      const scoresRes = await healthScoreApi.listForProfile(p.id, 30);
      const scoreList = scoresRes.data || [];
      setScores(scoreList);
      if (scoreList.length) setLatestScore(scoreList[0]);
    } catch {
      setError('Could not load health scores. Please check your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');
    try {
      const res = await healthScoreApi.calculate(profile.id, {
        sleep_hours: parseFloat(form.sleep_hours),
        physical_activity_level: parseInt(form.physical_activity_level),
        mental_health_index: parseFloat(form.mental_health_index),
        score_date: form.score_date,
      });
      setLatestScore(res.data);
      setScores(prev => [res.data, ...prev.slice(0, 29)]);
      setSuccess('Health score calculated successfully!');
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate health score.');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (val) => {
    const pct = (val || 0) * 100;
    return pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'rose';
  };

  const getScoreLabel = (val) => {
    const pct = (val || 0) * 100;
    return pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct > 0 ? 'Needs Improvement' : 'N/A';
  };

  const Slider = ({ label, icon: Icon, value, onChange, min, max, step = 1, unit, description }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Icon className="w-4 h-4 text-violet-500" /> {label}
        </label>
        <span className="text-sm font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-lg">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min} {unit}</span>
        {description && <span className="text-center text-violet-500 font-medium">{description}</span>}
        <span>{max} {unit}</span>
      </div>
    </div>
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Scores"
        subtitle="Calculate and track your overall health performance"
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={loadData}><RefreshCw className="w-4 h-4" /></GhostButton>
            <PrimaryButton onClick={() => setShowForm(f => !f)}>
              <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Score'}
            </PrimaryButton>
          </div>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Score Form */}
      {showForm && (
        <Card className="space-y-6 border-violet-100">
          <h3 className="text-base font-bold text-slate-800">Calculate Health Score</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Slider label="Sleep Duration" icon={Moon}
              value={form.sleep_hours} onChange={v => setForm(f => ({ ...f, sleep_hours: v }))}
              min={0} max={12} step={0.5} unit="hrs"
              description={form.sleep_hours >= 7 ? 'Optimal' : form.sleep_hours >= 5 ? 'Fair' : 'Poor'}
            />
            <Slider label="Physical Activity Level" icon={Dumbbell}
              value={form.physical_activity_level} onChange={v => setForm(f => ({ ...f, physical_activity_level: v }))}
              min={1} max={5} step={1} unit="/5"
              description={['Sedentary', 'Lightly Active', 'Moderate', 'Very Active', 'Extremely Active'][form.physical_activity_level - 1]}
            />
            <Slider label="Mental Health Index" icon={Brain}
              value={form.mental_health_index} onChange={v => setForm(f => ({ ...f, mental_health_index: v }))}
              min={0} max={100} step={1} unit="%"
              description={form.mental_health_index >= 80 ? 'Excellent' : form.mental_health_index >= 60 ? 'Good' : 'Needs Support'}
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Score Date</label>
              <input type="date" value={form.score_date} max={today}
                onChange={e => setForm(f => ({ ...f, score_date: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div className="flex gap-3">
              <PrimaryButton type="submit" loading={saving}>
                <HeartPulse className="w-4 h-4" /> Calculate Score
              </PrimaryButton>
              <GhostButton onClick={() => setShowForm(false)}>Cancel</GhostButton>
            </div>
          </form>
        </Card>
      )}

      {/* Latest Score */}
      {latestScore && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col items-center justify-center gap-3 py-6">
            <ScoreRing value={latestScore.overall_score} size={120} strokeWidth={10} label="Overall" />
            <Badge label={getScoreLabel(latestScore.overall_score)} color={getScoreColor(latestScore.overall_score)} />
          </Card>
          <StatCard label="Nutrition Score" value={Math.round((latestScore.nutrition_score || 0) * 100)} unit="%"
            icon={HeartPulse} color="violet" trend="Based on today's meals" />
          <StatCard label="Activity Score" value={Math.round((latestScore.physical_activity_score || 0) * 100)} unit="%"
            icon={Dumbbell} color="emerald" trend={`Level ${latestScore.physical_activity_level || 1}/5`} />
          <StatCard label="Mental Score" value={Math.round((latestScore.mental_health_score || 0) * 100)} unit="%"
            icon={Brain} color="blue" trend={`Index: ${latestScore.mental_health_index || 0}%`} />
        </div>
      )}

      {/* Score History */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <h3 className="text-base font-bold text-slate-800">Score History</h3>
          <span className="text-xs text-slate-400">{scores.length} records</span>
        </div>
        {scores.length === 0 ? (
          <div className="text-center py-10">
            <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No scores recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nutrition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mental</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sleep</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {scores.map((s, i) => (
                  <tr key={s.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700 whitespace-nowrap">
                      {new Date(s.score_date || s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-extrabold text-slate-800">{Math.round((s.overall_score || 0) * 100)}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{Math.round((s.nutrition_score || 0) * 100)}%</td>
                    <td className="px-4 py-3 text-slate-600">{Math.round((s.physical_activity_score || 0) * 100)}%</td>
                    <td className="px-4 py-3 text-slate-600">{Math.round((s.mental_health_score || 0) * 100)}%</td>
                    <td className="px-4 py-3 text-slate-600">{s.sleep_hours || '—'}h</td>
                    <td className="px-4 py-3">
                      <Badge label={getScoreLabel(s.overall_score)} color={getScoreColor(s.overall_score)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
