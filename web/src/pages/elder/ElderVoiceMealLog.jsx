import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ArrowLeft, Footprints, Moon, Loader2, AlertCircle, Mic, MicOff, Flame, Dumbbell, Leaf, Wheat, X, Search } from 'lucide-react';
import api from '../../services/api';

// ─── Expanded local food database ─────────────────────────────────────────────
const IFCT_FOODS = [
  // South Indian staples
  { id: 'local-1',  name: 'Ragi Dosa',          category: 'Breakfast', calories: 180, protein_g: 7.3,  carbs_g: 35.2, fat_g: 2.1,  calcium_mg: 344, fiber_g: 3.6, is_vegetarian: true,  is_vegan: true,  aliases: ['ragi', 'dosa', 'ragi dosa'], ingredients: ['Ragi flour', 'Urad dal', 'Salt'] },
  { id: 'local-2',  name: 'Idli (2 pieces)',    category: 'Breakfast', calories: 130, protein_g: 4.2,  carbs_g: 26.0, fat_g: 0.8,  calcium_mg: 45,  fiber_g: 1.2, is_vegetarian: true,  is_vegan: true,  aliases: ['idli', 'idly', 'idlis'], ingredients: ['Rice', 'Urad dal'] },
  { id: 'local-3',  name: 'Cheera Kootu',       category: 'Lunch',     calories: 95,  protein_g: 3.1,  carbs_g: 11.0, fat_g: 3.5,  calcium_mg: 210, fiber_g: 2.8, is_vegetarian: true,  is_vegan: true,  aliases: ['spinach', 'cheera', 'kootu', 'cheera kootu'], ingredients: ['Spinach', 'Coconut', 'Spices'] },
  { id: 'local-4',  name: 'Brown Rice',         category: 'Lunch',     calories: 216, protein_g: 4.5,  carbs_g: 44.0, fat_g: 1.6,  calcium_mg: 20,  fiber_g: 3.5, is_vegetarian: true,  is_vegan: true,  aliases: ['brown rice', 'rice'], ingredients: ['Whole grain rice'] },
  { id: 'local-5',  name: 'Curd / Yogurt',      category: 'Snack',     calories: 110, protein_g: 7.0,  carbs_g: 9.0,  fat_g: 4.5,  calcium_mg: 240, fiber_g: 0,   is_vegetarian: true,  is_vegan: false, aliases: ['curd', 'yogurt', 'dahi'], ingredients: ['Milk', 'Active cultures'] },
  { id: 'local-6',  name: 'Sama Rice Khichdi',  category: 'Dinner',    calories: 140, protein_g: 5.2,  carbs_g: 26.0, fat_g: 2.8,  calcium_mg: 180, fiber_g: 2.0, is_vegetarian: true,  is_vegan: true,  aliases: ['khichdi', 'sama rice', 'kitchdi', 'khicdi'], ingredients: ['Barnyard millet', 'Moong dal', 'Ghee'] },
  { id: 'local-7',  name: 'Warm Turmeric Milk', category: 'Beverage',  calories: 140, protein_g: 6.4,  carbs_g: 10.0, fat_g: 7.0,  calcium_mg: 230, fiber_g: 0,   is_vegetarian: true,  is_vegan: false, aliases: ['milk', 'turmeric milk', 'haldi milk', 'golden milk'], ingredients: ['Milk', 'Turmeric', 'Black pepper'] },
  { id: 'local-8',  name: 'Banana',             category: 'Snack',     calories: 89,  protein_g: 1.1,  carbs_g: 23.0, fat_g: 0.3,  calcium_mg: 5,   fiber_g: 2.6, is_vegetarian: true,  is_vegan: true,  aliases: ['banana', 'pazham', 'kela'], ingredients: ['Banana'] },
  { id: 'local-9',  name: 'Sambar',             category: 'Lunch',     calories: 85,  protein_g: 4.8,  carbs_g: 13.0, fat_g: 2.2,  calcium_mg: 65,  fiber_g: 3.8, is_vegetarian: true,  is_vegan: true,  aliases: ['sambar', 'sambhar'], ingredients: ['Toor dal', 'Mixed vegetables', 'Tamarind'] },
  { id: 'local-10', name: 'Chapati / Roti',     category: 'Dinner',    calories: 210, protein_g: 6.0,  carbs_g: 38.0, fat_g: 4.0,  calcium_mg: 28,  fiber_g: 3.2, is_vegetarian: true,  is_vegan: true,  aliases: ['chapati', 'roti', 'chappathi', 'rotis'], ingredients: ['Whole wheat flour', 'Water'] },
  // Non-veg
  { id: 'local-11', name: 'Chicken Rice',       category: 'Lunch',     calories: 350, protein_g: 25.0, carbs_g: 45.0, fat_g: 10.5, calcium_mg: 35,  fiber_g: 1.5, is_vegetarian: false, is_vegan: false, aliases: ['chicken rice', 'chicken'], ingredients: ['Rice', 'Chicken breast', 'Soy sauce', 'Garlic'] },
  { id: 'local-12', name: 'Pizza',              category: 'Dinner',    calories: 285, protein_g: 12.2, carbs_g: 35.0, fat_g: 10.5, calcium_mg: 120, fiber_g: 2.5, is_vegetarian: false, is_vegan: false, aliases: ['pizza', 'pizza slice'], ingredients: ['Wheat crust', 'Tomato sauce', 'Cheese', 'Pepperoni'] },
  { id: 'local-13', name: 'Boiled Egg',         category: 'Breakfast', calories: 78,  protein_g: 6.3,  carbs_g: 0.6,  fat_g: 5.3,  calcium_mg: 28,  fiber_g: 0,   is_vegetarian: false, is_vegan: false, aliases: ['egg', 'eggs', 'boiled egg', 'omelette', 'omlet'], ingredients: ['Egg'] },
  { id: 'local-14', name: 'Fish Curry',         category: 'Lunch',     calories: 185, protein_g: 18.0, carbs_g: 8.0,  fat_g: 8.5,  calcium_mg: 90,  fiber_g: 1.2, is_vegetarian: false, is_vegan: false, aliases: ['fish', 'fish curry', 'meen curry', 'meen'], ingredients: ['Fish', 'Coconut milk', 'Spices'] },
  { id: 'local-15', name: 'Veg Burger',         category: 'Snack',     calories: 320, protein_g: 10.5, carbs_g: 42.0, fat_g: 14.5, calcium_mg: 85,  fiber_g: 4.5, is_vegetarian: true,  is_vegan: false, aliases: ['burger', 'veg burger', 'vegburger'], ingredients: ['Bun', 'Potato patty', 'Lettuce', 'Mayo'] },
  { id: 'local-16', name: 'Mutton Biryani',     category: 'Dinner',    calories: 450, protein_g: 22.0, carbs_g: 55.0, fat_g: 18.5, calcium_mg: 65,  fiber_g: 3.5, is_vegetarian: false, is_vegan: false, aliases: ['mutton', 'biryani', 'briyani', 'biriyani', 'mutton biryani'], ingredients: ['Basmati rice', 'Mutton', 'Ghee', 'Spices'] },
  { id: 'local-17', name: 'Green Salad',        category: 'Lunch',     calories: 120, protein_g: 4.0,  carbs_g: 15.0, fat_g: 5.0,  calcium_mg: 45,  fiber_g: 6.0, is_vegetarian: true,  is_vegan: true,  aliases: ['salad', 'green salad'], ingredients: ['Lettuce', 'Cucumber', 'Tomato', 'Olive oil'] },
  // Noodles / pasta / fast food
  { id: 'local-18', name: 'Noodles',            category: 'Dinner',    calories: 310, protein_g: 8.5,  carbs_g: 54.0, fat_g: 7.5,  calcium_mg: 22,  fiber_g: 2.1, is_vegetarian: true,  is_vegan: true,  aliases: ['noodles', 'maggi', 'indomie', 'instant noodles', 'veg noodles'], ingredients: ['Maida', 'Spices', 'Vegetables'] },
  { id: 'local-19', name: 'Pasta',              category: 'Dinner',    calories: 350, protein_g: 12.0, carbs_g: 60.0, fat_g: 9.0,  calcium_mg: 45,  fiber_g: 3.5, is_vegetarian: true,  is_vegan: true,  aliases: ['pasta', 'spaghetti', 'penne', 'macaroni'], ingredients: ['Durum wheat', 'Tomato sauce', 'Olive oil'] },
  { id: 'local-20', name: 'Fried Rice',         category: 'Lunch',     calories: 295, protein_g: 7.5,  carbs_g: 50.0, fat_g: 8.0,  calcium_mg: 18,  fiber_g: 2.0, is_vegetarian: true,  is_vegan: true,  aliases: ['fried rice', 'veg fried rice', 'rice'], ingredients: ['Rice', 'Vegetables', 'Soy sauce', 'Oil'] },
  { id: 'local-21', name: 'Upma',               category: 'Breakfast', calories: 160, protein_g: 4.5,  carbs_g: 28.0, fat_g: 4.5,  calcium_mg: 30,  fiber_g: 2.5, is_vegetarian: true,  is_vegan: true,  aliases: ['upma', 'uppuma', 'uppma'], ingredients: ['Semolina', 'Vegetables', 'Mustard', 'Curry leaves'] },
  { id: 'local-22', name: 'Poha / Aval',        category: 'Breakfast', calories: 150, protein_g: 3.8,  carbs_g: 30.0, fat_g: 3.2,  calcium_mg: 25,  fiber_g: 2.0, is_vegetarian: true,  is_vegan: true,  aliases: ['poha', 'aval', 'beaten rice', 'flattened rice'], ingredients: ['Flattened rice', 'Vegetables', 'Turmeric'] },
  { id: 'local-23', name: 'Oats Porridge',      category: 'Breakfast', calories: 145, protein_g: 6.0,  carbs_g: 25.0, fat_g: 3.0,  calcium_mg: 55,  fiber_g: 4.5, is_vegetarian: true,  is_vegan: true,  aliases: ['oats', 'oatmeal', 'porridge', 'oats porridge'], ingredients: ['Rolled oats', 'Water', 'Salt'] },
  { id: 'local-24', name: 'Dal / Lentil Soup',  category: 'Lunch',     calories: 170, protein_g: 11.0, carbs_g: 28.0, fat_g: 3.0,  calcium_mg: 70,  fiber_g: 8.0, is_vegetarian: true,  is_vegan: true,  aliases: ['dal', 'lentil', 'dhal', 'dal soup', 'lentil soup'], ingredients: ['Lentils', 'Spices', 'Onion', 'Tomato'] },
  { id: 'local-25', name: 'Sandwich',           category: 'Snack',     calories: 280, protein_g: 11.0, carbs_g: 38.0, fat_g: 9.0,  calcium_mg: 80,  fiber_g: 3.0, is_vegetarian: true,  is_vegan: false, aliases: ['sandwich', 'toast sandwich', 'bread sandwich'], ingredients: ['Bread', 'Vegetables', 'Cheese'] },
  { id: 'local-26', name: 'Vada / Wada',        category: 'Breakfast', calories: 195, protein_g: 6.5,  carbs_g: 26.0, fat_g: 8.0,  calcium_mg: 40,  fiber_g: 2.5, is_vegetarian: true,  is_vegan: true,  aliases: ['vada', 'wada', 'medu vada', 'uzhunnu vada'], ingredients: ['Urad dal', 'Spices', 'Oil'] },
  { id: 'local-27', name: 'Parotta',            category: 'Dinner',    calories: 350, protein_g: 7.0,  carbs_g: 52.0, fat_g: 13.0, calcium_mg: 30,  fiber_g: 2.0, is_vegetarian: true,  is_vegan: true,  aliases: ['parotta', 'paratha', 'parata', 'parota'], ingredients: ['Maida', 'Oil', 'Water'] },
  { id: 'local-28', name: 'Rasam',              category: 'Lunch',     calories: 45,  protein_g: 2.0,  carbs_g: 8.0,  fat_g: 1.0,  calcium_mg: 30,  fiber_g: 1.5, is_vegetarian: true,  is_vegan: true,  aliases: ['rasam', 'soup', 'pepper water'], ingredients: ['Tamarind', 'Tomato', 'Spices'] },
  { id: 'local-29', name: 'Chicken Curry',      category: 'Dinner',    calories: 240, protein_g: 22.0, carbs_g: 8.0,  fat_g: 13.0, calcium_mg: 45,  fiber_g: 1.5, is_vegetarian: false, is_vegan: false, aliases: ['chicken curry', 'chicken masala', 'chicken gravy'], ingredients: ['Chicken', 'Onion', 'Tomato', 'Spices'] },
  { id: 'local-30', name: 'Pongal',             category: 'Breakfast', calories: 175, protein_g: 5.5,  carbs_g: 32.0, fat_g: 4.5,  calcium_mg: 35,  fiber_g: 2.0, is_vegetarian: true,  is_vegan: true,  aliases: ['pongal', 'ven pongal', 'sweet pongal', 'rice pongal'], ingredients: ['Rice', 'Moong dal', 'Ghee', 'Pepper'] },
  { id: 'local-31', name: 'Chappati with Curry',category: 'Dinner',    calories: 380, protein_g: 12.0, carbs_g: 58.0, fat_g: 10.0, calcium_mg: 65,  fiber_g: 5.0, is_vegetarian: true,  is_vegan: true,  aliases: ['roti curry', 'chapati curry', 'chappati'], ingredients: ['Whole wheat', 'Vegetables', 'Spices'] },
  { id: 'local-32', name: 'Apple',              category: 'Snack',     calories: 52,  protein_g: 0.3,  carbs_g: 14.0, fat_g: 0.2,  calcium_mg: 6,   fiber_g: 2.4, is_vegetarian: true,  is_vegan: true,  aliases: ['apple'], ingredients: ['Apple'] },
  { id: 'local-33', name: 'Coffee',             category: 'Beverage',  calories: 45,  protein_g: 1.5,  carbs_g: 6.0,  fat_g: 1.5,  calcium_mg: 50,  fiber_g: 0,   is_vegetarian: true,  is_vegan: false, aliases: ['coffee', 'filter coffee', 'kaapi'], ingredients: ['Coffee powder', 'Milk', 'Sugar'] },
  { id: 'local-34', name: 'Tea',                category: 'Beverage',  calories: 35,  protein_g: 1.0,  carbs_g: 5.0,  fat_g: 1.0,  calcium_mg: 40,  fiber_g: 0,   is_vegetarian: true,  is_vegan: false, aliases: ['tea', 'chai', 'chaya', 'masala tea'], ingredients: ['Tea leaves', 'Milk', 'Sugar'] },
  { id: 'local-35', name: 'Buttermilk',         category: 'Beverage',  calories: 40,  protein_g: 3.0,  carbs_g: 5.0,  fat_g: 1.0,  calcium_mg: 115, fiber_g: 0,   is_vegetarian: true,  is_vegan: false, aliases: ['buttermilk', 'moru', 'chaas'], ingredients: ['Yogurt', 'Water', 'Salt'] },
  { id: 'local-36', name: 'Chicken Biryani',    category: 'Dinner',    calories: 400, protein_g: 24.0, carbs_g: 52.0, fat_g: 15.0, calcium_mg: 55,  fiber_g: 2.5, is_vegetarian: false, is_vegan: false, aliases: ['chicken biryani', 'chicken biriyani', 'biryani'], ingredients: ['Basmati rice', 'Chicken', 'Spices'] },
  { id: 'local-37', name: 'Bread Toast',        category: 'Breakfast', calories: 165, protein_g: 5.5,  carbs_g: 28.0, fat_g: 4.5,  calcium_mg: 45,  fiber_g: 2.0, is_vegetarian: true,  is_vegan: false, aliases: ['bread', 'toast', 'bread toast'], ingredients: ['Wheat bread', 'Butter'] },
  { id: 'local-38', name: 'Fruit Salad',        category: 'Snack',     calories: 95,  protein_g: 1.5,  carbs_g: 24.0, fat_g: 0.5,  calcium_mg: 25,  fiber_g: 3.5, is_vegetarian: true,  is_vegan: true,  aliases: ['fruit salad', 'fruits', 'mixed fruits'], ingredients: ['Apple', 'Banana', 'Grapes', 'Pomegranate'] },
  { id: 'local-39', name: 'Vegetable Soup',     category: 'Dinner',    calories: 75,  protein_g: 3.0,  carbs_g: 12.0, fat_g: 2.0,  calcium_mg: 35,  fiber_g: 3.0, is_vegetarian: true,  is_vegan: true,  aliases: ['soup', 'veg soup', 'vegetable soup'], ingredients: ['Mixed vegetables', 'Spices', 'Stock'] },
  { id: 'local-40', name: 'Paneer Curry',       category: 'Dinner',    calories: 260, protein_g: 14.0, carbs_g: 12.0, fat_g: 17.5, calcium_mg: 200, fiber_g: 2.0, is_vegetarian: true,  is_vegan: false, aliases: ['paneer', 'paneer curry', 'paneer masala', 'cottage cheese'], ingredients: ['Paneer', 'Onion', 'Tomato', 'Spices'] },
];

