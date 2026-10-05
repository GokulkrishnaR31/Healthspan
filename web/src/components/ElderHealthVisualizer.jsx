import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Flame, CheckCircle, Award, Utensils, Droplets, Dumbbell, Sparkles, Brain, Bone, Lightbulb, ShieldAlert, AlertTriangle } from 'lucide-react';

export const isFastFoodName = (name = '') => {
  const lower = (name || '').toLowerCase();
  const fastFoodKeywords = [
    'burger', 'pizza', 'fries', 'french fry', 'samosa', 'soda', 'cola', 'pepsi',
    'coke', 'chips', 'fried', 'deep fried', 'maggi', 'noodles', 'doughnut',
    'donut', 'bhatura', 'pakora', 'puff', 'shawarma', 'hotdog', 'junk', 'fast food'
  ];
  return fastFoodKeywords.some((kw) => lower.includes(kw));
};

import { calculatePersonalizedHydration } from '../utils/hydrationCalculator';

export default function ElderHealthVisualizer({ 
  totalCalories = 1240, 
  totalProtein = 38, 
  waterLiters = 1.5,
  waterGlasses,
  profile = {},
  loggedMeals = [] 
}) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const directWater = waterLiters !== undefined ? waterLiters : (waterGlasses ? waterGlasses * 0.25 : 1.5);

  // Personalized Clinical Hydration Calculation
  const hydrationData = calculatePersonalizedHydration({
    weight_kg: profile.weight_kg || profile.weight || 64,
    gender: profile.gender || 'Male',
    age: profile.age || 68,
    conditions: profile.conditions || ['Diabetes', 'Cardiac Health'],
    loggedMeals: loggedMeals
  });

  const targetWater = hydrationData.targetLiters; // Dynamic Personalized Target (e.g. 2.8L or 1.6L for Kidney)
  const totalFluids = Number((directWater + hydrationData.dietaryFluidLiters).toFixed(2));

  // ICMR Target Baselines
  const targetCalories = 1600;
  const targetProtein = 45;

  const calPercent = Math.min(Math.round((totalCalories / targetCalories) * 100), 100);
  const proteinPercent = Math.min(Math.round((totalProtein / targetProtein) * 100), 100);
  const waterPercent = Math.min(Math.round((totalFluids / targetWater) * 100), 100);

  // Fast Food Detection & Health Score Deduction
  const fastFoodItems = (loggedMeals || []).filter(m => isFastFoodName(m.name || m.meal_name || ''));
  const fastFoodCount = fastFoodItems.length;
  const fastFoodPenalty = fastFoodCount * 15; // -15 Points per fast food item

  const baseScore = Math.min(Math.round((calPercent * 0.4) + (proteinPercent * 0.4) + (waterPercent * 0.2)), 100);
  const overallScore = Math.max(0, baseScore - fastFoodPenalty);

  // SVG Gauge Parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Dynamic Explainable Recommendations & Deficiency Identification based on Profile & Metrics
  const getOutputAnalysis = () => {
    const deficiencies = [];
    const recommendations = [];

    const healthScores = {
      overall: overallScore,
      boneHealth: proteinPercent >= 80 && waterPercent >= 70 ? 'Strong (88/100)' : 'Moderate (68/100) - Needs Calcium & Protein Boost',
      cognitiveHealth: waterPercent >= 75 ? 'Optimal (90/100)' : 'Needs Hydration (70/100) - Water vital for neural flow',
    };

    if (fastFoodCount > 0) {
      deficiencies.push({
        type: `🍟 Fast Food Penalty (-${fastFoodPenalty} Pts)`,
        detail: `Detected junk/fast food (${fastFoodItems.map(f => f.name || f.meal_name).join(', ')}). High in saturated trans-fats and sodium, causing -${fastFoodPenalty} points health score deduction.`,
        tag: `-${fastFoodPenalty} Score Penalty`
      });
      recommendations.push({
        title: '💧 Flush Out Sodium: Drink 2 Extra Glasses of Water / Lemon Water',
        reason: 'Helps kidneys flush out excess refined sodium and relieves digestive discomfort from deep-fried food.',
        category: 'Fast Food Counter-Measure'
      });
    }

    if (proteinPercent < 80) {
      deficiencies.push({
        type: 'Protein & Calcium Gap',
        detail: `Current protein: ${totalProtein}g / ${targetProtein}g target. Essential for senior muscle maintenance and bone density.`,
        tag: 'Bone & Muscle Risk'
      });
      recommendations.push({
        title: '🌟 Recommended Next Meal: Soft Ragi Kanji or Paneer Bhurji',
        reason: 'Rich in bioavailable calcium and soft protein to meet your ICMR daily target without digestive strain.',
        category: 'Personalized Meal Plan'
      });
    } else {
      recommendations.push({
        title: '🌟 Recommended Snack: Steamed Moong Sundal or Roasted Makhana',
        reason: 'Great low-glycemic, light snack that maintains your optimal protein level.',
        category: 'Personalized Meal Plan'
      });
    }

    if (waterPercent < 75) {
      deficiencies.push({
        type: 'Hydration Deficit',
        detail: `Water intake is ${waterGlasses}/8 glasses. Low hydration affects cognitive clarity and joint lubrication in seniors.`,
        tag: 'Cognitive & Joint Risk'
      });
      recommendations.push({
        title: '💧 Hydration Tip: Drink 2 Glasses of Warm Buttermilk / Coconut Water',
        reason: 'Restores electrolytes, improves cognitive focus, and supports digestion.',
        category: 'Cognitive Health'
      });
    }

    if ((profile.conditions || []).includes('Diabetes')) {
      recommendations.push({
        title: '🩸 Diabetes Glycemic Control: Low GI Meals Active',
        reason: 'Avoid refined rice; substitute with Foxtail Millet or Oats Porridge for stable post-meal blood sugar levels.',
        category: 'Medical Rule Output'
      });
    }

    if ((profile.conditions || []).includes('Hypertension')) {
      recommendations.push({
        title: '❤️ Hypertension Sodium Alert: Strictly < 2,000 mg Sodium',
        reason: 'Use rock salt / lemon zest flavorings instead of extra table salt to maintain blood pressure.',
        category: 'Medical Rule Output'
      });
    }

    return { deficiencies, recommendations, healthScores };
  };

  const { deficiencies, recommendations, healthScores } = getOutputAnalysis();

  return (
    <div className="space-y-4 font-['Outfit']">
      {/* ── CARD 1: Hero Nutrition Score Card ── */}
      <div className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden transition-all shadow-lg ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/30 border-slate-800 shadow-black/20 text-white'
          : 'bg-white border-slate-200/90 shadow-slate-900/5 text-slate-900'
      }`}>
        
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {t('dashboard.todaysNutrition')}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ICMR Standard</span>
          </div>
        </div>

        {/* Ring & Progress Bars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-4">
          
          {/* Circular Score Gauge */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={isDark ? '#1e293b' : '#E2E8F0'}
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={fastFoodCount > 0 ? '#F43F5E' : '#10B981'}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Ring Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {healthScores.overall}%
              </span>
              <span className={`text-[11px] font-black tracking-wider uppercase ${
                fastFoodCount > 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {fastFoodCount > 0 ? `-${fastFoodPenalty} Pts Penalty` : healthScores.overall >= 80 ? 'Optimal Health' : 'Needs Fuel'}
              </span>
            </div>
          </div>

          {/* Macro Breakdown Bars */}
          <div className="sm:col-span-7 space-y-3.5">
            {/* Calories Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Flame className="w-4 h-4 text-amber-500" /> Calories
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {totalCalories} <span className="text-slate-600 dark:text-slate-400 font-normal">/ {targetCalories} kcal</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" 
                  style={{ width: `${calPercent}%` }}
                />
              </div>
            </div>

            {/* Protein Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Dumbbell className="w-4 h-4 text-emerald-500" /> Protein
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {totalProtein}g <span className="text-slate-600 dark:text-slate-400 font-normal">/ {targetProtein}g</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" 
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Hydration Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Droplets className="w-4 h-4 text-cyan-500" /> Total Fluids (Water + Food)
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  {totalFluids.toFixed(2)} <span className="text-slate-600 dark:text-slate-400 font-normal">/ {targetWater.toFixed(1)} L</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-700" 
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-0.5">
                <span>{directWater.toFixed(2)}L water + {hydrationData.dietaryFluidLiters}L from food</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{waterPercent}% Hydrated</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── FAST FOOD HEALTH WARNING BANNER (POINT DEDUCTION NOTICE) ── */}
      {fastFoodCount > 0 && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-300 space-y-2 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between font-black text-rose-400 text-sm">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" /> 🍟 Senior Health Warning: Fast Food Detected!
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
              -{fastFoodPenalty} Points Penalty
            </span>
          </div>
          <p className="text-xs font-semibold text-rose-200/90">
            Logged Items: <strong>{fastFoodItems.map(f => f.name || f.meal_name).join(', ')}</strong>. Fast foods contain high trans-fats and excessive refined sodium that strain senior digestion, blood pressure, and cardiovascular health.
          </p>
          <div className="p-2.5 bg-slate-950/70 rounded-xl text-[11px] font-bold text-amber-300 border border-rose-500/20">
            💡 Clinical Counter-Measure: Drink 2 extra glasses of warm water and balance dinner with light moong dal or leafy greens.
          </div>
        </div>
      )}

      {/* ── SYSTEM OUTPUT 1: BONE & COGNITIVE HEALTH EVALUATION ── */}
      <div className={`p-5 rounded-3xl border space-y-3 transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" /> System Evaluation: Bone & Cognitive Health
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-indigo-400">
              <Bone className="w-4 h-4" /> Bone Health Score:
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200">{healthScores.boneHealth}</p>
          </div>

          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-cyan-400">
              <Brain className="w-4 h-4" /> Cognitive Health Score:
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200">{healthScores.cognitiveHealth}</p>
          </div>
        </div>
      </div>

      {/* ── SYSTEM OUTPUT 2: NUTRIENT DEFICIENCY IDENTIFICATION ── */}
      {deficiencies.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <h3 className="text-sm font-black text-amber-500 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Identified Nutritional Gaps & Warnings
          </h3>
          <div className="space-y-2">
            {deficiencies.map((def, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-2xl border border-amber-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between font-extrabold text-amber-300">
                  <span>⚠️ {def.type}</span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">{def.tag}</span>
                </div>
                <p className="text-slate-300 text-[11px] font-medium">{def.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SYSTEM OUTPUT 3: EXPLAINABLE PERSONALIZED MEAL RECOMMENDATIONS ── */}
      <div className={`p-5 rounded-3xl border space-y-3 transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <h3 className="text-sm font-black text-emerald-500 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" /> Explainable Meal & Diet Recommendations
        </h3>

        <div className="space-y-2.5">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-extrabold text-emerald-600 dark:text-emerald-400">
                <span>{rec.title}</span>
                <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{rec.category}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">{rec.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
