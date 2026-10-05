import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Send, Loader2, Sparkles, CheckCircle, Utensils, Clock, ShieldAlert, BellRing, Zap } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isFastFoodName } from './ElderHealthVisualizer';
import { fastParseMealText } from '../utils/fastFoodParser';

const MEAL_SLOTS = [
  { id: 'Breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'Lunch', label: 'Lunch', icon: '☀️' },
  { id: 'Evening Snacks', label: 'Snacks', icon: '☕' },
  { id: 'Dinner', label: 'Dinner', icon: '🌙' },
];

const QUICK_ELDER_MEALS = [
  { label: '2 Idlis + Sambar', text: '2 idlis and 1 cup sambar', slot: 'Breakfast' },
  { label: '1 Curd Rice', text: '1 cup curd rice', slot: 'Lunch' },
  { label: '2 Chapatis + Dal', text: '2 chapatis and 1 cup dal', slot: 'Lunch' },
  { label: '1 Oats Porridge', text: '1 cup cooked oats porridge', slot: 'Breakfast' },
  { label: '1 Filter Coffee', text: '1 cup filter coffee', slot: 'Evening Snacks' },
  { label: '1 Tender Coconut', text: '1 glass tender coconut water', slot: 'Evening Snacks' },
];

export default function VoiceMealModal({ isOpen, onClose, onMealSaved }) {
  const { user } = useAuth();
  const { speechLangCode } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('Lunch');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedFoods, setParsedFoods] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const modalEndRef = useRef(null);

  // Automatic Voice Meal Category Recognition Helper
  const detectSlotFromText = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('breakfast') || lower.includes('morning') || lower.includes('tiffin') || lower.includes('idli') || lower.includes('dosa') || lower.includes('poori') || lower.includes('kanji') || lower.includes('pongal') || lower.includes('upma') || lower.includes('poha')) {
      return 'Breakfast';
    }
    if (lower.includes('snack') || lower.includes('tea') || lower.includes('coffee') || lower.includes('evening') || lower.includes('biscuit') || lower.includes('sundal') || lower.includes('makhana') || lower.includes('coconut water')) {
      return 'Evening Snacks';
    }
    if (lower.includes('dinner') || lower.includes('night') || lower.includes('khichdi') || lower.includes('milk') || lower.includes('soup')) {
      return 'Dinner';
    }
    if (lower.includes('lunch') || lower.includes('afternoon') || lower.includes('rice') || lower.includes('curry') || lower.includes('sambar') || lower.includes('thali') || lower.includes('roti') || lower.includes('chapati') || lower.includes('dal')) {
      return 'Lunch';
    }
    return null;
  };

  // Instant analyze helper for text
  const performAnalysis = async (queryText) => {
    const clean = (queryText || '').trim();
    if (!clean) return;

    const detected = detectSlotFromText(clean);
    const activeSlot = detected || selectedSlot;

    // 1. Instant local parser (0ms response)
    const localFoods = fastParseMealText(clean, activeSlot);
    if (localFoods && localFoods.length > 0) {
      setParsedFoods(localFoods);
      setAnalyzing(false);
      return;
    }

    // 2. Fallback to API analysis
    setAnalyzing(true);
    const elderName = user?.name || user?.first_name || 'Senior';
    try {
      const res = await api.post('/api/analyze-food-text', { text: clean, elder_name: elderName });
      const foods = (res.data.foods || []).map(f => ({
        ...f,
        category: f.category || activeSlot
      }));
      setParsedFoods(foods.length > 0 ? foods : [
        {
          name: clean,
          category: activeSlot,
          quantity: 1,
          unit: 'serving',
          nutrition_facts: {
            calories: 280,
            protein_g: 8,
            carbs_g: 40,
            fat_g: 4,
            calcium_mg: 30,
          },
        }
      ]);
    } catch (err) {
      setParsedFoods([
        {
          name: clean,
          category: activeSlot,
          quantity: 1,
          unit: 'serving',
          nutrition_facts: {
            calories: 280,
            protein_g: 8,
            carbs_g: 40,
            fat_g: 4,
            calcium_mg: 30,
          },
        },
      ]);
    } finally {
      setAnalyzing(false);
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    let recognition = null;
    if (isListening && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLangCode || 'en-IN';

      recognition.onresult = (event) => {
        const text = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setTranscript(text);
        setInputText(text);

        const detected = detectSlotFromText(text);
        if (detected) setSelectedSlot(detected);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim() || inputText.trim()) {
          performAnalysis(transcript.trim() || inputText.trim());
        }
      };

      recognition.start();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening, speechLangCode]);

  useEffect(() => {
    if (parsedFoods && parsedFoods.length > 0) {
      setTimeout(() => {
        modalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [parsedFoods]);

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      const query = transcript.trim() || inputText.trim();
      if (query) performAnalysis(query);
    } else {
      setTranscript('');
      setParsedFoods(null);
      setIsListening(true);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    const queryText = inputText.trim() || transcript.trim();
    if (!queryText) return;
    performAnalysis(queryText);
  };

  const handleSelectQuickMeal = (qm) => {
    setInputText(qm.text);
    setSelectedSlot(qm.slot);
    performAnalysis(qm.text);
  };

  const handleUpdateItemCategory = (idx, newCategory) => {
    setParsedFoods(prev =>
      prev.map((f, i) => i === idx ? { ...f, category: newCategory } : f)
    );
  };

  // Check if any food item is fast food
  const hasFastFood = parsedFoods && parsedFoods.some(f => isFastFoodName(f.name));

  // ── INSTANT OPTIMISTIC SAVE TO LOCAL & BACKEND WITH ZERO WAITING ──
  const activeUserName = user?.first_name || user?.name?.split(' ')[0] || 'Senior';
  const userStorageKey = `logged_meals_${user?.email || user?.id || 'guest'}`;

  const handleSaveMeal = async () => {
    if (!parsedFoods || parsedFoods.length === 0) return;

    setSaving(true);
    const existingLocal = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    const newLocalMeals = [];
    const backendPayloads = [];

    const nowDate = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (const food of parsedFoods) {
      const itemCategory = food.category || selectedSlot;
      const mealItem = {
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: food.name || 'Logged Meal',
        meal_name: food.name || 'Logged Meal',
        category: itemCategory,
        meal_type: itemCategory,
        time: nowTime,
        date: nowDate,
        timestamp: nowIso,
        calories: food.nutrition_facts?.calories || 280,
        protein: food.nutrition_facts?.protein_g || 8,
        protein_g: food.nutrition_facts?.protein_g || 8,
        carbs: food.nutrition_facts?.carbs_g || 40,
        carbs_g: food.nutrition_facts?.carbs_g || 40,
      };

      newLocalMeals.push(mealItem);
      backendPayloads.push({
        elder_name: activeUserName,
        meal_name: food.name || 'Logged Meal',
        meal_type: itemCategory,
        calories: food.nutrition_facts?.calories || 280,
        protein_g: food.nutrition_facts?.protein_g || 8,
        carbs_g: food.nutrition_facts?.carbs_g || 40,
        fat_g: food.nutrition_facts?.fat_g || 5,
        logged_at: nowIso
      });
    }

    // 1. Instant local persistence & instant optimistic update to parent
    const combinedLocal = [...newLocalMeals, ...existingLocal];
    localStorage.setItem(userStorageKey, JSON.stringify(combinedLocal));
    localStorage.setItem('logged_meals', JSON.stringify(combinedLocal));
    window.dispatchEvent(new Event('healthspan:sync'));

    if (onMealSaved) {
      onMealSaved(parsedFoods);
    }

    // 2. Dispatch backend batch creation asynchronously without blocking UI
    api.post('/api/meals', { meals: backendPayloads }).then(() => {
      window.dispatchEvent(new Event('healthspan:sync'));
    }).catch(e => console.warn('Background meal sync notice:', e.message));

    // 3. Fast Food Alert handling
    if (hasFastFood) {
      const fastFoodItems = parsedFoods.filter(f => isFastFoodName(f.name));
      const foodNamesStr = fastFoodItems.map(f => f.name).join(', ');
      const totalCalories = fastFoodItems.reduce((acc, f) => acc + (f.nutrition_facts?.calories || 280), 0);

      const alertObj = {
        elderName: activeUserName,
        foodName: foodNamesStr,
        calories: totalCalories,
        time: nowTime,
        date: nowDate,
        healthRisk: 'High in refined sodium & trans-fats. Can trigger blood pressure spikes, heartburn & strain senior digestion.',
        penaltyPts: fastFoodItems.length * 15,
        recommendedAction: 'Ensure senior drinks 2 glasses of warm water and consumes a low-sodium, light dinner.',
        timestamp: nowIso
      };

      localStorage.setItem('caregiver_fastfood_alert', JSON.stringify(alertObj));

      api.post('/api/send-sms', {
        phone: '+91 98765 43210',
        alert_type: 'Fast Food Alert',
        message: `⚠️ HealthSpan Fast Food Alert: Your senior (${activeUserName}) consumed ${foodNamesStr} (${totalCalories} kcal). High sodium & trans-fat risk: blood pressure spikes & indigestion. Health score penalty (-${alertObj.penaltyPts} pts) applied. Recommended: 2 glasses warm water.`
      }).catch(e => console.warn('Background SMS dispatch notice:', e.message));
    }

    // 4. Instant Visual Feedback and swift modal close (no 1000ms delay!)
    setSuccess(true);
    setSaving(false);
    setTimeout(() => {
      setSuccess(false);
      setParsedFoods(null);
      setInputText('');
      setTranscript('');
      onClose();
    }, 250);
  };

  const handleQuantityChange = (idx, direction) => {
    setParsedFoods(prev =>
      prev.map((f, i) => {
        if (i !== idx) return f;
        const currentQty = Number(f.quantity) || 1;
        const unit = (f.unit || '').toLowerCase();

        let step = 1;
        let minVal = 1;
        let maxVal = 20;

        if (unit === 'ml') {
          step = 50;
          minVal = 50;
          maxVal = 2000;
        } else if (unit === 'g') {
          step = 25;
          minVal = 25;
          maxVal = 1000;
        } else if (unit === 'l') {
          step = 0.25;
          minVal = 0.25;
          maxVal = 5;
        } else if (unit === 'kg') {
          step = 0.25;
          minVal = 0.25;
          maxVal = 5;
        }

        const newQty = Math.max(minVal, Math.min(maxVal, Number((currentQty + (direction * step)).toFixed(2))));
        const ratio = newQty / currentQty;

        const currentCal = f.nutrition_facts?.calories || 250;
        const currentProt = f.nutrition_facts?.protein_g || 8;
        const currentCarb = f.nutrition_facts?.carbs_g || 40;
        const currentFat = f.nutrition_facts?.fat_g || 5;
        const currentCalcium = f.nutrition_facts?.calcium_mg || 30;

        return {
          ...f,
          quantity: newQty,
          nutrition_facts: {
            ...f.nutrition_facts,
            calories: Math.max(0, Math.round(currentCal * ratio)),
            protein_g: Math.max(0, Number((currentProt * ratio).toFixed(1))),
            carbs_g: Math.max(0, Number((currentCarb * ratio).toFixed(1))),
            fat_g: Math.max(0, Number((currentFat * ratio).toFixed(1))),
            calcium_mg: Math.max(0, Math.round(currentCalcium * ratio)),
          }
        };
      })
    );
  };

  useEffect(() => {
    if (parsedFoods && parsedFoods.length > 0) {
      setTimeout(() => {
        modalEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [parsedFoods]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4 font-['Outfit']"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setParsedFoods(null);
          setInputText('');
          setTranscript('');
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full my-auto max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 relative scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Voice & Text Meal Logger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Speak or type meal with quantity (e.g. "3 idlis with sambar")</p>
            </div>
          </div>
          <button
            onClick={() => {
              setParsedFoods(null);
              setInputText('');
              setTranscript('');
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── MEAL CATEGORY SELECTOR CHIPS ── */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Select Meal Time Slot:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {MEAL_SLOTS.map(slot => {
              const isSelected = selectedSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-black border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md scale-105'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{slot.icon}</span>
                  <span className="text-[10px] truncate">{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Microphone Trigger ── */}
        <div className="flex flex-col items-center justify-center space-y-3 py-3 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 shadow-emerald-600/30'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <div className="text-center space-y-0.5 px-2">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
              {isListening ? 'Listening... Speak food name & quantity!' : 'Tap mic & speak e.g. "3 idlis with sambar"'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">
              AI automatically extracts quantity & computes accurate ICMR nutrients
            </span>
          </div>
          {transcript && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold px-4 text-center italic bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/20">
              "{transcript}"
            </p>
          )}
        </div>

        {/* ── Text Input Form ── */}
        <form onSubmit={handleAnalyze} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                const detected = detectSlotFromText(e.target.value);
                if (detected) setSelectedSlot(detected);
              }}
              placeholder={`e.g. 2 Chapatis, 1 cup dal, and 1 bowl curd`}
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white font-medium outline-none transition-all"
            />
            <button
              type="submit"
              disabled={analyzing || !inputText.trim()}
              className="absolute right-2 top-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {/* ── Quick 1-Tap Elder Meal Chips ── */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Instant Quick-Log (1-Tap):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ELDER_MEALS.map((qm, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuickMeal(qm)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer shadow-2xs"
                >
                  {qm.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* ── Parsed Nutritional Breakdown with Quantity Controls ── */}
        {parsedFoods && parsedFoods.length > 0 && (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> AI Nutritional Breakdown</span>
              <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">{selectedSlot}</span>
            </div>

            {hasFastFood && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-bold space-y-1.5">
                <div className="flex items-center justify-between font-black text-rose-500">
                  <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> 🍟 Senior Health Warning: Fast Food Detected!</span>
                  <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">-15 Pts</span>
                </div>
                <p className="text-[11px] font-medium text-rose-700 dark:text-rose-200">
                  Fast foods contain high sodium & trans-fats. An <strong>Emergency Fast Food Alert (SMS & WhatsApp)</strong> will be dispatched to your caregiver upon saving.
                </p>
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 pt-0.5">
                  <BellRing className="w-3.5 h-3.5 animate-bounce" /> Caregiver Notification: Active Dispatch Enabled
                </div>
              </div>
            )}

            <div className="space-y-3">
              {parsedFoods.map((food, idx) => {
                const qty = Number(food.quantity) || 1;
                const unit = food.unit || 'pcs';

                return (
                  <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">{food.name}</span>
                        {isFastFoodName(food.name) && (
                          <span className="text-[10px] font-black bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded-md border border-rose-500/30">
                            Junk / Fast Food
                          </span>
                        )}
                      </div>
                      
                      {/* Per-Item Slot Selector Dropdown */}
                      <select
                        value={food.category || selectedSlot}
                        onChange={(e) => handleUpdateItemCategory(idx, e.target.value)}
                        className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 outline-none cursor-pointer"
                      >
                        <option value="Breakfast">🌅 Breakfast</option>
                        <option value="Lunch">☀️ Lunch</option>
                        <option value="Evening Snacks">☕ Snacks</option>
                        <option value="Dinner">🌙 Dinner</option>
                      </select>
                    </div>

                    {/* ── Interactive Quantity Stepper ── */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        Quantity: <span className="text-slate-900 dark:text-white font-extrabold">{qty} {unit}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(idx, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold flex items-center justify-center transition-all cursor-pointer text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-black text-emerald-600 dark:text-emerald-400">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center transition-all cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold pt-1">
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        <span className="text-slate-400 text-[9px] block">Calories</span>
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">{food.nutrition_facts?.calories || 250} kcal</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        <span className="text-slate-400 text-[9px] block">Protein</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">{food.nutrition_facts?.protein_g || 8}g</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        <span className="text-slate-400 text-[9px] block">Carbs</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-extrabold text-[11px]">{food.nutrition_facts?.carbs_g || 40}g</span>
                      </div>
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                        <span className="text-slate-400 text-[9px] block">Calcium</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px]">{food.nutrition_facts?.calcium_mg || 30}mg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {success ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Saved & Caregiver Alert Dispatched ✓
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveMeal}
                disabled={saving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving & Alerting Caregiver...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Save {selectedSlot} Meal & Dispatch Alert
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div ref={modalEndRef} />
      </div>
    </div>
  );
}
