import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePageTransition } from '../context/TransitionContext';

export default function SmoothTabs({ tabs, className = '' }) {
  const location = useLocation();
  const { navigateWithTransition } = usePageTransition();

  return (
    <nav className={`flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.to;

        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigateWithTransition(tab.to)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none whitespace-nowrap shrink-0 group ${
              isActive
                ? 'text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {/* Sliding Pill Indicator with Spring Physics */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-md shadow-emerald-600/30 -z-10"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 35,
                  mass: 0.6
                }}
              />
            )}

            {/* Subtle Hover Pill for non-active items */}
            {!isActive && (
              <span className="absolute inset-0 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            )}

            {Icon && (
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, -6, 0] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="shrink-0"
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500 transition-colors'}`} />
              </motion.div>
            )}

            <span className="relative z-10">{tab.label}</span>

            {tab.badge && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
