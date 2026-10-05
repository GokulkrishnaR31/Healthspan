import React from 'react';
import { Utensils, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';

const MEAL_HISTORY = [
  {
    date: 'Wednesday, Jul 28',
    breakfast: 'Ragi Dosa & Coconut Chutney',
    lunch: 'Brown Rice, Cheera Kootu & Curd',
    dinner: 'Sama Rice Khichdi',
    symptoms: 'None',
    hasMissed: false,
  },
  {
    date: 'Tuesday, Jul 27',
    breakfast: 'MISSED BREAKFAST SLOT',
    lunch: 'Sambar Rice & Spinach',
    dinner: 'Roti & Dal',
    symptoms: 'Mild Knee Pain (Evening)',
    hasMissed: true,
  },
  {
    date: 'Monday, Jul 26',
    breakfast: 'Idli (3 pcs) & Sambar',
    lunch: 'Rice & Fish Curry',
    dinner: 'Dosa & Milk',
    symptoms: 'None',
    hasMissed: false,
  },
];

export default function CaregiverMealHistory() {
  return (
    <div className="space-y-6 font-['Outfit'] max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#128C7E] uppercase">Read-Only Logs</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Meal & Symptom History</h1>
      </div>

      <div className="space-y-4">
        {MEAL_HISTORY.map((entry) => (
          <div key={entry.date} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-lg">
                <Calendar className="w-5 h-5 text-[#25D366]" /> {entry.date}
              </div>
              {entry.hasMissed ? (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 font-extrabold text-xs rounded-full border border-rose-300">
                  ⚠️ Missed Slot Flagged
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
                  All Meals Logged ✓
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className={`p-3 rounded-2xl border ${entry.breakfast.includes('MISSED') ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-xs text-slate-400 block font-bold">Breakfast</span>
                <span>{entry.breakfast}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block font-bold">Lunch</span>
                <span>{entry.lunch}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 block font-bold">Dinner</span>
                <span>{entry.dinner}</span>
              </div>
            </div>

            {entry.symptoms !== 'None' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-center justify-between">
                <span>Reported Symptoms: {entry.symptoms}</span>
                <span className="bg-amber-200 px-2 py-0.5 rounded-full">Alert Recorded</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
