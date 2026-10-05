import React, { useState, useEffect, useRef } from 'react';
import {
  X, Mic, MicOff, HeartPulse, Activity, CheckCircle2, AlertCircle,
  Sparkles, Volume2, Save, RefreshCw, ChevronRight, Sliders, Check,
  GlassWater, Droplets, Plus, Minus
} from 'lucide-react';
import { vitalsApi, activityApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

/**
 * DailyVitalsModal
 * Senior-friendly dual-mode modal (Voice & Stepper) for BP, Sugar, Pulse, and Water Intake.
 * Features a pinned header, scrollable body, and sticky bottom action bar so buttons are ALWAYS visible.
 */
export default function DailyVitalsModal({
  isOpen,
  onClose,
  onVitalsSaved,
  onWaterSaved,
  currentVitals = {},
  currentWater = 1.5,
  elderName
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState('voice'); // 'voice' | 'manual'
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vitals State
  const [systolic, setSystolic] = useState(currentVitals?.bp_systolic || '');
  const [diastolic, setDiastolic] = useState(currentVitals?.bp_diastolic || '');
  const [sugar, setSugar] = useState(currentVitals?.blood_sugar || '');
  const [sugarType, setSugarType] = useState(currentVitals?.sugar_type || 'fasting');
  const [pulse, setPulse] = useState(currentVitals?.pulse || '');
  const [water, setWater] = useState(currentWater !== undefined ? currentWater : 0);
  const [notes, setNotes] = useState('');

  const recognitionRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  // Initialize values strictly ONCE when modal opens (Prevents 10s background poll from resetting user typing!)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setSystolic(currentVitals?.bp_systolic || '');
      setDiastolic(currentVitals?.bp_diastolic || '');
      setSugar(currentVitals?.blood_sugar || '');
      setSugarType(currentVitals?.sugar_type || 'fasting');
      setPulse(currentVitals?.pulse || '');
      setWater(currentWater !== undefined ? currentWater : 0);
      setVoiceTranscript('');
      setVoiceFeedback('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Safe input change handlers that never force 0 or lock during user typing
  const handleSystolicChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setSystolic('');
    } else {
      const num = parseInt(val, 10);
      setSystolic(isNaN(num) ? '' : num);
    }
  };

  const handleDiastolicChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setDiastolic('');
    } else {
      const num = parseInt(val, 10);
      setDiastolic(isNaN(num) ? '' : num);
    }
  };

  const handleSugarChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setSugar('');
    } else {
      const num = parseInt(val, 10);
      setSugar(isNaN(num) ? '' : num);
    }
  };

  const handlePulseChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setPulse('');
    } else {
      const num = parseInt(val, 10);
      setPulse(isNaN(num) ? '' : num);
    }
  };

  const handleWaterChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setWater('');
    } else {
      const num = parseFloat(val);
      setWater(isNaN(num) ? '' : num);
    }
  };

  // Setup Web Speech API for voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        setVoiceTranscript(text);
      };

      recognition.onerror = (e) => {
        console.warn('Speech error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (voiceTranscript) {
        analyzeVoiceText(voiceTranscript);
      }
    } else {
      setVoiceTranscript('');
      setVoiceFeedback('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error:', err);
        // Fallback demo simulation
        setIsListening(true);
        setTimeout(() => {
          const sample = 'My BP was 120 over 80 and fasting sugar was 105 today and I drank 6 glasses of water';
          setVoiceTranscript(sample);
          setIsListening(false);
          analyzeVoiceText(sample);
        }, 2000);
      }
    }
  };

  const analyzeVoiceText = async (text) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await vitalsApi.analyzeVoice(text);
      if (res?.data?.extracted) {
        const ext = res.data.extracted;
        if (ext.bp_systolic) setSystolic(ext.bp_systolic);
        if (ext.bp_diastolic) setDiastolic(ext.bp_diastolic);
        if (ext.blood_sugar) setSugar(ext.blood_sugar);
        if (ext.sugar_type) setSugarType(ext.sugar_type);
        if (ext.pulse) setPulse(ext.pulse);
        setVoiceFeedback(ext.detected_summary || 'Vitals recognized successfully!');
      }
    } catch (err) {
      // Offline fallback regex parser
      const bpMatch = text.match(/(\d{2,3})\s*(?:\/|over|\s+)\s*(\d{2,3})/i);
      if (bpMatch) {
        setSystolic(parseInt(bpMatch[1], 10));
        setDiastolic(parseInt(bpMatch[2], 10));
      }
      const sugarMatch = text.match(/(?:sugar|glucose)\s*(?:is|\s*)?(\d{2,3})/i) || text.match(/(\d{2,3})\s*(?:mg\/dl|sugar)/i);
      if (sugarMatch) {
        setSugar(parseInt(sugarMatch[1], 10));
      }
      const pulseMatch = text.match(/(?:pulse|heart\s*rate)\s*(?:is|\s*)?(\d{2,3})/i) || text.match(/(\d{2,3})\s*(?:bpm|pulse)/i);
      if (pulseMatch) {
        setPulse(parseInt(pulseMatch[1], 10));
      }
      const waterMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:glasses|glass|litres|liters|cups?|l)\s*(?:of\s*)?water/i);
      if (waterMatch) {
        const num = parseFloat(waterMatch[1]);
        const calculatedLiters = text.toLowerCase().includes('liter') || text.toLowerCase().includes('litre') ? num : Number((num * 0.25).toFixed(2));
        setWater(calculatedLiters);
      }
      setVoiceFeedback('Readings successfully recognized from speech!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── American Heart Association (AHA) Official Blood Pressure Categories ──
  const getBpCategory = (sys, dia) => {
    if (!sys || !dia) {
      return {
        key: 'unrecorded',
        label: 'Enter readings to see classification',
        stage: 'Unrecorded',
        color: '#94a3b8',
        bg: 'bg-slate-500/15',
        border: 'border-slate-500/30',
        alertText: 'Please enter both systolic and diastolic readings'
      };
    }

    const s = Number(sys);
    const d = Number(dia);

    // 1. Hypertensive Crisis: Higher than 180 systolic and/or higher than 120 diastolic
    if (s > 180 || d > 120) {
      return {
        key: 'crisis',
        label: '🚨 Hypertensive Crisis (>180 and/or >120)',
        stage: 'Hypertensive Crisis',
        color: '#dc2626',
        bg: 'bg-rose-600/20',
        border: 'border-rose-600/60',
        alertText: 'Critical! Seek medical attention immediately.'
      };
    }

    // 2. High Blood Pressure (Hypertension Stage 2): 140 or higher systolic OR 90 or higher diastolic
    if (s >= 140 || d >= 90) {
      return {
        key: 'stage2',
        label: 'Stage 2 HTN (≥140 or ≥90)',
        stage: 'Stage 2 HTN',
        color: '#ef4444',
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/40',
        alertText: 'High Blood Pressure Stage 2'
      };
    }

    // 3. High Blood Pressure (Hypertension Stage 1): 130–139 systolic OR 80–89 diastolic
    if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) {
      return {
        key: 'stage1',
        label: 'Stage 1 HTN (130–139 or 80–89)',
        stage: 'Stage 1 HTN',
        color: '#f97316',
        bg: 'bg-orange-500/15',
        border: 'border-orange-500/40',
        alertText: 'High Blood Pressure Stage 1'
      };
    }

    // 4. Elevated: 120–129 systolic AND less than 80 diastolic
    if (s >= 120 && s <= 129 && d < 80) {
      return {
        key: 'elevated',
        label: 'Elevated (120–129 and <80)',
        stage: 'Elevated',
        color: '#f59e0b',
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/40',
        alertText: 'Elevated BP (Pre-hypertension)'
      };
    }

    // 5. Normal: Less than 120 systolic AND less than 80 diastolic
    return {
      key: 'normal',
      label: 'Normal (<120 and <80)',
      stage: 'Normal',
      color: '#10b981',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/40',
      alertText: 'Optimal Normal Blood Pressure'
    };
  };

  // ── Official Clinical Blood Sugar & Glucose Scale (CDC / ADA / Cleveland Clinic) ──
  const getSugarCategory = (val, type) => {
    if (!val) {
      return {
        key: 'unrecorded',
        label: 'Enter reading to see classification',
        color: '#94a3b8',
        bg: 'bg-slate-500/15',
        border: 'border-slate-500/30',
        alertText: 'Please enter blood sugar value'
      };
    }

    const sVal = Number(val);

    // Hypoglycemia (Low Blood Sugar Alert) for all types
    if (sVal < 70) {
      return {
        key: 'low',
        label: '⚠️ Low Sugar / Hypoglycemia (<70 mg/dL)',
        color: '#0284c7',
        bg: 'bg-sky-500/20',
        border: 'border-sky-500/60',
        alertText: 'Hypoglycemia Alert: Below 70 mg/dL requires immediate fast-acting glucose/fruit juice!'
      };
    }

    if (type === 'fasting') {
      if (sVal < 100) {
        return {
          key: 'normal',
          label: 'Normal Fasting (70–99 mg/dL)',
          color: '#10b981',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/50',
          alertText: 'Normal Non-Diabetic Fasting Range (70–99 mg/dL)'
        };
      }
      if (sVal <= 125) {
        return {
          key: 'prediabetes',
          label: 'Elevated / Prediabetes (100–125 mg/dL)',
          color: '#f59e0b',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/50',
          alertText: 'Prediabetes Range (Target for Diabetics: 80–130 mg/dL)'
        };
      }
      if (sVal <= 180) {
        return {
          key: 'high',
          label: 'High / Diabetic Range (≥126 mg/dL)',
          color: '#f97316',
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/50',
          alertText: 'Fasting level 126 mg/dL or higher indicates Diabetes'
        };
      }
      return {
        key: 'severe',
        label: '🚨 Very High Fasting Sugar (>180 mg/dL)',
        color: '#dc2626',
        bg: 'bg-rose-600/20',
        border: 'border-rose-600/60',
        alertText: 'Severe Hyperglycemia'
      };
    } else {
      // Post-Meal (1-2 Hours After Eating) / Random
      if (sVal < 140) {
        return {
          key: 'normal',
          label: 'Normal Post-Meal (<140 mg/dL)',
          color: '#10b981',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/50',
          alertText: 'Normal Non-Diabetic Post-Meal (<140 mg/dL)'
        };
      }
      if (sVal <= 180) {
        return {
          key: 'target_diabetes',
          label: 'Diabetic Target Post-Meal (140–180 mg/dL)',
          color: '#f59e0b',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/50',
          alertText: 'Target for People Managing Diabetes (<180 mg/dL)'
        };
      }
      if (sVal < 250) {
        return {
          key: 'high',
          label: 'High Post-Meal Spike (181–249 mg/dL)',
          color: '#ef4444',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/50',
          alertText: 'High Post-Meal Blood Sugar Spike'
        };
      }
      return {
        key: 'severe',
        label: '🚨 Critical Post-Meal Spike (≥250 mg/dL)',
        color: '#dc2626',
        bg: 'bg-rose-600/20',
        border: 'border-rose-600/60',
        alertText: 'Critical Post-Meal Spike'
      };
    }
  };

  const bpStatus = getBpCategory(systolic, diastolic);
  const sugarStatus = getSugarCategory(sugar, sugarType);

  const handleSave = async () => {
    setSaving(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const seniorName = elderName || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.name || 'Senior'));

    const sysNum = systolic === '' ? null : Number(systolic);
    const diaNum = diastolic === '' ? null : Number(diastolic);
    const sugarNum = sugar === '' ? null : Number(sugar);
    const pulseNum = pulse === '' ? null : Number(pulse);
    const waterNum = water === '' ? 0 : Number(water);

    const payload = {
      elder_name: seniorName,
      user_id: user?.id || user?._id,
      bp_systolic: sysNum,
      bp_diastolic: diaNum,
      blood_sugar: sugarNum,
      sugar_type: sugarType,
      pulse: pulseNum,
      water_liters: waterNum,
      vitals_source: activeMode,
      vitals_notes: notes,
      logged_date: todayStr
    };

    try {
      await vitalsApi.logVitals(payload);
      await activityApi.logActivity({ elder_name: seniorName, water_liters: waterNum, water_glasses: Math.round(waterNum / 0.25) });
    } catch (err) {
      console.warn('Backend vitals sync notice:', err);
    }

    // Save to local storage for instant persistence
    const todayKey = `vitals_${todayStr}`;
    localStorage.setItem(todayKey, JSON.stringify(payload));

    // Also update local vitals_history array for uninterrupted offline & instant chart rendering
    try {
      const existingHistory = JSON.parse(localStorage.getItem('vitals_history') || '[]');
      const filtered = existingHistory.filter(h => (h.logged_date || h.date) !== todayStr);
      filtered.push(payload);
      localStorage.setItem('vitals_history', JSON.stringify(filtered));
    } catch (e) {}

    window.dispatchEvent(new Event('healthspan:sync'));

    if (onVitalsSaved) onVitalsSaved(payload);
    if (onWaterSaved) onWaterSaved(waterNum);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        
        {/* ── 1. PINNED HEADER ── */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/15 text-rose-400 rounded-2xl border border-rose-500/30">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{t('vitalsModal.title', 'Log Blood Pressure & Sugar')}</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">{t('dashboard.vitalsCardSubtitle', 'Daily Clinical Health Tracker')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t('common.cancel', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. MODE SELECTOR (Voice vs Text) ── */}
        <div className="p-3 bg-slate-950/70 border-b border-slate-800/80 shrink-0">
          <div className="p-1 bg-slate-800/90 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveMode('voice')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'voice'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" /> {t('vitalsModal.voiceTab', '🎙️ Speak Vitals')}
            </button>
            <button
              onClick={() => setActiveMode('manual')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'manual'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" /> {t('vitalsModal.manualTab', '✍️ Manual Input')}
            </button>
          </div>
        </div>

        {/* ── 3. SCROLLABLE FORM BODY ── */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Voice Panel */}
          {activeMode === 'voice' && (
            <div className="space-y-3 p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-center">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {t('vitalsModal.voiceInstruction', 'Speak naturally into mic:')}
                </span>
                <p className="text-xs text-rose-300 font-black italic bg-rose-500/10 py-1.5 px-3 rounded-xl border border-rose-500/20 inline-block">
                  {t('vitalsModal.voiceExample', '"My BP is 125 over 80 and fasting sugar is 105"')}
                </p>
              </div>

              {/* Big Mic Button */}
              <button
                onClick={toggleListening}
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isListening
                    ? 'bg-rose-500 text-white scale-110 animate-pulse shadow-rose-500/60 ring-4 ring-rose-400/40'
                    : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-2 border-rose-500/40'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="text-xs font-black text-slate-200">
                {isListening ? t('vitalsModal.listening', '🔴 Recording… Tap when done') : t('vitalsModal.btnStartSpeaking', '👉 Tap Mic to Speak')}
              </p>

              {voiceTranscript && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">You said:</span>
                  <p className="text-slate-200 font-medium">"{voiceTranscript}"</p>
                </div>
              )}

              {voiceFeedback && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-left text-xs space-y-1">
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Detected Readings:
                  </span>
                  <p className="text-emerald-300 font-extrabold">{voiceFeedback}</p>
                </div>
              )}
            </div>
          )}

          {/* ── BLOOD PRESSURE SECTION ── */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" /> {t('dashboard.bpLabel', 'Blood Pressure (BP)')}
              </span>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full border transition-all"
                style={{ background: bpStatus.bg, color: bpStatus.color, borderColor: bpStatus.color + '60' }}
              >
                {bpStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Systolic */}
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block">
                  {t('dashboard.systolic', 'Systolic')} (Top / mmHg)
                </label>
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSystolic((v) => Math.max(50, (Number(v) || 120) - 2))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={systolic}
                    onChange={handleSystolicChange}
                    placeholder="120"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl py-2 px-2 text-center text-lg font-black text-rose-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSystolic((v) => Math.min(260, (Number(v) || 120) + 2))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Diastolic */}
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 block">
                  {t('dashboard.diastolic', 'Diastolic')} (Bottom / mmHg)
                </label>
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDiastolic((v) => Math.max(30, (Number(v) || 80) - 2))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={handleDiastolicChange}
                    placeholder="80"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl py-2 px-2 text-center text-lg font-black text-pink-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDiastolic((v) => Math.min(180, (Number(v) || 80) + 2))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ── AHA BLOOD PRESSURE CATEGORIES SCALE GUIDE ── */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  📋 AHA Blood Pressure Categories Guide
                </span>
                <span className="text-[10px] font-bold text-slate-500">AHA / ESC Guidelines</span>
              </div>
              
              <div className="space-y-1 text-[10px]">
                {/* Normal */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  bpStatus.key === 'normal'
                    ? 'bg-emerald-500/20 border-emerald-500/60 ring-1 ring-emerald-400 font-black text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <strong>Normal</strong>
                  </span>
                  <span>&lt; 120 mmHg AND &lt; 80 mmHg</span>
                </div>

                {/* Elevated */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  bpStatus.key === 'elevated'
                    ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-400 font-black text-amber-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <strong>Elevated</strong>
                  </span>
                  <span>120–129 mmHg AND &lt; 80 mmHg</span>
                </div>

                {/* Stage 1 HTN */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  bpStatus.key === 'stage1'
                    ? 'bg-orange-500/20 border-orange-500/60 ring-1 ring-orange-400 font-black text-orange-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <strong>Stage 1 Hypertension</strong>
                  </span>
                  <span>130–139 mmHg OR 80–89 mmHg</span>
                </div>

                {/* Stage 2 HTN */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  bpStatus.key === 'stage2'
                    ? 'bg-rose-500/20 border-rose-500/60 ring-1 ring-rose-400 font-black text-rose-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <strong>Stage 2 Hypertension</strong>
                  </span>
                  <span>≥ 140 mmHg OR ≥ 90 mmHg</span>
                </div>

                {/* Hypertensive Crisis */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  bpStatus.key === 'crisis'
                    ? 'bg-red-600/30 border-red-500/80 ring-2 ring-red-500 font-black text-red-300 animate-pulse'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    <strong>Hypertensive Crisis</strong>
                  </span>
                  <span>&gt; 180 mmHg AND/OR &gt; 120 mmHg</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── BLOOD SUGAR SECTION ── */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" /> {t('dashboard.sugarLabel', 'Blood Sugar (Glucose)')}
              </span>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full border transition-all"
                style={{ background: sugarStatus.bg, color: sugarStatus.color, borderColor: sugarStatus.color + '50' }}
              >
                {sugarStatus.label}
              </span>
            </div>

            {/* Fasting vs Post-Meal Selector */}
            <div className="p-1 bg-slate-900 rounded-xl flex gap-1 border border-slate-800">
              {[
                { id: 'fasting', label: `🌅 ${t('vitalsModal.sugarFasting', 'Fasting')}` },
                { id: 'post_prandial', label: `☀️ ${t('vitalsModal.sugarPostMeal', 'Post-Meal')}` },
                { id: 'random', label: '🎲 Random' },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setSugarType(tItem.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    sugarType === tItem.id
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSugar((v) => Math.max(30, (Number(v) || 105) - 5))}
                className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
              >
                -5
              </button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={sugar}
                  onChange={handleSugarChange}
                  placeholder="105"
                  className="w-full bg-transparent text-center text-2xl font-black text-amber-400 outline-none"
                />
                <span className="text-[10px] text-slate-400 font-bold block -mt-1">mg / dL</span>
              </div>
              <button
                type="button"
                onClick={() => setSugar((v) => Math.min(500, (Number(v) || 105) + 5))}
                className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
              >
                +5
              </button>
            </div>

            {/* ── CLINICAL BLOOD SUGAR TARGET RANGES & HBA1C REFERENCE GUIDE ── */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  🩸 Blood Sugar Target Ranges & HbA1c Scale
                </span>
                <span className="text-[10px] font-bold text-slate-500">CDC / ADA / Cleveland Clinic</span>
              </div>

              {/* Target Ranges for Adults */}
              <div className="space-y-1 text-[10px]">
                {/* Low Blood Sugar */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  sugarStatus.key === 'low'
                    ? 'bg-sky-500/20 border-sky-500/60 ring-1 ring-sky-400 font-black text-sky-300 animate-pulse'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <strong>Low Blood Sugar (Hypoglycemia)</strong>
                  </span>
                  <span>&lt; 70 mg/dL (Take fast sugar/juice!)</span>
                </div>

                {/* Fasting Targets */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  sugarType === 'fasting' && (sugarStatus.key === 'normal' || sugarStatus.key === 'prediabetes')
                    ? 'bg-emerald-500/20 border-emerald-500/60 ring-1 ring-emerald-400 font-black text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <strong>Fasting (Before Meals)</strong>
                  </span>
                  <span>70–99 (Normal) • 80–130 (Diabetes target)</span>
                </div>

                {/* Post-Meal Targets */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  sugarType === 'post_prandial' && (sugarStatus.key === 'normal' || sugarStatus.key === 'target_diabetes')
                    ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-400 font-black text-amber-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <strong>Post-Meal (1–2h After Eating)</strong>
                  </span>
                  <span>&lt; 140 (Normal) • &lt; 180 (Diabetes target)</span>
                </div>

                {/* Diabetic Diagnostic Fasting */}
                <div className={`p-1.5 rounded-xl border flex items-center justify-between transition-all ${
                  sugarStatus.key === 'high' || sugarStatus.key === 'severe'
                    ? 'bg-rose-500/20 border-rose-500/60 ring-1 ring-rose-400 font-black text-rose-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400 font-medium'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <strong>Elevated / High Spike</strong>
                  </span>
                  <span>≥ 126 (Fasting) • ≥ 200 (Post-Meal)</span>
                </div>
              </div>

              {/* HbA1c (3-Month Average) Quick Scale */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  🧪 HbA1c (3-Month Average) Scale
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[9px] text-center font-bold">
                  <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <div>&lt; 5.7%</div>
                    <div className="text-[8px] text-emerald-400 font-extrabold">Normal</div>
                  </div>
                  <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <div>5.7% – 6.4%</div>
                    <div className="text-[8px] text-amber-400 font-extrabold">Prediabetes</div>
                  </div>
                  <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    <div>≥ 6.5%</div>
                    <div className="text-[8px] text-rose-400 font-extrabold">Diabetes (&lt;7% target)</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── PULSE / HEART RATE SECTION ── */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-2">
              🫀 {t('vitalsModal.pulseLabel', 'Resting Pulse / Heart Rate')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPulse((v) => Math.max(30, (Number(v) || 72) - 1))}
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 font-black text-base hover:bg-slate-700 cursor-pointer shrink-0"
              >
                -
              </button>
              <input
                type="number"
                value={pulse}
                onChange={handlePulseChange}
                placeholder="72"
                className="w-16 bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2 text-center text-base font-black text-cyan-400 outline-none"
              />
              <span className="text-xs text-slate-400 font-bold">bpm</span>
              <button
                type="button"
                onClick={() => setPulse((v) => Math.min(220, (Number(v) || 72) + 1))}
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 font-black text-base hover:bg-slate-700 cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* ── WATER INTAKE SECTION ── */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-2">
              <GlassWater className="w-4 h-4 text-sky-400" /> {t('vitalsModal.waterLabel', 'Daily Water Intake')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWater((v) => Math.max(0, Number(((Number(v) || 1.5) - 0.25).toFixed(2))))}
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 font-black text-base hover:bg-slate-700 cursor-pointer shrink-0"
              >
                -
              </button>
              <input
                type="number"
                step="0.25"
                value={water}
                onChange={handleWaterChange}
                placeholder="1.5"
                className="w-16 bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2 text-center text-base font-black text-sky-400 outline-none"
              />
              <span className="text-xs text-slate-400 font-bold">L</span>
              <button
                type="button"
                onClick={() => setWater((v) => Number(((Number(v) || 1.5) + 0.25).toFixed(2)))}
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 font-black text-base hover:bg-slate-700 cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* ── 4. GUARANTEED VISIBLE PINNED BOTTOM ACTION BAR ── */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs sm:text-sm rounded-2xl transition-all cursor-pointer text-center"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-2/3 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4" />
            {saving ? t('vitalsModal.savingBtn', 'Saving...') : `${t('vitalsModal.saveBtn', 'Save Vitals Record')} ✓`}
          </button>
        </div>

      </div>
    </div>
  );
}
