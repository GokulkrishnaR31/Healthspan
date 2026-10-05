import React from 'react';
import { TrendingUp, Award, AlertCircle, Sparkles } from 'lucide-react';

const FOUR_WEEK_DATA = [
  { week: 'Week 1', calcium: 55, vitD: 70, omega3: 40 },
  { week: 'Week 2', calcium: 60, vitD: 78, omega3: 42 },
  { week: 'Week 3', calcium: 62, vitD: 80, omega3: 45 },
  { week: 'Week 4 (Current)', calcium: 65, vitD: 85, omega3: 45 },
];

export default function CaregiverNutrientHistory() {
  return (
    <div className="space-y-6 font-['Outfit'] max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-[#128C7E] uppercase">4-Week Trends</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Nutrient History & Analytics</h1>
      </div>

      {/* Highlights: Best & Worst Nutrient */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
            <Award className="w-4 h-4" /> Best Nutrient This Month
          </div>
          <p className="text-2xl font-extrabold text-slate-800">Vitamin D (85%)</p>
          <span className="text-xs text-emerald-700 font-bold">Consistently improving ↑</span>
        </div>

        <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
            <AlertCircle className="w-4 h-4" /> Needs Most Focus
          </div>
          <p className="text-2xl font-extrabold text-slate-800">Omega-3 (45%)</p>
          <span className="text-xs text-rose-700 font-bold">Below ICMR target</span>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
            <AlertCircle className="w-4 h-4" /> Bone Risk Days Flagged
          </div>
          <p className="text-2xl font-extrabold text-amber-600">4 Days</p>
          <span className="text-xs text-amber-700 font-bold">Due to calcium gap</span>
        </div>
      </div>

      {/* 4-Week Trend Table */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xl font-extrabold text-slate-900">4-Week Compliance Progress</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-xs">
                <th className="pb-3">Week</th>
                <th className="pb-3">Calcium Level</th>
                <th className="pb-3">Vitamin D Level</th>
                <th className="pb-3">Omega-3 Level</th>
                <th className="pb-3 text-right">Overall Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {FOUR_WEEK_DATA.map((row) => (
                <tr key={row.week} className="hover:bg-slate-50">
                  <td className="py-4 text-slate-900 font-bold">{row.week}</td>
                  <td className="py-4 text-amber-600">{row.calcium}% Target</td>
                  <td className="py-4 text-emerald-600">{row.vitD}% Target</td>
                  <td className="py-4 text-rose-600">{row.omega3}% Target</td>
                  <td className="py-4 text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#147556] text-xs font-bold">
                      Improving ↑
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
