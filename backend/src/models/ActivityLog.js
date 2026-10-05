import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  elder_name: { type: String, default: 'Senior' },
  walk_minutes: { type: Number, default: 0 },
  steps: { type: Number, default: 0 },
  sleep_hours: { type: Number, default: null },
  sleep_quality: { type: String, default: 'Pending Log' },
  sleep_notes: { type: String, default: '' },
  water_glasses: { type: Number, default: 0 },
  water_liters: { type: Number, default: 0 },
  // Clinical Daily Vitals
  bp_systolic: { type: Number, default: null },
  bp_diastolic: { type: Number, default: null },
  blood_sugar: { type: Number, default: null },
  sugar_type: { type: String, default: 'fasting' }, // 'fasting' | 'post_prandial' | 'random'
  pulse: { type: Number, default: null },
  vitals_source: { type: String, default: 'manual' }, // 'voice' | 'manual'
  vitals_notes: { type: String, default: '' },
  logged_date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

