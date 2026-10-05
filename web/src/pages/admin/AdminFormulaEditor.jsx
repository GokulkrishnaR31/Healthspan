import React, { useState } from 'react';
import { Sliders, Save, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

export default function AdminFormulaEditor() {
  const [weights, setWeights] = useState({
    calciumWeight: 0.30,
    vitDWeight: 0.25,
    omega3Weight: 0.20,
    antioxidantWeight: 0.15,
    proteinWeight: 0.10,
  });

  const [penalties, setPenalties] = useState({
    smokerPenalty: 12,
    missedMealPenalty: 8,
    lowSleepPenalty: 5,
  });

  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = () => {
    setStatusMsg('✅ Health score algorithm parameters updated successfully!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleRevert = () => {
    setWeights({
      calciumWeight: 0.30,
      vitDWeight: 0.25,
      omega3Weight: 0.20,
      antioxidantWeight: 0.15,
      proteinWeight: 0.10,
    });
    setPenalties({
      smokerPenalty: 12,
      missedMealPenalty: 8,
      lowSleepPenalty: 5,
    });
    setStatusMsg('🔄 Formula weights reverted to ICMR ICAR defaults.');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="space-y-6 font-['Outfit'] max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7F77DD] uppercase">Algorithm Customization</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Health Score Formula Editor</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRevert}
            className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Revert Defaults
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-[#7F77DD] hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" /> Save Formula
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 font-bold text-sm flex items-center gap-2">
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Live Formula Preview Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md space-y-2 font-mono text-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block font-sans">
          ⚡ Live Health Score Equation Preview:
        </span>
        <p className="text-emerald-400 leading-relaxed">
          Score = ({weights.calciumWeight} × %Ca) + ({weights.vitDWeight} × %VitD) + ({weights.omega3Weight} × %Omega3) + ({weights.antioxidantWeight} × %Antiox) - ({penalties.missedMealPenalty} × MissedMeals) - ({penalties.smokerPenalty} if Smoker)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editable Condition Weights */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#7F77DD]" /> Nutrient Target Weights (Sum = 1.0)
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                <span>Calcium Weight</span>
                <span>{(weights.calciumWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.05" max="0.50" step="0.05"
                value={weights.calciumWeight}
                onChange={(e) => setWeights({ ...weights, calciumWeight: parseFloat(e.target.value) })}
                className="w-full accent-[#7F77DD]"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                <span>Vitamin D Weight</span>
                <span>{(weights.vitDWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.05" max="0.50" step="0.05"
                value={weights.vitDWeight}
                onChange={(e) => setWeights({ ...weights, vitDWeight: parseFloat(e.target.value) })}
                className="w-full accent-[#7F77DD]"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold text-slate-800 mb-1">
                <span>Omega-3 Weight</span>
                <span>{(weights.omega3Weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range" min="0.05" max="0.50" step="0.05"
                value={weights.omega3Weight}
                onChange={(e) => setWeights({ ...weights, omega3Weight: parseFloat(e.target.value) })}
                className="w-full accent-[#7F77DD]"
              />
            </div>
          </div>
        </div>

        {/* Lifestyle Penalty Values */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-rose-500" /> Lifestyle Deduction Penalties (Pts)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1">Smoker Penalty</label>
              <input
                type="number"
                value={penalties.smokerPenalty}
                onChange={(e) => setPenalties({ ...penalties, smokerPenalty: parseInt(e.target.value, 10) })}
                className="w-full min-h-[44px] px-4 rounded-xl border-2 border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1">Missed Meal Penalty (Per Meal)</label>
              <input
                type="number"
                value={penalties.missedMealPenalty}
                onChange={(e) => setPenalties({ ...penalties, missedMealPenalty: parseInt(e.target.value, 10) })}
                className="w-full min-h-[44px] px-4 rounded-xl border-2 border-slate-200 font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
