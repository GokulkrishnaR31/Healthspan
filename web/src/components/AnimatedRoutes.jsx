import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ElderSetupWizard from '../pages/elder/ElderSetupWizard';
import ElderMobileHome from '../pages/elder/ElderMobileHome';
import ElderVoiceLogPage from '../pages/elder/ElderVoiceLogPage';
import ElderDietPlan from '../pages/elder/ElderDietPlan';
import ElderActivitySleepPage from '../pages/elder/ElderActivitySleepPage';
import ElderCareTeamPage from '../pages/elder/ElderCareTeamPage';
import PaperClinicalAssessmentForm from '../pages/elder/PaperClinicalAssessmentForm';
import ElderProfilePage from '../pages/elder/ElderProfilePage';
import CaregiverSetupWizard from '../pages/caregiver/CaregiverSetupWizard';
import CaregiverDashboard from '../pages/caregiver/CaregiverDashboard';
import CaregiverProfilePage from '../pages/caregiver/CaregiverProfilePage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PageTransition from './PageTransition';
import PageCurtains from './PageCurtains';
import ElderAIAssistant from './ElderAIAssistant';

// ── Role-Protected Private Route Guard ──
function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-['Outfit']">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-bold">Initialising HealthSpan...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, ensure user has permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`Unauthorized route attempt by role '${user.role}' for allowed roles:`, allowedRoles);
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'caregiver') {
      return <Navigate to="/caregiver/overview" replace />;
    } else {
      return <Navigate to="/elder/dashboard" replace />;
    }
  }

  // Ensure newly registered seniors or caregivers complete setup before accessing dashboard
  if (user.role === 'elder' && location.pathname === '/elder/dashboard') {
    const userEmail = (user.email || user.id || '').toLowerCase();
    const elderProf = JSON.parse(localStorage.getItem(`elder_profile_${userEmail}`) || localStorage.getItem('elder_profile') || '{}');
    if (elderProf && elderProf.isCompleted === false) {
      return <Navigate to="/elder/setup" replace />;
    }
  }

  if (user.role === 'caregiver' && (location.pathname === '/caregiver/overview' || location.pathname === '/caregiver/dashboard')) {
    const userEmail = (user.email || user.id || '').toLowerCase();
    const caregiverProf = JSON.parse(localStorage.getItem(`caregiver_profile_${userEmail}`) || localStorage.getItem('caregiver_profile') || '{}');
    if (caregiverProf && caregiverProf.isCompleted === false) {
      return <Navigate to="/caregiver/setup" replace />;
    }
  }

  return children;
}

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      {/* ── Global Cinematic Diagonal Wipe Overlay ── */}
      <PageCurtains />

      {/* ── Global Context-Aware Elder AI Assistant Companion ── */}
      <ElderAIAssistant />

      <Routes location={location} key={location.pathname}>
        {/* Root Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* Elder Mobile Routes */}
        <Route path="/elder/setup" element={<PrivateRoute allowedRoles={['elder', 'caregiver']}><PageTransition><ElderSetupWizard /></PageTransition></PrivateRoute>} />
        <Route path="/elder/dashboard" element={<PrivateRoute allowedRoles={['elder']}><PageTransition><ElderMobileHome /></PageTransition></PrivateRoute>} />
        <Route path="/elder/diet-plan" element={<PrivateRoute allowedRoles={['elder', 'caregiver', 'admin']}><PageTransition><ElderDietPlan /></PageTransition></PrivateRoute>} />
        <Route path="/elder/voice-log" element={<PrivateRoute allowedRoles={['elder', 'caregiver', 'admin']}><PageTransition><ElderVoiceLogPage /></PageTransition></PrivateRoute>} />
        <Route path="/elder/activity-sleep" element={<PrivateRoute allowedRoles={['elder', 'caregiver', 'admin']}><PageTransition><ElderActivitySleepPage /></PageTransition></PrivateRoute>} />
        <Route path="/elder/care-team" element={<PrivateRoute allowedRoles={['elder', 'caregiver', 'admin']}><PageTransition><ElderCareTeamPage /></PageTransition></PrivateRoute>} />
        <Route path="/elder/clinical-assessment" element={<PrivateRoute allowedRoles={['elder', 'caregiver', 'admin']}><PageTransition><PaperClinicalAssessmentForm /></PageTransition></PrivateRoute>} />
        <Route path="/elder/profile" element={<PrivateRoute allowedRoles={['elder', 'caregiver', 'admin']}><PageTransition><ElderProfilePage /></PageTransition></PrivateRoute>} />

        {/* Caregiver Portal Routes */}
        <Route path="/caregiver/setup" element={<PrivateRoute allowedRoles={['caregiver']}><PageTransition><CaregiverSetupWizard /></PageTransition></PrivateRoute>} />
        <Route path="/caregiver/overview" element={<PrivateRoute allowedRoles={['caregiver']}><PageTransition><CaregiverDashboard /></PageTransition></PrivateRoute>} />
        <Route path="/caregiver/profile" element={<PrivateRoute allowedRoles={['caregiver']}><PageTransition><CaregiverProfilePage /></PageTransition></PrivateRoute>} />
        <Route path="/caregiver/dashboard" element={<Navigate to="/caregiver/overview" replace />} />
        <Route path="/caregiver/elderly" element={<Navigate to="/caregiver/overview" replace />} />

        {/* Admin Portal */}
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></PrivateRoute>} />

        {/* Legacy / Alias Navigation Redirects */}
        <Route path="/profile" element={<Navigate to="/elder/profile" replace />} />
        <Route path="/profile-setup" element={<Navigate to="/elder/profile" replace />} />
        <Route path="/dashboard" element={<Navigate to="/elder/dashboard" replace />} />
        <Route path="/meal-logs" element={<Navigate to="/elder/voice-log" replace />} />
        <Route path="/daily-intake" element={<Navigate to="/elder/dashboard" replace />} />
        <Route path="/reports" element={<Navigate to="/caregiver/overview" replace />} />
        <Route path="/notifications" element={<Navigate to="/elder/dashboard" replace />} />
        <Route path="/elder/nutrients" element={<Navigate to="/elder/diet-plan" replace />} />
        <Route path="/elder/onboarding" element={<Navigate to="/elder/setup" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
