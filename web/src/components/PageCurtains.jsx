import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../context/TransitionContext';
import { useLanguage } from '../context/LanguageContext';

// Luxury editorial cubic-bezier easing (Awwwards / High-End Motion standard)
const luxuryEase = [0.76, 0, 0.24, 1];

const ROUTE_META_MAP = {
  '/elder/dashboard': { key: 'dashboard', code: '01' },
  '/elder/voice-log': { key: 'mealLog', code: '02' },
  '/elder/activity-sleep': { key: 'walkSleep', code: '03' },
  '/elder/diet-plan': { key: 'dietPlan', code: '04' },
  '/elder/clinical-assessment': { key: 'clinical', code: '05' },
  '/elder/care-team': { key: 'careTeam', code: '06' },
  '/caregiver/overview': { key: 'caregiverOverview', code: '07' },
  '/caregiver/setup': { key: 'caregiverSetup', code: '08' },
  '/admin/dashboard': { key: 'admin', code: '09' },
  '/login': { key: 'login', code: '00' },
  '/register': { key: 'register', code: '00' }
};

export default function PageCurtains() {
  const location = useLocation();
  const { t } = useLanguage();
  const { phase, targetPath, isTransitioning } = usePageTransition();

  const currentMeta = useMemo(() => {
    const activePath = targetPath || location.pathname;
    const match = ROUTE_META_MAP[activePath];
    if (match) {
      return {
        title: t(`curtains.${match.key}.title`, match.key.toUpperCase()),
        subtitle: t(`curtains.${match.key}.subtitle`, 'HealthSpan Senior Wellness & Care Portal'),
        code: match.code
      };
    }

    const seg = activePath.split('/').filter(Boolean).pop() || 'HEALTHSPAN';
    const cleanTitle = seg.replace(/[-_]/g, ' ').toUpperCase();
    return {
      title: cleanTitle,
      subtitle: t('header.appTagline', 'Senior Nutrition & Care'),
      code: '●'
    };
  }, [targetPath, location.pathname, t]);

  if (!isTransitioning && phase === 'idle') {
    return null;
  }

  // Calculate motion state based on current phase
  const getPanelX = () => {
    if (phase === 'covering') return '0%';
    if (phase === 'hold') return '0%';
    if (phase === 'uncovering') return '-160%';
    return '160%';
  };

  const getInitialX = () => {
    if (phase === 'covering') return '160%';
    if (phase === 'uncovering') return '0%';
    return '0%';
  };

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden select-none">
      {/* ── Solid Dark Geometric Panel with Sharp Diagonal Leading & Trailing Edge ── */}
      <motion.div
        key={`curtain-panel-${phase}`}
        initial={{
          x: getInitialX(),
          skewX: -20
        }}
        animate={{
          x: getPanelX(),
          skewX: -20
        }}
        transition={{
          duration: phase === 'hold' ? 0.36 : 0.42,
          ease: luxuryEase
        }}
        className="absolute top-[-10vh] -left-[35vw] w-[170vw] h-[120vh] bg-[#070B12] shadow-2xl flex items-center justify-center border-l border-r border-emerald-500/20"
      >
        {/* Un-skew inner container to keep text perfectly vertical & razor sharp */}
        <div
          style={{ transform: 'skewX(20deg)' }}
          className="flex flex-col items-center justify-center text-center px-6 max-w-2xl"
        >
          {/* Editorial Title & Code (Active during covering and hold) */}
          <AnimatePresence mode="wait">
            {(phase === 'covering' || phase === 'hold') && (
              <motion.div
                key={`editorial-title-${currentMeta.title}`}
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                transition={{ duration: 0.28, ease: luxuryEase }}
                className="flex flex-col items-center gap-2.5"
              >
                {/* Section Index & Brand Mark */}
                <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.35em] text-emerald-400 uppercase font-black">
                  <span>[ {currentMeta.code} ]</span>
                  <span className="w-8 h-[1px] bg-emerald-500/60" />
                  <span>{t('header.appName', 'HEALTHSPAN')}</span>
                </div>

                {/* Page Title in Crisp Editorial Typography */}
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-[0.14em] uppercase font-['Outfit'] drop-shadow-2xl">
                  {currentMeta.title}
                </h2>

                {/* Subtitle with Emerald Accent Pulse */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 shrink-0 animate-pulse" />
                  <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-400 font-['Outfit']">
                    {currentMeta.subtitle}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
