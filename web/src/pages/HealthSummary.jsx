import React, { useState, useEffect } from 'react';
import { Activity, HeartPulse, Scale, Ruler, Calendar, TrendingUp, User, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { profileApi, healthScoreApi, dailyIntakeApi, recommendationApi } from '../services/api';
import { StatCard, Spinner, Card, Badge, AlertBanner, SectionHeader, PrimaryButton, GhostButton, ScoreRing } from '../components/UI';

const today = new Date().toISOString().split('T')[0];

export default function HealthSummary() {
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [todayIntake, setTodayIntake] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await profileApi.myProfile();
      const p = profileRes.data;
      setProfile(p);

      const [scoresRes, intakeRes, recsRes] = await Promise.allSettled([
        healthScoreApi.listForProfile(p.id, 30),
        dailyIntakeApi.getByDate(p.id, today),
        recommendationApi.list(p.id),
      ]);

      if (scoresRes.status === 'fulfilled') {
        const scoreList = scoresRes.value.data || [];
        setScores(scoreList);
        if (scoreList.length > 0) setLatestScore(scoreList[0]);
      }
      if (intakeRes.status === 'fulfilled') setTodayIntake(intakeRes.value.data);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data?.slice(0, 5) || []);
    } catch {
      setError('Failed to load health summary. Please ensure your profile is set up.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecs = async () => {
    if (!profile) return;
    setRecsLoading(true);
    try {
      const res = await recommendationApi.generate(profile.id);
      setRecommendations(res.data?.slice(0, 5) || []);
    } catch {
      setError('Could not generate recommendations.');
    } finally {
      setRecsLoading(false);
    }
  };

  const bmi = profile?.weight_kg && profile?.height_cm
    ? (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? { label: 'Underweight', color: 'amber' }
    : bmi < 25 ? { label: 'Normal', color: 'emerald' }
    : bmi < 30 ? { label: 'Overweight', color: 'amber' }
    : { label: 'Obese', color: 'rose' }
    : null;

  const scoreHistory = scores.slice(0, 7).reverse();
  const avg7Day = scores.length > 0
    ? (scores.slice(0, 7).reduce((acc, s) => acc + (s.overall_score || 0), 0) / Math.min(scores.length, 7) * 100).toFixed(0)
    : null;

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Health Summary"
        subtitle="Complete overview of your current health status"
        action={<GhostButton onClick={loadData}><RefreshCw className="w-4 h-4" /> Refresh</GhostButton>}
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Profile + BMI + Score */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Weight" value={profile?.weight_kg} unit="kg" icon={Scale} color="violet" />
        <StatCard label="Height" value={profile?.height_cm} unit="cm" icon={Ruler} color="blue" />
        <StatCard label="BMI" value={bmi} icon={Activity}
          color={bmiCategory?.color || 'slate'}
          trend={bmiCategory ? bmiCategory.label : undefined}
        />
        <StatCard label="Age" value={profile?.age} unit="yrs" icon={User} color="indigo" />
      </div>

      {/* Score Ring + 7-day trend */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Score */}
        <Card className="flex flex-col items-center justify-center gap-4 min-h-[220px]">
          {latestScore ? (
            <>
              <ScoreRing value={latestScore.overall_score} size={140} strokeWidth={12} label="Health Score" />
              <div className="grid grid-cols-3 gap-3 w-full text-center">
                {[
                  { label: 'Nutrition', val: latestScore.nutrition_score },
                  { label: 'Activity', val: latestScore.physical_activity_score },
                  { label: 'Mental', val: latestScore.mental_health_score },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-lg font-extrabold text-slate-700">{Math.round((s.val || 0) * 100)}%</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <HeartPulse className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No score recorded yet</p>
            </div>
          )}
        </Card>

        {/* 7-day Score Trend */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">7-Day Score Trend</h3>
            {avg7Day && (
              <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                Avg: {avg7Day}%
              </span>
            )}
          </div>
          {scoreHistory.length > 0 ? (
            <div className="flex items-end gap-2 h-24">
              {scoreHistory.map((s, i) => {
                const h = Math.max(8, (s.overall_score || 0) * 96);
                const color = s.overall_score >= 0.8 ? 'bg-emerald-400' : s.overall_score >= 0.6 ? 'bg-amber-400' : 'bg-rose-400';
                return (
                  <div key={s.id || i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-medium">{Math.round(s.overall_score * 100)}%</span>
                    <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${h}%` }} />
                    <span className="text-[9px] text-slate-400">{formatShortDate(s.score_date || s.created_at)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No score history available</p>
          )}
        </Card>
      </div>

      {/* Today's Nutrition Overview */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Today's Nutrition Overview</h3>
        {todayIntake ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Calories', val: Math.round(todayIntake.total_calories || 0), unit: 'kcal', color: 'text-amber-600 bg-amber-50' },
              { label: 'Protein', val: (todayIntake.total_protein || 0).toFixed(1), unit: 'g', color: 'text-violet-600 bg-violet-50' },
              { label: 'Carbs', val: (todayIntake.total_carbohydrates || 0).toFixed(1), unit: 'g', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Fat', val: (todayIntake.total_fat || 0).toFixed(1), unit: 'g', color: 'text-rose-600 bg-rose-50' },
              { label: 'Fiber', val: (todayIntake.total_fiber || 0).toFixed(1), unit: 'g', color: 'text-blue-600 bg-blue-50' },
              { label: 'Sugar', val: (todayIntake.total_sugar || 0).toFixed(1), unit: 'g', color: 'text-pink-600 bg-pink-50' },
            ].map(n => (
              <div key={n.label} className={`rounded-xl px-4 py-3 ${n.color.split(' ')[1]}`}>
                <p className={`text-xl font-extrabold ${n.color.split(' ')[0]}`}>{n.val}<span className="text-xs ml-0.5">{n.unit}</span></p>
                <p className="text-xs text-slate-500 mt-0.5">{n.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No intake data for today</p>
        )}
      </Card>

      {/* AI Recommendations */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Health Recommendations</h3>
          <PrimaryButton onClick={generateRecs} loading={recsLoading} size="sm">
            <RefreshCw className="w-3.5 h-3.5" /> Generate
          </PrimaryButton>
        </div>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={rec.id || i} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{rec.title || rec.category}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rec.description || rec.recommendation_text}</p>
                  {rec.priority && <Badge label={rec.priority} color={rec.priority === 'high' ? 'rose' : rec.priority === 'medium' ? 'amber' : 'emerald'} />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recommendations yet. Click Generate to get personalized tips.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}


