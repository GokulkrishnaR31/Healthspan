import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TransitionContext = createContext(null);

export const ROUTE_TITLES = {
  '/elder/dashboard': {
    title: 'DAILY DASHBOARD',
    subtitle: 'Senior Health & Wellness Baseline',
    code: '01'
  },
  '/elder/voice-log': {
    title: 'MEAL LOG',
    subtitle: 'Voice & Nutritional Intake',
    code: '02'
  },
  '/elder/activity-sleep': {
    title: 'WALK & SLEEP',
    subtitle: 'Daily Mobility & Rest Tracker',
    code: '03'
  },
  '/elder/diet-plan': {
    title: 'AI DIET PLAN',
    subtitle: 'Personalised ICMR Meal Guidelines',
    code: '04'
  },
  '/elder/clinical-assessment': {
    title: 'CLINICAL ASSESSMENT',
    subtitle: 'Cognitive MMSE & FRAX Bone Evaluation',
    code: '05'
  },
  '/elder/care-team': {
    title: 'CARE TEAM & SUPPORT',
    subtitle: 'Caregiver & Emergency Assistance',
    code: '06'
  },
  '/caregiver/overview': {
    title: 'CAREGIVER OVERVIEW',
    subtitle: 'Senior Monitoring & Vital Alerts',
    code: '07'
  },
  '/caregiver/setup': {
    title: 'CAREGIVER SETUP',
    subtitle: 'Patient Linkage & Preferences',
    code: '08'
  },
  '/admin/dashboard': {
    title: 'ADMIN CONSOLE',
    subtitle: 'Clinical & NLP Intelligence',
    code: '09'
  },
  '/login': {
    title: 'HEALTHSPAN PORTAL',
    subtitle: 'Senior Wellness & Clinical Access',
    code: '00'
  },
  '/register': {
    title: 'PATIENT ENROLLMENT',
    subtitle: 'New Patient & Caregiver Setup',
    code: '00'
  }
};

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 'idle' | 'covering' | 'hold' | 'uncovering'
  const [phase, setPhase] = useState('idle');
  const [targetPath, setTargetPath] = useState(location.pathname);
  const isTransitioningRef = useRef(false);

  const navigateWithTransition = useCallback((toPath) => {
    if (toPath === location.pathname || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setTargetPath(toPath);
    setPhase('covering'); // Start diagonal sweep across current page

    // Step 1: When screen is 100% covered (at 420ms), switch route and enter hold phase
    setTimeout(() => {
      navigate(toPath);
      setPhase('hold');

      // Step 2: After brief luxury visual pause (at 780ms), start uncovering next page
      setTimeout(() => {
        setPhase('uncovering');

        // Step 3: When uncover completes (at 1200ms), return to idle
        setTimeout(() => {
          setPhase('idle');
          isTransitioningRef.current = false;
        }, 420);
      }, 360);
    }, 420);
  }, [location.pathname, navigate]);

  return (
    <TransitionContext.Provider
      value={{
        phase,
        targetPath,
        navigateWithTransition,
        isTransitioning: phase !== 'idle'
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error('usePageTransition must be used within a TransitionProvider');
  }
  return ctx;
}
