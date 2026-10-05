import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Clinical Nutrient Dataset mapped by MMSE (Cognitive) and FRAX (Bone Risk) categories
 * Sourced from clinical geriatric nutrition and research paper specifications
 */
export const CLINICAL_NUTRIENT_DATA = {
  // MMSE Cognitive Impairment Stages
  Normal: {
    'Vitamin B12': 2.4, // mcg
    'Vitamin B1 (Thiamine)': { Female: 1.1, Male: 1.2 }, // mg
    'Vitamin B2 (Riboflavin)': { Female: 1.1, Male: 1.3 }, // mg
    'Vitamin B6': { Female: 1.5, Male: 1.7 }, // mg
    'Vitamin B3 (Niacin)': { Female: 14, Male: 16 }, // mg
    'Vitamin B5 (Pantothenic Acid)': 5, // mg
    'Vitamin C': { Female: 75, Male: 90 }, // mg
    'Vitamin E': 15, // mg
    'Vitamin D': 600, // IU
    'Omega-3 fatty acids': { Female: 1.1, Male: 1.6 } // g
  },
  Mild: {
    'Vitamin B12': 2.8,
    'Vitamin B1 (Thiamine)': { Female: 1.1, Male: 1.2 },
    'Vitamin B2 (Riboflavin)': { Female: 1.1, Male: 1.3 },
    'Vitamin B6': { Female: 1.5, Male: 1.7 },
    'Vitamin B3 (Niacin)': { Female: 14, Male: 16 },
    'Vitamin B5 (Pantothenic Acid)': 5,
    'Vitamin C': { Female: 75, Male: 90 },
    'Vitamin E': 15,
    'Vitamin D': 800,
    'Omega-3 fatty acids': { Female: 1.2, Male: 1.6 }
  },
  Moderate: {
    'Vitamin B12': 3.6,
    'Vitamin B1 (Thiamine)': { Female: 1.2, Male: 1.4 },
    'Vitamin B2 (Riboflavin)': { Female: 1.2, Male: 1.4 },
    'Vitamin B6': { Female: 1.7, Male: 2.0 },
    'Vitamin B3 (Niacin)': { Female: 15, Male: 17 },
    'Vitamin B5 (Pantothenic Acid)': 6,
    'Folic Acid (Vitamin B9)': 400, // mcg
    'Omega-3 fatty acids': {
      ALA: { Female: 1.3, Male: 1.7 },
      'EPA-DHA': 400 // mg
    },
    Choline: { Female: 425, Male: 550 }, // mg
    Magnesium: { Female: 320, Male: 420 }, // mg
    Zinc: { Female: 8, Male: 11 } // mg
  },
  Extreme: {
    'Vitamin B12': 4.5,
    'Vitamin C': { Female: 90, Male: 110 },
    'Vitamin E': 20,
    Potassium: { Female: 2600, Male: 3400 }, // mg
    Selenium: 55, // mcg
    Calcium: 1200, // mg
    Protein: { Female: 65, Male: 75 }, // g
    'Vitamin D': 1000 // IU
  },
  Severe: {
    'Vitamin B12': 4.5,
    'Vitamin C': { Female: 90, Male: 110 },
    'Vitamin E': 20,
    Potassium: { Female: 2600, Male: 3400 },
    Selenium: 55,
    Calcium: 1200,
    Protein: { Female: 65, Male: 75 },
    'Vitamin D': 1000
  },

  // FRAX Fracture Risk Categories
  'Low Risk': {
    Calcium: 1000,
    'Vitamin D': 600,
    'Vitamin K': 90,
    Magnesium: { Female: 310, Male: 400 },
    Phosphorus: 700,
    Protein: { Female: 55, Male: 65 }
  },
  'Moderate Risk': {
    Calcium: 1200,
    'Vitamin D': 800,
    'Vitamin K': 100,
    Magnesium: { Female: 320, Male: 420 },
    Phosphorus: 750,
    Zinc: { Female: 9, Male: 12 },
    Protein: { Female: 60, Male: 70 }
  },
  'Hip Fracture Risk': {
    Calcium: 1400,
    'Vitamin D': 1000,
    'Vitamin K': 120, // mcg
    Magnesium: { Female: 340, Male: 440 },
    Phosphorus: 850,
    Zinc: { Female: 11, Male: 15 },
    Copper: 1100, // mcg
    Protein: { Female: 68, Male: 78 }
  },
  'Osteoporotic Fracture Risk': {
    Calcium: 1400,
    'Vitamin D': 1000,
    'Vitamin K': 120,
    Magnesium: { Female: 340, Male: 440 },
    Phosphorus: 850,
    Zinc: { Female: 11, Male: 15 },
    Copper: 1100,
    Protein: { Female: 68, Male: 78 }
  }
};

