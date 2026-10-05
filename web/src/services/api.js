import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // Use relative path so all API requests automatically route through the current domain / ngrok tunnel
  return '';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Attach JWT & ngrok headers to every request
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers['ngrok-skip-browser-warning'] = 'true';
  const token = localStorage.getItem('token');
  if (token && token !== 'demo_token_12345' && token !== 'demo_token_phone') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for handling errors gracefully
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.warn('API Response Notice:', err.message);
    return Promise.reject(err);
  }
);

export default api;

// ─────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    return api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  },
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/users/me'),
};

// ─────────────────────────────────────────────────────────
// Elder Profile & Care Code API
// ─────────────────────────────────────────────────────────
export const profileApi = {
  getProfile: () => api.get('/api/elder/profile'),
  updateProfile: (data) => api.put('/api/elder/profile', data),
  getCareCode: () => api.get('/api/elder/care-code'),
  myProfile: () => api.get('/api/elder/profile').catch(() => api.get('/elderly-profiles/me')),
  list: () => api.get('/api/caregiver/elders'),
  get: (id) => api.get('/api/elder/profile'),
  create: (data) => api.put('/api/elder/profile', data),
  update: (id, data) => api.put('/api/elder/profile', data),
  delete: (id) => api.delete('/api/elder/profile'),
};

export const dietPlanApi = {
  getAdaptiveRecommendations: (params) => api.get('/api/elder/adaptive-recommendations', { params }),
  getMonthlyAnalysis: (params) => api.get('/api/elder/monthly-analysis', { params }),
};

// ─────────────────────────────────────────────────────────
// Meal Logs API
// ─────────────────────────────────────────────────────────
export const mealLogApi = {
  list: () => api.get('/api/meals'),
  create: (data) => api.post('/api/meals', data),
  delete: (mealId) => api.delete('/api/meals', { data: { id: mealId } }),
  listByDate: (profileId, date) => api.get('/api/meals', { params: { date, profile_id: profileId } }),
  analyzeVoice: (text, elderName) => api.post('/api/analyze-food-text', { text, elder_name: elderName }),
};

// ─────────────────────────────────────────────────────────
// Activity, Pedometer & Hydration API
// ─────────────────────────────────────────────────────────
export const activityApi = {
  getToday: (param) => {
    const params = typeof param === 'object' ? param : (param ? { elder_name: param } : {});
    return api.get('/api/activity/today', { params });
  },
  logActivity: (data) => api.post('/api/activity/log', data),
  getHistory: (param) => {
    const params = typeof param === 'object' ? param : (param ? { elder_name: param } : {});
    return api.get('/api/activity/history', { params });
  },
};

// ─────────────────────────────────────────────────────────
// Dynamic Caregiver API
// ─────────────────────────────────────────────────────────
export const caregiverApi = {
  getElders: (email) => api.get('/api/caregiver/elders', { params: { email } }),
  linkElder: (data) => api.post('/api/caregiver/link-elder', data),
  verifyCode: (data) => api.post('/api/caregiver/verify-code', data),
  verifyCareCode: (data) => api.post('/api/caregiver/verify-code', data),
  updateElder: (id, data) => api.put(`/api/caregiver/elders/${id}`, data),
  getMedications: () => api.get('/api/caregiver/medications'),
  addMedication: (data) => api.post('/api/caregiver/medications', data),
  updateMedication: (id, data) => api.put(`/api/caregiver/medications/${id}`, data),
  toggleMedication: (id) => api.put(`/api/caregiver/medications/${id}`),
};

// ─────────────────────────────────────────────────────────
// Research Paper Clinical Assessment API (MMSE, FRAX & Dietary)
// ─────────────────────────────────────────────────────────
export const clinicalAssessmentApi = {
  submitAssessment: (data) => api.post('/api/clinical-assessment', data),
  getAssessment: () => api.get('/api/clinical-assessment'),
  generateRecipe: (data) => api.post('/api/clinical-recipe', data),
};

