import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { clinicalAssessmentApi, profileApi } from '../../services/api';
import {
  FileText,
  Brain,
  Bone,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Info,
  Activity,
  HeartPulse,
  Save,
  ChevronDown,
  RotateCcw,
  Check,
  Flame,
  Volume2,
  Sliders,
  Gamepad2
} from 'lucide-react';
import ElderCognitivePuzzleGame from '../../components/ElderCognitivePuzzleGame';
import ElderMobilityPhysicalAssessment from '../../components/ElderMobilityPhysicalAssessment';

const MMSE_KEY_MAP = {
  year: 'clinical.qYear',
  season: 'clinical.qSeason',
  date: 'clinical.qDate',
  day: 'clinical.qDay',
  month: 'clinical.qMonth',
  state: 'clinical.qState',
  country: 'clinical.qCountry',
  city: 'clinical.qCity',
  building: 'clinical.qBuilding',
  floor: 'clinical.qFloor',
  word1: 'clinical.qWord1',
  word2: 'clinical.qWord2',
  word3: 'clinical.qWord3',
  calc1: 'clinical.qCalc1',
  calc2: 'clinical.qCalc2',
  calc3: 'clinical.qCalc3',
  calc4: 'clinical.qCalc4',
  calc5: 'clinical.qCalc5',
  recall1: 'clinical.qRecall1',
  recall2: 'clinical.qRecall2',
  recall3: 'clinical.qRecall3',
  name_pencil: 'clinical.qPencil',
  name_watch: 'clinical.qWatch',
  repeat_phrase: 'clinical.qRepeat',
  command1: 'clinical.qCommand1',
  command2: 'clinical.qCommand2',
  command3: 'clinical.qCommand3',
  close_eyes: 'clinical.qCloseEyes',
  write_sentence: 'clinical.qSentence',
  copy_design: 'clinical.qDesign',
};

const FRAX_KEY_MAP = {
  previous_fracture: 'clinical.qPrevFracture',
  parent_hip_fracture: 'clinical.qParentHip',
  smoking: 'clinical.qSmoking',
  glucocorticoids: 'clinical.qSteroids',
  rheumatoid_arthritis: 'clinical.qArthritis',
  secondary_osteoporosis: 'clinical.qOsteo',
  alcohol_ge3_units: 'clinical.qAlcohol',
};

const MMSE_QUESTIONS = {
  orientation_time: [
    { id: 'year', label: 'What is the current Year? (1 pt)', max: 1 },
    { id: 'season', label: 'What is the current Season? (1 pt)', max: 1 },
    { id: 'date', label: 'What is today’s Date (day of month)? (1 pt)', max: 1 },
    { id: 'day', label: 'What Day of the week is it? (1 pt)', max: 1 },
    { id: 'month', label: 'What Month is it? (1 pt)', max: 1 },
  ],
  orientation_place: [
    { id: 'state', label: 'What State are we in? (1 pt)', max: 1 },
    { id: 'country', label: 'What Country are we in? (1 pt)', max: 1 },
    { id: 'city', label: 'What Town / City is this? (1 pt)', max: 1 },
    { id: 'building', label: 'What Building / Hospital / Clinic is this? (1 pt)', max: 1 },
    { id: 'floor', label: 'What Floor / Room number are we on? (1 pt)', max: 1 },
  ],
  registration: [
    { id: 'word1', label: 'Repeat Word 1: "Apple" (1 pt)', max: 1 },
    { id: 'word2', label: 'Repeat Word 2: "Table" (1 pt)', max: 1 },
    { id: 'word3', label: 'Repeat Word 3: "Penny" (1 pt)', max: 1 },
  ],
  attention: [
    { id: 'calc1', label: '100 - 7 = 93 (1 pt)', max: 1 },
    { id: 'calc2', label: '93 - 7 = 86 (1 pt)', max: 1 },
    { id: 'calc3', label: '86 - 7 = 79 (1 pt)', max: 1 },
    { id: 'calc4', label: '79 - 7 = 72 (1 pt)', max: 1 },
    { id: 'calc5', label: '72 - 7 = 65 (1 pt) [Or WORLD spelled D-L-R-O-W]', max: 1 },
  ],
  recall: [
    { id: 'recall1', label: 'Recall Object 1 (Apple) (1 pt)', max: 1 },
    { id: 'recall2', label: 'Recall Object 2 (Table) (1 pt)', max: 1 },
    { id: 'recall3', label: 'Recall Object 3 (Penny) (1 pt)', max: 1 },
  ],
  language: [
    { id: 'name_pencil', label: 'Naming: Identify a "Pencil" when shown (1 pt)', max: 1 },
    { id: 'name_watch', label: 'Naming: Identify a "Wristwatch" when shown (1 pt)', max: 1 },
    { id: 'repeat_phrase', label: 'Repetition: Repeat "No ifs, ands, or buts" (1 pt)', max: 1 },
    { id: 'command1', label: '3-Stage: "Take a paper in your right hand" (1 pt)', max: 1 },
    { id: 'command2', label: '3-Stage: "Fold the paper in half" (1 pt)', max: 1 },
    { id: 'command3', label: '3-Stage: "Put it on the floor" (1 pt)', max: 1 },
    { id: 'close_eyes', label: 'Reading Comprehension: Read & obey "CLOSE YOUR EYES" (1 pt)', max: 1 },
    { id: 'write_sentence', label: 'Writing: Write a complete, sensible sentence (1 pt)', max: 1 },
    { id: 'copy_design', label: 'Visuospatial: Copy intersecting pentagons design (1 pt)', max: 1 },
  ],
};

