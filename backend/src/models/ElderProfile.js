import mongoose from 'mongoose';

const generateCareCode = () => `ELDER-${Math.floor(1000 + Math.random() * 9000)}`;

const elderProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  care_code: { type: String, default: generateCareCode, index: true },
  name: { type: String, default: 'Senior User' },
  phone: { type: String, default: '' },
  pin: { type: String, default: '' },
  age: { type: Number, default: 68 },
  gender: { type: String, default: 'Male' },
  height_cm: { type: Number, default: 169 },
  weight_kg: { type: Number, default: 64 },
  bmi: { type: Number, default: 22.4 },
  activity_level: { type: String, default: 'Rest / Sedentary' },
  conditions: [{ type: String }],
  chewability: { type: String, default: 'Soft Meals' },
  regional_cuisine: { type: String, default: 'Pan-Indian Balanced' },
  diet_type: { type: String, default: 'Vegetarian' },
  fasting_routine: { type: String, default: 'None' },
  daily_water_target: { type: Number, default: 8 },
  daily_calorie_target: { type: Number, default: 1800 },
  daily_protein_target: { type: Number, default: 60 },
  daily_calcium_target: { type: Number, default: 1200 },
  daily_vitamin_d_target: { type: Number, default: 600 },
  daily_omega3_target: { type: Number, default: 1000 },
  // Paper Clinical Assessment Fields:
  // MMSE (Mini-Mental State Examination - 0 to 30)
  mmse_score: { type: Number, default: 28 },
  mmse_stage: { type: String, default: 'Normal' }, // Normal (30-26), Mild (25-20), Moderate (19-10), Severe (9-0)
  mmse_duration: { type: String, default: 'Varies' },
  mmse_details: { type: mongoose.Schema.Types.Mixed, default: {} },
  // FRAX (Fracture Risk Assessment Tool)
  frax_major_risk: { type: Number, default: 8.5 }, // 10-year major osteoporotic fracture risk (%)
  frax_hip_risk: { type: Number, default: 1.8 }, // 10-year hip fracture risk (%)
  frax_category: { type: String, default: 'Normal' }, // Normal (<10%), Moderate Fracture Risk (10-20%), Osteoporosis (>20%)
  frax_clinical_factors: { type: mongoose.Schema.Types.Mixed, default: {} },
  // Dietary preferences, restrictions & allergens
  allergens: [{ type: String }], // e.g. Gluten, Lactose, Peanuts, Soy, Shellfish
  dietary_restrictions: [{ type: String }],
  is_completed: { type: Boolean, default: false }
}, { timestamps: true });

export const ElderProfile = mongoose.model('ElderProfile', elderProfileSchema, 'ElderProfiles');
