import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles, CheckCircle2, Mic, MicOff, Flame, Footprints, Clock, Send, Loader2, Info, Plus, Minus, TrendingUp, Activity, ShieldCheck, Heart } from 'lucide-react';
import { activityApi } from '../services/api';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { parseNaturalSleepText } from '../utils/sleepCalculator';

export default function SleepActivityTracker() {
  const { t } = useLanguage();
  // Walk Duration (starts at 0 until user taps or logs activity)
  const [walkMinutes, setWalkMinutes] = useState(0);
  const [isWalkLogged, setIsWalkLogged] = useState(false);

  // Sleep Routine Tracking (starts at null until user records sleep)
  const [bedtime, setBedtime] = useState(localStorage.getItem('bedtime') || null);
  const [sleepHours, setSleepHours] = useState(null);
  const [sleepQuality, setSleepQuality] = useState('Pending Log');
  const [isSleepLogged, setIsSleepLogged] = useState(false);
  const [sleepExplanation, setSleepExplanation] = useState('No sleep record logged yet today.');
  const [sleepTextInput, setSleepTextInput] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSleepTranscript, setVoiceSleepTranscript] = useState('');
  const [isAnalyzingSleep, setIsAnalyzingSleep] = useState(false);
  const [sleepLogSuccess, setSleepLogSuccess] = useState(false);

  // ── Fetch Activity Data from MongoDB Atlas Backend on Mount ──
  useEffect(() => {
    async function loadActivityData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await activityApi.getToday();
        if (res?.data) {
          const isLogged = res.data.is_logged ?? (res.data.walk_minutes > 0 || (res.data.sleep_hours !== null && res.data.sleep_hours > 0));
          if (isLogged && res.data.walk_minutes !== undefined && res.data.walk_minutes !== null && res.data.walk_minutes > 0) {
            setWalkMinutes(res.data.walk_minutes);
            setIsWalkLogged(true);
          } else {
            setWalkMinutes(0);
            setIsWalkLogged(false);
          }

          if (isLogged && res.data.sleep_hours !== undefined && res.data.sleep_hours !== null && res.data.sleep_hours > 0) {
            setSleepHours(res.data.sleep_hours);
            setSleepQuality(res.data.sleep_quality || 'Restful');
            setIsSleepLogged(true);
          } else {
            setSleepHours(null);
            setSleepQuality('Pending Log');
            setIsSleepLogged(false);
          }
        } else {
          setWalkMinutes(0);
          setIsWalkLogged(false);
          setSleepHours(null);
          setSleepQuality('Pending Log');
          setIsSleepLogged(false);
        }
      } catch (err) {
        console.warn('Activity fetch notice:', err);
        setWalkMinutes(0);
        setIsWalkLogged(false);
        setSleepHours(null);
        setSleepQuality('Pending Log');
        setIsSleepLogged(false);
      }
    }
    loadActivityData();
  }, []);

  // Sync Activity Updates to MongoDB Atlas Backend
  const syncActivityBackend = async (newWalk, newSleep, newQuality) => {
    try {
      const finalWalk = newWalk !== undefined ? newWalk : walkMinutes;
      const finalSleep = newSleep !== undefined ? newSleep : sleepHours;
      const finalQuality = newQuality !== undefined ? newQuality : sleepQuality;
      await activityApi.logActivity({
        walk_minutes: finalWalk,
        steps: finalWalk * 100,
        sleep_hours: finalSleep,
        sleep_quality: finalQuality,
        logged_date: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      console.warn('Activity sync notice:', e);
    }
  };

  // ── Walk Controls ──
  const addWalk10Min = () => {
    const updated = Math.min(walkMinutes + 10, 60);
    setWalkMinutes(updated);
    setIsWalkLogged(updated > 0);
    syncActivityBackend(updated, sleepHours, sleepQuality);
  };

  const removeWalk10Min = () => {
    const updated = Math.max(walkMinutes - 10, 0);
    setWalkMinutes(updated);
    setIsWalkLogged(updated > 0);
    syncActivityBackend(updated, sleepHours, sleepQuality);
  };

  const setExactWalk = (mins) => {
    setWalkMinutes(mins);
    setIsWalkLogged(mins > 0);
    syncActivityBackend(mins, sleepHours, sleepQuality);
  };

  // ── Web Speech API for Sleep Voice Input ──
  useEffect(() => {
    let recognition = null;
    if (isVoiceListening && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setVoiceSleepTranscript(text);
        setSleepTextInput(text);
      };

      recognition.onerror = (err) => {
        console.warn('Sleep speech recognition error:', err);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isVoiceListening]);

  const handleAnalyzeSleep = async (e) => {
    if (e) e.preventDefault();
    const query = sleepTextInput.trim() || voiceSleepTranscript.trim();
    if (!query) return;

    setIsAnalyzingSleep(true);
    try {
      const res = await api.post('/api/analyze-sleep-text', { text: query });
      if (res?.data) {
        const hrs = Number(res.data.sleep_hours) || 7.5;
        const quality = res.data.sleep_quality || 'Restful';
        const expl = res.data.explanation || `Slept ${hrs} hours.`;
        setSleepHours(hrs);
        setSleepQuality(quality);
        setIsSleepLogged(true);
        setSleepExplanation(expl);
        syncActivityBackend(walkMinutes, hrs, quality);
        setSleepLogSuccess(true);
        setTimeout(() => setSleepLogSuccess(false), 5000);
      }
    } catch (err) {
      const parsed = parseNaturalSleepText(query);
      setSleepHours(parsed.sleep_hours);
      setSleepQuality(parsed.sleep_quality);
      setIsSleepLogged(true);
      setSleepExplanation(parsed.explanation);
      syncActivityBackend(walkMinutes, parsed.sleep_hours, parsed.sleep_quality);
      setSleepLogSuccess(true);
      setTimeout(() => setSleepLogSuccess(false), 5000);
    } finally {
      setIsAnalyzingSleep(false);
    }
  };

  const handleBedtimeToggle = () => {
    if (!bedtime) {
      const now = new Date().toISOString();
      setBedtime(now);
      localStorage.setItem('bedtime', now);
    } else {
      const sleepStart = new Date(bedtime);
      const sleepEnd = new Date();
      const diffHours = (sleepEnd - sleepStart) / (1000 * 60 * 60);
      const finalHours = Math.min(Math.max(parseFloat(diffHours.toFixed(1)), 4), 12);
      setSleepHours(finalHours);
      setSleepQuality('Restful');
      setIsSleepLogged(true);
      setBedtime(null);
      localStorage.removeItem('bedtime');
      syncActivityBackend(walkMinutes, finalHours, 'Restful');
    }
  };

  const caloriesBurned = Math.round(walkMinutes * 3.5); // ~3.5 kcal per min
  const walkGoal = 60;
  const walkPercent = isWalkLogged ? Math.min(Math.round((walkMinutes / walkGoal) * 100), 100) : 0;

  return (
    <div className="space-y-6 font-['Outfit']">
      {/* ── Desktop Banner / KPI Metrics Header ── */}
      <div className="glass-card-premium p-6 rounded-3xl shadow-md border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Wellness & Rest Dashboard
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Daily Mobility & Sleep Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Monitor senior daily walking cadence, active calories, and AI-assisted rest patterns
          </p>
        </div>

        {/* Quick KPI Stat Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <Footprints className="w-5 h-5 text-emerald-500" />
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase">Today's Walk</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {isWalkLogged ? `${walkMinutes} / 60 min (${walkPercent}%)` : '0 / 60 min (Not Logged)'}
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
            <Moon className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase">Last Rest</div>
              <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {isSleepLogged ? `${sleepHours} hrs (${sleepQuality})` : 'Not Logged Yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-Column Desktop Grid for Card Arrangements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── CARD 1: Interactive Walk Duration Tracker ── */}
        <div className="glass-card-premium p-6 rounded-3xl space-y-6 shadow-md border flex flex-col justify-between">
          <div className="space-y-5">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                  <Footprints className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{t('activitySleep.walkTracker', 'Daily Walk Duration')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('activitySleep.walkTarget', 'Target: 60 mins (Click 10 min blocks)')}</p>
                </div>
              </div>

              {/* Steppers */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={removeWalk10Min}
                  disabled={walkMinutes === 0}
                  className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-30 cursor-pointer text-base"
                  title="-10 min"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={addWalk10Min}
                  disabled={walkMinutes >= 60}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-30 cursor-pointer"
                  title="+10 min"
                >
                  <Plus className="w-4 h-4" /> 10 Min {t('dashboard.stepsWalked', 'Walk')}
                </button>
              </div>
            </div>

            {/* Counter & Calorie Pill */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{walkMinutes}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold ml-2">/ 60 {t('activitySleep.minutesWalked', 'min walk target')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/20">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                <span>~{caloriesBurned} kcal · {walkMinutes * 100} {t('dashboard.stepsWalked', 'steps')}</span>
              </div>
            </div>

            {/* 6 Interactive 10-Minute Walk Blocks */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t('activitySleep.stepperHelp', 'Tap Walk Block to Set Duration:')}
              </label>
              <div className="grid grid-cols-6 gap-2.5">
                {[10, 20, 30, 40, 50, 60].map((mins) => {
                  const isFilled = walkMinutes >= mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setExactWalk(mins)}
                      className={`h-14 rounded-2xl font-black text-xs flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isFilled
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-500 text-white border-emerald-400 shadow-md shadow-emerald-600/25 scale-102 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Footprints className={`w-4 h-4 mb-0.5 ${isFilled ? 'text-white' : 'text-slate-400'}`} />
                      <span className="text-xs">{mins}m</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${walkPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{walkPercent}% {t('dashboard.targetGlasses', 'Target')}</span>
                <span>{Math.max(walkGoal - walkMinutes, 0)} mins remaining</span>
              </div>
            </div>
          </div>

          {/* Mobility Advice Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <Heart className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Gentle low-impact walking supports cardiovascular resilience, steady glucose balance, and joint mobility.</span>
          </div>
        </div>

        {/* ── CARD 2: Sleep Tracker with Voice & Text Input ── */}
        <div className="glass-card-premium p-6 rounded-3xl space-y-6 shadow-md border flex flex-col justify-between">
          <div className="space-y-5">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{t('activitySleep.sleepTracker', 'Sleep Routine')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('activitySleep.voiceSleepHelp', 'Log via Voice, Text or 1-Tap Routine')}</p>
                </div>
              </div>
              <div className={`text-xs font-bold px-3.5 py-1.5 rounded-2xl border flex items-center gap-1.5 shrink-0 ${
                isSleepLogged 
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <CheckCircle2 className={`w-4 h-4 ${isSleepLogged ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{isSleepLogged ? sleepQuality : 'Pending Log'}</span>
              </div>
            </div>

            {/* Rest Display & Good Night / Morning Action Button */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                  {isSleepLogged ? sleepHours : '--'}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-bold ml-2">
                  {isSleepLogged ? t('activitySleep.sleepDuration', 'hours rest') : 'hours rest (Not Logged)'}
                </span>
              </div>

              <button
                onClick={handleBedtimeToggle}
                className={`min-h-[48px] px-5 sm:px-6 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  bedtime
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/20'
                }`}
              >
                {bedtime ? <Sun className="w-4 h-4 text-slate-950" /> : <Moon className="w-4 h-4 text-white" />}
                <span>{bedtime ? 'Good Morning ☀️' : 'Good Night 🌙'}</span>
              </button>
            </div>

            {bedtime && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-xs text-indigo-700 dark:text-indigo-300 font-semibold animate-pulse flex items-center gap-2">
                <span>🌙 Sleeping in progress... Tap "Good Morning" when you wake up.</span>
              </div>
            )}

            {/* ── Voice & Text Sleep Input Section ── */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>🎙️ {t('activitySleep.voiceSleepHelp', 'Voice or Text Sleep Log:')}</span>
                </label>
                {isVoiceListening && (
                  <span className="text-rose-500 font-extrabold text-[11px] animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Listening...
                  </span>
                )}
              </div>

              <form onSubmit={handleAnalyzeSleep} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={sleepTextInput}
                    onChange={(e) => setSleepTextInput(e.target.value)}
                    placeholder={t('activitySleep.typePlaceholder', 'e.g. I slept 8 hours peacefully from 10 PM to 6 AM')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl py-3 pl-3.5 pr-10 text-xs text-slate-900 dark:text-white font-medium outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (isVoiceListening) {
                        setIsVoiceListening(false);
                      } else {
                        setVoiceSleepTranscript('');
                        setIsVoiceListening(true);
                      }
                    }}
                    className={`absolute right-2 top-2 p-1.5 rounded-xl transition-all cursor-pointer ${
                      isVoiceListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                    }`}
                    title="Voice Input"
                  >
                    {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzingSleep || !sleepTextInput.trim()}
                  className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-600/20 shrink-0"
                >
                  {isAnalyzingSleep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{t('activitySleep.saveSleep', 'Calculate Sleep')}</span>
                </button>
              </form>

              {/* Quick Example Voice / Text Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                <span className="text-[11px] text-slate-400 font-bold">Try saying:</span>
                {[
                  "Slept 10pm to 6am",
                  "Slept 8 hours soundly",
                  "11:30 PM to 6:30 AM"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSleepTextInput(prompt)}
                    className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>

              {voiceSleepTranscript && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 italic">
                  Spoken: "{voiceSleepTranscript}"
                </p>
              )}

              {sleepLogSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                  <div className="text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Sleep Recorded: {sleepHours} hours ({sleepQuality})
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pl-5">
                    💡 {sleepExplanation}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rest Advice */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-800 dark:text-indigo-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Regular sleep schedule (7 to 8.5 hours) supports cognitive memory retention and circadian biological rhythm.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
