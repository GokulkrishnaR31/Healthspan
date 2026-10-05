import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    default: ''
  },
  last_name: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['elder', 'caregiver', 'admin'],
    default: 'elder'
  },
  phone: {
    type: String,
    default: ''
  },
  pin: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Explicitly use the 'Login' collection in MongoDB Atlas under DietPlanner database
export const User = mongoose.model('User', userSchema, 'Login');
