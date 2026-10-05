import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Utensils, Clock, RefreshCw, Filter } from 'lucide-react';
import { profileApi, mealLogApi, foodApi } from '../services/api';
import { Spinner, Card, Badge, AlertBanner, SectionHeader, PrimaryButton, GhostButton, EmptyState, Input } from '../components/UI';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'];
const today = new Date().toISOString().split('T')[0];

export default function MealLogs() {
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);

  const [form, setForm] = useState({
    food_item_id: '',
    meal_type: 'breakfast',
    quantity: 100,
    log_date: today,
  });

  useEffect(() => { loadProfile(); }, []);
  useEffect(() => { if (profile) loadMeals(); }, [profile, selectedDate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.myProfile();
      setProfile(res.data);
      const foodRes = await foodApi.list(0, 200);
      setAllFoods(foodRes.data || []);
    } catch {
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const loadMeals = async () => {
    try {
      const res = await mealLogApi.listByDate(profile.id, selectedDate);
      setMeals(res.data || []);
    } catch {
      setMeals([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood) { setError('Please select a food item'); return; }
    setSubmitting(true);
    setError('');
    try {
      await mealLogApi.create({
        elderly_profile_id: profile.id,
        food_item_id: selectedFood.id,
        meal_type: form.meal_type,
        quantity: parseFloat(form.quantity),
        log_date: form.log_date,
      });
      setSuccess('Meal logged successfully!');
      setShowForm(false);
      setSelectedFood(null);
      setFoodSearch('');
      setForm({ food_item_id: '', meal_type: 'breakfast', quantity: 100, log_date: today });
      await loadMeals();
      setTimeout(() => setSuccess(''), 3000);
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
      setSuccess('Meal removed.');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Failed to delete meal.');
    }
  };

  const filteredFoods = allFoods.filter(f =>
    f.name?.toLowerCase().includes(foodSearch.toLowerCase())
  ).slice(0, 12);

  const groupedMeals = MEAL_TYPES.reduce((acc, type) => {
    const items = meals.filter(m => m.meal_type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  const totalCal = meals.reduce((acc, m) => acc + (m.calories || 0), 0);

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Meal Logging"
        subtitle="Track daily food intake and nutrition"
        action={
          <div className="flex items-center gap-2">
            <GhostButton onClick={loadMeals}><RefreshCw className="w-4 h-4" /></GhostButton>
            <PrimaryButton onClick={() => setShowForm(f => !f)}>
              <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Log Meal'}
            </PrimaryButton>
          </div>
        }
      />

      <AlertBanner type="error" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Date Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Date:</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} max={today}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
        />
        {totalCal > 0 && (
          <span className="ml-auto text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
            Total: {Math.round(totalCal)} kcal
          </span>
        )}
      </div>

      {/* Log Form */}
      {showForm && (
        <Card className="space-y-5 border-violet-100">
          <h3 className="text-base font-bold text-slate-800">Log New Meal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Food Search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Item</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={selectedFood ? selectedFood.name : foodSearch}
                  onChange={e => { setFoodSearch(e.target.value); setSelectedFood(null); }}
                  placeholder="Search food items..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>
              {!selectedFood && foodSearch && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm max-h-40 overflow-y-auto">
                  {filteredFoods.length === 0 ? (
                    <p className="text-sm text-slate-400 p-3 text-center">No food items found</p>
                  ) : (
                    filteredFoods.map(food => (
                      <button key={food.id} type="button" onClick={() => { setSelectedFood(food); setFoodSearch(''); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-violet-50 text-left text-sm transition-colors border-b border-slate-50 last:border-0">
                        <span className="font-medium text-slate-700">{food.name}</span>
                        <span className="text-xs text-slate-400">{food.category || ''}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedFood && (
                <div className="flex items-center gap-2 bg-violet-50 px-3 py-2 rounded-xl">
                  <Utensils className="w-4 h-4 text-violet-500 shrink-0" />
                  <span className="text-sm font-semibold text-violet-700 flex-1">{selectedFood.name}</span>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 capitalize">
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <Input label="Quantity (g)" type="number" value={form.quantity} min={1}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              <Input label="Date" type="date" value={form.log_date} max={today}
                onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))} />
            </div>

            <div className="flex gap-3 pt-2">
              <PrimaryButton type="submit" loading={submitting} disabled={!selectedFood}>
                <Plus className="w-4 h-4" /> Log Meal
              </PrimaryButton>
              <GhostButton onClick={() => { setShowForm(false); setSelectedFood(null); setFoodSearch(''); }}>
                Cancel
              </GhostButton>
            </div>
          </form>
        </Card>
      )}

      {/* Meal Groups */}
      {Object.keys(groupedMeals).length === 0 ? (
        <EmptyState icon={Utensils} title="No meals logged"
          description={`No meals found for ${selectedDate}. Click "Log Meal" to add one.`}
          action={
            <PrimaryButton onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Log First Meal
            </PrimaryButton>
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedMeals).map(([type, items]) => (
            <Card key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  {type.replace('_', ' ')}
                </h3>
                <span className="text-xs text-slate-400">
                  {Math.round(items.reduce((a, m) => a + (m.calories || 0), 0))} kcal
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {items.map(meal => (
                  <div key={meal.id} className="py-3 flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{meal.food_item_name || 'Food Item'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {meal.quantity}g
                        {meal.calories && ` · ${Math.round(meal.calories)} kcal`}
                        {meal.protein && ` · ${meal.protein.toFixed(1)}g protein`}
                      </p>
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
    </div>
  );
}

