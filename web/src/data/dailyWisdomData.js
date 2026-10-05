/**
 * Daily Quotes & Medical Food Remedies Dataset
 * Tailored for senior elders with medical explanations, health condition benefits, and timing.
 */

export const DAILY_QUOTES = [
  {
    id: 'q_1',
    text: "Every morning is a fresh gift of vitality, peace, and good health. Embrace today with a gentle smile and a grateful heart.",
    author: "Ancient Longevity Wisdom",
    theme: "Peace & Vitality"
  },
  {
    id: 'q_2',
    text: "A calm mind and nourishing, wholesome food are the truest medicines for a long, joyful, and vibrant life.",
    author: "Ayurvedic Living Principle",
    theme: "Nourishment & Harmony"
  },
  {
    id: 'q_3',
    text: "Your wisdom is a beacon for your family; your daily health and strength are the greatest blessings you offer yourself.",
    author: "Elder Wellness Guide",
    theme: "Strength & Dignity"
  },
  {
    id: 'q_4',
    text: "Small sips of clean water, mindful slow steps, and deep peaceful breaths turn every ordinary day into vibrant longevity.",
    author: "Mindful Health Practice",
    theme: "Mindful Habits"
  },
  {
    id: 'q_5',
    text: "Age is the crown of life's experiences. Treat your precious body today with kindness, gentle meals, and light laughter.",
    author: "Holistic Health Tradition",
    theme: "Self-Kindness"
  },
  {
    id: 'q_6',
    text: "May your morning be filled with clarity, your afternoon with renewed energy, and your night with restful, healing sleep.",
    author: "Daily Blessing",
    theme: "Daily Harmony"
  },
  {
    id: 'q_7',
    text: "True wellness is not only what is on your plate, but the peace you nurture in your thoughts and the love you share.",
    author: "Holistic Longevity Wisdom",
    theme: "Holistic Balance"
  },
  {
    id: 'q_8',
    text: "Each gentle step you take today strengthens your tomorrow. Honor your pace and cherish your wellness journey.",
    author: "Gentle Fitness Guide",
    theme: "Gentle Progress"
  }
];

