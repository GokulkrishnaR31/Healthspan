import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import { User } from './src/models/User.js';
import { ElderProfile } from './src/models/ElderProfile.js';
import { CaregiverLink } from './src/models/CaregiverLink.js';
import { MealLog } from './src/models/MealLog.js';
import { Medication } from './src/models/Medication.js';
import { ActivityLog } from './src/models/ActivityLog.js';

const MONGO_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/healthspan?retryWrites=true&w=majority';

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB Atlas successfully!');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // ─────────────────────────────────────────────────────────
  // 1. ELDERS DEFINITION
  // ─────────────────────────────────────────────────────────
  const eldersData = [
    {
      email: 'deepan.kumar@healthspan.in',
      phone: '7604948580',
      pin: '5820',
      care_code: 'DP-5820',
      first_name: 'Deepan',
      last_name: 'Kumar',
      name: 'Deepan Kumar',
      age: 68,
      gender: 'Male',
      height_cm: 169,
      weight_kg: 64,
      bmi: 22.4,
      conditions: ['Diabetes', 'Hypertension', 'Cardiac Health'],
      chewability: 'Soft Meals',
      regional_cuisine: 'South Indian Traditional',
      diet_type: 'Vegetarian',
      fasting_routine: 'Ekadashi (Twice monthly)',
      water_liters: 2.4,
      sleep_hours: 7.5,
      steps: 4250,
      medications: [
        { name: 'Metformin 500mg', dose: '1 Tablet', time: '8:30 AM (After Breakfast)', status: 'Taken' },
        { name: 'Telmisartan 40mg', dose: '1 Tablet', time: '9:00 AM (Morning BP)', status: 'Taken' },
        { name: 'Multivitamin Silver 50+', dose: '1 Capsule', time: '1:30 PM (Lunch)', status: 'Pending' }
      ],
      meals: [
        { meal_name: 'Steamed Idli with Drumstick Sambar & Mint Chutney', meal_type: 'Breakfast', calories: 280, protein_g: 9, carbs_g: 48, fat_g: 4, tag: 'Low Glycemic' },
        { meal_name: 'Brown Rice with Spinach Dal & Carrot Poriyal', meal_type: 'Lunch', calories: 450, protein_g: 16, carbs_g: 65, fat_g: 6, tag: 'High Fiber' },
        { meal_name: 'Warm Ragi Porridge with Roasted Flaxseed Powder', meal_type: 'Evening Snack', calories: 180, protein_g: 6, carbs_g: 32, fat_g: 3, tag: 'Calcium Rich' },
        { meal_name: 'Soft Phulka with Bottle Gourd (Lauki) Sabzi & Curd', meal_type: 'Dinner', calories: 340, protein_g: 11, carbs_g: 52, fat_g: 5, tag: 'Doctor Approved' }
      ]
    },
    {
      email: 'shanthi.palani@healthspan.in',
      phone: '9444123456',
      pin: '7412',
      care_code: 'SP-7412',
      first_name: 'Shanthi',
      last_name: 'Palani',
      name: 'Shanthi Palani',
      age: 65,
      gender: 'Female',
      height_cm: 158,
      weight_kg: 68,
      bmi: 27.2,
      conditions: ['Arthritis / Joint Pain', 'High Cholesterol', 'Digestion / GERD'],
      chewability: 'Regular Diet',
      regional_cuisine: 'Pan-Indian Balanced',
      diet_type: 'Vegetarian',
      fasting_routine: 'Pradosham',
      water_liters: 2.0,
      sleep_hours: 7.0,
      steps: 3100,
      medications: [
        { name: 'Glucosamine + Chondroitin', dose: '1 Tablet', time: '9:00 AM (Joint Support)', status: 'Taken' },
        { name: 'Calcium 500mg + Vitamin D3', dose: '1 Tablet', time: '2:00 PM (After Lunch)', status: 'Taken' },
        { name: 'Atorvastatin 10mg', dose: '1 Tablet', time: '9:00 PM (Bedtime Lipid Control)', status: 'Pending' }
      ],
      meals: [
        { meal_name: 'Vegetable Oats Upma with Grated Coconut & Fresh Papaya', meal_type: 'Breakfast', calories: 290, protein_g: 8, carbs_g: 46, fat_g: 5, tag: 'Cholesterol Safe' },
        { meal_name: 'Methi Moong Dal with 2 Soft Phulkas & Beetroot Poriyal', meal_type: 'Lunch', calories: 420, protein_g: 15, carbs_g: 60, fat_g: 6, tag: 'Anti-Inflammatory' },
        { meal_name: 'Roasted Makhana (Foxnuts) with Turmeric Milk', meal_type: 'Evening Snack', calories: 160, protein_g: 5, carbs_g: 22, fat_g: 4, tag: 'Bone Mineralizing' },
        { meal_name: 'Steamed Broccoli, Pumpkin Soup & Curd Rice', meal_type: 'Dinner', calories: 310, protein_g: 10, carbs_g: 45, fat_g: 4, tag: 'Easy Digestion' }
      ]
    },
    {
      email: 'ramesh.verma@healthspan.in',
      phone: '9811123456',
      pin: '6391',
      care_code: 'RV-6391',
      first_name: 'Ramesh',
      last_name: 'Verma',
      name: 'Ramesh Verma',
      age: 72,
      gender: 'Male',
      height_cm: 172,
      weight_kg: 60,
      bmi: 20.3,
      conditions: ['Kidney Care', 'Hypertension', 'Thyroid'],
      chewability: 'Soft Meals',
      regional_cuisine: 'North Indian Home Style',
      diet_type: 'Eggetarian',
      fasting_routine: 'None',
      water_liters: 1.8,
      sleep_hours: 6.8,
      steps: 2800,
      medications: [
        { name: 'Thyroxine 50mcg', dose: '1 Tablet', time: '6:30 AM (Empty Stomach)', status: 'Taken' },
        { name: 'Amlodipine 5mg', dose: '1 Tablet', time: '8:30 AM (Morning BP)', status: 'Taken' },
        { name: 'Sodium Bicarbonate 500mg', dose: '1 Tablet', time: '1:00 PM (Renal Buffer)', status: 'Pending' }
      ],
      meals: [
        { meal_name: 'Egg White Scramble (2 Whites) with Brown Toast & Tea', meal_type: 'Breakfast', calories: 260, protein_g: 14, carbs_g: 32, fat_g: 3, tag: 'Controlled Protein' },
        { meal_name: 'Lauki (Bottle Gourd) Moong Dal with Steamed Rice', meal_type: 'Lunch', calories: 390, protein_g: 12, carbs_g: 68, fat_g: 4, tag: 'Low Potassium' },
        { meal_name: 'Sliced Pears & Soaked Chia Seed Water', meal_type: 'Evening Snack', calories: 130, protein_g: 3, carbs_g: 26, fat_g: 2, tag: 'Renal Safe' },
        { meal_name: 'Soft Paneer Bhurji (Low Salt) with 1 Chapati & Clear Soup', meal_type: 'Dinner', calories: 330, protein_g: 13, carbs_g: 40, fat_g: 6, tag: 'Low Sodium' }
      ]
    },
    {
      email: 'kalyani.s@healthspan.in',
      phone: '9884123456',
      pin: '4189',
      care_code: 'KS-4189',
      first_name: 'Kalyani',
      last_name: 'Sundaram',
      name: 'Kalyani Sundaram',
      age: 74,
      gender: 'Female',
      height_cm: 152,
      weight_kg: 50,
      bmi: 21.6,
      conditions: ['Digestion / GERD', 'Diabetes', 'Cardiac Health'],
      chewability: 'Pureed Diet',
      regional_cuisine: 'South Indian Traditional',
      diet_type: 'Vegetarian',
      fasting_routine: 'None',
      water_liters: 2.2,
      sleep_hours: 8.0,
      steps: 1950,
      medications: [
        { name: 'Rabeprazole 20mg', dose: '1 Tablet', time: '7:00 AM (GERD Empty Stomach)', status: 'Taken' },
        { name: 'Vildagliptin 50mg', dose: '1 Tablet', time: '8:30 AM (Post Breakfast)', status: 'Taken' },
        { name: 'Isabgol Natural Fiber Husk', dose: '1 Spoon in Water', time: '9:30 PM (Digestive Health)', status: 'Pending' }
      ],
      meals: [
        { meal_name: 'Pureed Moong Dal & Rice Congee (Kanji) with Steamed Apple', meal_type: 'Breakfast', calories: 240, protein_g: 8, carbs_g: 44, fat_g: 2, tag: 'Pureed Diet' },
        { meal_name: 'Mashed Sweet Potato & Turmeric Khichdi with Ghee', meal_type: 'Lunch', calories: 370, protein_g: 10, carbs_g: 64, fat_g: 5, tag: 'Ultra-Soft' },
        { meal_name: 'Tender Coconut Water & Pureed Banana Custard', meal_type: 'Evening Snack', calories: 150, protein_g: 3, carbs_g: 32, fat_g: 1, tag: 'Natural Electrolytes' },
        { meal_name: 'Strained Tomato Vegetable Soup & Soft Mashed Idli', meal_type: 'Dinner', calories: 290, protein_g: 7, carbs_g: 52, fat_g: 3, tag: 'Acid-Reflux Safe' }
      ]
    }
  ];

  // ─────────────────────────────────────────────────────────
  // 2. CAREGIVERS DEFINITION
  // ─────────────────────────────────────────────────────────
  const caregiversData = [
    {
      email: 'priya.verma@healthspan.in',
      phone: '9876543210',
      pin: '2580',
      first_name: 'Priya',
      last_name: 'Verma',
      name: 'Priya Verma',
      relationship: 'Daughter',
      linked_elder_codes: ['DP-5820', 'SP-7412']
    },
    {
      email: 'arvind.doctor@healthspan.in',
      phone: '9876543211',
      pin: '3690',
      first_name: 'Dr. Arvind',
      last_name: 'Swaminathan',
      name: 'Dr. Arvind Swaminathan',
      relationship: 'Doctor / Physician',
      linked_elder_codes: ['RV-6391', 'KS-4189', 'DP-5820']
    },
    {
      email: 'meera.nair@healthspan.in',
      phone: '9876543212',
      pin: '1470',
      first_name: 'Meera',
      last_name: 'Nair',
      name: 'Meera Nair',
      relationship: 'Nurse / Clinical Caretaker',
      linked_elder_codes: ['SP-7412', 'KS-4189']
    },
    {
      email: 'vikram.rao@healthspan.in',
      phone: '9876543213',
      pin: '9510',
      first_name: 'Vikram',
      last_name: 'Rao',
      name: 'Vikram Rao',
      relationship: 'Son',
      linked_elder_codes: ['RV-6391']
    }
  ];

  const createdElderDocs = {};

  // Seed Elders
  console.log('\n--- Seeding 4 Elderly Profiles ---');
  for (const e of eldersData) {
    let user = await User.findOne({ email: e.email });
    if (!user) {
      user = await User.create({
        email: e.email,
        phone: e.phone,
        pin: e.pin,
        password_hash: hashedPassword,
        first_name: e.first_name,
        last_name: e.last_name,
        role: 'elder',
        is_active: true
      });
    } else {
      user.phone = e.phone;
      user.pin = e.pin;
      user.first_name = e.first_name;
      user.last_name = e.last_name;
      user.password_hash = hashedPassword;
      await user.save();
    }

    let profile = await ElderProfile.findOne({ user_id: user._id });
    const profilePayload = {
      user_id: user._id,
      care_code: e.care_code,
      name: e.name,
      phone: e.phone,
      pin: e.pin,
      age: e.age,
      gender: e.gender,
      height_cm: e.height_cm,
      weight_kg: e.weight_kg,
      bmi: e.bmi,
      conditions: e.conditions,
      chewability: e.chewability,
      regional_cuisine: e.regional_cuisine,
      diet_type: e.diet_type,
      fasting_routine: e.fasting_routine,
      is_completed: true
    };

    if (!profile) {
      profile = await ElderProfile.create(profilePayload);
    } else {
      Object.assign(profile, profilePayload);
      await profile.save();
    }

    createdElderDocs[e.care_code] = { user, profile, data: e };
    console.log(`✅ Elder: "${e.name}" | PIN: ${e.pin} | Phone: ${e.phone} | Care Code: ${e.care_code} | Conditions: [${e.conditions.join(', ')}]`);

    // Seed Medications for Elder
    await Medication.deleteMany({ elder_name: e.name });
    for (const med of e.medications) {
      await Medication.create({
        elder_name: e.name,
        caregiver_email: '',
        name: med.name,
        dose: med.dose,
        time: med.time,
        status: med.status
      });
    }

    // Seed Activity for Elder
    const todayStr = new Date().toISOString().split('T')[0];
    await ActivityLog.deleteMany({ elder_name: e.name });
    await ActivityLog.create({
      elder_name: e.name,
      logged_date: todayStr,
      steps: e.steps,
      walk_minutes: Math.round(e.steps / 80),
      water_liters: e.water_liters,
      water_glasses: Math.round(e.water_liters / 0.25),
      sleep_hours: e.sleep_hours,
      sleep_quality: 'Good',
      health_score: 85,
      calories: e.meals.reduce((sum, m) => sum + m.calories, 0)
    });

    // Seed 7 days history for DailyCharts
    const now = new Date();
    for (let d = 1; d <= 6; d++) {
      const histDate = new Date(now);
      histDate.setDate(now.getDate() - d);
      const histStr = histDate.toISOString().split('T')[0];
      await ActivityLog.create({
        elder_name: e.name,
        logged_date: histStr,
        steps: Math.max(1200, e.steps + Math.floor((Math.random() - 0.5) * 600)),
        walk_minutes: 35,
        water_liters: Math.max(1.5, Number((e.water_liters + (Math.random() - 0.5) * 0.4).toFixed(1))),
        water_glasses: 8,
        sleep_hours: Math.max(6.0, Number((e.sleep_hours + (Math.random() - 0.5) * 1.0).toFixed(1))),
        sleep_quality: 'Optimal',
        health_score: Math.floor(78 + Math.random() * 15),
        calories: e.meals.reduce((sum, m) => sum + m.calories, 0) - (d * 15)
      });
    }

    // Seed Meals for Elder
    await MealLog.deleteMany({ elder_name: e.name });
    for (const m of e.meals) {
      await MealLog.create({
        user_id: user._id,
        elder_name: e.name,
        meal_name: m.meal_name,
        meal_type: m.meal_type,
        calories: m.calories,
        protein_g: m.protein_g,
        carbs_g: m.carbs_g,
        fat_g: m.fat_g,
        tag: m.tag,
        logged_via: 'voice',
        logged_at: new Date()
      });
    }
  }

  // Seed Caregivers & Links
  console.log('\n--- Seeding 4 Caregivers & Linking Elders ---');
  for (const c of caregiversData) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({
        email: c.email,
        phone: c.phone,
        pin: c.pin,
        password_hash: hashedPassword,
        first_name: c.first_name,
        last_name: c.last_name,
        role: 'caregiver',
        is_active: true
      });
    } else {
      user.phone = c.phone;
      user.pin = c.pin;
      user.first_name = c.first_name;
      user.last_name = c.last_name;
      user.password_hash = hashedPassword;
      await user.save();
    }

    // Clear old links for this caregiver
    await CaregiverLink.deleteMany({ caregiver_email: c.email });

    // Link each assigned elder
    for (const code of c.linked_elder_codes) {
      const elderObj = createdElderDocs[code];
      if (elderObj) {
        await CaregiverLink.create({
          caregiver_email: c.email,
          elder_id: elderObj.profile._id,
          elder_name: elderObj.data.name,
          elder_code: elderObj.data.care_code,
          relationship: c.relationship,
          phone: elderObj.data.phone,
          age: elderObj.data.age,
          height_cm: elderObj.data.height_cm,
          weight_kg: elderObj.data.weight_kg,
          conditions: elderObj.data.conditions,
          chewability: elderObj.data.chewability,
          water_glasses: Math.round(elderObj.data.water_liters / 0.25),
          sleep_hours: elderObj.data.sleep_hours,
          steps: elderObj.data.steps,
          status: 'Stable',
          last_meal: elderObj.data.meals[0]?.meal_name || 'Logged Meal'
        });
      }
    }

    console.log(`✅ Caregiver: "${c.name}" | Email: ${c.email} | PIN: ${c.pin} | Linked Elders: [${c.linked_elder_codes.join(', ')}]`);
  }

  console.log('\n=============================================');
  console.log('🎉 ALL DUMMY DATA SEEDED SUCCESSFULLY IN MONGODB ATLAS!');
  console.log('=============================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
