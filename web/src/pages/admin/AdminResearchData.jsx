import React from 'react';
import { Download, FileText, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';

const ANONYMIZED_PARTICIPANTS = [
  { id: 'SUB-401', region: 'Tamil Nadu', wk1Score: 68, wk4Score: 82, diff: '+14 pts' },
  { id: 'SUB-402', region: 'Kerala', wk1Score: 71, wk4Score: 79, diff: '+8 pts' },
  { id: 'SUB-403', region: 'Karnataka', wk1Score: 62, wk4Score: 76, diff: '+14 pts' },
  { id: 'SUB-404', region: 'Andhra Pradesh', wk1Score: 75, wk4Score: 88, diff: '+13 pts' },
];

export default function AdminResearchData() {
  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Subject_ID,Region,Wk1_Score,Wk4_Score,Delta\n" +
      ANONYMIZED_PARTICIPANTS.map(p => `${p.id},${p.region},${p.wk1Score},${p.wk4Score},${p.diff}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "HealthSpan_Anonymized_Research_Data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-['Outfit'] max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7F77DD] uppercase">Ethics Compliant Research Export</span>
          <h1 className="text-3xl font-extrabold text-slate-900">Research & Clinical Trial Data</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-2xl bg-[#7F77DD] hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" /> Export CSV Data
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
          >
            <FileText className="w-4 h-4" /> Generate Report PDF
          </button>
        </div>
      </div>

      {/* Week 1 vs Week 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Score Wk 1 vs Wk 4</span>
          <p className="text-3xl font-extrabold text-emerald-600">69.0 → 81.2</p>
          <span className="text-xs text-emerald-700 font-bold">+12.2 pts Mean Gain</span>
        </div>

        <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Nutrient Gap Reduction</span>
          <p className="text-3xl font-extrabold text-[#7F77DD]">-42% Gap</p>
          <span className="text-xs text-purple-700 font-bold">Calcium & Vit D focus</span>
        </div>

        <div className="bg-white border-2 border-blue-100 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Symptom Reduction Trend</span>
          <p className="text-3xl font-extrabold text-blue-600">-38% Symptoms</p>
          <span className="text-xs text-blue-700 font-bold">Fewer joint pain logs</span>
        </div>
      </div>

      {/* Anonymized Participant Table */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900">Anonymized Participant Cohort</h3>
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> HIPAA / ICMR De-identified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-xs">
                <th className="pb-3">Subject Code</th>
                <th className="pb-3">Region Cohort</th>
                <th className="pb-3">Week 1 Baseline</th>
                <th className="pb-3">Week 4 Score</th>
                <th className="pb-3 text-right">Net Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {ANONYMIZED_PARTICIPANTS.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-4 font-mono font-bold text-slate-900">{row.id}</td>
                  <td className="py-4 text-slate-600">{row.region}</td>
                  <td className="py-4 text-slate-500">{row.wk1Score} pts</td>
                  <td className="py-4 text-emerald-600 font-bold">{row.wk4Score} pts</td>
                  <td className="py-4 text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {row.diff}
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