export const MEDICAL_FOOD_REMEDIES = [
  {
    id: 'rem_methi',
    foodName: 'Soaked Fenugreek Seeds (Methi Dana)',
    icon: '🌱',
    color: 'emerald',
    eatingThisIsGoodFor: 'Regulating Blood Sugar, Lowering HbA1c & Calming Acid Reflux',
    whyItHelps: 'Fenugreek seeds are loaded with soluble galactomannan fiber and 4-hydroxyisoleucine, which slows carbohydrate digestion, prevents glucose spikes, and coats the stomach lining against acid reflux.',
    targetConditions: ['Diabetes', 'High Blood Sugar', 'Digestion / Acidity', 'Cholesterol'],
    bestTime: '🌅 Morning (Empty Stomach)',
    preparation: 'Soak 1 teaspoon of methi seeds in 1 glass of warm water overnight. Drink the infused water and gently chew the soft seeds first thing in the morning.',
    caution: 'If taking diabetes medication, monitor blood sugar regularly as methi naturally enhances insulin sensitivity.'
  },
  {
    id: 'rem_turmeric_milk',
    foodName: 'Warm Golden Milk with Black Pepper (Haldi Doodh)',
    icon: '🥛',
    color: 'amber',
    eatingThisIsGoodFor: 'Relieving Knee & Joint Pain, Reducing Arthritis Swelling & Deep Sleep',
    whyItHelps: 'Curcumin in turmeric is a clinically proven anti-inflammatory polyphenol. Black pepper contains piperine, which boosts curcumin absorption by up to 2,000%, offering rapid relief for stiff joints and osteoarthritis.',
    targetConditions: ['Joint Pain', 'Arthritis', 'Sleep Quality', 'Immunity'],
    bestTime: '🌙 Night (30 mins before sleep)',
    preparation: 'Gently warm 1 cup of low-fat or plant milk with 1/4 teaspoon organic turmeric powder, a pinch of freshly ground black pepper, and 1/4 tsp crushed cardamom.',
    caution: 'Avoid adding white sugar; use a drop of raw honey (stirred after cooling slightly) or drink warm as is.'
  },
  {
    id: 'rem_stewed_apple',
    foodName: 'Warm Stewed Apple with Cinnamon',
    icon: '🍎',
    color: 'rose',
    eatingThisIsGoodFor: 'Gentle Digestion, Relieving Constipation & Soft-Chew Heart Health',
    whyItHelps: 'Lightly cooking peeled apples releases soluble pectin fiber that forms a soothing gel in the intestines, softening stools without straining. Cinnamon adds cinnamaldehyde which protects arteries and improves insulin response.',
    targetConditions: ['Digestion', 'Constipation Relief', 'Cardiac Health', 'Soft Food Diet'],
    bestTime: '🥣 Breakfast or 11:00 AM Mid-Morning Snack',
    preparation: 'Peel and cube 1 sweet apple. Simmer in 4 tablespoons of water with a pinch of pure cinnamon powder for 6-8 minutes until fork-tender and fragrant.',
    caution: 'Always peel apple skin for elders with sensitive digestion or reduced chewing strength.'
  },
  {
    id: 'rem_garlic_water',
    foodName: 'Crushed Garlic with Warm Water',
    icon: '🧄',
    color: 'indigo',
    eatingThisIsGoodFor: 'Lowering High Blood Pressure, Clearing Arteries & Boosting Cardiac Flow',
    whyItHelps: 'Crushing raw garlic activates allicin, an active sulfur enzyme that triggers nitric oxide production, relaxing stiff blood vessels and helping naturally lower systolic blood pressure.',
    targetConditions: ['Hypertension', 'Cardiac Health', 'High Cholesterol', 'Circulation'],
    bestTime: '🌅 Morning after light breakfast',
    preparation: 'Crush 1 small clove of fresh garlic. Let it sit exposed to air for 5 minutes (to activate allicin), then swallow with a warm glass of water.',
    caution: 'If taking prescription blood thinners (like Warfarin/Aspirin), consult your physician before consuming large amounts of raw garlic.'
  },
  {
    id: 'rem_walnuts_almonds',
    foodName: 'Soaked Walnuts & Peeled Almonds',
    icon: '🥜',
    color: 'amber',
    eatingThisIsGoodFor: 'Brain Memory Agility, Preventing Cognitive Decline & Nerve Strength',
    whyItHelps: 'Walnuts are exceptionally high in plant-based Omega-3 ALA (Alpha-Linolenic Acid), and almonds are rich in Vitamin E and Magnesium, guarding senior brain synapses from oxidative stress.',
    targetConditions: ['Memory & Brain Focus', 'Nerve Vitality', 'Heart Health', 'Energy'],
    bestTime: '☀️ Morning with Breakfast',
    preparation: 'Soak 2 walnut halves and 4 almonds in water overnight. In the morning, peel the almond skins (which contain tannins that hinder digestion) and chew slowly.',
    caution: 'Chew thoroughly into a smooth paste to ensure effortless swallowing and optimal nutrient absorption.'
  },
  {
    id: 'rem_amla_honey',
    foodName: 'Fresh Amla (Indian Gooseberry) with Honey',
    icon: '🍈',
    color: 'emerald',
    eatingThisIsGoodFor: 'Strengthening Eye Retina, Stopping Seasonal Colds & Liver Detox',
    whyItHelps: 'Amla provides 20 times more bioavailable Vitamin C than oranges. Its unique heat-stable tannins protect aging retinal capillaries and stimulate natural white blood cell defense.',
    targetConditions: ['Eye Vision Health', 'Immunity', 'Liver & Digestion', 'Longevity'],
    bestTime: '🌅 Early Morning',
    preparation: 'Mix 1 tablespoon of fresh amla juice (or 1 tsp grated amla) with 1/2 teaspoon pure raw honey in 1/2 cup of lukewarm water.',
    caution: 'For diabetic elders, consume amla juice with plain water or a pinch of roasted cumin instead of honey.'
  },
  {
    id: 'rem_jeera_water',
    foodName: 'Boiled Cumin & Coriander Seed Water (Jeera-Dhania)',
    icon: '🍵',
    color: 'teal',
    eatingThisIsGoodFor: 'Relieving Stomach Bloating, Gastric Heaviness & Flushing Kidneys',
    whyItHelps: 'Cuminaldehyde and linalool stimulate digestive enzymes in the pancreas and saliva, breaking down heavy starches quickly and preventing distressing abdominal gas after meals.',
    targetConditions: ['Digestion / Gas Bloating', 'Kidney Filtration', 'Appetite Support'],
    bestTime: '🍵 30 minutes after Lunch or Dinner',
    preparation: 'Boil 1/2 tsp cumin seeds (jeera) and 1/2 tsp coriander seeds in 2 cups of water for 4 minutes. Strain and sip warm like herbal tea.',
    caution: 'Drink warm, not scalding hot, to soothe throat tissues.'
  },
  {
    id: 'rem_flaxseed_curd',
    foodName: 'Roasted Flaxseed Powder with Fresh Curd (Yogurt)',
    icon: '🥣',
    color: 'blue',
    eatingThisIsGoodFor: 'Increasing Bone Density, Preventing Osteoporosis & Smooth Bowel Flow',
    whyItHelps: 'Flaxseeds provide rich lignans and calcium, while fresh probiotic curd creates the ideal acidic gut environment for bones to absorb calcium and vitamin D effectively.',
    targetConditions: ['Bone Health / Osteoporosis', 'Cholesterol', 'Gut Flora & Digestion'],
    bestTime: '🍛 With Midday Lunch',
    preparation: 'Roast flaxseeds lightly and grind into a coarse powder. Stir 1 level teaspoon into 1/2 cup of fresh homemade curd with your lunch meal.',
    caution: 'Store ground flaxseed powder in an airtight glass container in the refrigerator to keep omega oils fresh.'
  },
  {
    id: 'rem_tulsi_ginger',
    foodName: 'Warm Tulsi Leaves & Crushed Ginger Tea',
    icon: '🌿',
    color: 'emerald',
    eatingThisIsGoodFor: 'Clearing Chest Congestion, Soothing Morning Throat & Lowering Stress',
    whyItHelps: 'Tulsi contains eugenol and adaptogenic flavonoids that naturally calm cortisol (stress hormone), while gingerols dissolve airway mucus and alleviate morning throat dryness.',
    targetConditions: ['Respiratory Health', 'Throat Comfort', 'Stress Relief', 'Immunity'],
    bestTime: '☕ 4:00 PM Evening Tea Time',
    preparation: 'Tear 5-6 fresh washed Tulsi leaves and 1/2 inch crushed ginger. Steep in 1.5 cups boiling water for 4 minutes. Strain and sip warm.',
    caution: 'Gentle and safe daily herbal tea for elderly respiratory health.'
  },
  {
    id: 'rem_coconut_water',
    foodName: 'Tender Coconut Water with Mint',
    icon: '🥥',
    color: 'cyan',
    eatingThisIsGoodFor: 'Stopping Night Leg Muscle Cramps & Restoring Cellular Electrolytes',
    whyItHelps: 'Rich in bio-potassium, magnesium, and bio-available electrolytes, tender coconut water relaxes hyperactive muscle spasms, balances blood pressure, and keeps kidneys cool.',
    targetConditions: ['Muscle Cramps', 'Hydration', 'Kidney Health', 'Blood Pressure'],
    bestTime: '☀️ Mid-Morning (10:00 AM – 11:30 AM)',
    preparation: 'Drink fresh tender coconut water slowly at room temperature with 2-3 freshly crushed mint leaves for refreshing aroma.',
    caution: 'If diagnosed with advanced chronic kidney disease (CKD) on strict potassium restriction, consult your doctor.'
  }
];

/**
 * Get daily quote and remedy tailored to date and optional elder profile
 */
export function getDailyWisdom(dateStr = new Date().toISOString().split('T')[0], conditions = []) {
  // Use day of year as a stable deterministic seed
  const today = new Date(dateStr);
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const dayOfYear = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

  // Quote based on day of year
  const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  // If elder has specific conditions (e.g. Diabetes, Joint Pain), prioritize matching remedies
  let matchedRemedies = MEDICAL_FOOD_REMEDIES;
  if (Array.isArray(conditions) && conditions.length > 0) {
    const relevant = MEDICAL_FOOD_REMEDIES.filter(r => 
      r.targetConditions.some(tc => 
        conditions.some(c => tc.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(tc.toLowerCase()))
      )
    );
    if (relevant.length > 0) {
      matchedRemedies = relevant;
    }
  }

  const remedy = matchedRemedies[dayOfYear % matchedRemedies.length];

  return {
    quote,
    remedy,
    allRemedies: MEDICAL_FOOD_REMEDIES
  };
}
