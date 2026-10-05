import React, { useState } from 'react';
import { Mic, RefreshCw, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const RECENT_TRANSCRIPTS = [
  { id: 'T-901', text: 'I had 2 ragi dosas with coconut chutney for breakfast', detectedFoods: ['ragi dosa', 'coconut chutney'], status: '100% Recognized' },
  { id: 'T-902', text: 'Ate thinai pongal and sambar in afternoon', detectedFoods: ['sambar'], unrecognized: ['thinai pongal'], status: 'Partial Match' },
  { id: 'T-903', text: 'Severe knee pain after walking in morning', detectedSymptoms: ['knee pain'], status: 'Symptom Flagged' },
];

export default function AdminNLPMonitor() {
  const [retrainMsg, setRetrainMsg] = useState('');

  const handleRetrain = () => {
    setRetrainMsg('⚙️ Retraining voice NLP keyword classifier model with new Indian food items…');
    setTimeout(() => {
      setRetrainMsg('✅ NLP Keyword model successfully retrained! Added 4 new recognized foods.');
      setTimeout(() => setRetrainMsg(''), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-['Outfit'] max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7F77DD] uppercase">Voice Parser Diagnostics</span>
          <h1 className="text-3xl font-extrabold text-slate-900">NLP & Voice Transcript Monitor</h1>
        </div>

        <button
          onClick={handleRetrain}
          className="px-4 py-2.5 rounded-2xl bg-[#7F77DD] hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md"
        >
          <RefreshCw className="w-4 h-4" /> Retrain Keyword Classifier
        </button>
      </div>

      {retrainMsg && (
        <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 font-bold text-sm flex items-center gap-2">
          <span>{retrainMsg}</span>
        </div>
      )}

      {/* Unrecognized Foods Queue */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-lg font-extrabold text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" /> Foods Unrecognized by NLP (Action Queue)
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-amber-300 flex items-center gap-3 text-sm font-bold text-slate-800 shadow-sm">
            <span>🌾 thinai pongal (Foxtail Millet Pongal)</span>
            <button className="px-2.5 py-1 bg-[#7F77DD] text-white rounded-xl text-xs font-extrabold flex items-center gap-1 hover:bg-indigo-700">
              <Plus className="w-3.5 h-3.5" /> Add to DB
            </button>
          </div>

          <div className="bg-white px-4 py-2 rounded-2xl border border-amber-300 flex items-center gap-3 text-sm font-bold text-slate-800 shadow-sm">
            <span>🌿 murungai keerai soup</span>
            <button className="px-2.5 py-1 bg-[#7F77DD] text-white rounded-xl text-xs font-extrabold flex items-center gap-1 hover:bg-indigo-700">
              <Plus className="w-3.5 h-3.5" /> Add to DB
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transcripts Log Table */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xl font-extrabold text-slate-900">Recent Anonymized Voice Logs</h3>

        <div className="space-y-3">
          {RECENT_TRANSCRIPTS.map((t) => (
            <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Transcript ID: {t.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full ${t.unrecognized ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#147556]'}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-base font-medium text-slate-800 italic">"{t.text}"</p>
              {t.detectedFoods && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">Entities Detected:</span>
                  {t.detectedFoods.map(f => (
                    <span key={f} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