/**
 * Built-in Rich Clinical Food Database with Nutrients per 100g / Serving
 */
export const CLINICAL_FOOD_DATABASE = [
  { food: 'Ragi (Finger Millet) Flour', category: 'Grain', Calcium: 344, 'Vitamin D': 0, Protein: 7.3, Magnesium: 137, Zinc: 2.3, Potassium: 408, 'Vitamin B1 (Thiamine)': 0.42, 'Vitamin B3 (Niacin)': 1.1, unit: '100g' },
  { food: 'Paneer (Cottage Cheese)', category: 'Dairy', Calcium: 208, 'Vitamin D': 20, Protein: 18.3, 'Vitamin B12': 0.8, Zinc: 2.7, Phosphorus: 290, unit: '100g' },
  { food: 'Curd / Plain Yogurt', category: 'Dairy', Calcium: 150, 'Vitamin D': 40, Protein: 4.5, 'Vitamin B12': 0.6, Potassium: 200, Phosphorus: 140, unit: '100g' },
  { food: 'Spinach (Palak)', category: 'Vegetable', Calcium: 99, 'Vitamin K': 483, 'Vitamin C': 28, 'Vitamin E': 2.0, 'Folic Acid (Vitamin B9)': 194, Magnesium: 79, Potassium: 558, unit: '100g' },
  { food: 'Moringa / Drumstick Leaves', category: 'Vegetable', Calcium: 440, 'Vitamin C': 220, 'Vitamin A': 1130, Protein: 6.7, Potassium: 259, Magnesium: 42, unit: '100g' },
  { food: 'Walnuts (Akhrot)', category: 'Nuts', 'Omega-3 fatty acids': 9.08, 'Vitamin E': 0.7, Magnesium: 158, Phosphorus: 346, Protein: 15.2, Zinc: 3.1, unit: '100g' },
  { food: 'Flaxseeds (Alsi)', category: 'Seeds', 'Omega-3 fatty acids': 22.8, Calcium: 255, Magnesium: 392, Protein: 18.3, Potassium: 813, 'Vitamin B1 (Thiamine)': 1.6, unit: '100g' },
  { food: 'Almonds (Badam)', category: 'Nuts', Calcium: 264, 'Vitamin E': 25.6, Magnesium: 270, Protein: 21.2, Zinc: 3.1, Phosphorus: 481, unit: '100g' },
  { food: 'Yellow Moong Dal (Cooked)', category: 'Legume', Protein: 7.0, 'Folic Acid (Vitamin B9)': 159, 'Vitamin B1 (Thiamine)': 0.16, Potassium: 292, Magnesium: 48, Zinc: 0.8, unit: '100g' },
  { food: 'Chana / Chickpeas (Boiled)', category: 'Legume', Protein: 8.9, Calcium: 49, 'Folic Acid (Vitamin B9)': 172, Magnesium: 48, Zinc: 1.5, Potassium: 291, unit: '100g' },
  { food: 'Salmon / Rohu Fish', category: 'Fish', 'Omega-3 fatty acids': 2.2, 'Vitamin D': 526, 'Vitamin B12': 3.2, Protein: 20.0, Selenium: 36.5, Phosphorus: 250, unit: '100g' },
  { food: 'Eggs (Boiled)', category: 'Egg', Protein: 12.6, 'Vitamin B12': 1.1, 'Vitamin D': 87, Choline: 294, Selenium: 30.7, 'Vitamin B2 (Riboflavin)': 0.5, unit: '100g' },
  { food: 'Guava (Amrood)', category: 'Fruit', 'Vitamin C': 228, Potassium: 417, 'Vitamin A': 31, 'Folic Acid (Vitamin B9)': 49, unit: '100g' },
  { food: 'Amla (Indian Gooseberry)', category: 'Fruit', 'Vitamin C': 600, Calcium: 50, Potassium: 225, Iron: 1.2, unit: '100g' },
  { food: 'Banana', category: 'Fruit', Potassium: 358, 'Vitamin B6': 0.4, 'Vitamin C': 8.7, Magnesium: 27, unit: '100g' },
  { food: 'Fortified Soya Milk', category: 'Plant Milk', Calcium: 120, 'Vitamin D': 45, 'Vitamin B12': 1.0, Protein: 3.3, unit: '100ml' },
  { food: 'Sunflower Seeds', category: 'Seeds', 'Vitamin E': 35.17, Selenium: 53.0, 'Vitamin B6': 1.35, Magnesium: 325, Zinc: 5.0, unit: '100g' },
  { food: 'Chia Seeds', category: 'Seeds', 'Omega-3 fatty acids': 17.8, Calcium: 631, Magnesium: 335, Phosphorus: 860, Protein: 16.5, unit: '100g' }
];

