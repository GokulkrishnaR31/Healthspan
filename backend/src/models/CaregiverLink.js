import mongoose from 'mongoose';

const caregiverLinkSchema = new mongoose.Schema({
  caregiver_email: { type: String, required: true, index: true },
  elder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ElderProfile' },
  elder_name: { type: String, required: true },
  elder_code: { type: String, required: true },
  relationship: { type: String, default: 'Son / Daughter' },
  phone: { type: String, default: '+91 98765 43210' },
  age: { type: Number, default: 68 },
  height_cm: { type: Number, default: 169 },
  weight_kg: { type: Number, default: 64 },
  conditions: { type: [String], default: ['Diabetes', 'Digestion'] },
  chewability: { type: String, default: 'Soft Meals' },
  water_glasses: { type: Number, default: 5 },
  sleep_hours: { type: Number, default: 7.5 },
  steps: { type: Number, default: 3420 },
  status: { type: String, default: 'Stable' },
  last_meal: { type: String, default: 'Chana Masala & Phulka (8:30 AM)' },
}, { timestamps: true });

export const CaregiverLink = mongoose.model('CaregiverLink', caregiverLinkSchema);
