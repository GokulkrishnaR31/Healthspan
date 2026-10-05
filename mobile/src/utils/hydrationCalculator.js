/**
 * Clinical Geriatric Hydration & Fluid Target Calculator (Mobile & Web)
 */

export function calculatePersonalizedHydration({
  weight_kg = 64,
  gender = 'Male',
  age = 68,
  conditions = ['Diabetes', 'Cardiac Health'],
  loggedMeals = []
} = {}) {
  // 1. Base Fluid Calculation by Weight & Gender (30-32 ml/kg for men, 28 ml/kg for women)
  let baseLiters = (weight_kg && weight_kg > 30) ? (weight_kg * 0.032) : 2.5;

  if (gender?.toLowerCase() === 'female') {
    baseLiters = (weight_kg && weight_kg > 30) ? (weight_kg * 0.028) : 2.2;
  }

  if (age >= 75) {
    baseLiters = Math.max(1.8, baseLiters * 0.95);
  }

  // 2. Chronic Disease Medical Adjustments
  const condStr = (Array.isArray(conditions) ? conditions.join(' ') : String(conditions || '')).toLowerCase();
  let medicalLimitReason = null;
  let targetLiters = baseLiters;

  if (condStr.includes('kidney') || condStr.includes('ckd') || condStr.includes('renal')) {
    targetLiters = 1.6; // Strict fluid restriction to prevent renal fluid overload
    medicalLimitReason = 'Kidney / Renal Care: Strict Fluid Limit (Max 1.6L to prevent fluid retention)';
  } else if (condStr.includes('heart failure') || condStr.includes('chf')) {
    targetLiters = 1.8;
    medicalLimitReason = 'Cardiac Congestive Care: Controlled Fluid Intake (1.8L)';
  } else if (condStr.includes('diabetes') || condStr.includes('hypertension') || condStr.includes('bp')) {
    targetLiters = Math.max(2.6, targetLiters);
    medicalLimitReason = 'Diabetes & Blood Pressure Protocol: 2.6L - 2.8L for renal glucose clearance';
  } else {
    targetLiters = Math.max(2.4, Math.min(3.2, targetLiters));
  }

  targetLiters = Number(targetLiters.toFixed(1));

  // 3. Compute Dietary Moisture Contribution from Logged Meals
  let dietaryFluidLiters = 0;
  const moistureFoods = [
    { key: 'kanji', ml: 250 },
    { key: 'sambar', ml: 150 },
    { key: 'rasam', ml: 180 },
    { key: 'soup', ml: 200 },
    { key: 'coconut', ml: 250 },
    { key: 'buttermilk', ml: 200 },
    { key: 'moru', ml: 200 },
    { key: 'chaas', ml: 200 },
    { key: 'curd', ml: 100 },
    { key: 'yogurt', ml: 100 },
    { key: 'khichdi', ml: 120 },
    { key: 'milk', ml: 200 },
    { key: 'tea', ml: 120 },
    { key: 'coffee', ml: 120 },
    { key: 'watermelon', ml: 200 },
    { key: 'papaya', ml: 100 },
  ];

  (loggedMeals || []).forEach(m => {
    const mealName = (m.name || m.meal_name || '').toLowerCase();
    for (const item of moistureFoods) {
      if (mealName.includes(item.key)) {
        dietaryFluidLiters += (item.ml / 1000);
        break;
      }
    }
  });

  dietaryFluidLiters = Number(dietaryFluidLiters.toFixed(2));

  return {
    targetLiters,
    dietaryFluidLiters,
    medicalLimitReason,
    baseWeight: weight_kg || 64,
    gender: gender || 'Male'
  };
}
