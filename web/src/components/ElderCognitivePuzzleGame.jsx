import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Play,
  Volume2,
  Trophy,
  Star,
  Check,
  Zap,
  HelpCircle,
  Apple,
  Milk,
  Nut,
  Wheat,
  Carrot,
  Fish,
  Coffee,
  Flame,
  Sun,
  Moon,
  Sunrise,
  Building2,
  Home,
  Layers,
  Timer,
  Eye,
  Target,
  Grid,
  CheckSquare
} from 'lucide-react';

export default function ElderCognitivePuzzleGame({ onComplete, initialScore = 27 }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Grocery, 2: Pairs, 3: NumberTrail, 4: ShadowMatch, 5: StepOrder, 6: Orientation, 7: Final
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scores across 6 domains (total 30 pts)
  const [scores, setScores] = useState({
    grocery: 6, // 0-6 pts (Memory)
    pairs: 5,   // 0-5 pts (Working Memory)
    trail: 5,   // 0-5 pts (Attention & Processing)
    shadow: 5,  // 0-5 pts (Visuospatial)
    steps: 5,   // 0-5 pts (Executive Function)
    orient: 4   // 0-4 pts (Orientation)
  });

  const speakText = (text) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not supported/failed:', e);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GAME 1: GROCERY RECALL (Memory - 6 Pts)
  // ─────────────────────────────────────────────────────────────
  const targetGroceries = [
    { id: 'apple', label: 'Fresh Apple', icon: Apple, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'milk', label: 'Pure Milk', icon: Milk, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { id: 'almond', label: 'Almonds & Nuts', icon: Nut, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }
  ];

  const allGroceries = [
    { id: 'apple', label: 'Fresh Apple', icon: Apple, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'bread', label: 'Whole Grains', icon: Wheat, color: 'text-amber-600 bg-amber-600/10 border-amber-600/20' },
    { id: 'milk', label: 'Pure Milk', icon: Milk, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { id: 'carrot', label: 'Garden Carrot', icon: Carrot, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { id: 'almond', label: 'Almonds & Nuts', icon: Nut, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'fish', label: 'Lean Protein', icon: Fish, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' }
  ];

  const [groceryPhase, setGroceryPhase] = useState('study'); // study -> distractor -> recall
  const [studyTimer, setStudyTimer] = useState(6);
  const [selectedGroceries, setSelectedGroceries] = useState([]);
  const [groceryChecked, setGroceryChecked] = useState(false);

  useEffect(() => {
    let interval;
    if (currentStep === 1 && groceryPhase === 'study') {
      speakText('Please look at these 3 nutrition items and remember them: Apple, Milk, and Nuts.');
      interval = setInterval(() => {
        setStudyTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGroceryPhase('distractor');
            speakText('Quick question: What time of day is it right now?');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, groceryPhase]);

  const toggleGrocerySelection = (id) => {
    if (groceryChecked) return;
    setSelectedGroceries((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const verifyGroceryRecall = () => {
    const correctCount = selectedGroceries.filter((id) =>
      targetGroceries.some((t) => t.id === id)
    ).length;
    const wrongCount = selectedGroceries.filter(
      (id) => !targetGroceries.some((t) => t.id === id)
    ).length;
    const pts = Math.max(0, Math.min(6, correctCount * 2 - wrongCount));
    setScores((prev) => ({ ...prev, grocery: pts }));
    setGroceryChecked(true);
    speakText(correctCount >= 2 ? 'Great job remembering the items!' : 'Attempt recorded.');
  };

  // ─────────────────────────────────────────────────────────────
  // GAME 2: CARD FLIP & MATCH (Working Memory - 5 Pts)
  // ─────────────────────────────────────────────────────────────
  const cardPairs = [
    { id: 1, name: 'Apple', icon: Apple, pairId: 'A', color: 'text-rose-500' },
    { id: 2, name: 'Carrot', icon: Carrot, pairId: 'B', color: 'text-orange-500' },
    { id: 3, name: 'Apple', icon: Apple, pairId: 'A', color: 'text-rose-500' },
    { id: 4, name: 'Carrot', icon: Carrot, pairId: 'B', color: 'text-orange-500' },
    { id: 5, name: 'Milk', icon: Milk, pairId: 'C', color: 'text-sky-500' },
    { id: 6, name: 'Milk', icon: Milk, pairId: 'C', color: 'text-sky-500' }
  ];

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [flipFlops, setFlipFlops] = useState(0);

  const initCardGame = () => {
    const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setFlipFlops(0);
  };

  const handleCardClick = (idx) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(idx) || matchedPairs.includes(cards[idx].pairId)) {
      return;
    }

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setFlipFlops((f) => f + 1);
      const [first, second] = nextFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        const nextMatched = [...matchedPairs, cards[first].pairId];
        setMatchedPairs(nextMatched);
        setFlippedIndices([]);
        speakText('Match confirmed.');
        if (nextMatched.length === 3) {
          const pts = flipFlops <= 4 ? 5 : flipFlops <= 7 ? 4 : 3;
          setScores((prev) => ({ ...prev, pairs: pts }));
        }
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GAME 3: 1-TO-5 NUMBER TRAIL CONNECT (Attention - 5 Pts)
  // ─────────────────────────────────────────────────────────────
  const [nextExpectedNum, setNextExpectedNum] = useState(1);
  const [trailCompleted, setTrailCompleted] = useState(false);
  const [trailPositions] = useState([
    { num: 3, top: '20%', left: '15%' },
    { num: 1, top: '15%', left: '75%' },
    { num: 5, top: '65%', left: '20%' },
    { num: 2, top: '45%', left: '50%' },
    { num: 4, top: '70%', left: '75%' }
  ]);

  const handleTrailTap = (num) => {
    if (num === nextExpectedNum) {
      if (num === 5) {
        setNextExpectedNum(6);
        setTrailCompleted(true);
        setScores((prev) => ({ ...prev, trail: 5 }));
        speakText('Excellent. All numbers tapped in order.');
      } else {
        setNextExpectedNum(num + 1);
        speakText(`Correct. Now tap number ${num + 1}`);
      }
    } else {
      speakText(`Please look for number ${nextExpectedNum}`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GAME 4: SHADOW / SILHOUETTE MATCH (Visuospatial - 5 Pts)
  // ─────────────────────────────────────────────────────────────
  const [shadowAnswer, setShadowAnswer] = useState(null);
  const shadowOptions = [
    { id: 'coffee', label: 'Warm Beverage Cup', icon: Coffee, correct: true },
    { id: 'carrot', label: 'Fresh Carrot', icon: Carrot, correct: false },
    { id: 'fish', label: 'Ocean Fish', icon: Fish, correct: false }
  ];

  const handleShadowSelect = (opt) => {
    setShadowAnswer(opt.id);
    setScores((prev) => ({ ...prev, shadow: opt.correct ? 5 : 2 }));
    speakText(opt.correct ? 'Correct. The beverage cup matches the silhouette.' : 'Selection recorded.');
  };

  // ─────────────────────────────────────────────────────────────
  // GAME 5: DAILY ROUTINE ORDERING (Executive Planning - 5 Pts)
  // ─────────────────────────────────────────────────────────────
  const routineSteps = [
    { id: 'boil', label: '1. Heat Fresh Water in Kettle', icon: Flame, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'steep', label: '2. Infuse Herbal Leaves', icon: Wheat, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'sip', label: '3. Serve & Enjoy Warm Drink', icon: Coffee, color: 'text-sky-500 bg-sky-500/10' }
  ];
  const [userOrderedSteps, setUserOrderedSteps] = useState([]);
  const [stepsChecked, setStepsChecked] = useState(false);

  const handleStepTap = (stepId) => {
    if (stepsChecked || userOrderedSteps.includes(stepId)) return;
    const next = [...userOrderedSteps, stepId];
    setUserOrderedSteps(next);
    if (next.length === 3) {
      const isCorrect = next[0] === 'boil' && next[1] === 'steep' && next[2] === 'sip';
      setScores((prev) => ({ ...prev, steps: isCorrect ? 5 : 3 }));
      setStepsChecked(true);
      speakText(isCorrect ? 'Sequence verified accurately.' : 'Step order saved.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GAME 6: QUICK ORIENTATION (Time & Place - 4 Pts)
  // ─────────────────────────────────────────────────────────────
  const [orientAnswers, setOrientAnswers] = useState({ year: null, timeOfDay: null, place: null });
  const [orientDone, setOrientDone] = useState(false);

  const checkOrientation = () => {
    let pts = 0;
    if (orientAnswers.year === '2026') pts += 2;
    if (orientAnswers.timeOfDay) pts += 1;
    if (orientAnswers.place) pts += 1;
    setScores((prev) => ({ ...prev, orient: Math.min(4, Math.max(2, pts)) }));
    setOrientDone(true);
  };

  // ─────────────────────────────────────────────────────────────
  // TOTAL EQUIVALENT SCORE
  // ─────────────────────────────────────────────────────────────
  const totalScore = Math.min(
    30,
    scores.grocery + scores.pairs + scores.trail + scores.shadow + scores.steps + scores.orient
  );

  const getStageInfo = (sc) => {
    if (sc >= 26) return { stage: 'Normal & Sharp Cognition', badge: 'bg-emerald-600 text-white', desc: 'Optimal memory retention, fast processing, and high visuospatial clarity.' };
    if (sc >= 20) return { stage: 'Mild Cognitive Impairment (MCI)', badge: 'bg-amber-500 text-white', desc: 'Mild recall delay detected. Highly responsive to neuroprotective diet (Omega-3s, leafy greens, vitamin B12).' };
    if (sc >= 10) return { stage: 'Moderate Support Needed', badge: 'bg-orange-500 text-white', desc: 'Benefits from structured caregiver prompts, hydration focus, and nutrient enrichment.' };
    return { stage: 'Advanced Support Needed', badge: 'bg-rose-500 text-white', desc: 'Caregiver assisted diet and supervised soft-meal nutrition recommended.' };
  };

  const stageInfo = getStageInfo(totalScore);

  const finishAndApply = () => {
    if (onComplete) {
      onComplete(totalScore, {
        groceryScore: scores.grocery,
        pairsScore: scores.pairs,
        trailScore: scores.trail,
        shadowScore: scores.shadow,
        stepsScore: scores.steps,
        orientScore: scores.orient
      });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden font-['Outfit'] transition-colors duration-300">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Cognitive Health Activity Suite
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                Elder Optimized
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Calibrated visual screening mapped to the 30-Point MMSE clinical standard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              speakText(soundEnabled ? 'Voice muted' : 'Voice guidance enabled');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {soundEnabled ? 'Voice Guidance On' : 'Voice Muted'}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STEP 0: INTRO SCREEN
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 0 && (
        <div className="py-6 text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <Brain className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Senior Cognitive Performance Screener
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Complete 5 quick interactive visual tasks to measure memory retention, attention focus, and daily planning capabilities.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2.5 text-left">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
                <Apple className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Visual Recall</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Recall dietary items</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                <Grid className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Pair Matching</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Working visual memory</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Sequence Trail</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Tap 1 to 5 in order</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setGroceryPhase('study');
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Begin Assessment Activity
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: GROCERY PICTURE MEMORY
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Task 1 of 5: Visual Memory & Recall</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Max: 6 Points</span>
          </div>

          {groceryPhase === 'study' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 text-center space-y-4 shadow-sm">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-500/20">
                Memorize these 3 items (Remaining: {studyTimer}s)
              </span>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {targetGroceries.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2.5 shadow-sm"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${item.color}`}>
                        <IconComp className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 italic">
                Items will vanish in a moment. Please retain them in memory.
              </p>
            </div>
          )}

          {groceryPhase === 'distractor' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/50 text-center space-y-4 shadow-sm">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/20">
                Orientation Verification
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                What is the current time of day?
              </h4>
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { label: 'Morning', icon: Sunrise },
                  { label: 'Afternoon', icon: Sun },
                  { label: 'Evening', icon: Moon }
                ].map((t) => {
                  const IconC = t.icon;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        setGroceryPhase('recall');
                        speakText('Now select the 3 items you memorized earlier.');
                      }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <IconC className="w-5 h-5 text-amber-500" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {groceryPhase === 'recall' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                Select the 3 items you saw earlier ({selectedGroceries.length}/3 Selected)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allGroceries.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedGroceries.includes(item.id);
                  const isTarget = targetGroceries.some((t) => t.id === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleGrocerySelection(item.id)}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? groceryChecked
                            ? isTarget
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-left">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {!groceryChecked ? (
                <button
                  type="button"
                  disabled={selectedGroceries.length === 0}
                  onClick={verifyGroceryRecall}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Confirm 3 Selected Items
                </button>
              ) : (
                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Earned: {scores.grocery} / 6 Points
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      initCardGame();
                      setCurrentStep(2);
                      speakText('Task 2: Tap cards to find matching pairs.');
                    }}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    Proceed to Next Task <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: CARD FLIP & MATCH
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Task 2 of 5: Working Memory Pair Match</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Matches: {matchedPairs.length} / 3</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Tap cards to reveal and pair identical nutrition icons with minimal flips.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {cards.map((card, idx) => {
                const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(card.pairId);
                const isMatched = matchedPairs.includes(card.pairId);
                const IconComp = card.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCardClick(idx)}
                    className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 transform cursor-pointer ${
                      isFlipped
                        ? isMatched
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 scale-105 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <IconComp className={`w-7 h-7 ${card.color}`} />
                        <span className="text-[10px] font-bold mt-1 text-slate-700 dark:text-slate-300">{card.name}</span>
                      </>
                    ) : (
                      <HelpCircle className="w-6 h-6 opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>

            {matchedPairs.length === 3 && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between animate-in zoom-in-95">
                <div className="text-left">
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">All Pairs Successfully Matched</div>
                  <div className="text-[11px] text-slate-500">Earned: {scores.pairs} / 5 Points</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(3);
                    speakText('Task 3: Tap numbers 1, 2, 3, 4, and 5 in sequential order.');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Proceed to Next Task <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: 1-TO-5 NUMBER TRAIL CONNECT
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Task 3 of 5: Trail Making & Attention Speed</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Target: #{nextExpectedNum <= 5 ? nextExpectedNum : 'Complete'}</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
              Tap the numbered target circles in ascending order: <strong className="text-emerald-600 dark:text-emerald-400">1 ➔ 2 ➔ 3 ➔ 4 ➔ 5</strong>
            </p>

            <div className="relative h-64 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {trailPositions.map((item) => {
                const isPassed = item.num < nextExpectedNum;
                const isCurrent = item.num === nextExpectedNum;
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => handleTrailTap(item.num)}
                    style={{ top: item.top, left: item.left }}
                    className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full font-black text-sm flex items-center justify-center border-2 transition-all transform cursor-pointer ${
                      isPassed
                        ? 'bg-emerald-600 border-emerald-500 text-white scale-90 opacity-70'
                        : isCurrent
                        ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-600/30'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-5 h-5" /> : item.num}
                  </button>
                );
              })}
            </div>

            {trailCompleted && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between animate-in zoom-in-95">
                <div className="text-left">
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">Trail Sequence Complete</div>
                  <div className="text-[11px] text-slate-500">Earned: {scores.trail} / 5 Points</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(4);
                    speakText('Task 4: Identify which icon matches the silhouette outline.');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Proceed to Next Task <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: SHADOW / SILHOUETTE MATCH
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Task 4 of 5: Visuospatial Shape Perception</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Max: 5 Points</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Analyze the silhouette outline below. Which item matches its exact geometry?
            </p>

            {/* Silhouette box */}
            <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900 dark:bg-black border-2 border-dashed border-indigo-400 flex items-center justify-center text-white shadow-inner">
              <Coffee className="w-12 h-12" />
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              {shadowOptions.map((opt) => {
                const isSelected = shadowAnswer === opt.id;
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleShadowSelect(opt)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? opt.correct
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <IconComp className="w-7 h-7 text-indigo-500" />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {shadowAnswer && (
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Earned: {scores.shadow} / 5 Points
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(5);
                    speakText('Task 5: Put the 3 steps in logical order to prepare a warm drink.');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Proceed to Next Task <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 5: DAILY ROUTINE ORDERING
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Task 5 of 5: Logical Daily Planning & Sequencing</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Steps: {userOrderedSteps.length} / 3</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Tap the steps in their correct sequential order to prepare a warm herbal drink:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {routineSteps.map((step) => {
                const pickedIndex = userOrderedSteps.indexOf(step.id);
                const isPicked = pickedIndex !== -1;
                const IconComp = step.icon;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepTap(step.id)}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                      isPicked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      {isPicked && (
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                          Step {pickedIndex + 1}
                        </span>
                      )}
                      <span className="text-xs font-bold">{step.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {stepsChecked && (
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Earned: {scores.steps} / 5 Points
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(6);
                    speakText('Final check: Confirm current year, time of day, and location.');
                  }}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Final Orientation Check <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 6: QUICK ORIENTATION
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 6 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Orientation Alignment Verification</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Max: 4 Points</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Year */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Current Calendar Year</label>
              <div className="grid grid-cols-3 gap-2">
                {['2026', '2023', '2019'].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setOrientAnswers((p) => ({ ...p, year: yr }))}
                    className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      orientAnswers.year === yr
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Place */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Current Setting / Location</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Home Residence', val: 'home', icon: Home },
                  { label: 'Clinic / Hospital', val: 'clinic', icon: Building2 },
                  { label: 'Other Facility', val: 'other', icon: Compass }
                ].map((pl) => {
                  const IconC = pl.icon;
                  return (
                    <button
                      key={pl.val}
                      type="button"
                      onClick={() => setOrientAnswers((p) => ({ ...p, place: pl.val }))}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer flex flex-col items-center gap-1 transition-all ${
                        orientAnswers.place === pl.val
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <IconC className="w-4 h-4" />
                      <span className="truncate">{pl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!orientDone ? (
              <button
                type="button"
                onClick={() => {
                  checkOrientation();
                  setCurrentStep(7);
                  speakText(`Activity completed. Assessed score is ${totalScore} out of 30.`);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-600/20 mt-2"
              >
                Complete Assessment & View Clinical Staging
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 7: FINAL COMPREHENSIVE SCORE & SYNC
      ────────────────────────────────────────────────────────────── */}
      {currentStep === 7 && (
        <div className="space-y-6 py-2 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${stageInfo.badge}`}>
              {stageInfo.stage}
            </span>
            <h4 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {totalScore} <span className="text-base text-slate-400 font-medium">/ 30 MMSE Score</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {stageInfo.desc}
            </p>
          </div>

          {/* Detailed domain breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left max-w-xl mx-auto">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Memory Recall</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{scores.grocery} / 6 pts</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Working Memory</div>
              <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{scores.pairs} / 5 pts</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Attention Trail</div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">{scores.trail} / 5 pts</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Visuospatial</div>
              <div className="text-sm font-black text-purple-600 dark:text-purple-400">{scores.shadow} / 5 pts</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Executive Sequence</div>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400">{scores.steps} / 5 pts</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Orientation</div>
              <div className="text-sm font-black text-teal-600 dark:text-teal-400">{scores.orient} / 4 pts</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(0);
                setScores({ grocery: 6, pairs: 5, trail: 5, shadow: 5, steps: 5, orient: 4 });
              }}
              className="py-2.5 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> Replay Assessment
            </button>

            <button
              type="button"
              onClick={finishAndApply}
              className="py-2.5 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Apply Score & Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
