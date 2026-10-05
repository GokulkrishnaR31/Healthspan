import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  elder_name: { type: String, default: 'Senior' },
  meal_type: { type: String, default: 'Lunch' }, // Breakfast, Lunch, Dinner, Snack
  meal_name: { type: String, default: 'Logged Meal' },
  calories: { type: Number, default: 280 },
  protein_g: { type: Number, default: 8 },
  carbs_g: { type: Number, default: 40 },
  fat_g: { type: Number, default: 5 },
  fiber_g: { type: Number, default: 4 },
  calcium_mg: { type: Number, default: 120 },
  is_vegetarian: { type: Boolean, default: true },
  ingredients: [{ type: String }],
  logged_via: { type: String, default: 'voice' }, // 'voice' or 'manual'
  logged_at: { type: Date, default: Date.now }
}, { timestamps: true });

export const MealLog = mongoose.model('MealLog', mealLogSchema, 'MealLogs');
