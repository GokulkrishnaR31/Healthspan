/**
 * High-Speed Instant Indian Senior Food & Nutrition Parser
 * Sub-millisecond keyword, quantity, unit, and nutritional fact extractor.
 */

export const INDIAN_FOOD_DB = {
  // ── ROTIS, BREADS & CEREALS ──
  'chapathi': { name: 'Whole Wheat Chapathi', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'chapathis': { name: 'Whole Wheat Chapathi', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'chapati': { name: 'Whole Wheat Chapati', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'chapatis': { name: 'Whole Wheat Chapati', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'chappati': { name: 'Whole Wheat Chapathi', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'chappathi': { name: 'Whole Wheat Chapathi', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'roti': { name: 'Whole Wheat Roti', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'rotis': { name: 'Whole Wheat Roti', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 85, unit_prot: 3.2, unit_carb: 16.5, unit_fat: 0.8, unit_calc: 18, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'phulka': { name: 'Oil-Free Phulka', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 75, unit_prot: 3.0, unit_carb: 15.0, unit_fat: 0.4, unit_calc: 16, unit_fiber: 2.4, is_veg: true, is_fast: false, type: 'count' },
  'phulkas': { name: 'Oil-Free Phulka', category: 'Lunch', unit: 'piece', base_amount: 1, unit_cal: 75, unit_prot: 3.0, unit_carb: 15.0, unit_fat: 0.4, unit_calc: 16, unit_fiber: 2.4, is_veg: true, is_fast: false, type: 'count' },
  'paratha': { name: 'Stuffed Paratha', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 210, unit_prot: 4.5, unit_carb: 30.0, unit_fat: 8.0, unit_calc: 25, unit_fiber: 2.8, is_veg: true, is_fast: false, type: 'count' },
  'poori': { name: 'Poori with Masala', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 145, unit_prot: 2.5, unit_carb: 18.0, unit_fat: 7.2, unit_calc: 15, unit_fiber: 1.2, is_veg: true, is_fast: false, type: 'count' },
  'puri': { name: 'Poori with Masala', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 145, unit_prot: 2.5, unit_carb: 18.0, unit_fat: 7.2, unit_calc: 15, unit_fiber: 1.2, is_veg: true, is_fast: false, type: 'count' },

  // ── SPREADS, SWEETENERS & FATS ──
  'butter': { name: 'Butter', category: 'Breakfast', unit: 'tsp', base_amount: 10, unit_cal: 72, unit_prot: 0.1, unit_carb: 0.0, unit_fat: 8.1, unit_calc: 2, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'fat' },
  'white butter': { name: 'White Butter (Makhan)', category: 'Breakfast', unit: 'tsp', base_amount: 10, unit_cal: 70, unit_prot: 0.1, unit_carb: 0.2, unit_fat: 7.8, unit_calc: 3, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'fat' },
  'makhan': { name: 'White Butter (Makhan)', category: 'Breakfast', unit: 'tsp', base_amount: 10, unit_cal: 70, unit_prot: 0.1, unit_carb: 0.2, unit_fat: 7.8, unit_calc: 3, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'fat' },
  'vennai': { name: 'Butter (Vennai)', category: 'Breakfast', unit: 'tsp', base_amount: 10, unit_cal: 72, unit_prot: 0.1, unit_carb: 0.0, unit_fat: 8.1, unit_calc: 2, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'fat' },
  'ghee': { name: 'Pure Desi Ghee', category: 'Lunch', unit: 'tsp', base_amount: 5, unit_cal: 45, unit_prot: 0.0, unit_carb: 0.0, unit_fat: 5.0, unit_calc: 1, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'fat' },
  'ney': { name: 'Pure Desi Ghee (Ney)', category: 'Lunch', unit: 'tsp', base_amount: 5, unit_cal: 45, unit_prot: 0.0, unit_carb: 0.0, unit_fat: 5.0, unit_calc: 1, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'fat' },
  'sugar': { name: 'Refined Sugar', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 20, unit_prot: 0.0, unit_carb: 5.0, unit_fat: 0.0, unit_calc: 0, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'white sugar': { name: 'Refined Sugar', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 20, unit_prot: 0.0, unit_carb: 5.0, unit_fat: 0.0, unit_calc: 0, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'cheeni': { name: 'Sugar (Cheeni)', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 20, unit_prot: 0.0, unit_carb: 5.0, unit_fat: 0.0, unit_calc: 0, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'sakkarai': { name: 'Sugar (Sakkarai)', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 20, unit_prot: 0.0, unit_carb: 5.0, unit_fat: 0.0, unit_calc: 0, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'jaggery': { name: 'Organic Jaggery (Gur)', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 19, unit_prot: 0.1, unit_carb: 4.8, unit_fat: 0.0, unit_calc: 4, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'gur': { name: 'Jaggery (Gur)', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 19, unit_prot: 0.1, unit_carb: 4.8, unit_fat: 0.0, unit_calc: 4, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'vellam': { name: 'Jaggery (Vellam)', category: 'Breakfast', unit: 'tsp', base_amount: 5, unit_cal: 19, unit_prot: 0.1, unit_carb: 4.8, unit_fat: 0.0, unit_calc: 4, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'honey': { name: 'Natural Honey', category: 'Breakfast', unit: 'tsp', base_amount: 7, unit_cal: 21, unit_prot: 0.0, unit_carb: 5.7, unit_fat: 0.0, unit_calc: 1, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'sweetener' },
  'jam': { name: 'Fruit Jam', category: 'Breakfast', unit: 'tsp', base_amount: 10, unit_cal: 28, unit_prot: 0.0, unit_carb: 7.0, unit_fat: 0.0, unit_calc: 2, unit_fiber: 0.1, is_veg: true, is_fast: false, type: 'sweetener' },

  // ── LIQUIDS, BEVERAGES & JUICES (Volume in ml / glass / cup) ──
  'milk': { name: 'Warm Milk', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 110, unit_prot: 6.5, unit_carb: 9.5, unit_fat: 4.5, unit_calc: 240, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },
  'cow milk': { name: 'Fresh Cow Milk', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 125, unit_prot: 6.8, unit_carb: 9.8, unit_fat: 6.0, unit_calc: 245, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },
  'tea': { name: 'Ginger Tea', category: 'Evening Snacks', unit: 'cup', base_amount: 150, unit_cal: 65, unit_prot: 2.0, unit_carb: 9.0, unit_fat: 2.2, unit_calc: 60, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },
  'coffee': { name: 'Filter Coffee', category: 'Evening Snacks', unit: 'cup', base_amount: 150, unit_cal: 75, unit_prot: 2.5, unit_carb: 9.5, unit_fat: 2.8, unit_calc: 80, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },
  'green tea': { name: 'Green Tea', category: 'Evening Snacks', unit: 'cup', base_amount: 150, unit_cal: 5, unit_prot: 0.2, unit_carb: 0.8, unit_fat: 0.0, unit_calc: 4, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },
  'buttermilk': { name: 'Spiced Buttermilk (Mor)', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 45, unit_prot: 2.5, unit_carb: 4.0, unit_fat: 1.5, unit_calc: 110, unit_fiber: 0.2, is_veg: true, is_fast: false, type: 'liquid' },
  'mor': { name: 'Spiced Buttermilk (Mor)', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 45, unit_prot: 2.5, unit_carb: 4.0, unit_fat: 1.5, unit_calc: 110, unit_fiber: 0.2, is_veg: true, is_fast: false, type: 'liquid' },
  'coconut water': { name: 'Tender Coconut Water', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 46, unit_prot: 1.5, unit_carb: 9.0, unit_fat: 0.5, unit_calc: 45, unit_fiber: 1.5, is_veg: true, is_fast: false, type: 'liquid' },
  'orange juice': { name: 'Fresh Orange Juice', category: 'Breakfast', unit: 'glass', base_amount: 200, unit_cal: 90, unit_prot: 1.5, unit_carb: 21.0, unit_fat: 0.2, unit_calc: 25, unit_fiber: 0.5, is_veg: true, is_fast: false, type: 'liquid' },
  'apple juice': { name: 'Fresh Apple Juice', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 95, unit_prot: 0.4, unit_carb: 24.0, unit_fat: 0.2, unit_calc: 12, unit_fiber: 0.4, is_veg: true, is_fast: false, type: 'liquid' },
  'juice': { name: 'Fresh Fruit Juice', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 95, unit_prot: 1.0, unit_carb: 23.0, unit_fat: 0.2, unit_calc: 20, unit_fiber: 0.5, is_veg: true, is_fast: false, type: 'liquid' },
  'fruit juice': { name: 'Fresh Fruit Juice', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 95, unit_prot: 1.0, unit_carb: 23.0, unit_fat: 0.2, unit_calc: 20, unit_fiber: 0.5, is_veg: true, is_fast: false, type: 'liquid' },
  'lemon juice': { name: 'Fresh Lemon Juice (Nimbu Pani)', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 45, unit_prot: 0.4, unit_carb: 11.0, unit_fat: 0.1, unit_calc: 15, unit_fiber: 0.2, is_veg: true, is_fast: false, type: 'liquid' },
  'sugarcane juice': { name: 'Sugarcane Juice', category: 'Evening Snacks', unit: 'glass', base_amount: 200, unit_cal: 180, unit_prot: 0.5, unit_carb: 45.0, unit_fat: 0.1, unit_calc: 30, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },
  'soup': { name: 'Vegetable Clear Soup', category: 'Dinner', unit: 'bowl', base_amount: 200, unit_cal: 70, unit_prot: 3.0, unit_carb: 11.0, unit_fat: 1.2, unit_calc: 30, unit_fiber: 2.0, is_veg: true, is_fast: false, type: 'liquid' },
  'water': { name: 'Drinking Water', category: 'Lunch', unit: 'glass', base_amount: 250, unit_cal: 0, unit_prot: 0.0, unit_carb: 0.0, unit_fat: 0.0, unit_calc: 0, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'liquid' },

  // ── BREAKFAST & TIFFIN ITEMS ──
  'idli': { name: 'Steamed Idli', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 65, unit_prot: 2.0, unit_carb: 14.0, unit_fat: 0.3, unit_calc: 12, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'count' },
  'idlis': { name: 'Steamed Idli', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 65, unit_prot: 2.0, unit_carb: 14.0, unit_fat: 0.3, unit_calc: 12, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'count' },
  'dosa': { name: 'Plain Dosa', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 140, unit_prot: 3.5, unit_carb: 24.0, unit_fat: 3.2, unit_calc: 18, unit_fiber: 1.2, is_veg: true, is_fast: false, type: 'count' },
  'dosas': { name: 'Plain Dosa', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 140, unit_prot: 3.5, unit_carb: 24.0, unit_fat: 3.2, unit_calc: 18, unit_fiber: 1.2, is_veg: true, is_fast: false, type: 'count' },
  'masala dosa': { name: 'Masala Dosa', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 230, unit_prot: 5.0, unit_carb: 34.0, unit_fat: 8.0, unit_calc: 25, unit_fiber: 2.5, is_veg: true, is_fast: false, type: 'count' },
  'ghee roast': { name: 'Ghee Roast Dosa', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 210, unit_prot: 3.8, unit_carb: 26.0, unit_fat: 9.5, unit_calc: 20, unit_fiber: 1.2, is_veg: true, is_fast: false, type: 'count' },
  'uthappam': { name: 'Onion Uthappam', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 190, unit_prot: 4.5, unit_carb: 30.0, unit_fat: 5.5, unit_calc: 24, unit_fiber: 2.2, is_veg: true, is_fast: false, type: 'count' },
  'oothappam': { name: 'Onion Uthappam', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 190, unit_prot: 4.5, unit_carb: 30.0, unit_fat: 5.5, unit_calc: 24, unit_fiber: 2.2, is_veg: true, is_fast: false, type: 'count' },
  'sambar': { name: 'Vegetable Sambar', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 110, unit_prot: 4.8, unit_carb: 16.0, unit_fat: 2.5, unit_calc: 42, unit_fiber: 3.5, is_veg: true, is_fast: false, type: 'curry' },
  'chutney': { name: 'Coconut Chutney', category: 'Breakfast', unit: 'tbsp', base_amount: 15, unit_cal: 45, unit_prot: 0.8, unit_carb: 2.5, unit_fat: 3.8, unit_calc: 15, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'condiment' },
  'coconut chutney': { name: 'Coconut Chutney', category: 'Breakfast', unit: 'tbsp', base_amount: 15, unit_cal: 45, unit_prot: 0.8, unit_carb: 2.5, unit_fat: 3.8, unit_calc: 15, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'condiment' },
  'tomato chutney': { name: 'Tomato Chutney', category: 'Breakfast', unit: 'tbsp', base_amount: 15, unit_cal: 35, unit_prot: 0.6, unit_carb: 4.0, unit_fat: 1.8, unit_calc: 10, unit_fiber: 0.8, is_veg: true, is_fast: false, type: 'condiment' },
  'vada': { name: 'Medu Vada', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 150, unit_prot: 4.2, unit_carb: 14.0, unit_fat: 8.5, unit_calc: 22, unit_fiber: 2.0, is_veg: true, is_fast: false, type: 'count' },
  'medu vada': { name: 'Medu Vada', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 150, unit_prot: 4.2, unit_carb: 14.0, unit_fat: 8.5, unit_calc: 22, unit_fiber: 2.0, is_veg: true, is_fast: false, type: 'count' },
  'pongal': { name: 'Ven Pongal (Ghee Moong Rice)', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 240, unit_prot: 6.5, unit_carb: 36.0, unit_fat: 7.8, unit_calc: 35, unit_fiber: 2.8, is_veg: true, is_fast: false, type: 'cereal' },
  'ven pongal': { name: 'Ven Pongal', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 240, unit_prot: 6.5, unit_carb: 36.0, unit_fat: 7.8, unit_calc: 35, unit_fiber: 2.8, is_veg: true, is_fast: false, type: 'cereal' },
  'upma': { name: 'Rava Vegetable Upma', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 180, unit_prot: 4.2, unit_carb: 28.0, unit_fat: 5.5, unit_calc: 25, unit_fiber: 2.4, is_veg: true, is_fast: false, type: 'cereal' },
  'rava upma': { name: 'Rava Upma', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 180, unit_prot: 4.2, unit_carb: 28.0, unit_fat: 5.5, unit_calc: 25, unit_fiber: 2.4, is_veg: true, is_fast: false, type: 'cereal' },
  'poha': { name: 'Flattened Rice Poha', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 190, unit_prot: 4.0, unit_carb: 32.0, unit_fat: 5.0, unit_calc: 28, unit_fiber: 2.2, is_veg: true, is_fast: false, type: 'cereal' },
  'puttu': { name: 'Steamed Rice Puttu', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 220, unit_prot: 5.2, unit_carb: 42.0, unit_fat: 3.0, unit_calc: 30, unit_fiber: 3.0, is_veg: true, is_fast: false, type: 'cereal' },
  'appam': { name: 'Appam', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 110, unit_prot: 2.2, unit_carb: 22.0, unit_fat: 1.5, unit_calc: 15, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'count' },

  // ── RICE, DALS & PROTEIN ──
  'rice': { name: 'Steamed Rice', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 170, unit_prot: 3.5, unit_carb: 38.0, unit_fat: 0.5, unit_calc: 10, unit_fiber: 0.8, is_veg: true, is_fast: false, type: 'cereal' },
  'curd rice': { name: 'Probiotic Curd Rice', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 195, unit_prot: 5.5, unit_carb: 32.0, unit_fat: 4.8, unit_calc: 140, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'cereal' },
  'lemon rice': { name: 'Lemon Rice', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 210, unit_prot: 4.2, unit_carb: 35.0, unit_fat: 6.2, unit_calc: 22, unit_fiber: 1.8, is_veg: true, is_fast: false, type: 'cereal' },
  'sambar rice': { name: 'Sambar Rice', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 220, unit_prot: 6.2, unit_carb: 36.0, unit_fat: 5.5, unit_calc: 45, unit_fiber: 3.2, is_veg: true, is_fast: false, type: 'cereal' },
  'rasam rice': { name: 'Digestive Rasam Rice', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 180, unit_prot: 3.8, unit_carb: 34.0, unit_fat: 3.2, unit_calc: 25, unit_fiber: 1.5, is_veg: true, is_fast: false, type: 'cereal' },
  'rasam': { name: 'Digestive Rasam', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 45, unit_prot: 1.2, unit_carb: 7.5, unit_fat: 1.0, unit_calc: 20, unit_fiber: 1.0, is_veg: true, is_fast: false, type: 'liquid' },
  'khichdi': { name: 'Moong Dal Khichdi', category: 'Dinner', unit: 'cup', base_amount: 150, unit_cal: 210, unit_prot: 7.5, unit_carb: 36.0, unit_fat: 4.2, unit_calc: 40, unit_fiber: 3.5, is_veg: true, is_fast: false, type: 'cereal' },
  'dal': { name: 'Yellow Moong Dal', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 140, unit_prot: 8.2, unit_carb: 20.0, unit_fat: 3.0, unit_calc: 35, unit_fiber: 4.5, is_veg: true, is_fast: false, type: 'curry' },
  'kootu': { name: 'Vegetable Moringa Kootu', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 125, unit_prot: 5.5, unit_carb: 18.0, unit_fat: 3.5, unit_calc: 65, unit_fiber: 4.0, is_veg: true, is_fast: false, type: 'curry' },
  'poriyal': { name: 'Vegetable Poriyal', category: 'Lunch', unit: 'cup', base_amount: 100, unit_cal: 95, unit_prot: 2.8, unit_carb: 12.0, unit_fat: 4.0, unit_calc: 45, unit_fiber: 3.8, is_veg: true, is_fast: false, type: 'solid' },
  'paneer': { name: 'Paneer', category: 'Lunch', unit: 'g', base_amount: 100, unit_cal: 265, unit_prot: 18.0, unit_carb: 3.5, unit_fat: 20.0, unit_calc: 480, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'solid' },
  'curd': { name: 'Fresh Curd', category: 'Lunch', unit: 'cup', base_amount: 150, unit_cal: 100, unit_prot: 5.0, unit_carb: 6.0, unit_fat: 4.0, unit_calc: 180, unit_fiber: 0.0, is_veg: true, is_fast: false, type: 'dairy' },
  'egg': { name: 'Boiled Egg', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 78, unit_prot: 6.3, unit_carb: 0.6, unit_fat: 5.3, unit_calc: 28, unit_fiber: 0.0, is_veg: false, is_fast: false, type: 'count' },
  'boiled egg': { name: 'Boiled Egg', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 78, unit_prot: 6.3, unit_carb: 0.6, unit_fat: 5.3, unit_calc: 28, unit_fiber: 0.0, is_veg: false, is_fast: false, type: 'count' },
  'omelette': { name: 'Egg Omelette', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 130, unit_prot: 8.5, unit_carb: 2.0, unit_fat: 9.5, unit_calc: 35, unit_fiber: 0.5, is_veg: false, is_fast: false, type: 'count' },
  'chicken': { name: 'Stewed Chicken', category: 'Lunch', unit: 'g', base_amount: 100, unit_cal: 165, unit_prot: 25.0, unit_carb: 0.0, unit_fat: 6.5, unit_calc: 15, unit_fiber: 0.0, is_veg: false, is_fast: false, type: 'solid' },
  'fish': { name: 'Grilled / Steamed Fish', category: 'Lunch', unit: 'g', base_amount: 100, unit_cal: 120, unit_prot: 20.0, unit_carb: 0.0, unit_fat: 4.0, unit_calc: 30, unit_fiber: 0.0, is_veg: false, is_fast: false, type: 'solid' },

  // ── FRUITS & NUTS ──
  'apple': { name: 'Fresh Apple', category: 'Evening Snacks', unit: 'piece', base_amount: 1, unit_cal: 80, unit_prot: 0.4, unit_carb: 21.0, unit_fat: 0.2, unit_calc: 10, unit_fiber: 3.5, is_veg: true, is_fast: false, type: 'count' },
  'banana': { name: 'Banana', category: 'Breakfast', unit: 'piece', base_amount: 1, unit_cal: 90, unit_prot: 1.1, unit_carb: 23.0, unit_fat: 0.3, unit_calc: 8, unit_fiber: 2.6, is_veg: true, is_fast: false, type: 'count' },
  'oats': { name: 'Cooked Oats Porridge', category: 'Breakfast', unit: 'cup', base_amount: 150, unit_cal: 150, unit_prot: 5.5, unit_carb: 27.0, unit_fat: 2.8, unit_calc: 40, unit_fiber: 4.0, is_veg: true, is_fast: false, type: 'cereal' },
  'makhana': { name: 'Roasted Makhana', category: 'Evening Snacks', unit: 'cup', base_amount: 35, unit_cal: 105, unit_prot: 3.5, unit_carb: 19.0, unit_fat: 1.5, unit_calc: 50, unit_fiber: 2.0, is_veg: true, is_fast: false, type: 'solid' },
  'sundal': { name: 'Chickpea Sundal', category: 'Evening Snacks', unit: 'cup', base_amount: 100, unit_cal: 140, unit_prot: 7.0, unit_carb: 20.0, unit_fat: 3.5, unit_calc: 45, unit_fiber: 4.8, is_veg: true, is_fast: false, type: 'solid' },

  // ── FAST FOODS & JUNK (For Alerts) ──
  'samosa': { name: 'Fried Samosa', category: 'Evening Snacks', unit: 'piece', base_amount: 1, unit_cal: 260, unit_prot: 3.5, unit_carb: 28.0, unit_fat: 15.0, unit_calc: 18, unit_fiber: 1.5, is_veg: true, is_fast: true, type: 'count' },
  'pizza': { name: 'Cheese Pizza Slice', category: 'Dinner', unit: 'slice', base_amount: 1, unit_cal: 290, unit_prot: 11.0, unit_carb: 32.0, unit_fat: 13.0, unit_calc: 160, unit_fiber: 1.8, is_veg: true, is_fast: true, type: 'count' },
  'burger': { name: 'Burger', category: 'Dinner', unit: 'piece', base_amount: 1, unit_cal: 350, unit_prot: 13.0, unit_carb: 38.0, unit_fat: 16.0, unit_calc: 80, unit_fiber: 2.0, is_veg: false, is_fast: true, type: 'count' },
  'chips': { name: 'Fried Potato Chips', category: 'Evening Snacks', unit: 'pack', base_amount: 1, unit_cal: 220, unit_prot: 2.0, unit_carb: 24.0, unit_fat: 14.0, unit_calc: 10, unit_fiber: 1.2, is_veg: true, is_fast: true, type: 'count' }
};

const NUMBER_WORDS = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'a': 1, 'an': 1, 'half': 0.5, 'oru': 1, 'rendu': 2, 'moonu': 3, 'naalu': 4, 'ek': 1, 'do': 2, 'teen': 3, 'char': 4
};

/**
 * Enhanced Multi-Unit Extractor & Nutrition Normalizer (Backend)
 * Handles: ml, L, g, kg, glass, cup, bowl, tsp, tbsp, pieces, slices, plates
 */
export function fastParseMealText(text = '', fallbackSlot = 'Lunch') {
  if (!text || typeof text !== 'string') return [];
  const rawClean = text.trim();
  if (!rawClean) return [];

  const lower = rawClean.toLowerCase();
  const clauses = lower.split(/,| and | with | & |\+|\band\b|\bwith\b|\bplus\b/).map(s => s.trim()).filter(Boolean);
  const detectedFoods = [];
  const processedKeys = new Set();

  for (const clause of (clauses.length > 0 ? clauses : [lower])) {
    let rawNum = null;
    const digitMatch = clause.match(/(\d+(\.\d+)?)/);
    if (digitMatch) {
      rawNum = parseFloat(digitMatch[1]);
    } else {
      for (const [w, n] of Object.entries(NUMBER_WORDS)) {
        const wordRegex = new RegExp(`\\b${w}\\b`, 'i');
        if (wordRegex.test(clause)) {
          rawNum = n;
          break;
        }
      }
    }
    const enteredQty = rawNum !== null ? rawNum : 1;

    // Detect unit in clause
    let detectedUnit = null;
    if (/\b(ml|milliliters?|millilitres?)\b/i.test(clause)) detectedUnit = 'ml';
    else if (/\b(litres?|liters?|l)\b/i.test(clause)) detectedUnit = 'L';
    else if (/\b(grams?|gms?|g)\b/i.test(clause)) detectedUnit = 'g';
    else if (/\b(kilos?|kilograms?|kg)\b/i.test(clause)) detectedUnit = 'kg';
    else if (/\b(glass|glasses|tumbler|tumblers)\b/i.test(clause)) detectedUnit = 'glass';
    else if (/\b(cups?|katori|katoris)\b/i.test(clause)) detectedUnit = 'cup';
    else if (/\b(bowls?)\b/i.test(clause)) detectedUnit = 'bowl';
    else if (/\b(tablespoons?|tbsp)\b/i.test(clause)) detectedUnit = 'tbsp';
    else if (/\b(teaspoons?|tsp)\b/i.test(clause)) detectedUnit = 'tsp';
    else if (/\b(slices?)\b/i.test(clause)) detectedUnit = 'slice';
    else if (/\b(pieces?|pcs|nos?)\b/i.test(clause)) detectedUnit = 'piece';

    let matchedEntry = null;
    const sortedDbKeys = Object.keys(INDIAN_FOOD_DB).sort((a, b) => b.length - a.length);
    for (const key of sortedDbKeys) {
      const re = new RegExp(`\\b${key}\\b`, 'i');
      if (re.test(clause)) {
        matchedEntry = INDIAN_FOOD_DB[key];
        break;
      }
    }

    if (matchedEntry) {
      const itemKey = `${matchedEntry.name}_${enteredQty}_${detectedUnit || matchedEntry.unit}`;
      if (!processedKeys.has(itemKey)) {
        processedKeys.add(itemKey);

        // ── Normalization Calculation Ratio ──
        let ratio = enteredQty;
        let finalUnit = detectedUnit || matchedEntry.unit;

        if (detectedUnit === 'ml') {
          // Compare with base volume (default 200ml for glass, 150ml for cup)
          const baseVol = matchedEntry.base_amount || 200;
          ratio = enteredQty / baseVol;
          finalUnit = 'ml';
        } else if (detectedUnit === 'L') {
          const baseVol = matchedEntry.base_amount || 200;
          ratio = (enteredQty * 1000) / baseVol;
          finalUnit = 'L';
        } else if (detectedUnit === 'g') {
          const baseWeight = matchedEntry.base_amount || 100;
          ratio = enteredQty / baseWeight;
          finalUnit = 'g';
        } else if (detectedUnit === 'kg') {
          const baseWeight = matchedEntry.base_amount || 100;
          ratio = (enteredQty * 1000) / baseWeight;
          finalUnit = 'kg';
        } else if (detectedUnit === 'glass' && matchedEntry.unit === 'cup') {
          ratio = enteredQty * (200 / 150); // 1 glass is ~1.33 cups
          finalUnit = 'glass';
        } else if (detectedUnit === 'cup' && matchedEntry.unit === 'glass') {
          ratio = enteredQty * (150 / 200); // 1 cup is ~0.75 glass
          finalUnit = 'cup';
        } else if (detectedUnit === 'tbsp' && matchedEntry.unit === 'tsp') {
          ratio = enteredQty * 3; // 1 tbsp = 3 tsp
          finalUnit = 'tbsp';
        } else if (detectedUnit === 'tsp' && matchedEntry.unit === 'tbsp') {
          ratio = enteredQty / 3;
          finalUnit = 'tsp';
        }

        const totalCal = Math.max(0, Math.round(matchedEntry.unit_cal * ratio));
        const totalProt = Number((matchedEntry.unit_prot * ratio).toFixed(1));
        const totalCarb = Number((matchedEntry.unit_carb * ratio).toFixed(1));
        const totalFat = Number((matchedEntry.unit_fat * ratio).toFixed(1));
        const totalCalc = Math.round(matchedEntry.unit_calc * ratio);

        detectedFoods.push({
          id: 'fast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: matchedEntry.name,
          quantity: enteredQty,
          unit: finalUnit,
          category: matchedEntry.category || fallbackSlot,
          is_vegetarian: matchedEntry.is_veg,
          is_fast_food: matchedEntry.is_fast,
          nutrition_facts: {
            calories: totalCal,
            unit_calories: Math.round(matchedEntry.unit_cal),
            protein_g: totalProt,
            unit_protein: matchedEntry.unit_prot,
            carbs_g: totalCarb,
            unit_carbs: matchedEntry.unit_carb,
            fat_g: totalFat,
            unit_fat: matchedEntry.unit_fat,
            calcium_mg: totalCalc,
            unit_calcium: matchedEntry.unit_calc,
          }
        });
      }
    }
  }

  return detectedFoods;
}