const ALLERGEN_OPTIONS = [
  { id: 'Gluten', label: 'Gluten (Wheat, Barley, Rye)', icon: '🌾' },
  { id: 'Lactose / Dairy', label: 'Lactose / Cow Milk Dairy', icon: '🥛' },
  { id: 'Peanuts & Tree Nuts', label: 'Peanuts & Tree Nuts', icon: '🥜' },
  { id: 'Soy Products', label: 'Soy & Edamame', icon: '🌱' },
  { id: 'Shellfish & Seafood', label: 'Shellfish & Crustaceans', icon: '🦐' },
  { id: 'Egg Products', label: 'Eggs / Albumen', icon: '🥚' },
];

export default function PaperClinicalAssessmentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(1); // 1: Personal, 2: FRAX, 3: MMSE, 4: Diet, 5: Results
  const [saving, setSaving] = useState(false);
  const [resultData, setResultData] = useState(null);

  // ── 1. Personal Information State ──
  const [personal, setPersonal] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.name || 'Senior'),
    age: 68,
    gender: 'Male',
    height_cm: 169,
    weight_kg: 64,
    activity_level: 'Light Walk',
    region: 'Tamil Nadu (South Indian)',
  });

  useEffect(() => {
    profileApi.getProfile()
      .then((res) => {
        if (res?.data) {
          const d = res.data;
          setPersonal((prev) => ({
            ...prev,
            name: d.name || user?.name || user?.first_name || prev.name,
            age: d.age || prev.age,
            gender: d.gender || prev.gender,
            height_cm: d.height_cm || d.heightCm || prev.height_cm,
            weight_kg: d.weight_kg || d.weightKg || prev.weight_kg,
            activity_level: d.activity_level || d.activityLevel || prev.activity_level,
            region: d.regional_cuisine || d.regionalCuisine || prev.region,
          }));
          if (d.mmse_score !== undefined) {
            setDirectMmseScore(d.mmse_score);
          }
          if (d.frax_major_risk !== undefined) {
            setDirectFraxMajor(d.frax_major_risk);
            setDirectFraxHip(d.frax_hip_risk || 1.8);
          }
          if (d.allergens?.length) {
            setDietary((prev) => ({ ...prev, allergens: d.allergens }));
          }
        }
      })
      .catch(() => {});
  }, [user]);

  // ── 2. Physical Mobility, Fall & Bone Risk State ──
  const [physicalMode, setPhysicalMode] = useState('multidimensional'); // 'multidimensional' | 'clinical_record'
  const [isPhysicalDone, setIsPhysicalDone] = useState(false);
  const [physicalSummary, setPhysicalSummary] = useState({
    steadi: { fallenPast12M: false, feelsUnsteady: false, worriedAboutFalling: false },
    tugSeconds: 10.2,
    chairStands: 13,
    balanceResults: { sideBySide: true, semiTandem: true, tandem: true, singleLeg: false },
    sarcf: { strength: 0, assistance: 0, riseChair: 0, climbStairs: 0, falls: 0 },
    sarcfTotalScore: 0,
    isIncreasedFallRisk: false,
    isSarcopeniaConcern: false,
    steadiPositiveCount: 0
  });

  const handlePhysicalSave = (data) => {
    setPhysicalSummary(data);
    setIsPhysicalDone(true);
    setActiveTab(3); // Proceed to Cognitive Assessment
  };

  const [useDirectFrax, setUseDirectFrax] = useState(false);
  const [directFraxMajor, setDirectFraxMajor] = useState(6.2);
  const [directFraxHip, setDirectFraxHip] = useState(1.4);

  const [fraxFactors, setFraxFactors] = useState({
    previous_fracture: false,
    parent_hip_fracture: false,
    smoking: false,
    glucocorticoids: false,
    rheumatoid_arthritis: false,
    secondary_osteoporosis: false,
    alcohol_ge3_units: false,
    femoral_neck_tscore: '',
  });

  // ── 3. MMSE Cognitive State ──
  const [cognitiveMode, setCognitiveMode] = useState('puzzle'); // 'puzzle' | 'questionnaire' | 'direct'
  const [useDirectMmse, setUseDirectMmse] = useState(false);
  const [directMmseScore, setDirectMmseScore] = useState(27);
  const [puzzleStats, setPuzzleStats] = useState(null);

  const [mmseAnswers, setMmseAnswers] = useState({
    year: 1, season: 1, date: 1, day: 1, month: 1,
    state: 1, country: 1, city: 1, building: 1, floor: 1,
    word1: 1, word2: 1, word3: 1,
    calc1: 1, calc2: 1, calc3: 1, calc4: 1, calc5: 1,
    recall1: 1, recall2: 1, recall3: 1,
    name_pencil: 1, name_watch: 1, repeat_phrase: 1,
    command1: 1, command2: 1, command3: 1,
    close_eyes: 1, write_sentence: 1, copy_design: 1,
  });

  // ── 4. Dietary & Allergen State ──
  const [dietary, setDietary] = useState({
    preferred_cuisine: 'Pan-Indian Balanced',
    diet_type: 'Vegetarian',
    chewability: 'Soft Meals',
    allergens: [],
    dietary_restrictions: ['Low Sodium', 'Low Glycemic Index'],
  });

  // Calculate live BMI
  const heightM = (Number(personal.height_cm) || 169) / 100;
  const bmi = Number(((Number(personal.weight_kg) || 64) / (heightM * heightM)).toFixed(1));

  // ── Real-time Computed Scores ──
  const computedMmseScore = (cognitiveMode === 'puzzle' || cognitiveMode === 'direct' || useDirectMmse)
    ? Number(directMmseScore)
    : Object.values(mmseAnswers).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handlePuzzleComplete = (score, domainScores) => {
    setDirectMmseScore(score);
    setPuzzleStats(domainScores);
    
    // Auto-distribute domain points to keep clinical data synchronized
    const orientPt = (domainScores?.orientScore ?? 4) >= 3 ? 1 : 0;
    const memoryPt = (domainScores?.groceryScore ?? 6) >= 4 ? 1 : 0;
    const attentionPt = (domainScores?.trailScore ?? 5) >= 4 ? 1 : 0;
    const recallPt = (domainScores?.groceryScore ?? 6) >= 5 ? 1 : 0;
    const languagePt = (domainScores?.shadowScore ?? 5) >= 4 && (domainScores?.stepsScore ?? 5) >= 4 ? 1 : 0;

    setMmseAnswers({
      year: orientPt, season: orientPt, date: orientPt, day: orientPt, month: orientPt,
      state: orientPt, country: orientPt, city: orientPt, building: orientPt, floor: orientPt,
      word1: memoryPt, word2: memoryPt, word3: memoryPt,
      calc1: attentionPt, calc2: attentionPt, calc3: attentionPt, calc4: attentionPt, calc5: attentionPt,
      recall1: recallPt, recall2: recallPt, recall3: recallPt,
      name_pencil: languagePt, name_watch: languagePt, repeat_phrase: languagePt,
      command1: languagePt, command2: languagePt, command3: languagePt,
      close_eyes: languagePt, write_sentence: languagePt, copy_design: languagePt,
    });
  };

  const getMmseEvaluation = (score) => {
    if (score >= 26) return { stage: 'Normal Cognition', duration: 'Ongoing Baseline', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (score >= 20) return { stage: 'Mild Cognitive Impairment (MCI)', duration: '2 to 7 Years', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (score >= 10) return { stage: 'Moderate Dementia', duration: '2 to 4 Years', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { stage: 'Severe Dementia', duration: '1 to 2 Years', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const getFraxEvaluation = () => {
    if (useDirectFrax) {
      const major = Number(directFraxMajor);
      const hip = Number(directFraxHip);
      if (major >= 20 || hip >= 3) return { category: 'Osteoporosis', major, hip, color: 'text-rose-500', bg: 'bg-rose-500/10' };
      if (major >= 10) return { category: 'Moderate Fracture Risk', major, hip, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      return { category: 'Normal Bone Density', major, hip, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
    const yesCount = Object.values(fraxFactors).filter((v) => v === true).length;
    let major = Number((4.5 + yesCount * 3.8).toFixed(1));
    let hip = Number((0.8 + yesCount * 1.2).toFixed(1));
    if (personal.gender === 'Female') {
      major = Number((major * 1.25).toFixed(1));
      hip = Number((hip * 1.3).toFixed(1));
    }
    if (major >= 20 || hip >= 3) return { category: 'Osteoporosis', major, hip, color: 'text-rose-500', bg: 'bg-rose-500/10' };
    if (major >= 10) return { category: 'Moderate Fracture Risk', major, hip, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { category: 'Normal Bone Density', major, hip, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const mmseEval = getMmseEvaluation(computedMmseScore);
  const fraxEval = getFraxEvaluation();

  const toggleAllergen = (item) => {
    setDietary((prev) => {
      const exists = prev.allergens.includes(item);
      return {
        ...prev,
        allergens: exists ? prev.allergens.filter((a) => a !== item) : [...prev.allergens, item],
      };
    });
  };

  const handleMmseAnswerChange = (key, val) => {
    setMmseAnswers((prev) => ({ ...prev, [key]: Number(val) }));
  };

  const handleSubmitAssessment = async () => {
    setSaving(true);
    try {
      const payload = {
        name: personal.name,
        age: Number(personal.age),
        gender: personal.gender,
        height_cm: Number(personal.height_cm),
        weight_kg: Number(personal.weight_kg),
        activity_level: personal.activity_level,
        region: personal.region,
        mmse_score: computedMmseScore,
        mmse_details: mmseAnswers,
        frax_factors: fraxFactors,
        direct_frax_major: useDirectFrax ? Number(directFraxMajor) : undefined,
        direct_frax_hip: useDirectFrax ? Number(directFraxHip) : undefined,
        preferred_cuisine: dietary.preferred_cuisine,
        diet_type: dietary.diet_type,
        chewability: dietary.chewability,
        allergens: dietary.allergens,
        dietary_restrictions: dietary.dietary_restrictions,
      };

      const res = await clinicalAssessmentApi.submitAssessment(payload);
      setResultData(res.data);
      setActiveTab(5);
    } catch (err) {
      console.error('Assessment submission error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-16 font-['Outfit']">
        {/* Title Banner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> {t('clinical.fitBadge', 'Clinical Health Assessment Engine')}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {t('clinical.fitBadge', 'Food Integration Tool (FIT) Assessment')}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('clinical.pageTitle', 'Clinical Nutrition & Health Risk Assessment')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {t('clinical.pageSubtitle', 'Data collection for personalized dietary planning to enhance bone and cognitive health in the aging population.')}
            </p>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {[
              { num: 1, label: t('clinical.tab1', '1. Personal Data'), icon: HeartPulse },
              { num: 2, label: '2. Mobility & Physical', icon: Activity },
              { num: 3, label: t('clinical.tab3', '3. MMSE Cognitive'), icon: Brain },
              { num: 4, label: t('clinical.tab4', '4. Diet & Allergens'), icon: Utensils },
              { num: 5, label: t('clinical.tab5', '5. Personalized Plan'), icon: Sparkles },
            ].map((tabItem) => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.num;
              const isLocked = tabItem.num === 3 && !isPhysicalDone && physicalMode === 'multidimensional';
              return (
                <button
                  key={tabItem.num}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    setActiveTab(tabItem.num);
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-2 text-xs font-black transition-all ${
                    isLocked
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed border border-dashed border-slate-300 dark:border-slate-800'
                      : isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02] cursor-pointer'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer'
                  }`}
                  title={isLocked ? 'Please complete and save Step 6 of Physical Assessment to unlock' : tabItem.label}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{tabItem.label}</span>
                  </div>
                  {isLocked && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                      Lock
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB 1: PERSONAL & DEMOGRAPHIC INFORMATION ── */}
        {activeTab === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="w-5 h-5" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('clinical.tab1', '1. Personal & Anthropometric Data')}</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Nutritional values and RDAs are adjusted according to age, gender, and BMI as specified in Section I of the paper.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('clinical.fullName', 'Full Name')}</label>
                  <input
                    type="text"
                    value={personal.name}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('clinical.genderLabel', 'Gender (Tailors Calcium & Iron RDAs)')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Female', 'Male', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPersonal({ ...personal, gender: g })}
                        className={`py-3 rounded-2xl text-xs font-extrabold border transition-all ${
                          personal.gender === g
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('clinical.ageYears', 'Age (Years)')}</label>
                  <input
                    type="number"
                    value={personal.age}
                    onChange={(e) => setPersonal({ ...personal, age: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('clinical.regionLabel', 'State / Regional Cuisine Basis')}</label>
                  <select
                    value={personal.region}
                    onChange={(e) => setPersonal({ ...personal, region: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <optgroup label="── South Indian ──">
                      <option value="Tamil Nadu (South Indian)">Tamil Nadu (Idli, Sambar, Rasam, Keerai)</option>
                      <option value="Kerala (South Indian)">Kerala (Puttu, Kadala, Appam, Avial, Kanji)</option>
                      <option value="Karnataka (South Indian)">Karnataka (Ragi Mudde, Bisi Bele Bath, Neer Dosa)</option>
                      <option value="Andhra / Telangana (South Indian)">Andhra / Telangana (Pesarattu, Gongura Pappu, Ragi Sankati)</option>
                    </optgroup>
                    <optgroup label="── North Indian ──">
                      <option value="Punjab & Haryana (North Indian)">Punjab & Haryana (Phulka, Dal Makhani, Sarson Saag, Paneer)</option>
                      <option value="Uttar Pradesh & Delhi (North Indian)">Uttar Pradesh & Delhi (Moong Dal Khichdi, Lauki, Tehri, Dalia)</option>
                      <option value="Rajasthan (North Indian)">Rajasthan (Bajra Roti, Gatte ki Sabzi, Moong Dal, Kadhi)</option>
                      <option value="Himachal & Kashmir (North Indian)">Himachal & Kashmir (Khatta, Dalia, Chana Madra, Rice)</option>
                    </optgroup>
                    <optgroup label="── West Indian ──">
                      <option value="Maharashtra (West Indian)">Maharashtra (Poha, Jowar Bhakri, Usal, Varan Bhaat, Pitla)</option>
                      <option value="Gujarat (West Indian)">Gujarat (Dhokla, Thepla, Gujarati Kadhi, Khichdi)</option>
                      <option value="Goa & Konkan (West Indian)">Goa & Konkan (Ukda Rice, Sol Kadhi, Coconut Vegetable Stew)</option>
                    </optgroup>
                    <optgroup label="── East & North-East Indian ──">
                      <option value="West Bengal (East Indian)">West Bengal (Bhaat, Shukto, Moong Dal, Chorchori)</option>
                      <option value="Odisha (East Indian)">Odisha (Dalma, Pakhala Bhaat, Santula, Besara)</option>
                      <option value="Bihar & Jharkhand (East Indian)">Bihar & Jharkhand (Sattu, Dal Puri, Aloo Chokha, Khichdi)</option>
                      <option value="Assam & North-East (North-East Indian)">Assam & North-East (Khar, Masor Tenga, Steamed Herb Rice)</option>
                    </optgroup>
                    <optgroup label="── Multi-Regional / Balanced ──">
                      <option value="Pan-Indian Balanced">Pan-Indian Balanced (Multi-grain Phulka, Dal Tadka, Steamed Veg)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('clinical.heightLabel', 'Height (cm)')}</label>
                  <input
                    type="number"
                    value={personal.height_cm}
                    onChange={(e) => setPersonal({ ...personal, height_cm: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    value={personal.weight_kg}
                    onChange={(e) => setPersonal({ ...personal, weight_kg: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Calculated BMI Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Calculated Body Mass Index (BMI)</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {bmi} kg/m²
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                      {bmi < 18.5 ? 'Underweight' : bmi <= 24.9 ? 'Normal Healthy' : 'Overweight'}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400 font-semibold">
                  Required for FRAX® Fracture Risk Index
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  Proceed to FRAX Bone Assessment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PHYSICAL MOBILITY, FALL RISK & BONE ASSESSMENT ── */}
        {activeTab === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-5 h-5" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    2. Physical Mobility, Fall Risk & Sarcopenia Screening
                  </h2>
                </div>

                {/* Sub-mode selector */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPhysicalMode('multidimensional')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      physicalMode === 'multidimensional'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Physical Assessment Suite (Recommended)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhysicalMode('clinical_record')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      physicalMode === 'clinical_record'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Bone className="w-3.5 h-3.5" />
                    <span>Doctor DXA / Lab Record</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {physicalMode === 'multidimensional'
                  ? 'Multi-dimensional screening aligned with CDC STEADI and EWGSOP2 guidelines: 3-question fall screener, Timed Up & Go (TUG), 30s Chair Stand, 4-Stage Balance, and SARC-F muscle screener.'
                  : 'Clinical DXA bone mineral density (BMD) femoral neck T-Score and 10-year hospital fracture probability records.'}
              </p>

              {/* ── MODE 1: MULTI-DIMENSIONAL PHYSICAL PERFORMANCE ── */}
              {physicalMode === 'multidimensional' && (
                <div className="pt-2">
                  <ElderMobilityPhysicalAssessment
                    initialData={physicalSummary}
                    onSave={handlePhysicalSave}
                  />
                </div>
              )}

              {/* ── MODE 2: CLINICAL DOCTOR DXA / LAB RECORD ── */}
              {physicalMode === 'clinical_record' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                    <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                      Doctor's DXA Scanner & Lab Report Overrides:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Femoral Neck BMD T-Score</label>
                        <input
                          type="text"
                          placeholder="e.g. -2.1 (DXA scan report)"
                          value={fraxFactors.femoral_neck_tscore}
                          onChange={(e) => setFraxFactors({ ...fraxFactors, femoral_neck_tscore: e.target.value })}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">10-Year Major Fracture Probability (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={directFraxMajor}
                          onChange={(e) => setDirectFraxMajor(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Reference Finding:</div>
                    <p className="text-xs text-slate-500">
                      {fraxFactors.femoral_neck_tscore && parseFloat(fraxFactors.femoral_neck_tscore) <= -2.5
                        ? 'BMD T-Score indicates Osteoporosis (≤ -2.5). Elevates dietary Calcium target to 1,400 mg and Vitamin D3 to 1,000 IU.'
                        : 'BMD within manageable range. Standard ICMR senior bone maintenance target applied.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Personal Data
                </button>

                {physicalMode === 'clinical_record' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhysicalDone(true);
                      setActiveTab(3);
                    }}
                    className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    Proceed to Cognitive Assessment <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MMSE COGNITIVE ASSESSMENT (SECTION II & TABLE 1) ── */}
        {activeTab === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                  <Brain className="w-5 h-5" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('clinical.mmseTitle', '3. Cognitive & Brain Health Assessment')}</h2>
                </div>

                {/* Assessment Mode Selector */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCognitiveMode('puzzle')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      cognitiveMode === 'puzzle'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Interactive Activity Suite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCognitiveMode('questionnaire')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      cognitiveMode === 'questionnaire'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>30-Item Clinical Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCognitiveMode('direct')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      cognitiveMode === 'direct'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Direct Score Entry</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {cognitiveMode === 'puzzle'
                  ? 'Stress-free, senior-accessible visual games (grocery recall, card flip matching, star trails, and shadow matching) that auto-calibrate to the 30-point MMSE standard.'
                  : t('clinical.mmseDesc', 'Structured cognitive assessment evaluating 5 key areas: Orientation, Registration, Attention & Calculation, Recall, and Language & Praxis (Section II). Staged per Table 1: Normal (30–26), Mild (25–20), Moderate (19–10), Severe (9–0).')}
              </p>

              {/* ── MODE 1: INTERACTIVE SENIOR PUZZLE ACTIVITIES ── */}
              {cognitiveMode === 'puzzle' && (
                <div className="pt-2">
                  <ElderCognitivePuzzleGame
                    initialScore={directMmseScore}
                    onComplete={handlePuzzleComplete}
                  />
                </div>
              )}

              {/* ── MODE 2: DIRECT SCORE OVERRIDE ── */}
              {cognitiveMode === 'direct' && (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Direct MMSE Score Entry (0 to 30)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={directMmseScore}
                      onChange={(e) => setDirectMmseScore(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600"
                    />
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 min-w-[50px] text-right">
                      {directMmseScore} / 30
                    </span>
                  </div>
                </div>
              )}

              {/* ── MODE 3: TRADITIONAL 5-DOMAIN QUESTIONNAIRE ── */}
              {cognitiveMode === 'questionnaire' && (
                <div className="space-y-4">
                  {/* Domain 1: Orientation */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t('clinical.domain1', 'Domain 1: Orientation to Time & Place (10 Points)')}
                    </span>
                    <div className="space-y-2">
                      {[...MMSE_QUESTIONS.orientation_time, ...MMSE_QUESTIONS.orientation_place].map((q) => (
                        <div key={q.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{t(MMSE_KEY_MAP[q.id], q.label)}</span>
                          <div className="flex gap-1">
                            {[1, 0].map((pt) => (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => handleMmseAnswerChange(q.id, pt)}
                                className={`w-8 h-7 rounded-lg text-xs font-bold transition-all ${
                                  mmseAnswers[q.id] === pt
                                    ? pt === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white'
                                    : 'bg-white dark:bg-slate-900 border text-slate-400'
                                }`}
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domain 2: Registration */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t('clinical.domain2', 'Domain 2: Immediate Registration (3 Points)')}
                    </span>
                    <p className="text-[11px] text-slate-500">{t('clinical.domain2Desc', 'Examiner names 3 objects: Apple, Table, Penny. Patient immediately repeats.')}</p>
                    <div className="space-y-2">
                      {MMSE_QUESTIONS.registration.map((q) => (
                        <div key={q.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{t(MMSE_KEY_MAP[q.id], q.label)}</span>
                          <div className="flex gap-1">
                            {[1, 0].map((pt) => (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => handleMmseAnswerChange(q.id, pt)}
                                className={`w-8 h-7 rounded-lg text-xs font-bold transition-all ${
                                  mmseAnswers[q.id] === pt
                                    ? pt === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white'
                                    : 'bg-white dark:bg-slate-900 border text-slate-400'
                                }`}
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domain 3: Attention & Calculation */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t('clinical.domain3', 'Domain 3: Attention & Serial 7s Subtraction (5 Points)')}
                    </span>
                    <div className="space-y-2">
                      {MMSE_QUESTIONS.attention.map((q) => (
                        <div key={q.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{t(MMSE_KEY_MAP[q.id], q.label)}</span>
                          <div className="flex gap-1">
                            {[1, 0].map((pt) => (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => handleMmseAnswerChange(q.id, pt)}
                                className={`w-8 h-7 rounded-lg text-xs font-bold transition-all ${
                                  mmseAnswers[q.id] === pt
                                    ? pt === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white'
                                    : 'bg-white dark:bg-slate-900 border text-slate-400'
                                }`}
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domain 4: Delayed Recall */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t('clinical.domain4', 'Domain 4: Delayed Recall (3 Points)')}
                    </span>
                    <p className="text-[11px] text-slate-500">{t('clinical.domain4Desc', 'Ask patient to recall the 3 objects named in Domain 2.')}</p>
                    <div className="space-y-2">
                      {MMSE_QUESTIONS.recall.map((q) => (
                        <div key={q.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{t(MMSE_KEY_MAP[q.id], q.label)}</span>
                          <div className="flex gap-1">
                            {[1, 0].map((pt) => (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => handleMmseAnswerChange(q.id, pt)}
                                className={`w-8 h-7 rounded-lg text-xs font-bold transition-all ${
                                  mmseAnswers[q.id] === pt
                                    ? pt === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white'
                                    : 'bg-white dark:bg-slate-900 border text-slate-400'
                                }`}
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Domain 5: Language & Praxis */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {t('clinical.domain5', 'Domain 5: Language, Reading, Writing & Copying (9 Points)')}
                    </span>
                    <div className="space-y-2">
                      {MMSE_QUESTIONS.language.map((q) => (
                        <div key={q.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{t(MMSE_KEY_MAP[q.id], q.label)}</span>
                          <div className="flex gap-1">
                            {[1, 0].map((pt) => (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => handleMmseAnswerChange(q.id, pt)}
                                className={`w-8 h-7 rounded-lg text-xs font-bold transition-all ${
                                  mmseAnswers[q.id] === pt
                                    ? pt === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white'
                                    : 'bg-white dark:bg-slate-900 border text-slate-400'
                                }`}
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Table 1 Live Result Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Assessed MMSE Cognitive Score (Table 1)
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-black ${
                    computedMmseScore >= 26
                      ? 'bg-emerald-500 text-white'
                      : computedMmseScore >= 20
                      ? 'bg-amber-500 text-white'
                      : computedMmseScore >= 10
                      ? 'bg-orange-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {mmseEval.stage}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {computedMmseScore} <span className="text-sm font-semibold text-slate-400">/ 30</span>
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Typical Stage Duration: <strong>{mmseEval.duration}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {computedMmseScore < 26
                    ? 'Targeted nutrient enrichment active: Prioritizing Omega-3 fatty acids, bioavailable B-vitamins (B12, B6, Folate), and neuroprotective antioxidants.'
                    : 'Cognitive baseline optimal. Maintaining neuroprotective antioxidants and Omega-3 balance for brain vitality.'}
                </p>
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(4)}
                  className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  Proceed to Dietary Preferences & Allergens <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DIETARY PREFERENCES, RESTRICTIONS & ALLERGENS ── */}
        {activeTab === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <Utensils className="w-5 h-5" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">4. Dietary Preferences, Allergens & Texture</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Personalization through Food Preferences and Restrictions (Section II-3). Filters matching CSV food databases (dairy, grains, fruits, vegetables, proteins) to ensure safe, enjoyable adherence.
              </p>

              {/* Preferred Cuisine */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Preferred Regional Cuisine
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Tamil Nadu (South Indian)',
                    'Kerala (South Indian)',
                    'Karnataka (South Indian)',
                    'Andhra & Telangana (South Indian)',
                    'Punjab & North Indian',
                    'UP & Delhi (North Indian)',
                    'Rajasthan (North Indian)',
                    'Maharashtra (West Indian)',
                    'Gujarat (West Indian)',
                    'West Bengal (East Indian)',
                    'Odisha (East Indian)',
                    'Assam & North-East',
                    'Pan-Indian Balanced',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDietary({ ...dietary, preferred_cuisine: c })}
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all ${
                        dietary.preferred_cuisine === c
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Choice */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Dietary Choice (Section II-3)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Vegetarian', 'Vegan', 'Pescatarian', 'Non-Vegetarian'].map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setDietary({ ...dietary, diet_type: dt })}
                      className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                        dietary.diet_type === dt
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chewability & Food Texture */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Food Texture & Chewability (Elderly Safety)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Normal Meals', 'Soft Meals', 'Semi-Liquid Digest', 'Pureed Meals'].map((tex) => (
                    <button
                      key={tex}
                      type="button"
                      onClick={() => setDietary({ ...dietary, chewability: tex })}
                      className={`p-3 rounded-2xl text-xs font-bold border text-center transition-all ${
                        dietary.chewability === tex
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {tex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergen Avoidance Multi-select (Paper Section I & II-3) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Allergen Avoidance & Sensitivities (Tap to Exclude)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALLERGEN_OPTIONS.map((a) => {
                    const isSelected = dietary.allergens.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAllergen(a.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-base">{a.icon}</span> {a.label}
                        </span>
                        {isSelected ? (
                          <span className="text-[10px] font-extrabold uppercase bg-rose-500 text-white px-2 py-0.5 rounded-lg">Excluded</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Safe</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab(3)}
                  className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={saving}
                  className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Analyzing Health Data & Generating Plan...' : 'Generate Personalized Diet Plan (Figure 2)'}
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: RESULT VIEW MATCHING FIGURE 2 OF PAPER ── */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Status */}
            <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Paper Assessment Complete • Data Successfully Processed</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/elder/diet-plan')}
                className="text-xs font-black bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-md"
              >
                View Daily Meal Schedule ➔
              </button>
            </div>

            {/* FIGURE 2 GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Box 1: Assessed Scores */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" /> Assessed Clinical Scores (Figure 2)
                </span>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300">MMSE Cognitive Assessment</span>
                    <span className="text-xs font-black text-blue-700 bg-blue-500/20 px-2 py-0.5 rounded-lg">
                      {resultData?.assessed_scores?.mmse?.stage || mmseEval.stage}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                    {resultData?.assessed_scores?.mmse?.score ?? computedMmseScore} / 30
                  </div>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                    Typical progression duration: {resultData?.assessed_scores?.mmse?.duration || mmseEval.duration}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">FRAX® 10-Year Fracture Risk</span>
                    <span className="text-xs font-black text-amber-700 bg-amber-500/20 px-2 py-0.5 rounded-lg">
                      {resultData?.assessed_scores?.frax?.category || fraxEval.category}
                    </span>
                  </div>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-300">
                    Major: {resultData?.assessed_scores?.frax?.major_osteoporotic_risk ?? fraxEval.major}% • Hip: {resultData?.assessed_scores?.frax?.hip_fracture_risk ?? fraxEval.hip}%
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    {resultData?.assessed_scores?.frax?.description || fraxEval.description}
                  </p>
                </div>
              </div>

              {/* Box 2: Recommended Nutrients with Tolerance Ranges */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" /> Recommended Nutrients (Gender-Adjusted RDA)
                </span>

                <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                  {(resultData?.recommended_nutrients || [
                    { nutrient: 'Calcium', target: 1200, unit: 'mg', tolerance: '1100 - 1400 mg', priority: 'Bone Health' },
                    { nutrient: 'Vitamin D', target: 600, unit: 'IU', tolerance: '600 - 1000 IU', priority: 'Calcium Absorption' },
                    { nutrient: 'Omega-3', target: 1000, unit: 'mg', tolerance: '1000 - 1500 mg', priority: 'Brain Health' },
                    { nutrient: 'Protein', target: 64, unit: 'g', tolerance: '60 - 75 g', priority: 'Bone Matrix' },
                    { nutrient: 'Vitamin B-12', target: 2.4, unit: 'mcg', tolerance: '2.4 - 5.0 mcg', priority: 'Nerve Conduction' },
                    { nutrient: 'Antioxidants', target: 200, unit: 'mg', tolerance: '200 - 350 mg', priority: 'Neuroprotection' }
                  ]).map((n) => (
                    <div key={n.nutrient} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">{n.nutrient}</div>
                        <div className="text-[10px] text-slate-400">Tolerance: {n.tolerance}</div>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {n.target} {n.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Personalized Recipe Formulated from CSV Categories */}
              <div className="md:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                        Personalized Recipe (Figure 2)
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {resultData?.personalized_recipe?.title || 'Sprouted Ragi & Drumstick Sambar with Brown Rice'}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl font-bold border border-emerald-500/20">
                    {dietary.preferred_cuisine}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ingredients */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Ingredients (Allergens Strictly Excluded):
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {(resultData?.personalized_recipe?.ingredients || [
                        '1/2 cup Sprouted Ragi flour (Rich in bioavailable Calcium)',
                        '1 fresh Drumstick (Moringa) cut into pieces',
                        '1/2 cup Yellow Moong Dal (High protein, easy to digest)',
                        '1 tsp Flaxseed powder (Brain-supportive Omega-3)',
                        '1/4 tsp Turmeric & Hing (Anti-inflammatory)',
                        '1 tsp Pure Ghee or Cold-pressed sesame oil'
                      ]).map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Preparation & Cooking Instructions */}
                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Preparation & Cooking Instructions:
                    </span>
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      {(resultData?.personalized_recipe?.instructions || [
                        '1. Pressure cook dal and vegetables until tender and easily chewable.',
                        '2. Temper mustard and cumin in warm ghee/oil.',
                        '3. Blend flaxseed powder into warm gravy just before serving to preserve Omega-3 fats.',
                        '4. Serve warm at senior-friendly temperature.'
                      ]).map((step, idx) => (
                        <p key={idx} className="leading-relaxed">{step}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resultData?.personalized_recipe?.nutritional_alignment || 'Nutritionally aligned with assessed FRAX bone and MMSE cognitive categories.'}</span>
                </div>
              </div>

              {/* Box 4: Other Clinical Recommendations */}
              <div className="md:col-span-2 p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" /> Other Clinical & Functional Food Recommendations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    ☀️ <strong>Sunlight Exposure:</strong> 15–20 mins early morning sunlight (7:30–8:30 AM) to stimulate endogenous Vitamin D3 synthesis.
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    🥛 <strong>Probiotics & Gut Health:</strong> Include fresh curd, buttermilk, or fermented kanji to improve intestinal calcium and mineral absorption.
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    💧 <strong>Hydration:</strong> 6 to 8 glasses of lukewarm water distributed throughout the day to support brain neurotransmission and renal load.
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    🛡️ <strong>Adherence Reminder:</strong> All ingredients verified against stated exclusions: {dietary.allergens.length ? dietary.allergens.join(', ') : 'None'}.
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab(4)}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Assessment Inputs
              </button>
              <button
                type="button"
                onClick={() => navigate('/elder/diet-plan')}
                className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                Open Daily Meal Timetable <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