/**
 * 1. Calculate MMSE Category
 */
export function calculateMMSECategory(score) {
  const num = Number(score);
  if (isNaN(num)) return 'Normal';
  if (num > 25) return 'Normal';
  if (num >= 20) return 'Mild';
  if (num >= 10) return 'Moderate';
  return 'Severe';
}

/**
 * 2. Calculate FRAX Category
 */
export function calculateFRAXCategory(hipScore, osteoScore) {
  const hip = Number(hipScore) || 0;
  const osteo = Number(osteoScore) || 0;

  // Normalized for both decimal risk (e.g. 3.5%) and percentage format
  if (hip >= 3.0 || osteo >= 20.0 || (hip > 3 && osteo > 3)) {
    return 'Hip Fracture Risk';
  } else if (hip >= 1.5 || osteo >= 10.0 || (hip > 1 && osteo > 1)) {
    return 'Moderate Risk';
  } else {
    return 'Low Risk';
  }
}

/**
 * 3. Extract Nutrients by MMSE & FRAX Categories
 */
export function extractNutrientsByCategory(mmseCategory = 'Normal', fraxCategory = 'Low Risk') {
  const mmseNutrients = CLINICAL_NUTRIENT_DATA[mmseCategory] || CLINICAL_NUTRIENT_DATA.Normal;
  const fraxNutrients = CLINICAL_NUTRIENT_DATA[fraxCategory] || CLINICAL_NUTRIENT_DATA['Low Risk'];
  return { mmseNutrients, fraxNutrients };
}

/**
 * 4. Resolve Gender Specific Targets
 */
export function removeGenderData(nutrients = {}, genderToKeep = 'Female') {
  const resolved = {};
  const isFemale = (genderToKeep || 'Female').toLowerCase().startsWith('f');
  const targetKey = isFemale ? 'Female' : 'Male';

  for (const [nutrient, value] of Object.entries(nutrients)) {
    if (value && typeof value === 'object') {
      if (value[targetKey] !== undefined) {
        resolved[nutrient] = value[targetKey];
      } else if (value.Female !== undefined || value.Male !== undefined) {
        resolved[nutrient] = value.Female !== undefined ? value.Female : value.Male;
      } else if (value.ALA !== undefined) {
        resolved[nutrient] = value.ALA[targetKey] || 1.4;
      } else if (value.adults !== undefined) {
        resolved[nutrient] = value.adults;
      } else {
        // Nested structure fallback to first scalar value
        const firstVal = Object.values(value)[0];
        resolved[nutrient] = typeof firstVal === 'number' ? firstVal : 1.0;
      }
    } else {
      resolved[nutrient] = value;
    }
  }

  return resolved;
}

/**
 * 5. Find Matching Foods with Tolerance Window
 */
