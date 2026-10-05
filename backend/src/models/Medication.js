import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  caregiver_email: { type: String, default: '', index: true }, // Links to caregiver for isolation
  elder_name: { type: String, default: '' },
  name: { type: String, required: true },
  dose: { type: String, default: '1 Tablet' },
  time: { type: String, default: '8:00 AM' },
  status: { type: String, default: 'Pending' }, // 'Given ✓' or 'Pending'
}, { timestamps: true });

export const Medication = mongoose.model('Medication', medicationSchema);