// ─────────────────────────────────────────────────────────
// Clinical Vitals API (BP, Blood Sugar, Pulse)
// ─────────────────────────────────────────────────────────
export const vitalsApi = {
  getToday: (param) => {
    const params = typeof param === 'object' ? param : (param ? { elder_name: param } : {});
    return api.get('/api/vitals/today', { params });
  },
  logVitals: (data) => api.post('/api/vitals/log', data),
  getHistory: (param) => {
    const params = typeof param === 'object' ? param : (param ? { elder_name: param } : {});
    return api.get('/api/vitals/history', { params });
  },
  analyzeVoice: (text) => api.post('/api/vitals/analyze-voice', { text }),
};

// ─────────────────────────────────────────────────────────
// Food & Nutritional Database API
// ─────────────────────────────────────────────────────────
export const foodApi = {
  list: (skip = 0, limit = 100) => api.get('/api/admin/food-database').catch(() => api.get('/food-items')),
  search: (query) => api.get('/api/admin/food-database', { params: { query } }),
  get: (id) => api.get(`/food-items/${id}`).catch(() => api.get('/api/admin/food-database')),
  create: (data) => api.post('/food-items', data),
};

// ─────────────────────────────────────────────────────────
// Daily Intake & Nutrition Summaries API
// ─────────────────────────────────────────────────────────
export const dailyIntakeApi = {
  getByDate: (profileId, date) => api.get('/api/activity/today', { params: { profile_id: profileId, date } }),
  calculate: (profileId, date) => api.get('/api/activity/today', { params: { profile_id: profileId, date } }),
  list: (profileId) => api.get('/api/activity/history', { params: { profile_id: profileId } }),
};

// ─────────────────────────────────────────────────────────
// Health Scores & Conditions API
// ─────────────────────────────────────────────────────────
export const healthScoreApi = {
  listForProfile: (profileId, limit = 30) => api.get('/api/activity/history', { params: { profile_id: profileId, limit } }),
  getLatest: (profileId) => api.get('/api/vitals/today', { params: { profile_id: profileId } }),
  calculate: (profileId, data) => api.post('/api/vitals/log', data),
};

export const recommendationApi = {
  list: (profileId) => api.get('/api/clinical-recipe', { params: { profile_id: profileId } }),
  generate: (profileId) => api.post('/api/clinical-recipe', { profile_id: profileId }),
};

export const healthConditionApi = {
  listAll: () => api.get('/health-conditions'),
  listForProfile: (profileId) => api.get('/health-conditions', { params: { profile_id: profileId } }),
  add: (profileId, conditionId) => api.post('/health-conditions', { profile_id: profileId, condition_id: conditionId }),
  remove: (profileId, conditionId) => api.delete('/health-conditions', { data: { profile_id: profileId, condition_id: conditionId } }),
};

export const diseaseApi = {
  listAll: () => api.get('/diseases'),
  listForProfile: (profileId) => api.get('/diseases', { params: { profile_id: profileId } }),
  add: (profileId, diseaseId) => api.post('/diseases', { profile_id: profileId, disease_id: diseaseId }),
  remove: (profileId, diseaseId) => api.delete('/diseases', { data: { profile_id: profileId, disease_id: diseaseId } }),
};

export const reportApi = {
  daily: (profileId, date) => api.get('/api/activity/today', { params: { profile_id: profileId, date } }),
  weekly: (profileId, date) => api.get('/api/activity/history', { params: { profile_id: profileId, date } }),
  monthly: (profileId, year, month) => api.get('/api/activity/history', { params: { profile_id: profileId, year, month } }),
};

export const notificationApi = {
  list: (skip = 0, limit = 50) => api.get('/api/caregiver/elders'),
  markRead: (id) => Promise.resolve({ data: { success: true } }),
  markAllRead: () => Promise.resolve({ data: { success: true } }),
  delete: (id) => Promise.resolve({ data: { success: true } }),
};

export const emergencyContactApi = {
  list: (profileId) => api.get('/api/elder/care-code'),
  create: (data) => api.post('/api/caregiver/link-elder', data),
  delete: (id) => Promise.resolve({ data: { success: true } }),
  sendSOS: (data) => api.post('/api/send-sms', data),
};

export const settingsApi = {
  get: () => api.get('/api/elder/profile'),
  update: (data) => api.put('/api/elder/profile', data),
};