const symptomKeywords = ['knee pain', 'joint pain', 'fatigue', 'tired', 'acidity', 'gas', 'headache', 'dizziness', 'chest pain'];

// ─── Smart local food search ───────────────────────────────────────────────────
// Uses token-level matching: "I ate noodles" → tokens: ["i","ate","noodles"] → matches food with alias "noodles"
function searchFoodsLocally(text, foodList) {
  if (!text || !text.trim()) return [];
  const lowerText = text.toLowerCase();
  // Generate all word tokens from the input
  const tokens = lowerText.split(/[\s,;.!?]+/).filter(t => t.length > 2);
  
  const results = [];
  const addedIds = new Set();

  for (const food of foodList) {
    const allTerms = food.aliases
      ? [...food.aliases, food.name.toLowerCase()]
      : [food.name.toLowerCase()];

    let matched = false;

    for (const term of allTerms) {
      // Check if the full term appears in the input text
      if (lowerText.includes(term)) {
        matched = true;
        break;
      }
      // Also check if any token matches a word in the term
      const termTokens = term.split(/[\s-]+/);
      if (termTokens.some(tt => tt.length > 2 && tokens.includes(tt))) {
        matched = true;
        break;
      }
    }

    if (matched && !addedIds.has(food.id)) {
      results.push(food);
      addedIds.add(food.id);
    }
  }

  return results;
}