export function findMatchingFoodsWithTolerance(
  foodDatabase = CLINICAL_FOOD_DATABASE,
  mmseNutrients = {},
  fraxNutrients = {},
  tolerance = 0.2
) {
  const combinedTargets = { ...mmseNutrients, ...fraxNutrients };
  const matchedFoodSet = new Set();
  const matchedDetails = [];

  for (const item of foodDatabase) {
    let matchScore = 0;
    const matchingNutrients = [];

    for (const [nutrient, targetVal] of Object.entries(combinedTargets)) {
      if (item[nutrient] !== undefined && typeof item[nutrient] === 'number') {
        const foodVal = item[nutrient];
        const minVal = targetVal * (1 - tolerance);
        const maxVal = targetVal * (1 + tolerance);

        // Substantial nutrient contribution or within tolerance
        if (foodVal >= minVal * 0.1 || (foodVal >= minVal && foodVal <= maxVal * 2.0)) {
          matchScore++;
          matchingNutrients.push({ nutrient, amount: foodVal, target: targetVal });
        }
      }
    }

    if (matchScore > 0) {
      matchedFoodSet.add(item.food);
      matchedDetails.push({
        food: item.food,
        category: item.category,
        unit: item.unit,
        matchCount: matchScore,
        nutrients: matchingNutrients
      });
    }
  }

  return {
    foodList: Array.from(matchedFoodSet),
    details: matchedDetails.sort((a, b) => b.matchCount - a.matchCount)
  };
}

export async function generateClinicalRecipe(optionsOrMmse, maybeFrax, maybeFoods, maybeCuisine, maybeGender) {
  let mmseNutrients = {};
  let fraxNutrients = {};
  let cuisine = 'South Indian Balanced';
  let dietaryPreferences = 'Vegetarian';
  let allergensRestrictions = [];
  let chewability = 'Soft Meals';
  let apiKey = process.env.GEMINI_API_KEY;

  if (optionsOrMmse && typeof optionsOrMmse === 'object' && !Array.isArray(optionsOrMmse) && (optionsOrMmse.mmseNutrients || optionsOrMmse.cuisine || optionsOrMmse.apiKey)) {
    mmseNutrients = optionsOrMmse.mmseNutrients || {};
    fraxNutrients = optionsOrMmse.fraxNutrients || {};
    cuisine = optionsOrMmse.cuisine || cuisine;
    dietaryPreferences = optionsOrMmse.dietaryPreferences || dietaryPreferences;
    allergensRestrictions = optionsOrMmse.allergensRestrictions || [];
    chewability = optionsOrMmse.chewability || chewability;
    apiKey = optionsOrMmse.apiKey || process.env.GEMINI_API_KEY;
  } else {
    // Positional arguments fallback
    cuisine = maybeCuisine || (typeof maybeFoods === 'string' ? maybeFoods : cuisine);
    if (typeof optionsOrMmse === 'object') mmseNutrients = optionsOrMmse;
    if (typeof maybeFrax === 'object') fraxNutrients = maybeFrax;
  }
  const combinedNutrientList = Array.from(
    new Set([...Object.keys(mmseNutrients), ...Object.keys(fraxNutrients)])
  );
  const nutrientPrompt = combinedNutrientList.join(', ');
  const allergensStr = Array.isArray(allergensRestrictions) && allergensRestrictions.length > 0
    ? allergensRestrictions.join(', ')
    : 'None';

  const prompt = `
You are an expert Clinical Geriatric Nutritionist and Master Chef specializing in senior Indian nutrition, cognitive preservation, and bone health.

Create a delicious, easy-to-digest, therapeutic senior recipe based on the following clinical criteria:
- **Target Nutrients**: ${nutrientPrompt}
- **Target Cuisine**: ${cuisine}
- **Dietary Preference**: ${dietaryPreferences}
- **Allergens & Dietary Exclusions**: ${allergensStr}
- **Texture / Chewability**: ${chewability} (ensure ingredients are properly cooked, soft, or pureed if needed to prevent dysphagia and choking)

Please format your response cleanly with the following sections:
1. **Recipe Title** (Appealing, culturally relevant name with emoji)
2. **Prep Time & Cook Time** (Quick & easy for seniors or caregivers)
3. **Clinical Health Target** (Explaining how this supports brain MMSE & bone FRAX)
4. **Key Ingredients with Quantities** (Metric & household measures)
5. **Step-by-Step Cooking Instructions** (Clear, simple numbered steps)
6. **Nutritional Highlights** (Estimated Calories, Protein, Calcium, Vitamin D, Omega-3)
7. **Caregiver Serving Tip** (Chewability and digestion recommendation)
`;

  if (apiKey) {
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash'];
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim().length > 50) {
          return text;
        }
      } catch (err) {
        // Try next supported model
        continue;
      }
    }
  }

  // Fallback high-quality clinical recipe if Gemini is unreachable or offline
  return generateClinicalFallbackRecipe({
    cuisine,
    dietaryPreferences,
    chewability,
    combinedNutrientList
  });
}

