import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sun, Sparkles, Quote, Volume2, VolumeX, Heart, ShieldCheck,
  ChevronLeft, ChevronRight, X, Clock, AlertCircle, CheckCircle2,
  Utensils, Stethoscope
} from 'lucide-react';
import { DAILY_QUOTES, MEDICAL_FOOD_REMEDIES, getDailyWisdom } from '../data/dailyWisdomData';

export default function DailyWisdomRemedyModal({
  isOpen,
  onClose,
  elderName = 'Senior',
  conditions = [],
  onAcknowledge
}) {
  const [currentRemedyIndex, setCurrentRemedyIndex] = useState(0);
  const [dailyData, setDailyData] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const wisdom = getDailyWisdom(new Date().toISOString().split('T')[0], conditions);
      setDailyData(wisdom);
      const idx = MEDICAL_FOOD_REMEDIES.findIndex(r => r.id === wisdom.remedy.id);
      setCurrentRemedyIndex(idx >= 0 ? idx : 0);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      stopSpeech();
      document.body.style.overflow = '';
    }
    return () => {
      stopSpeech();
      document.body.style.overflow = '';
    };
  }, [isOpen, conditions]);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on your browser.');
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const currentRemedy = MEDICAL_FOOD_REMEDIES[currentRemedyIndex] || dailyData?.remedy;
    const currentQuote = dailyData?.quote;

    const textToRead = `Good morning ${elderName}. Today's thought: "${currentQuote?.text || ''}". 
    Today's recommended healing food is ${currentRemedy?.foodName || ''}. 
    Eating this is good for: ${currentRemedy?.eatingThisIsGoodFor || ''}. 
    Why it helps: ${currentRemedy?.whyItHelps || ''}. 
    Best time to consume: ${currentRemedy?.bestTime || ''}. 
    Preparation: ${currentRemedy?.preparation || ''}. 
    Wishing you good health and a peaceful day!`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.88; // elder-friendly gentle pace
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!isOpen || !dailyData) return null;

  const currentRemedy = MEDICAL_FOOD_REMEDIES[currentRemedyIndex] || dailyData.remedy;
  const quote = dailyData.quote;

  const handleNextRemedy = () => {
    stopSpeech();
    setCurrentRemedyIndex((prev) => (prev + 1) % MEDICAL_FOOD_REMEDIES.length);
  };

  const handlePrevRemedy = () => {
    stopSpeech();
    setCurrentRemedyIndex((prev) => (prev - 1 + MEDICAL_FOOD_REMEDIES.length) % MEDICAL_FOOD_REMEDIES.length);
  };

  const handleConfirm = () => {
    stopSpeech();
    if (onAcknowledge) onAcknowledge();
    onClose();
  };

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-['Outfit']"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleConfirm();
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-amber-400/80 dark:border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Gradient Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-500 shrink-0" />

        {/* ── HEADER ── */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-amber-100 dark:border-slate-800 bg-amber-50/50 dark:bg-slate-900/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {timeGreeting} & Blessings
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-black bg-amber-200/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200">
                  Daily Entry
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {timeGreeting}, {elderName} ji!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Speech Readout Button */}
            <button
              type="button"
              onClick={handleToggleSpeech}
              title={isSpeaking ? "Stop Voice Readout" : "Listen to Today's Wisdom"}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                isSpeaking 
                  ? 'bg-amber-500 text-white animate-pulse shadow-md shadow-amber-500/30' 
                  : 'bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-700 border border-amber-300/60 dark:border-slate-700'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Close X Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* 1. Daily Uplifting Quote Card */}
          <div className="relative rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-600/40 p-4 shadow-xs">
            <Quote className="absolute top-2 right-3 w-8 h-8 text-amber-400/25 pointer-events-none" />
            
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Thought For Today ({quote.theme})
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 italic leading-relaxed">
              "{quote.text}"
            </p>

            <div className="mt-2 text-right">
              <span className="text-[11px] font-bold text-amber-800/80 dark:text-amber-300/80">
                — {quote.author}
              </span>
            </div>
          </div>

          {/* 2. Medical Food Remedy Card ("Eating This Is Good For That") */}
          <div className="rounded-2xl border-2 border-emerald-400/60 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-3 shadow-xs">
            
            {/* Header with Carousel Navigation */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Food as Medicine • Daily Remedy
                </span>
              </div>

              {/* Remedy Switcher */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevRemedy}
                  title="Previous remedy"
                  className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 px-1">
                  {currentRemedyIndex + 1} / {MEDICAL_FOOD_REMEDIES.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextRemedy}
                  title="Next remedy"
                  className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Food Name & Icon */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-700/50 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {currentRemedy.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Recommended Daily Superfood
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {currentRemedy.foodName}
                </h3>
              </div>
            </div>

            {/* Eating This Is Good For... */}
            <div className="p-3 bg-emerald-100/70 dark:bg-emerald-900/40 rounded-xl border-l-4 border-emerald-500 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-black text-emerald-900 dark:text-emerald-300">
                <Heart className="w-3 h-3 text-emerald-600" />
                <span>Eating this is especially good for:</span>
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
                {currentRemedy.eatingThisIsGoodFor}
              </p>
            </div>

            {/* Clinical & Nutritional Mechanism ("Why it works") */}
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Why It Works (Clinical Nutrition Rationale)</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                {currentRemedy.whyItHelps}
              </p>
            </div>

            {/* Target Health Badges */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Aids Health Conditions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentRemedy.targetConditions.map((cond, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-700/60 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Best Time & Preparation Tip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <div className="bg-amber-100/60 dark:bg-slate-800 p-2.5 rounded-xl border border-amber-300/60 dark:border-amber-700/40 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Best Time</span>
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {currentRemedy.bestTime}
                </p>
              </div>

              <div className="bg-teal-100/60 dark:bg-slate-800 p-2.5 rounded-xl border border-teal-300/60 dark:border-teal-700/40 space-y-0.5">
                <div className="flex items-center gap-1 text-[10px] font-black text-teal-900 dark:text-teal-300 uppercase">
                  <Utensils className="w-3 h-3 text-teal-600" />
                  <span>Preparation Tip</span>
                </div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {currentRemedy.preparation}
                </p>
              </div>
            </div>

            {/* Caution/Doctor Note */}
            {currentRemedy.caution && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-slate-900 dark:text-slate-100">Doctor's Note:</strong> {currentRemedy.caution}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden sm:flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Delivered once daily on morning entry</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-700/20 hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Start My Healthy Day</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
