import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Utensils, RefreshCw, Plus, Trash2, Search, ChevronDown, Calendar, Users } from 'lucide-react';
import { profileApi, mealLogApi, foodApi, dailyIntakeApi } from '../../services/api';
import {
  Spinner, Card, Badge, AlertBanner, SectionHeader,
  GhostButton, PrimaryButton, NutrientBar, StatCard, Input
} from '../../components/UI';

const today = new Date().toISOString().split('T')[0];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];

export default function MealMonitoring() {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('profile') || '');
  const [meals, setMeals] = useState([]);
  const [intake, setIntake] = useState(null);
  const [allFoods, setAllFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [form, setForm] = useState({ meal_type: 'breakfast', quantity: 100, log_date: today });

  useEffect(() => { loadProfiles(); }, []);
  useEffect(() => { if (selectedId) loadMealData(); }, [selectedId, selectedDate]);

  const loadProfiles = async () => {
    try {
      const [profileRes, foodRes] = await Promise.all([profileApi.list(), foodApi.list(0, 200)]);
      const list = profileRes.data || [];
      setProfiles(list);
      setAllFoods(foodRes.data || []);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } catch {
      setError('Could not load profiles.');
    } finally {
      setLoading(false);
    }
  };

  const loadMealData = async () => {
    setLoading(true);
    setError('');
    try {
      const [mealRes, intakeRes] = await Promise.allSettled([
        mealLogApi.listByDate(selectedId, selectedDate),
        dailyIntakeApi.getByDate(selectedId, selectedDate),
      ]);
      setMeals(mealRes.status === 'fulfilled' ? mealRes.value.data || [] : []);
      setIntake(intakeRes.status === 'fulfilled' ? intakeRes.value.data : null);
    } catch {
      setError('Failed to load meal data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!selectedFood) { setError('Please select a food item'); return; }
    setSubmitting(true);
    setError('');
    try {
      await mealLogApi.create({
        elderly_profile_id: selectedId,
        food_item_id: selectedFood.id,
        meal_type: form.meal_type,
        quantity: parseFloat(form.quantity),
        log_date: form.log_date,
      });
      setSuccess('Meal logged successfully!');
      setShowForm(false);
      setSelectedFood(null);
      setFoodSearch('');
      await loadMealData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log meal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mealId) => {
    try {
      await mealLogApi.delete(mealId);
      setMeals(prev => prev.filter(m => m.id !== mealId));
    } catch { setError('Failed to delete meal.'); }
  };

  const filteredFoods = allFoods.filter(f => f.name?.toLowerCase().includes(foodSearch.toLowerCase())).slice(0, 10);
  const groupedMeals = MEAL_TYPES.reduce((acc, t) => {
    const items = meals.filter(m => m.meal_type === t);
    if (items.length) acc[t] = items;
    return acc;
  }, {});
  const totalCal = meals.reduce((a, m) => a + (m.calories || 0), 0);
  const selectedProfile = profiles.find(p => p.id === selectedId);

  if (loading && !profiles.length) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Meal Monitoring"
        subtitle="Track and log meals for elderly under your care"
        action={
          <div className="flex gap-2">
            <GhostButton onClick={loadMealData}><RefreshCw className="w-4 h-4" /></GhostButton>
            {selectedId && (
              <PrimaryButton onClick={() => setShowForm(f => !f)}>
                <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Log Meal'}
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
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input type="date" value={selectedDate} max={today}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {totalCal > 0 && (
              <span className="ml-auto text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl">
                Total: {Math.round(totalCal)} kcal
              </span>
            )}
          </div>

          {/* Nutrition Summary */}
          {intake && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Calories" value={Math.round(intake.total_calories || 0)} unit="kcal" color="amber" />
              <StatCard label="Protein" value={(intake.total_protein || 0).toFixed(1)} unit="g" color="violet" />
              <StatCard label="Carbs" value={(intake.total_carbohydrates || 0).toFixed(1)} unit="g" color="emerald" />
              <StatCard label="Fat" value={(intake.total_fat || 0).toFixed(1)} unit="g" color="rose" />
            </div>
          )}

          {/* Log Form */}
          {showForm && (
            <Card className="space-y-4 border-emerald-100">
              <h3 className="text-base font-bold text-slate-800">Log New Meal for {selectedProfile?.full_name || 'Profile'}</h3>
              <form onSubmit={handleLogMeal} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Item</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={selectedFood ? selectedFood.name : foodSearch}
                      onChange={e => { setFoodSearch(e.target.value); setSelectedFood(null); }}
                      placeholder="Search food items..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  {!selectedFood && foodSearch && (
                    <div className="border border-slate-200 rounded-xl bg-white shadow-sm max-h-36 overflow-y-auto">
                      {filteredFoods.length === 0
                        ? <p className="text-sm text-slate-400 p-3 text-center">No foods found</p>
                        : filteredFoods.map(f => (
                          <button key={f.id} type="button" onClick={() => { setSelectedFood(f); setFoodSearch(''); }}
                            className="w-full flex justify-between px-4 py-2 hover:bg-emerald-50 text-left text-sm border-b border-slate-50 last:border-0">
                            <span className="font-medium text-slate-700">{f.name}</span>
                            <span className="text-xs text-slate-400">{f.category || ''}</span>
                          </button>
                        ))
                      }
                    </div>
                  )}
                  {selectedFood && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                      <Utensils className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm font-semibold text-emerald-700 flex-1">{selectedFood.name}</span>
                      <button type="button" onClick={() => setSelectedFood(null)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meal Type</label>
                    <select value={form.meal_type} onChange={e => setForm(f => ({ ...f, meal_type: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 capitalize">
                      {MEAL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <Input label="Quantity (g)" type="number" value={form.quantity} min={1}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                  <Input label="Date" type="date" value={form.log_date} max={today}
                    onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))} />
                </div>

                <div className="flex gap-3">
                  <PrimaryButton type="submit" loading={submitting} disabled={!selectedFood}>
                    <Plus className="w-4 h-4" /> Log Meal
                  </PrimaryButton>
                  <GhostButton onClick={() => { setShowForm(false); setSelectedFood(null); }}>Cancel</GhostButton>
                </div>
              </form>
            </Card>
          )}

          {/* Meal Groups */}
          {loading ? <Spinner className="h-32" /> : Object.keys(groupedMeals).length === 0 ? (
            <Card className="text-center py-10">
              <Utensils className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No meals logged for {selectedDate}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMeals).map(([type, items]) => (
                <Card key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />{type.replace('_', ' ')}
                    </h3>
                    <span className="text-xs text-slate-400">{Math.round(items.reduce((a, m) => a + (m.calories || 0), 0))} kcal</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {items.map(meal => (
                      <div key={meal.id} className="py-3 flex items-center justify-between group">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{meal.food_item_name || 'Food Item'}</p>
                          <p className="text-xs text-slate-400">{meal.quantity}g{meal.calories ? ` · ${Math.round(meal.calories)} kcal` : ''}</p>
                        </div>
                        <button onClick={() => handleDelete(meal.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