/**
 * Fallback Clinical Recipe Generator
 */
function generateClinicalFallbackRecipe({
  cuisine = 'South Indian Balanced',
  dietaryPreferences = 'Vegetarian',
  chewability = 'Soft Meals',
  combinedNutrientList = []
}) {
  const isSouth = cuisine.toLowerCase().includes('south') || cuisine.toLowerCase().includes('tamil') || cuisine.toLowerCase().includes('kerala');

  if (isSouth) {
    return `
### 🍲 Fortified Ragi & Palak Vegetable Khichdi (Calcium & Omega-3 Enriched)

**⏱️ Prep Time:** 10 mins | **Cook Time:** 20 mins | **Servings:** 2
**🩺 Clinical Target:** Supports Bone Density (Calcium 350mg) and Cognitive Synaptic Function (Omega-3 & Vitamin B-Complex).

#### 🥗 Ingredients:
- 1/2 cup Ragi (Finger Millet) rava or roasted ragi flour
- 1/4 cup Yellow Moong Dal (washed and soaked)
- 1 cup Fresh Spinach (Palak), finely shredded
- 1/4 cup Grated Paneer or Soft Tofu
- 1 tbsp Crushed Walnuts / Roasted Flaxseed powder
- 1/2 tsp Turmeric powder & Cumin seeds
- 1 tsp Pure Cow Ghee
- 3 cups Warm Water or Vegetable broth
- Pinch of Himalayan pink salt

#### 👨‍🍳 Step-by-Step Cooking Instructions:
1. **Tempering**: Heat 1 tsp ghee in a pressure cooker. Add cumin seeds and a pinch of turmeric until aromatic.
2. **Dal & Grain Simmer**: Add soaked moong dal and ragi with 3 cups water. Pressure cook for 3 whistles until ultra-soft.
3. **Greens Integration**: Open cooker, add shredded spinach and grated paneer. Simmer for 3 minutes on low heat until spinach wilts completely into the porridge.
4. **Enrichment**: Turn off flame and stir in crushed walnuts/flaxseed powder for bioavailable Omega-3 fatty acids.
5. **Texture Check**: Mash gently with a ladle to achieve a smooth, velvety ${chewability} texture.

#### 📊 Nutritional Highlights:
- **Calories:** ~340 kcal
- **Protein:** 14g (High Biological Value)
- **Calcium:** ~380 mg (32% Daily Target)
- **Vitamin D & K:** Enhanced via Dairy & Spinach Matrix
- **Omega-3 Fatty Acids:** ~1.4g (ALA)

#### 💡 Caregiver Serving Tip:
Serve warm with a spoon of fresh homemade curd. The soft texture is gentle on swallowing and supports steady post-meal glycemic levels.
`;
  }

  return `
### 🍲 Golden Turmeric Moong & Moringa Soft Porridge with Almond Butter

**⏱️ Prep Time:** 10 mins | **Cook Time:** 18 mins | **Servings:** 2
**🩺 Clinical Target:** Cognitive Vitality (Vitamin B12 & Magnesium) and Bone Matrix Support (Calcium & Vitamin D).

#### 🥗 Ingredients:
- 1/2 cup Yellow Moong Dal & Soft Rice / Broken Oats
- 1/2 cup Drumstick Leaves (Moringa) or Tender Greens
- 1/2 cup Almond Milk or Fortified Cow's Milk
- 1 tbsp Crushed Almonds or Smooth Almond Butter
- 1/2 tsp Turmeric & Ginger paste
- 1 tsp Ghee
- 3.5 cups Water

#### 👨‍🍳 Cooking Instructions:
1. Cook moong dal and grains with turmeric and water until very soft and creamy.
2. Stir in tender moringa greens and simmer for 4 minutes until thoroughly tender.
3. Whisk in warm fortified milk and almond butter for a creamy, soothing consistency.
4. Season lightly and serve warm with a soft texture suitable for effortless digestion.

#### 📊 Nutritional Highlights:
- **Calories:** ~320 kcal | **Protein:** 13g | **Calcium:** ~310mg | **Magnesium:** ~120mg
`;
}
