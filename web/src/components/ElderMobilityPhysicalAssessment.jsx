import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldAlert,
  Timer,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Award,
  Bone,
  Flame,
  Volume2,
  Scale,
  Plus,
  Minus,
  Check,
  ChevronRight,
  HelpCircle,
  Footprints,
  UserCheck
} from 'lucide-react';

export default function ElderMobilityPhysicalAssessment({ onSave, initialData = {} }) {
  const [activeSection, setActiveSection] = useState('steadi'); // 'steadi' | 'tug' | 'chair' | 'balance' | 'sarcf' | 'summary'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ── 1. Daily Fall & Balance Screener ──
  const [steadi, setSteadi] = useState({
    fallenPast12M: initialData?.steadi?.fallenPast12M ?? false,
    feelsUnsteady: initialData?.steadi?.feelsUnsteady ?? false,
    worriedAboutFalling: initialData?.steadi?.worriedAboutFalling ?? false
  });

  // ── 2. Timed Up & Go (TUG) ──
  const [tugSeconds, setTugSeconds] = useState(initialData?.tugSeconds ?? null);
  const [isTugRunning, setIsTugRunning] = useState(false);
  const [tugTimerDisplay, setTugTimerDisplay] = useState(0);
  const tugIntervalRef = useRef(null);

  // ── 3. 30-Second Chair Stand ──
  const [chairStands, setChairStands] = useState(initialData?.chairStands ?? null);
  const [chairTimeLeft, setChairTimeLeft] = useState(30);
  const [isChairRunning, setIsChairRunning] = useState(false);
  const chairIntervalRef = useRef(null);

  // ── 4. 4-Stage Balance Test ──
  const [balanceResults, setBalanceResults] = useState({
    sideBySide: initialData?.balanceResults?.sideBySide ?? true,
    semiTandem: initialData?.balanceResults?.semiTandem ?? true,
    tandem: initialData?.balanceResults?.tandem ?? true,
    singleLeg: initialData?.balanceResults?.singleLeg ?? false
  });

  // ── 5. SARC-F Muscle Strength ──
  const [sarcf, setSarcf] = useState({
    strength: initialData?.sarcf?.strength ?? 0,
    assistance: initialData?.sarcf?.assistance ?? 0,
    riseChair: initialData?.sarcf?.riseChair ?? 0,
    climbStairs: initialData?.sarcf?.climbStairs ?? 0,
    falls: initialData?.sarcf?.falls ?? 0
  });

  const speakText = (text) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // ── TUG Timer Handlers ──
  const startTug = () => {
    setIsTugRunning(true);
    setTugTimerDisplay(0);
    speakText('Timer started. Stand up, walk 10 feet, turn around, walk back, and sit down.');
    const startTime = Date.now();
    tugIntervalRef.current = setInterval(() => {
      setTugTimerDisplay(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);
  };

  const stopTug = () => {
    if (!isTugRunning) return;
    clearInterval(tugIntervalRef.current);
    setIsTugRunning(false);
    const finalSec = parseFloat(tugTimerDisplay);
    setTugSeconds(finalSec);
    speakText(`Great! You completed the walk in ${finalSec} seconds.`);
  };

  const resetTug = () => {
    clearInterval(tugIntervalRef.current);
    setIsTugRunning(false);
    setTugTimerDisplay(0);
    setTugSeconds(null);
  };

  // ── Chair Stand Handlers ──
  const startChairTest = () => {
    setIsChairRunning(true);
    setChairTimeLeft(30);
    if (chairStands === null) setChairStands(0);
    speakText('30 second chair stand test started. Stand up fully and sit down repeatedly.');
    chairIntervalRef.current = setInterval(() => {
      setChairTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(chairIntervalRef.current);
          setIsChairRunning(false);
          speakText('Time is up! Excellent effort.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetChairTest = () => {
    clearInterval(chairIntervalRef.current);
    setIsChairRunning(false);
    setChairTimeLeft(30);
  };

  useEffect(() => {
    return () => {
      clearInterval(tugIntervalRef.current);
      clearInterval(chairIntervalRef.current);
    };
  }, []);

  // ── Computations ──
  const steadiPositiveCount = (steadi.fallenPast12M ? 1 : 0) + (steadi.feelsUnsteady ? 1 : 0) + (steadi.worriedAboutFalling ? 1 : 0);
  const sarcfTotalScore = sarcf.strength + sarcf.assistance + sarcf.riseChair + sarcf.climbStairs + sarcf.falls;
  const isSarcopeniaConcern = sarcfTotalScore >= 4;
  const isIncreasedFallRisk = (tugSeconds !== null && tugSeconds >= 12) || (!balanceResults.tandem) || steadiPositiveCount >= 2;

  const handleSaveAndSync = () => {
    const summaryData = {
      steadi,
      tugSeconds,
      chairStands,
      balanceResults,
      sarcf,
      sarcfTotalScore,
      isIncreasedFallRisk,
      isSarcopeniaConcern,
      steadiPositiveCount,
      completedAt: new Date().toISOString()
    };
    if (onSave) {
      onSave(summaryData);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md font-['Outfit'] space-y-6">
      
      {/* ⚠️ Safety Warning Banner (Large & Simple Language) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-900 dark:text-amber-200 shadow-sm">
        <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wide">
            Safety Note For Seniors & Caregivers
          </h4>
          <p className="font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Please make sure a family member is nearby, or keep a sturdy chair or wall within reach. If you feel tired, dizzy, or unsteady at any time, please stop immediately and rest.
          </p>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          {[
            { id: 'steadi', label: '1. Fall Check', icon: AlertTriangle },
            { id: 'tug', label: '2. Walking Speed', icon: Timer },
            { id: 'chair', label: '3. Chair Stand', icon: Activity },
            { id: 'balance', label: '4. Balance Check', icon: Scale },
            { id: 'sarcf', label: '5. Muscle Strength', icon: Flame },
            { id: 'summary', label: '6. Review & Save', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            speakText(soundEnabled ? 'Voice guidance muted' : 'Voice guidance enabled');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          {soundEnabled ? 'Voice On' : 'Muted'}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: 3-QUESTION FALL CHECK
      ────────────────────────────────────────────────────────────── */}
      {activeSection === 'steadi' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Step 1: Daily Walking & Balance Check
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              Please answer these 3 simple questions about your walking and balance at home:
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { key: 'fallenPast12M', label: '1. Have you fallen or slipped in the past 12 months?' },
              { key: 'feelsUnsteady', label: '2. Do you ever feel unsteady or lose balance while standing or walking?' },
              { key: 'worriedAboutFalling', label: '3. Are you worried or fearful about falling when walking alone?' },
            ].map((q) => {
              const val = steadi[q.key];
              return (
                <div
                  key={q.key}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {q.label}
                  </span>
                  <div className="flex gap-3 shrink-0 self-end sm:self-center">
                    {[true, false].map((b) => (
                      <button
                        key={String(b)}
                        type="button"
                        onClick={() => setSteadi({ ...steadi, [q.key]: b })}
                        className={`px-7 py-3 rounded-2xl text-base font-black transition-all cursor-pointer ${
                          val === b
                            ? b
                              ? 'bg-amber-500 text-white shadow-md scale-105'
                              : 'bg-emerald-600 text-white shadow-md scale-105'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        {b ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              Check Result: <strong>{steadiPositiveCount > 0 ? `${steadiPositiveCount} of 3 "Yes" answers (Let's check walking speed)` : 'All 3 "No" answers (Good baseline balance)'}</strong>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('tug')}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm sm:text-base font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              Proceed to Step 2 (Walking Speed) <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: TIMED UP & GO (TUG) WALKING TEST
      ────────────────────────────────────────────────────────────── */}
      {activeSection === 'tug' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Step 2: 3-Meter Walking Speed & Turn Test
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              This measures your walking speed and balance when standing up and turning around.
            </p>
          </div>

          {/* Simple Instructions Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <span className="font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wide block">
              How to perform this test:
            </span>
            <ol className="list-decimal list-inside space-y-1 font-semibold leading-relaxed">
              <li>Sit comfortably on a standard chair.</li>
              <li>Press the green <strong>"Start Timer"</strong> button below.</li>
              <li>Stand up, walk forward 10 feet (about 3 large steps), turn around, walk back, and sit down.</li>
              <li>Press the red <strong>"Stop Timer"</strong> button as soon as you sit down!</li>
            </ol>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-sm">
            {/* Big Timer Display */}
            <div className="w-40 h-40 mx-auto rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-500/30 flex flex-col items-center justify-center shadow-inner">
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {isTugRunning ? tugTimerDisplay : tugSeconds !== null ? `${tugSeconds}s` : '0.0s'}
              </span>
              <span className="text-xs uppercase font-bold text-slate-400 mt-1">
                {isTugRunning ? 'Walking...' : 'Your Walk Time'}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-3">
              {!isTugRunning ? (
                <button
                  type="button"
                  onClick={startTug}
                  className="py-3.5 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Timer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopTug}
                  className="py-3.5 px-7 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer animate-pulse"
                >
                  <Square className="w-5 h-5 fill-current" /> Stop (Senior Seated)
                </button>
              )}

              <button
                type="button"
                onClick={resetTug}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Manual Entry */}
            <div className="max-w-xs mx-auto pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Or enter seconds by hand:</span>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 10.5"
                value={tugSeconds !== null ? tugSeconds : ''}
                onChange={(e) => setTugSeconds(parseFloat(e.target.value) || null)}
                className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm font-bold text-center"
              />
            </div>

            {/* Evaluation Result */}
            {tugSeconds !== null && (
              <div className={`p-4 rounded-2xl text-left border ${
                tugSeconds >= 12
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm uppercase">
                    Result ({tugSeconds} seconds):
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white ${
                    tugSeconds >= 12 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {tugSeconds >= 12 ? 'Needs Balance Support (≥12s)' : 'Good Walking Speed (<12s)'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm mt-1 text-slate-700 dark:text-slate-300">
                  {tugSeconds >= 12
                    ? 'Takes 12 seconds or more. We recommend extra hydration, comfortable non-slip footwear, and leg strengthening.'
                    : 'Takes under 12 seconds. You have healthy walking confidence and good mobility!'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveSection('steadi')}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('chair')}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Proceed to Step 3 (Chair Stand) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: 30-SECOND CHAIR STAND TEST
      ────────────────────────────────────────────────────────────── */}
      {activeSection === 'chair' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Step 3: 30-Second Chair Stand (Leg Muscle Strength)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              This test checks your lower-body leg strength and endurance.
            </p>
          </div>

          {/* Simple Instructions Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <span className="font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wide block">
              How to perform this test:
            </span>
            <ol className="list-decimal list-inside space-y-1 font-semibold leading-relaxed">
              <li>Sit on a sturdy chair with your arms crossed across your chest.</li>
              <li>Press <strong>"Start 30s Timer"</strong> below.</li>
              <li>Stand up completely and sit back down as many times as you comfortably can in 30 seconds.</li>
              <li>Tap the big <strong>"+1 Stand"</strong> button each time you stand up!</li>
            </ol>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block uppercase">Timer</span>
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{chairTimeLeft}s</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 block uppercase">Stands Count</span>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{chairStands || 0}</span>
              </div>
            </div>

            {/* Test Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              {!isChairRunning ? (
                <button
                  type="button"
                  onClick={startChairTest}
                  className="py-3.5 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" /> Start 30s Timer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setChairStands((prev) => (prev || 0) + 1)}
                  className="py-4 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base flex items-center gap-2 shadow-xl shadow-indigo-600/30 cursor-pointer scale-105 transition-all"
                >
                  <Plus className="w-6 h-6" /> Tap Every Time You Stand (+1)
                </button>
              )}

              <button
                type="button"
                onClick={resetChairTest}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Manual Counter Adjustment */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-xs sm:text-sm text-slate-500 font-medium">Adjust count:</span>
              <button
                type="button"
                onClick={() => setChairStands((p) => Math.max(0, (p || 0) - 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-lg"
              >
                -
              </button>
              <span className="text-base font-bold min-w-[30px]">{chairStands || 0}</span>
              <button
                type="button"
                onClick={() => setChairStands((p) => (p || 0) + 1)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-lg"
              >
                +
              </button>
            </div>

            {chairStands !== null && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-left">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Result ({chairStands} stands): {chairStands >= 12 ? 'Strong leg muscles (12 or more stands in 30 seconds).' : 'Below 12 stands: We will include extra natural protein in your diet to build leg strength.'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveSection('tug')}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('balance')}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Proceed to Step 4 (Balance Check) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: 4-STAGE BALANCE TEST
      ────────────────────────────────────────────────────────────── */}
      {activeSection === 'balance' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Step 4: Standing Balance Check (10 Seconds Each)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Try standing in these 4 positions for 10 seconds each without holding anything (keep someone nearby for safety).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {[
              { key: 'sideBySide', label: '1. Feet Side by Side', desc: 'Stand with your feet touching together side by side for 10 seconds.' },
              { key: 'semiTandem', label: '2. One Foot Slightly Ahead', desc: 'Place one foot slightly ahead with heel touching the big toe for 10 seconds.' },
              { key: 'tandem', label: '3. Heel-to-Toe Stance', desc: 'Place one foot directly in front of the other (heel touching toes) for 10 seconds.' },
              { key: 'singleLeg', label: '4. Stand on One Foot (Bonus)', desc: 'Gently raise one foot slightly off the floor for 5 to 10 seconds.' },
            ].map((st) => {
              const passed = balanceResults[st.key];
              return (
                <div
                  key={st.key}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{st.label}</span>
                    <button
                      type="button"
                      onClick={() => setBalanceResults({ ...balanceResults, [st.key]: !passed })}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                        passed
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {passed ? 'Held 10s (Passed)' : 'Unable (<10s)'}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{st.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveSection('chair')}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sarcf')}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              Proceed to Step 5 (Muscle Strength) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: SARC-F MUSCLE STRENGTH CHECK
      ────────────────────────────────────────────────────────────── */}
      {activeSection === 'sarcf' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Step 5: Daily Muscle Strength Check
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              5 questions about your daily physical strength to help us customize your dietary protein:
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              {
                key: 'strength',
                title: '1. Lifting Heavy Things',
                question: 'How easy is it to lift and carry a 4 kg bag of groceries or a full bucket?',
                options: [
                  { label: 'Easy / No difficulty (0 pts)', val: 0 },
                  { label: 'A little hard (1 pt)', val: 1 },
                  { label: 'Very hard or Unable (2 pts)', val: 2 },
                ]
              },
              {
                key: 'assistance',
                title: '2. Walking Across a Room',
                question: 'How easy is it to walk from one room to another?',
                options: [
                  { label: 'Easy / No difficulty (0 pts)', val: 0 },
                  { label: 'A little hard (1 pt)', val: 1 },
                  { label: 'Need walking stick / help (2 pts)', val: 2 },
                ]
              },
              {
                key: 'riseChair',
                title: '3. Standing Up From a Chair',
                question: 'How easy is it to stand up from a chair or bed without pushing with your hands?',
                options: [
                  { label: 'Easy / No difficulty (0 pts)', val: 0 },
                  { label: 'A little hard (1 pt)', val: 1 },
                  { label: 'Very hard or Unable (2 pts)', val: 2 },
                ]
              },
              {
                key: 'climbStairs',
                title: '4. Climbing 10 Stairs',
                question: 'How easy is it to climb one flight of 10 stairs?',
                options: [
                  { label: 'Easy / No difficulty (0 pts)', val: 0 },
                  { label: 'A little hard (1 pt)', val: 1 },
                  { label: 'Very hard or Unable (2 pts)', val: 2 },
                ]
              },
              {
                key: 'falls',
                title: '5. Slipped or Fallen',
                question: 'How many times did you slip or fall in the past year?',
                options: [
                  { label: '0 times (0 pts)', val: 0 },
                  { label: '1 to 3 times (1 pt)', val: 1 },
                  { label: '4 or more times (2 pts)', val: 2 },
                ]
              },
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm"
              >
                <div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{item.title}</span>
                  <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">{item.question}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {item.options.map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSarcf({ ...sarcf, [item.key]: opt.val })}
                      className={`p-3 rounded-xl text-xs sm:text-sm font-bold border transition-all text-left cursor-pointer ${
                        sarcf[item.key] === opt.val
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                Muscle Strength Score: {sarcfTotalScore} of 10
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isSarcopeniaConcern
                  ? 'Score is 4 or higher: We will boost protein (dal, paneer, sprouts) to support muscle recovery.'
                  : 'Score under 4: Healthy senior muscle strength!'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('summary')}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              View Summary & Save <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FINAL HEALTH & NUTRITION SUMMARY
      ────────────────────────────────────────────────────────────── */}
      {activeSection === 'summary' && (
        <div className="space-y-6 animate-in zoom-in-95 py-2">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Your Physical & Mobility Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto font-medium">
              Here are your physical assessment results and how they help personalize your meal plan:
            </p>
          </div>

          {/* 4 Clear Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Walking & Fall Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-indigo-500" /> 1. Walking & Fall Risk
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  isIncreasedFallRisk ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isIncreasedFallRisk ? 'Needs Balance Care' : 'Good Walking Speed'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Walk Time: {tugSeconds !== null ? `${tugSeconds} seconds` : 'Not timed'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isIncreasedFallRisk
                  ? 'We will prioritize regular hydration, electrolyte balance, and home safety guidance.'
                  : 'You have steady walking confidence and good reaction speed!'}
              </p>
            </div>

            {/* Card 2: Muscle Strength */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" /> 2. Leg & Muscle Health
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  isSarcopeniaConcern ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isSarcopeniaConcern ? 'Needs More Protein' : 'Healthy Strength'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Chair Stands: {chairStands !== null ? `${chairStands} in 30s` : 'Completed'} | Score: {sarcfTotalScore}/10
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {isSarcopeniaConcern
                  ? 'Meal Plan Adjustment: Increasing high-protein foods (sprouts, paneer, lentils, nuts) to strengthen leg muscles.'
                  : 'Your muscle strength baseline is well preserved.'}
              </p>
            </div>

            {/* Card 3: Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-500" /> 3. Standing Balance
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  balanceResults.tandem ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {balanceResults.tandem ? 'Steady Balance' : 'Needs Balance Support'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Heel-to-Toe Stance: {balanceResults.tandem ? 'Held 10 Seconds' : 'Under 10 Seconds'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Indicates your posture and standing coordination.
              </p>
            </div>

            {/* Card 4: Doctor / Caregiver Note */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-rose-500" /> 4. Health Team Note
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Care Summary
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Wellness Screener
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                You can share these physical findings with your doctor or physical therapist during routine check-ups.
              </p>
            </div>
          </div>

          {/* Big Action Button to Save & Unlock Next Step */}
          <div className="flex justify-center pt-3">
            <button
              type="button"
              onClick={handleSaveAndSync}
              className="py-4 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" /> Save Physical Assessment & Proceed to Cognitive Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
