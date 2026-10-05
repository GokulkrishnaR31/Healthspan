import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from './src/models/User.js';
import { ElderProfile } from './src/models/ElderProfile.js';
import { MealLog } from './src/models/MealLog.js';
import { ActivityLog } from './src/models/ActivityLog.js';
import { CaregiverLink } from './src/models/CaregiverLink.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function seedData() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully!');

  const email = 'gkeditz618@gmail.com';
  const name = 'Shanthi Palani';
  const phone = '7604948580';

  // 1. Find or create user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      password_hash: '$2b$10$EP1mZ6U3.DqY9V.8w9h34evHh5jJ3H0g8n0yW7qZ2W.eQ2Z6E9iWy',
      first_name: 'Shanthi',
      last_name: 'Palani',
      role: 'elder',
      phone: phone,
      pin: '1234',
      is_active: true
    });
    console.log('Created user:', user._id);
  } else {
    user.first_name = 'Shanthi';
    user.last_name = 'Palani';
    user.role = 'elder';
    user.phone = phone;
    user.pin = user.pin || '1234';
    await user.save();
    console.log('Found existing user:', user._id);
  }

  // 2. Elder Profile
  let profile = await ElderProfile.findOne({ user_id: user._id });
  if (!profile) {
    profile = await ElderProfile.findOne({ $or: [{ phone: phone }, { name: name }] });
  }

  const profileData = {
    user_id: user._id,
    name: name,
    phone: phone,
    pin: '1234',
    care_code: 'ELDER-7604',
    age: 68,
    gender: 'Female',
    height_cm: 158,
    weight_kg: 58,
    bmi: 23.2,
    activity_level: 'Light Walk',
    conditions: ['Diabetes', 'Hypertension', 'Digestion'],
    chewability: 'Soft Meals',
    regional_cuisine: 'Tamil Nadu (South Indian)',
    diet_type: 'Vegetarian',
    fasting_routine: 'None',
    daily_water_target: 10,
    daily_calorie_target: 1650,
    daily_protein_target: 60,
    daily_calcium_target: 1200,
    daily_vitamin_d_target: 600,
    daily_omega3_target: 1000,
    mmse_score: 28,
    mmse_stage: 'Normal',
    frax_major_risk: 7.2,
    frax_hip_risk: 1.4,
    frax_category: 'Normal',
    is_completed: true
  };

  if (!profile) {
    profile = await ElderProfile.create(profileData);
    console.log('Created Elder Profile for Shanthi Palani');
  } else {
    Object.assign(profile, profileData);
    await profile.save();
    console.log('Updated Elder Profile for Shanthi Palani');
  }

  // 3. Caregiver Links
  const caregiverEmails = ['caregiver@healthspan.in', 'priya@healthspan.in', 'caregiver@gmail.com', 'admin@healthspan.in'];
  for (const cEmail of caregiverEmails) {
    await CaregiverLink.findOneAndUpdate(
      { caregiver_email: cEmail, elder_name: name },
      {
        caregiver_email: cEmail,
        elder_id: profile._id,
        elder_name: name,
        elder_code: 'ELDER-7604',
        relationship: 'Daughter',
        phone: phone,
        age: 68,
        height_cm: 158,
        weight_kg: 58,
        conditions: ['Diabetes', 'Hypertension', 'Digestion'],
        chewability: 'Soft Meals',
        water_glasses: 11,
        sleep_hours: 7.8,
        steps: 4320,
        status: 'Optimal Health',
        last_meal: 'Sprouted Ragi Kanji (8:30 AM)'
      },
      { upsert: true, new: true }
    );
  }
  console.log('Linked Shanthi Palani with Caregiver accounts!');

  // 4. Delete existing logs for clean 30-day seed
  await MealLog.deleteMany({ $or: [{ user_id: user._id }, { elder_name: name }] });
  await ActivityLog.deleteMany({ $or: [{ user_id: user._id }, { elder_name: name }] });
  console.log('Cleaned older logs to seed pristine 30-day history...');

  // Sample Healthy Indian Senior Meals Pool
  const breakfastPool = [
    { name: 'Sprouted Ragi Kanji & Steamed Sprouts', calories: 280, protein_g: 8, carbs_g: 48, fat_g: 2, fiber_g: 6, calcium_mg: 340, tag: 'ICMR Recommended' },
    { name: 'Steamed Rice Idli (2 pcs) with Sambar & Mint Chutney', calories: 220, protein_g: 6, carbs_g: 42, fat_g: 2, fiber_g: 4, calcium_mg: 120, tag: 'Soft Chewable' },
    { name: 'Oats Vegetable Porridge with Crushed Almonds', calories: 260, protein_g: 9, carbs_g: 38, fat_g: 5, fiber_g: 5, calcium_mg: 180, tag: 'Heart Healthy' },
    { name: 'Moong Dal Poha with Roasted Peanuts & Lemon', calories: 240, protein_g: 7, carbs_g: 40, fat_g: 4, fiber_g: 3, calcium_mg: 90, tag: 'Low Glycemic' }
  ];

  const lunchPool = [
    { name: 'Moong Dal Khichdi with Steamed Lauki & Ghee', calories: 420, protein_g: 14, carbs_g: 58, fat_g: 6, fiber_g: 6, calcium_mg: 210, tag: 'Easy Digestion' },
    { name: 'Brown Rice with Spinach Dal & Carrot Poriyal', calories: 450, protein_g: 15, carbs_g: 62, fat_g: 5, fiber_g: 7, calcium_mg: 280, tag: 'High Fiber' },
    { name: 'Curd Rice with Pomegranate & Cucumber Salad', calories: 380, protein_g: 10, carbs_g: 52, fat_g: 5, fiber_g: 3, calcium_mg: 320, tag: 'Gut Friendly' },
    { name: 'Soft Phulka (2 pcs) with Methi Paneer & Yellow Dal', calories: 440, protein_g: 16, carbs_g: 54, fat_g: 8, fiber_g: 5, calcium_mg: 290, tag: 'Protein Rich' }
  ];

  const snackPool = [
    { name: 'Steamed Moong Sundal with Grated Coconut', calories: 180, protein_g: 9, carbs_g: 28, fat_g: 3, fiber_g: 5, calcium_mg: 140, tag: 'Protein Booster' },
    { name: 'Roasted Foxnuts (Makhana) with Turmeric Milk', calories: 190, protein_g: 6, carbs_g: 24, fat_g: 4, fiber_g: 3, calcium_mg: 260, tag: 'Bone Health' },
    { name: 'Warm Spiced Buttermilk & 4 Soaked Almonds', calories: 120, protein_g: 5, carbs_g: 8, fat_g: 4, fiber_g: 2, calcium_mg: 210, tag: 'Hydration & Probiotic' }
  ];

  const dinnerPool = [
    { name: 'Bottle Gourd Soup & 1 Soft Multi-grain Phulka', calories: 310, protein_g: 9, carbs_g: 44, fat_g: 3, fiber_g: 6, calcium_mg: 160, tag: 'Light Dinner' },
    { name: 'Vegetable Daliya Porridge with Yellow Moong Dal', calories: 340, protein_g: 11, carbs_g: 48, fat_g: 4, fiber_g: 5, calcium_mg: 190, tag: 'Diabetes Friendly' },
    { name: 'Ragi Dosa with Tomato Onion Chutney', calories: 320, protein_g: 8, carbs_g: 46, fat_g: 4, fiber_g: 6, calcium_mg: 350, tag: 'Calcium Rich' },
    { name: 'Steamed Vegetable Idiyappam with Coconut Milk Curry', calories: 300, protein_g: 7, carbs_g: 45, fat_g: 4, fiber_g: 4, calcium_mg: 140, tag: 'Low Salt' }
  ];

  const mealDocs = [];
  const activityDocs = [];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Generate 30 continuous days of data
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;

    // Day variance
    const bf = breakfastPool[i % breakfastPool.length];
    const lu = lunchPool[i % lunchPool.length];
    const sn = snackPool[i % snackPool.length];
    const dn = dinnerPool[i % dinnerPool.length];

    const elderNames = [name, 'Gkeditz618', 'gkeditz618@gmail.com'];

    for (const elName of elderNames) {
      // Breakfast
      mealDocs.push({
        user_id: user._id,
        elder_name: elName,
        meal_type: 'Breakfast',
        meal_name: bf.name,
        calories: bf.calories + (i % 3) * 10,
        protein_g: bf.protein_g,
        carbs_g: bf.carbs_g,
        fat_g: bf.fat_g,
        fiber_g: bf.fiber_g,
        calcium_mg: bf.calcium_mg,
        is_vegetarian: true,
        logged_via: 'voice',
        date: dateStr,
        isToday: isToday,
        logged_at: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8, 30, 0)
      });

      // Lunch
      mealDocs.push({
        user_id: user._id,
        elder_name: elName,
        meal_type: 'Lunch',
        meal_name: lu.name,
        calories: lu.calories + (i % 2) * 15,
        protein_g: lu.protein_g,
        carbs_g: lu.carbs_g,
        fat_g: lu.fat_g,
        fiber_g: lu.fiber_g,
        calcium_mg: lu.calcium_mg,
        is_vegetarian: true,
        logged_via: 'voice',
        date: dateStr,
        isToday: isToday,
        logged_at: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 13, 0, 0)
      });

      // Snack
      mealDocs.push({
        user_id: user._id,
        elder_name: elName,
        meal_type: 'Evening Snacks',
        meal_name: sn.name,
        calories: sn.calories,
        protein_g: sn.protein_g,
        carbs_g: sn.carbs_g,
        fat_g: sn.fat_g,
        fiber_g: sn.fiber_g,
        calcium_mg: sn.calcium_mg,
        is_vegetarian: true,
        logged_via: 'voice',
        date: dateStr,
        isToday: isToday,
        logged_at: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 15, 0)
      });

      // Dinner
      mealDocs.push({
        user_id: user._id,
        elder_name: elName,
        meal_type: 'Dinner',
        meal_name: dn.name,
        calories: dn.calories + (i % 3) * 10,
        protein_g: dn.protein_g,
        carbs_g: dn.carbs_g,
        fat_g: dn.fat_g,
        fiber_g: dn.fiber_g,
        calcium_mg: dn.calcium_mg,
        is_vegetarian: true,
        logged_via: 'voice',
        date: dateStr,
        isToday: isToday,
        logged_at: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0, 0)
      });

      // Activity, Sleep, Hydration & Clinical Vitals for the day
      const baseWalk = 35 + ((i * 7) % 20);
      const baseSteps = 3800 + ((i * 123) % 1500);
      const baseSleep = 7.2 + ((i % 5) * 0.2);
      const baseWaterLiters = 2.8 + ((i % 4) * 0.2);

      const bpSys = 118 + ((i * 3) % 10);
      const bpDia = 76 + ((i * 2) % 6);
      const bloodSugar = 100 + ((i * 5) % 16);
      const pulse = 72 + ((i * 2) % 6);

      activityDocs.push({
        user_id: user._id,
        elder_name: elName,
        walk_minutes: baseWalk,
        steps: baseSteps,
        sleep_hours: baseSleep,
        sleep_quality: 'Good Restful Sleep',
        water_glasses: Math.round(baseWaterLiters / 0.25),
        water_liters: Number(baseWaterLiters.toFixed(2)),
        bp_systolic: bpSys,
        bp_diastolic: bpDia,
        blood_sugar: bloodSugar,
        sugar_type: 'fasting',
        pulse: pulse,
        vitals_source: 'manual',
        vitals_notes: 'Normal ICMR Senior Range',
        logged_date: dateStr,
        createdAt: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 0, 0)
      });
    }
  }

  await MealLog.insertMany(mealDocs);
  console.log(`Inserted ${mealDocs.length} meal logs across 30 days!`);

  await ActivityLog.insertMany(activityDocs);
  console.log(`Inserted ${activityDocs.length} daily activity & clinical vitals logs across 30 days!`);

  console.log('\n--- SEED COMPLETE ---');
  console.log(`User: ${name} (${email})`);
  console.log(`Care Code: ELDER-7604`);
  console.log(`Total Days: 30 Days`);
  console.log(`Total Meals: ${mealDocs.length}`);
  console.log(`Total Vitals & Activities: ${activityDocs.length}`);

  await mongoose.disconnect();
}

seedData().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
