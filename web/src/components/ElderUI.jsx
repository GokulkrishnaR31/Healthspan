import React, { useState } from 'react';
import { Mic, MicOff, Check, AlertTriangle, AlertCircle, Phone, Heart, ShieldAlert, X, Sparkles, Smile, Award, Star, Activity, Info } from 'lucide-react';

/** Professional Avatar Badge */
export const CartoonAvatar = ({ type = 'paati', size = 'md' }) => {
  const avatars = {
    paati: { icon: Heart, label: 'Elder', bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    thatha: { icon: ShieldAlert, label: 'Elder', bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    champion: { icon: Award, label: 'Health Champion', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    ragi: { icon: Activity, label: 'Healthy Meal', bg: 'bg-orange-50 text-orange-600 border-orange-200' },
    milk: { icon: Sparkles, label: 'Nutritious', bg: 'bg-sky-50 text-sky-600 border-sky-200' },
  };

  const current = avatars[type] || avatars.paati;
  const sizeClasses = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const Icon = current.icon;

  return (
    <div className={`${sizeClasses} ${current.bg} border rounded-full flex items-center justify-center shadow-sm shrink-0 transition-transform`}>
      <Icon className={size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} />
    </div>
  );
};

/** Elegant TapChip for accessibility without childish look */
export const TapChip = ({ label, selected, onClick, icon: Icon, badge, emoji }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-[52px] px-5 py-3 text-[16px] font-medium rounded-xl border transition-all flex items-center justify-center gap-3 cursor-pointer select-none ${
      selected
        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100 ring-1 ring-indigo-600'
        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {Icon && <Icon className={`w-5 h-5 ${selected ? 'text-indigo-600' : 'text-slate-400'}`} />}
    <span>{label}</span>
    {badge && (
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200 ml-1">
        {badge}
      </span>
    )}
    {selected && <Check className="w-5 h-5 text-indigo-600 ml-auto shrink-0" />}
  </button>
);

/** Large touch-friendly button with premium feel */
export const LargeButton = ({ children, onClick, variant = 'primary', icon: Icon, disabled, type = 'button', className = '' }) => {
  const baseStyles = "w-full min-h-[56px] px-6 py-3.5 text-[17px] font-semibold rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.98]";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 border border-indigo-700",
    secondary: "bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 border border-rose-700",
    outline: "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

/** Refined Health Score Ring */
export const HealthScoreRing = ({ score = 0, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#E11D48'; // Rose
  let textColor = 'text-rose-700';
  let label = 'Needs Attention';

  if (score >= 80) {
    strokeColor = '#10B981'; // Emerald
    textColor = 'text-emerald-700';
    label = 'Excellent Health';
  } else if (score >= 60) {
    strokeColor = '#F59E0B'; // Amber
    textColor = 'text-amber-700';
    label = 'Fair Health';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-5xl font-light tracking-tight ${textColor}`}>{score}</span>
          <span className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Score</span>
        </div>
      </div>
      <div className={`mt-6 px-4 py-2 rounded-full text-sm font-medium ${textColor} bg-slate-50 border border-slate-100 flex items-center gap-2`}>
        <Activity className="w-4 h-4" /> {label}
      </div>
    </div>
  );
};

/** Refined Insight Box */
export const BlueExplanationBox = ({ message }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-4 text-slate-800 shadow-sm text-left">
    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
      <Info className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[15px] font-semibold text-slate-900 mb-1">
        Insight
      </p>
      <p className="text-[15px] text-slate-600 leading-relaxed">{message}</p>
    </div>
  </div>
);

/** Premium Nutrient Card */
export const NutrientCard = ({ name, percent, current, target, unit, icon: Icon, emoji }) => {
  let statusBg = 'bg-rose-50 border-rose-200 text-rose-700';
  let progressBg = 'bg-rose-500';
  let badgeText = 'Low';

  if (percent >= 80) {
    statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-700';
    progressBg = 'bg-emerald-500';
    badgeText = 'Optimal';
  } else if (percent >= 50) {
    statusBg = 'bg-amber-50 border-amber-200 text-amber-700';
    progressBg = 'bg-amber-500';
    badgeText = 'Fair';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            {Icon ? <Icon className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
          </div>
          <span className="text-[16px] font-semibold text-slate-800">{name}</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${statusBg}`}>
          {badgeText} ({percent}%)
        </span>
      </div>

      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-slate-500">
        <span className="font-medium">Current: <span className="text-slate-700">{current} {unit}</span></span>
        <span className="font-medium">Target: <span className="text-slate-700">{target} {unit}</span></span>
      </div>
    </div>
  );
};

/** Refined Voice Recorder Component */
export const VoiceRecorderWidget = ({ onTranscript, onLogSaved }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [detectedSymptoms, setDetectedSymptoms] = useState([]);
  const [manualInput, setManualInput] = useState('');

  const foodKeywords = ['ragi', 'dosa', 'sambar', 'idli', 'rice', 'roti', 'dal', 'milk', 'curd', 'spinach', 'cheera', 'kootu', 'upma', 'khichdi', 'paneer', 'fish', 'egg', 'fruits', 'apple', 'banana'];
  const symptomKeywords = ['knee pain', 'joint pain', 'fatigue', 'tired', 'acidity', 'gas', 'headache', 'dizziness', 'chest pain'];

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => { setIsListening(true); };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      parseEntities(currentTranscript);
    };

    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  const stopListening = () => { setIsListening(false); };

  const parseEntities = (text) => {
    const lower = text.toLowerCase();
    const foods = foodKeywords.filter(f => lower.includes(f));
    const symptoms = symptomKeywords.filter(s => lower.includes(s));
    setDetectedFoods([...new Set(foods)]);
    setDetectedSymptoms([...new Set(symptoms)]);
  };

  const handleSave = () => {
    const finalText = transcript || manualInput;
    if (!finalText.trim()) return;
    onLogSaved?.({
      transcript: finalText,
      foods: detectedFoods,
      symptoms: detectedSymptoms,
      timestamp: new Date().toISOString(),
      stepCountAutoCaptured: 3420,
      sleepEstimateAutoCaptured: '7h 15m',
    });
    setTranscript('');
    setManualInput('');
    setDetectedFoods([]);
    setDetectedSymptoms([]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-slate-800">Voice Entry</h3>
        <p className="text-slate-500 text-[15px]">Tap the microphone and describe your meal.</p>
      </div>

      {/* Mic Button */}
      <div className="flex justify-center py-4">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 shadow-sm transition-all duration-300 cursor-pointer border-4 ${
            isListening
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
              : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-600'
          }`}
        >
          {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
        </button>
      </div>

      <p className="text-center text-[15px] font-medium text-slate-600">
        {isListening ? 'Listening...' : 'Tap to Start'}
      </p>

      {/* Transcript Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left min-h-[100px]">
        <span className="text-xs font-semibold uppercase text-slate-400 block mb-2 tracking-wider">Live Transcript</span>
        <p className="text-[16px] text-slate-800 leading-relaxed">
          {transcript || manualInput || 'Waiting for input...'}
        </p>
      </div>

      {/* Detected Tags */}
      {(detectedFoods.length > 0 || detectedSymptoms.length > 0) && (
        <div className="space-y-4 text-left">
          {detectedFoods.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2 tracking-wider">Detected Foods</span>
              <div className="flex flex-wrap gap-2">
                {detectedFoods.map(food => (
                  <span key={food} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          {detectedSymptoms.length > 0 && (
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2 tracking-wider">Detected Symptoms</span>
              <div className="flex flex-wrap gap-2">
                {detectedSymptoms.map(sym => (
                  <span key={sym} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback Text Input */}
      <div className="space-y-3 text-left">
        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Manual Entry</label>
        <input
          type="text"
          value={manualInput}
          onChange={(e) => { setManualInput(e.target.value); parseEntities(e.target.value); }}
          placeholder="e.g. 2 ragi dosas and curd for lunch"
          className="w-full min-h-[52px] px-4 rounded-xl border border-slate-300 text-[16px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-shadow"
        />
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <LargeButton onClick={handleSave} disabled={!transcript && !manualInput}>
          Save Entry
        </LargeButton>
      </div>
    </div>
  );
};

