import React, { useState, useEffect } from 'react';
import { Apple, Calculator, Calendar, RefreshCw } from 'lucide-react';
import { profileApi, dailyIntakeApi } from '../services/api';
import { Spinner, Card, Badge, AlertBanner, SectionHeader, PrimaryButton, GhostButton, NutrientBar, StatCard } from '../components/UI';

const today = new Date().toISOString().split('T')[0];

// Recommended Daily Allowances for elderly (60+)
const RDA = {
  calories: 1800,
  protein: 60,
  carbohydrates: 225,
  fat: 60,
  fiber: 25,
  sugar: 36,
  sodium: 1500,
  calcium: 1200,
  iron: 8,
  vitamin_c: 90,
};

export default function DailyIntake() {
  const [profile, setProfile] = useState(null);
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { if (profile) loadIntake(); }, [profile, selectedDate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.myProfile();
      setProfile(res.data);
    } catch {
      setError('Could not load profile.');
      setLoading(false);
    }
  };

  const loadIntake = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dailyIntakeApi.getByDate(profile.id, selectedDate);
      setIntake(res.data);
    } catch {
      setIntake(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!profile) return;
    setCalculating(true);
    setError('');
    try {
      const res = await dailyIntakeApi.calculate(profile.id, selectedDate);
      setIntake(res.data);
      setSuccess('Daily intake calculated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate intake.');
    } finally {
      setCalculating(false);
    }
  };

  const macros = intake ? [
    { label: 'Calories', current: intake.total_calories || 0, goal: RDA.calories, unit: 'kcal', color: 'bg-amber-400' },
    { label: 'Protein', current: intake.total_protein || 0, goal: RDA.protein, unit: 'g', color: 'bg-violet-500' },
    { label: 'Carbohydrates', current: intake.total_carbohydrates || 0, goal: RDA.carbohydrates, unit: 'g', color: 'bg-emerald-500' },
    { label: 'Fat', current: intake.total_fat || 0, goal: RDA.fat, unit: 'g', color: 'bg-rose-400' },
    { label: 'Fiber', current: intake.total_fiber || 0, goal: RDA.fiber, unit: 'g', color: 'bg-blue-400' },
    { label: 'Sugar', current: intake.total_sugar || 0, goal: RDA.sugar, unit: 'g', color: 'bg-pink-400' },
  ] : [];

  const micros = intake ? [
    { label: 'Sodium', val: intake.total_sodium, unit: 'mg', rda: RDA.sodium },
    { label: 'Calcium', val: intake.total_calcium, unit: 'mg', rda: RDA.calcium },
    { label: 'Iron', val: intake.total_iron, unit: 'mg', rda: RDA.iron },
    { label: 'Vitamin C', val: intake.total_vitamin_c, unit: 'mg', rda: RDA.vitamin_c },
  ].filter(m => m.val != null && m.val > 0) : [];

  const calPct = intake ? Math.min(Math.round(((intake.total_calories || 0) / RDA.calories) * 100), 100) : 0;

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Daily Intake"
        subtitle="Track and calculate your nutritional totals for the day"
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={loadIntake}><RefreshCw className="w-4 h-4" /></GhostButton>
            <PrimaryButton onClick={handleCalculate} loading={calculating}>
              <Calculator className="w-4 h-4" /> Calculate
            </PrimaryButton>
          </div>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Date Selector */}
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-slate-400" />
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} max={today}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        />
        {intake && (
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            Last updated: {new Date(intake.updated_at || intake.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {!intake ? (
        <Card className="text-center py-12 space-y-4">
          <Apple className="w-12 h-12 text-slate-200 mx-auto" />
          <div>
            <p className="text-base font-semibold text-slate-600">No intake data for {selectedDate}</p>
            <p className="text-sm text-slate-400 mt-1">Log meals first, then calculate your daily totals.</p>
          </div>
          <PrimaryButton onClick={handleCalculate} loading={calculating}>
            <Calculator className="w-4 h-4" /> Calculate from Meals
          </PrimaryButton>
        </Card>
      ) : (
        <>
          {/* Calorie Donut */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="sm:col-span-2 lg:col-span-1 flex flex-col items-center justify-center gap-2 py-6">
              <div className="relative">
                <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={60} cy={60} r={50} fill="none" stroke="#f1f5f9" strokeWidth={12} />
                  <circle cx={60} cy={60} r={50} fill="none"
                    stroke={calPct > 100 ? '#f43f5e' : calPct > 80 ? '#f59e0b' : '#8b5cf6'}
                    strokeWidth={12}
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - calPct / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-extrabold text-slate-800">{calPct}%</p>
                  <p className="text-[10px] text-slate-400 font-semibold">of daily goal</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-700">{Math.round(intake.total_calories || 0)} kcal</p>
              <p className="text-xs text-slate-400">Goal: {RDA.calories} kcal</p>
            </Card>

            <StatCard label="Protein" value={(intake.total_protein || 0).toFixed(1)} unit="g" color="violet"
              trend={`${Math.round(((intake.total_protein || 0) / RDA.protein) * 100)}% of goal`} />
            <StatCard label="Carbohydrates" value={(intake.total_carbohydrates || 0).toFixed(1)} unit="g" color="emerald"
              trend={`${Math.round(((intake.total_carbohydrates || 0) / RDA.carbohydrates) * 100)}% of goal`} />
            <StatCard label="Fat" value={(intake.total_fat || 0).toFixed(1)} unit="g" color="rose"
              trend={`${Math.round(((intake.total_fat || 0) / RDA.fat) * 100)}% of goal`} />
          </div>

          {/* Macronutrient Bars */}
          <Card className="space-y-5">
            <h3 className="text-base font-bold text-slate-800">Macronutrient Progress</h3>
            <div className="space-y-4">
              {macros.map(m => (
                <NutrientBar key={m.label} label={m.label} current={m.current} goal={m.goal} unit={m.unit} color={m.color} />
              ))}
            </div>
          </Card>

          {/* Micronutrients */}
          {micros.length > 0 && (
            <Card className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Micronutrients</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {micros.map(m => {
                  const pct = m.rda > 0 ? Math.min(Math.round((m.val / m.rda) * 100), 200) : 0;
                  const color = pct >= 100 ? 'text-emerald-600 bg-emerald-50' : pct >= 60 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
                  return (
                    <div key={m.label} className={`rounded-xl p-4 ${color.split(' ')[1]}`}>
                      <p className={`text-xl font-extrabold ${color.split(' ')[0]}`}>
                        {m.val.toFixed(1)}<span className="text-xs ml-0.5">{m.unit}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
                      <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color.split(' ')[0].replace('text', 'bg')}`}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{pct}% of RDA ({m.rda}{m.unit})</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Summary Table */}
          <Card className="overflow-hidden">
            <h3 className="text-base font-bold text-slate-800 p-5 border-b border-slate-50">Complete Nutrition Summary</h3>
            <div className="divide-y divide-slate-50">
              {[
                { label: 'Total Calories', val: Math.round(intake.total_calories || 0), unit: 'kcal' },
                { label: 'Protein', val: (intake.total_protein || 0).toFixed(2), unit: 'g' },
                { label: 'Total Fat', val: (intake.total_fat || 0).toFixed(2), unit: 'g' },
                { label: 'Saturated Fat', val: (intake.total_saturated_fat || 0).toFixed(2), unit: 'g' },
                { label: 'Total Carbohydrates', val: (intake.total_carbohydrates || 0).toFixed(2), unit: 'g' },
                { label: 'Dietary Fiber', val: (intake.total_fiber || 0).toFixed(2), unit: 'g' },
                { label: 'Total Sugar', val: (intake.total_sugar || 0).toFixed(2), unit: 'g' },
                { label: 'Sodium', val: (intake.total_sodium || 0).toFixed(2), unit: 'mg' },
                { label: 'Cholesterol', val: (intake.total_cholesterol || 0).toFixed(2), unit: 'mg' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600">{row.label}</span>
                  <span className="text-sm font-bold text-slate-800">{row.val} {row.unit}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
