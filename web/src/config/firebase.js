import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

// Firebase configuration with fallback to the user's project keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDr2bE1gjbl7Y5Bs3mcaYY_tYaIJppM-Rs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "healthspan-diet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "healthspan-diet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "healthspan-diet.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "675812451917",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:675812451917:web:d025c8c9a8698e95721e04"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Initializes RecaptchaVerifier for Firebase Phone Auth
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Could not clear previous recaptcha verifier:", e);
    }
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) {}
        window.recaptchaVerifier = null;
      }
    }
  });

  return window.recaptchaVerifier;
}

/**
 * Sends a real 6-digit SMS OTP via Firebase Phone Auth
 * @param {string} phoneNumber - Full phone number including country code (e.g. +919876543210)
 * @param {string} containerId - DOM ID of recaptcha element
 * @returns {Promise<ConfirmationResult>}
 */
export async function sendFirebaseOtp(phoneNumber, containerId = 'recaptcha-container') {
  let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+91${formattedPhone.replace(/^0+/, '')}`;
  }

  const appVerifier = setupRecaptcha(containerId);
  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
}

export { RecaptchaVerifier, signInWithPhoneNumber };
export default app;