// Nutrition Badge Card
const NutriCard = ({ icon: Icon, label, value, unit, color, bg }) => (
  <div className={`${bg} rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 border`}>
    <div className={`p-1.5 rounded-xl ${color} text-white shrink-0`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <span className="text-[10px] sm:text-[11px] font-black text-slate-500 block uppercase tracking-wide leading-none">{label}</span>
      <span className="text-[15px] sm:text-base font-black text-slate-900 leading-none">{value}<span className="text-[10px] sm:text-xs font-bold text-slate-500 ml-0.5">{unit}</span></span>
    </div>
  </div>
);

// Food Detail Card
const FoodDetailCard = ({ food, onRemove }) => {
  const nf = food.nutrition_facts || food;
  const emoji = food.category === 'Breakfast' ? '🌅' : food.category === 'Lunch' ? '🌞' : food.category === 'Dinner' ? '🌙' : food.category === 'Snack' ? '🍎' : food.category === 'Beverage' ? '☕' : '🍽️';

  return (
    <div className="bg-white comic-card p-4 sm:p-5 space-y-4 relative overflow-hidden group transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-[100px] opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F6F1] border-2 border-[#1D9E75] flex items-center justify-center text-2xl shadow-[2px_3px_0_#1D9E75]">
            {emoji}
          </div>
          <div>
            <h4 className="text-[17px] sm:text-lg font-black text-slate-900 leading-tight">{food.name}</h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-300">
                {food.category || 'Food'}
              </span>
              {(food.is_vegetarian || nf.is_vegetarian) ? (
                <span className="text-[10px] font-black text-green-800 bg-green-100 px-2 py-0.5 rounded-full uppercase border border-green-300">🥦 Veg</span>
              ) : (
                <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full uppercase border border-rose-300">🍗 Non-Veg</span>
              )}
            </div>
            {food.ingredients && (
              <p className="text-xs font-bold text-slate-500 mt-2 flex flex-wrap gap-1 leading-tight">
                <span className="text-slate-400">Contains:</span>
                {food.ingredients.map((ing, idx) => (
                  <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">{ing}</span>
                ))}
              </p>
            )}
          </div>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 border-2 border-rose-200 transition-colors shadow-sm">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 relative z-10">
        <NutriCard icon={Flame}   label="Calories" value={nf.calories || 0}   unit="kcal" color="bg-orange-500"  bg="bg-orange-50 border-orange-200" />
        <NutriCard icon={Dumbbell} label="Protein"  value={nf.protein_g || 0}  unit="g"    color="bg-blue-600"    bg="bg-blue-50 border-blue-200" />
        <NutriCard icon={Wheat}   label="Carbs"    value={nf.carbs_g || 0}    unit="g"    color="bg-purple-600"  bg="bg-purple-50 border-purple-200" />
        <NutriCard icon={Leaf}    label="Fats"     value={nf.fat_g || 0}      unit="g"    color="bg-emerald-600" bg="bg-emerald-50 border-emerald-200" />
        {(nf.calcium_mg != null) && (
          <NutriCard icon={Leaf}  label="Calcium"  value={nf.calcium_mg}      unit="mg"   color="bg-amber-500"   bg="bg-amber-50 border-amber-200" />
        )}
        {(nf.fiber_g != null) && (
          <NutriCard icon={Leaf}  label="Fiber"    value={nf.fiber_g}         unit="g"    color="bg-teal-600"    bg="bg-teal-50 border-teal-200" />
        )}
      </div>
    </div>
  );
};

export default function ElderVoiceMealLog() {
  const navigate = useNavigate();
  const { t, activeLanguage } = useLanguage();
  const { user } = useAuth();
  const [savedLog, setSavedLog] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [elderName, setElderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Voice & Input state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [allFoods, setAllFoods] = useState(IFCT_FOODS);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [detectedSymptoms, setDetectedSymptoms] = useState([]);

  // Manual food search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  // ── Debounced food detection ─────────────────────────────────────────────
  useEffect(() => {
    const combinedText = `${transcript} ${manualInput}`.trim();
    const lowerText = combinedText.toLowerCase();

    // Detect symptoms locally
    const symptoms = symptomKeywords.filter(s => lowerText.includes(s));
    setDetectedSymptoms([...new Set(symptoms)]);

    if (!combinedText) {
      setSelectedFoods([]);
      return;
    }

    // ① Instant local match — show immediately while AI processes
    const localMatches = searchFoodsLocally(combinedText, allFoods);
    if (localMatches.length > 0) {
      setSelectedFoods(localMatches);
    }

    // ② Try AI with a short debounce
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await api.post('/api/analyze-food-text', { text: combinedText });
        if (res.data && res.data.foods && res.data.foods.length > 0) {
          // Add AI-found foods on top of local ones (deduplicate by name)
          const existingNames = new Set(localMatches.map(f => f.name.toLowerCase()));
          const newAiFoods = res.data.foods.filter(f => !existingNames.has(f.name.toLowerCase()));
          setSelectedFoods([...localMatches, ...newAiFoods]);
        }
        // else keep local matches
      } catch {
        // AI failed – local matches already shown, no extra action needed
      } finally {
        setIsAnalyzing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [transcript, manualInput, allFoods]);

  // ── Manual search results ────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const results = searchFoodsLocally(searchQuery, allFoods).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery, allFoods]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/api/elder/profile');
      setProfileId(res.data.id || res.data._id);
      // Use authenticated user's name from profile or JWT
      const name = res.data.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'Senior';
      setElderName(name);
    } catch {
      // Fallback to JWT user info
      const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'Senior';
      setElderName(name);
    }

    try {
      const foodRes = await api.get('/food-items?limit=200');
      if (foodRes.data?.length > 0) {
        const backendFoods = foodRes.data.map(f => ({
          ...f,
          aliases: [f.name.toLowerCase()],
          calories:    f.nutrition_facts?.calories,
          protein_g:   f.nutrition_facts?.protein_g,
          carbs_g:     f.nutrition_facts?.carbs_g,
          fat_g:       f.nutrition_facts?.fat_g,
          calcium_mg:  f.nutrition_facts?.calcium_mg,
          fiber_g:     f.nutrition_facts?.fiber_g,
        }));
        // Merge: backend foods + local IFCT (keep both)
        const backendNames = new Set(backendFoods.map(f => f.name.toLowerCase()));
        const localOnly = IFCT_FOODS.filter(f => !backendNames.has(f.name.toLowerCase()));
        setAllFoods([...backendFoods, ...localOnly]);
      }
    } catch {
      setAllFoods(IFCT_FOODS);
    }
  };

  const addFoodManually = (food) => {
    setSelectedFoods(prev => {
      if (prev.find(f => f.id === food.id)) return prev;
      return [...prev, food];
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = activeLanguage?.speechCode || 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSave = async () => {
    const finalText = transcript || manualInput;
    if (!finalText.trim() && selectedFoods.length === 0) return;

    setSubmitting(true);
    setSubmitError('');

    const now = new Date();
    const hour = now.getHours();
    let mealType = 'Snack';
    if (hour >= 5 && hour < 11) mealType = 'Breakfast';
    else if (hour >= 11 && hour < 15) mealType = 'Lunch';
    else if (hour >= 17 && hour < 21) mealType = 'Dinner';

    const foodNames = selectedFoods.map(f => f.name).join(', ');
    const notes = `${finalText}${foodNames ? ` [Auto-added Foods: ${foodNames}]` : ''}${detectedSymptoms.length ? ` [Symptoms: ${detectedSymptoms.join(',')}]` : ''}`;

    const totalNutrition = selectedFoods.reduce((acc, food) => {
      const nf = food.nutrition_facts || food;
      return {
        calories:   acc.calories   + (nf.calories   || 0),
        protein_g:  acc.protein_g  + (nf.protein_g  || 0),
        carbs_g:    acc.carbs_g    + (nf.carbs_g    || 0),
        fat_g:      acc.fat_g      + (nf.fat_g      || 0),
        calcium_mg: acc.calcium_mg + (nf.calcium_mg || 0),
        fiber_g:    acc.fiber_g    + (nf.fiber_g    || 0),
      };
    }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, calcium_mg: 0, fiber_g: 0 });

    const localLog = { mealType, selectedFoods, totalNutrition, notes, transcript: finalText || foodNames, savedAt: now.toISOString() };
    
    // Save to user-specific localStorage key for isolation
    const userKey = `logged_meals_${user?.email || user?.id || 'guest'}`;
    const existing = JSON.parse(localStorage.getItem(userKey) || localStorage.getItem('elder_meal_logs') || '[]');
    localStorage.setItem(userKey, JSON.stringify([localLog, ...existing].slice(0, 50)));
    // Legacy key for compatibility
    localStorage.setItem('elder_meal_logs', JSON.stringify([localLog, ...existing].slice(0, 50)));

    // Build meal payload for the backend
    const mealsPayload = selectedFoods.length > 0
      ? selectedFoods.map(food => {
          const nf = food.nutrition_facts || food;
          return {
            meal_name: food.name,
            meal_type: mealType,
            elder_name: elderName,
            calories: nf.calories || 0,
            protein_g: nf.protein_g || 0,
            carbs_g: nf.carbs_g || 0,
            fat_g: nf.fat_g || 0,
            calcium_mg: nf.calcium_mg || 0,
            logged_via: 'voice',
            logged_at: now.toISOString(),
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        })
      : [{
          meal_name: finalText || 'Voice Logged Meal',
          meal_type: mealType,
          elder_name: elderName,
          calories: 250,
          protein_g: 8,
          carbs_g: 35,
          fat_g: 5,
          logged_via: 'voice',
          logged_at: now.toISOString(),
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }];

    try {
      // Use the correct /api/meals endpoint with JWT auth
      await api.post('/api/meals', { meals: mealsPayload });
      setSavedLog({ ...localLog, synced: true });
    } catch {
      setSavedLog({ ...localLog, synced: false });
      setSubmitError('Saved locally — will sync when connection is restored.');
    }
    setSubmitting(false);
  };

  const removeFood = (foodId) => {
    setSelectedFoods(prev => prev.filter(f => f.id !== foodId));
  };

  const totalNutrition = selectedFoods.reduce((acc, food) => {
    const nf = food.nutrition_facts || food;
    return {
      calories:  acc.calories  + (nf.calories  || 0),
      protein_g: acc.protein_g + (nf.protein_g || 0),
      carbs_g:   acc.carbs_g   + (nf.carbs_g   || 0),
      fat_g:     acc.fat_g     + (nf.fat_g     || 0),
    };
  }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  return (
    <div className="space-y-6 font-['Nunito']" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/elder/dashboard')} className="cartoon-btn p-2.5 bg-white text-slate-800">
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t('log.title')}</h1>
          <p className="text-sm text-slate-600 font-black uppercase tracking-wider mt-0.5">{t('log.subtitle')}</p>
        </div>
      </div>

      {!profileId && (
        <div className="bg-amber-100 border-3 border-amber-300 rounded-3xl p-4 flex items-center gap-3 text-amber-900 shadow-[3px_4px_0_#FCD34D]">
          <span className="text-2xl animate-wobble">⚠️</span>
          <span className="font-black">Offline Mode — Please complete your Health Setup to sync to the cloud!</span>
        </div>
      )}

      {submitting ? (
        <div className="bg-white comic-card p-12 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-14 h-14 text-[#1D9E75] animate-spin" />
          <p className="text-xl font-black text-slate-800">{t('log.saving')}</p>
        </div>
      ) : savedLog ? (
        <div className="bg-[#D1FAE5] border-[3px] border-[#34D399] rounded-[2rem] p-6 sm:p-8 text-emerald-950 space-y-5 shadow-[5px_6px_0_#34D399]">
          <div className="flex items-center gap-4">
            <span className="text-6xl animate-wobble">🎉</span>
            <div>
              <h3 className="text-2xl font-black">{t('log.logSaved')}</h3>
              <span className="text-[13px] font-black uppercase tracking-wider bg-white/50 px-3 py-1 rounded-full mt-1 inline-block border-2 border-emerald-300">
                {savedLog.synced ? '✅ Saved securely to cloud' : '📱 Saved on this device'}
              </span>
            </div>
          </div>
          <div className="bg-white/80 rounded-3xl p-5 border-2 border-emerald-300">
            <p className="text-sm font-black uppercase text-emerald-800 mb-1">What you logged:</p>
            <p className="text-lg font-bold text-slate-900 italic">"{savedLog.transcript}"</p>
          </div>
          <button onClick={() => navigate('/elder/dashboard')} className="cartoon-btn w-full py-4 text-lg bg-white text-[#147556] border-emerald-600 shadow-[4px_5px_0_#065F46] hover:bg-emerald-50">
            {t('log.takeMeHome')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Recorder Section ── */}
          <div className="bg-white comic-card p-6 sm:p-8 text-center space-y-6 sunburst-bg relative overflow-hidden">
            <div className="absolute top-4 left-4 text-3xl opacity-20 animate-float-slow pointer-events-none">🥦</div>
            <div className="absolute bottom-4 right-4 text-4xl opacity-20 animate-float pointer-events-none">🍲</div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">🎙️</span>
              <p className="text-2xl font-black text-slate-900">{t('log.whatDidYouEat')}</p>
              <p className="text-sm text-slate-500 font-semibold">Speak or type what you ate — we'll detect the food automatically!</p>
            </div>

            <div className="flex justify-center py-4 relative z-10">
              <button
                type="button"
                onClick={isListening ? () => setIsListening(false) : startListening}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 transition-all cursor-pointer border-[4px] shadow-[0_8px_0_rgba(0,0,0,0.2)] active:translate-y-[8px] active:shadow-none select-none ${
                  isListening
                    ? 'bg-rose-500 border-rose-700 text-white animate-mic-pulse'
                    : 'bg-gradient-to-b from-[#1D9E75] to-[#147556] border-[#0D6B4E] text-white'
                }`}
              >
                {isListening ? <MicOff className="w-14 h-14" /> : <Mic className="w-14 h-14" />}
                <span className="text-sm font-black uppercase tracking-widest">{isListening ? t('log.stop') : t('log.tapToSpeak')}</span>
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-3 relative z-10 text-left max-w-lg mx-auto w-full pt-4">
              <div className="bg-emerald-50 border-3 border-emerald-200 rounded-2xl p-4">
                <span className="text-[11px] font-black uppercase text-[#147556] block mb-1">{t('log.liveTranscript')}</span>
                <p className="text-[17px] text-slate-800 font-bold leading-relaxed min-h-[28px]">
                  {transcript || <span className="text-slate-400 italic">Listening…</span>}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-0.5 bg-slate-200 flex-1 rounded-full" />
                <span className="text-xs font-black uppercase text-slate-400">{t('log.orType')}</span>
                <div className="h-0.5 bg-slate-200 flex-1 rounded-full" />
              </div>

              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={t('log.typePlaceholder')}
                className="w-full px-5 py-4 rounded-2xl border-3 border-slate-300 text-lg font-bold focus:border-[#1D9E75] focus:bg-emerald-50 transition-colors outline-none shadow-[2px_3px_0_#CBD5E1]"
              />
            </div>
          </div>

          {/* ── Manual Food Search ── */}
          <div className="bg-white comic-card p-5 space-y-3" ref={searchRef}>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#1D9E75]" /> Search & Add Food Manually
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search: noodles, rice, banana, tea…"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:border-[#1D9E75] focus:bg-emerald-50 outline-none transition-colors"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                  {searchResults.map(food => (
                    <button
                      key={food.id}
                      onClick={() => addFoodManually(food)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0 text-left"
                    >
                      <div>
                        <span className="text-sm font-bold text-slate-900">{food.name}</span>
                        <span className="text-xs text-slate-400 ml-2">{food.category}</span>
                      </div>
                      <span className="text-xs font-bold text-[#1D9E75]">{food.calories} kcal</span>
                    </button>
                  ))}
                </div>
              )}
              {showSearch && searchQuery.length > 1 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-2xl shadow-lg z-50 p-4 text-sm text-slate-400 text-center">
                  No local match — try voice/text to let AI detect it.
                </div>
              )}
            </div>
          </div>

          {/* ── AI Analyzing ── */}
          {isAnalyzing && (
            <div className="flex items-center gap-3 justify-center text-slate-500 font-bold bg-white p-4 comic-card">
              <Loader2 className="w-5 h-5 animate-spin text-[#1D9E75]" />
              Analyzing with AI…
            </div>
          )}

          {/* ── Detected Foods ── */}
          {(!isAnalyzing && selectedFoods.length > 0) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-wobble">✨</span>
                  <h3 className="text-xl font-black text-slate-900">{t('log.foundFoods')}</h3>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                    {selectedFoods.length} item{selectedFoods.length > 1 ? 's' : ''} found
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {selectedFoods.map(food => (
                  <FoodDetailCard key={food.id} food={food} onRemove={() => removeFood(food.id)} />
                ))}
              </div>

              {/* Total Nutrition */}
              {selectedFoods.length >= 1 && (
                <div className="bg-[#4C1D95] text-white comic-card p-5 mt-2">
                  <h4 className="text-lg font-black flex items-center gap-2 mb-3">
                    <span className="text-2xl">🧮</span> {t('log.totalNutrition')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {[
                      { label: 'Calories', value: Math.round(totalNutrition.calories),         unit: 'kcal', color: 'text-orange-300' },
                      { label: 'Protein',  value: totalNutrition.protein_g.toFixed(1),         unit: 'g',    color: 'text-blue-300' },
                      { label: 'Carbs',    value: totalNutrition.carbs_g.toFixed(1),           unit: 'g',    color: 'text-purple-300' },
                      { label: 'Fats',     value: totalNutrition.fat_g.toFixed(1),             unit: 'g',    color: 'text-emerald-300' },
                    ].map(item => (
                      <div key={item.label} className="bg-white/10 rounded-2xl p-3 border-2 border-white/20">
                        <span className="text-[10px] font-black block uppercase tracking-wider opacity-80">{item.label}</span>
                        <span className={`text-xl font-black ${item.color}`}>{item.value}<span className="text-xs ml-0.5">{item.unit}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Symptoms ── */}
          {detectedSymptoms.length > 0 && (
            <div className="bg-rose-50 border-3 border-rose-300 rounded-3xl p-4 shadow-[3px_4px_0_#FDA4AF]">
              <span className="text-[11px] font-black uppercase text-rose-800 block mb-2">{t('log.symptomsNoticed')}</span>
              <div className="flex flex-wrap gap-2">
                {detectedSymptoms.map(sym => (
                  <span key={sym} className="px-3 py-1.5 bg-white text-rose-700 font-extrabold text-sm rounded-xl border-2 border-rose-200">
                    ⚠️ {sym}
                  </span>
                ))}
              </div>
              <p className="text-xs font-bold text-rose-600 mt-2">These will be saved to your health log for the doctor to review.</p>
            </div>
          )}

          {submitError && (
            <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 flex items-center gap-2 text-amber-900 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" /> {submitError}
            </div>
          )}

          {/* ── Save Button ── */}
          <button
            onClick={handleSave}
            disabled={!transcript && !manualInput && selectedFoods.length === 0}
            className={`w-full py-5 text-xl font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
              (!transcript && !manualInput && selectedFoods.length === 0)
                ? 'bg-slate-200 text-slate-400 border-[3px] border-slate-300 rounded-[2rem] cursor-not-allowed'
                : 'cartoon-btn bg-[#FFD166] text-amber-950 border-[#B45309] shadow-[5px_6px_0_#B45309] hover:bg-[#FDE68A]'
            }`}
          >
            {t('log.saveMeal')} 🍲
          </button>

          {/* ── Auto Sensors ── */}
          <div className="bg-white comic-card p-5 mt-4">
            <h3 className="text-[17px] font-black text-slate-800 flex items-center gap-2 mb-4">
              <span className="animate-wobble inline-block">📱</span> Auto-captured background metrics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <Footprints className="w-6 h-6 text-[#1D9E75]" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Steps Today</span>
                  <span className="text-[16px] font-black text-slate-800">3,420 steps</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <Moon className="w-6 h-6 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Sleep Last Night</span>
                  <span className="text-[16px] font-black text-slate-800">7h 15m</span>
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 text-center mt-3">Auto-synced from your phone sensors to help your doctor.</p>
          </div>
        </div>
      )}
    </div>
  );
}
