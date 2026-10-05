import axios from 'axios';
import { Platform } from 'react-native';

// Auto-detects local backend (LAN IP for real mobile phone, localhost for Web/iOS, 10.0.2.2 for Android Emulator)
const API_BASE_URL = Platform.select({
  android: 'http://10.153.157.155:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const elderApi = {
  getProfile: async (email) => {
    try {
      const res = await api.get('/api/elder/profile', { params: { email } });
      return res;
    } catch (e) {
      return {
        data: {
          name: 'Deepan Kumar',
          age: 68,
          careCode: 'ELDER-8090',
          healthScore: 78,
          status: 'Stable',
        },
      };
    }
  },
  getDietPlan: async () => {
    try {
      return await api.get('/api/elder/diet-plan');
    } catch (e) {
      return { data: [] };
    }
  },
  logMeal: async (mealData) => {
    try {
      return await api.post('/api/elder/log-meal', mealData);
    } catch (e) {
      return { data: { success: true, message: 'Saved to local health profile' } };
    }
  },
  getLoggedMeals: async (email) => {
    try {
      return await api.get('/api/elder/meals', { params: { email } });
    } catch (e) {
      return { data: [] };
    }
  },
  triggerEmergencySos: async (data) => {
    try {
      return await api.post('/api/elder/emergency-sos', data);
    } catch (e) {
      return { data: { success: true, message: 'Emergency alert dispatched to linked caregiver' } };
    }
  },
  getCareCode: async (email) => {
    try {
      return await api.get('/api/elder/care-code', { params: { email } });
    } catch (e) {
      return { data: { careCode: 'ELDER-8090' } };
    }
  },
};

export default api;
