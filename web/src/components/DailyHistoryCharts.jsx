import React, { useState } from 'react';
import { Droplets, Footprints, Moon, Flame, TrendingUp, Calendar, Sparkles, CheckCircle2, Zap, Shield } from 'lucide-react';

/**
 * DailyHistoryCharts with Cinematic Entrance Effects & Animated Visualizations
 */
export default function DailyHistoryCharts({ 
  historyData = [], 
  isDark = false,
  todayWater = 0,
  todayWalk = 0,
  todaySteps = 0,
  todaySleep = 0,
  todayCalories = 0,
  todayScore = 0,
  scoreHistory = []
}) {
  const [activeMetric, setActiveMetric] = useState('score');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // ── Normalize & fill 7 days ──
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateStr: d.toISOString().split('T')[0],
      isToday: i === 6,
      offset: 6 - i
    };
  });

  // Merge backend data with our day slots strictly from real logged entries
  const filled = days.map((slot) => {
    const found = historyData.find((h) => {
      if (h.logged_date) return h.logged_date === slot.dateStr;
      if (h.day) return h.day === slot.label;
      return false;
    });

    const scoreHistItem = scoreHistory?.find(s => s.dateKey === slot.dateStr || s.day === slot.label);
    const scoreVal = slot.isToday 
      ? Number(todayScore || 0) 
      : (scoreHistItem?.score !== undefined ? Number(scoreHistItem.score) : (found?.health_score !== undefined ? Number(found.health_score) : 0));

    const waterVal = slot.isToday 
      ? Number(todayWater || 0) 
      : (found?.water_liters !== undefined && found?.water_liters !== null ? Number(found.water_liters) : (scoreHistItem?.water || 0));
    const walkVal = slot.isToday 
      ? Number(todayWalk || 0) 
      : (found?.walk_minutes !== undefined && found?.walk_minutes !== null ? Number(found.walk_minutes) : 0);
    const stepsVal = slot.isToday 
      ? Number(todaySteps || 0) 
      : (found?.steps !== undefined && found?.steps !== null ? Number(found.steps) : 0);
    const sleepVal = slot.isToday 
      ? Number(todaySleep || 0) 
      : (found?.sleep_hours !== undefined && found?.sleep_hours !== null ? Number(found.sleep_hours) : 0);
    const calVal = slot.isToday 
      ? Number(todayCalories || 0) 
      : (found?.calories !== undefined && found?.calories !== null ? Number(found.calories) : (scoreHistItem?.calories || 0));

    return {
      label: slot.label,
      isToday: slot.isToday,
      health_score: scoreVal,
      water_liters: waterVal,
      walk_minutes: walkVal,
      steps: stepsVal,
      sleep_hours: sleepVal,
      calories: calVal,
      hasData: slot.isToday ? (scoreVal > 0 || waterVal > 0 || walkVal > 0 || sleepVal > 0 || calVal > 0) : Boolean(found || (scoreHistItem && scoreHistItem.hasData))
    };
  });

  const metrics = [
    {
      key: 'score',
      label: 'Score',
      unit: '%',
      icon: Shield,
      color: '#006b5f',
      gradStart: '#008778',
      gradEnd: '#005249',
      target: 80,
      getValue: (d) => d.health_score,
      format: (v) => `${v}%`,
      tip: 'ICMR Geriatric Nutrition & Vitality Target: 80%+'
    },
    {
      key: 'water',
      label: 'Water',
      unit: 'L',
      icon: Droplets,
      color: '#06b6d4',
      gradStart: '#22d3ee',
      gradEnd: '#0891b2',
      target: 2.6,
      getValue: (d) => d.water_liters,
      format: (v) => `${Number(v).toFixed(1)}L`,
      tip: 'Stay hydrated with warm water sips'
    },
    {
      key: 'walk',
      label: 'Walk',
      unit: 'min',
      icon: Footprints,
      color: '#10b981',
      gradStart: '#34d399',
      gradEnd: '#059669',
      target: 45,
      getValue: (d) => d.walk_minutes,
      format: (v) => `${v}m`,
      tip: 'Gentle walking maintains bone density'
    },
    {
      key: 'sleep',
      label: 'Sleep',
      unit: 'hrs',
      icon: Moon,
      color: '#818cf8',
      gradStart: '#a5b4fc',
      gradEnd: '#6366f1',
      target: 7.5,
      getValue: (d) => d.sleep_hours,
      format: (v) => `${Number(v).toFixed(1)}h`,
      tip: '7+ hours provides cellular restoration'
    },
    {
      key: 'calories',
      label: 'Calories',
      unit: 'kcal',
      icon: Flame,
      color: '#f97316',
      gradStart: '#fb923c',
      gradEnd: '#ea580c',
      target: 1600,
      getValue: (d) => d.calories,
      format: (v) => `${v}`,
      tip: 'Balanced geriatric ICMR intake'
    },
  ];

  const metric = metrics.find((m) => m.key === activeMetric) || metrics[0];
  const values = filled.map((d) => metric.getValue(d));
  const maxVal = Math.max(...values, metric.target * 1.15);

  // SVG chart dimensions
  const W = 340;
  const H = 135;
  const PAD = { top: 16, bottom: 28, left: 10, right: 10 };
  const barW = (W - PAD.left - PAD.right) / 7;
  const chartH = H - PAD.top - PAD.bottom;

  const getX = (i) => PAD.left + i * barW + barW * 0.15;
  const getBarW = () => barW * 0.7;
  const getBarH = (v) => v <= 0 ? 0 : Math.max(6, (v / maxVal) * chartH);
  const getY = (v) => v <= 0 ? PAD.top + chartH : PAD.top + chartH - getBarH(v);

  // Target line Y position
  const targetY = PAD.top + chartH - (metric.target / maxVal) * chartH;

  // Build connecting trend line path points
  const points = filled.map((day, i) => {
    const val = metric.getValue(day);
    const x = getX(i) + getBarW() / 2;
    const y = getY(val);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
        isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200/90 bg-white'
      }`}
    >
      {/* Intro Animation Style Keyframes */}
      <style>{`
        @keyframes barGrowIntro {
          0% {
            transform: scaleY(0);
            opacity: 0;
          }
          70% {
            transform: scaleY(1.06);
            opacity: 0.95;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }
        @keyframes trendDraw {
          from {
            stroke-dashoffset: 400;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm"
            style={{ background: `${metric.color}15`, border: `1px solid ${metric.color}35` }}
          >
            <TrendingUp className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color: metric.color }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                7-Day Health Trend
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Animated
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Live Geriatric Log History
            </p>
          </div>
        </div>

        {/* Doctor Tip Badge */}
        <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>{metric.tip}</span>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="px-4 pt-3 pb-1">
        <div
          className={`flex gap-1.5 p-1 rounded-2xl ${
            isDark ? 'bg-slate-800/80' : 'bg-slate-100'
          }`}
        >
          {metrics.map((m) => {
            const Icon = m.icon;
            const isActive = activeMetric === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  setActiveMetric(m.key);
                  setHoveredIndex(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/40'
                }`}
                style={isActive ? { color: m.color } : {}}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Animated Bar & Wave Chart */}
      <div className="px-4 pt-2 pb-2 relative">
        <svg
          key={activeMetric}
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric.gradStart} stopOpacity="1" />
              <stop offset="100%" stopColor={metric.gradEnd} stopOpacity="0.75" />
            </linearGradient>
            
            {/* Today Golden Highlight */}
            <linearGradient id="grad-today" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
            </linearGradient>

            {/* Glow filter for Target Line */}
            <filter id="glow-target" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Target Dashed Line with Soft Glow */}
          {metric.target && metric.target <= maxVal && (
            <g className="transition-all duration-500">
              <line
                x1={PAD.left}
                y1={targetY}
                x2={W - PAD.right}
                y2={targetY}
                stroke={metric.color}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.5"
                filter="url(#glow-target)"
              />
              <text
                x={W - PAD.right - 2}
                y={targetY - 3}
                textAnchor="end"
                fontSize="8"
                fill={metric.color}
                opacity="0.8"
                fontWeight="800"
              >
                Target: {metric.format(metric.target)}
              </text>
            </g>
          )}

          {/* Animated Connecting Trend Sparkline */}
          <polyline
            fill="none"
            stroke={metric.color}
            strokeWidth="1.5"
            strokeDasharray="400"
            strokeDashoffset="0"
            points={points}
            opacity="0.3"
            style={{
              animation: 'trendDraw 1s ease-out forwards'
            }}
          />

          {/* Bars with Staggered Entrance Animation */}
          {filled.map((day, i) => {
            const val = metric.getValue(day);
            const bh = getBarH(val);
            const bx = getX(i);
            const by = getY(val);
            const bw = getBarW();
            const isToday = day.isToday;
            const isHovered = hoveredIndex === i;
            const hasData = val > 0;

            return (
              <g 
                key={`${activeMetric}_${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-transform group"
              >
                {/* Background track */}
                <rect
                  x={bx}
                  y={PAD.top}
                  width={bw}
                  height={chartH}
                  rx="6"
                  fill={isDark ? '#1e293b' : '#f1f5f9'}
                  className="transition-colors"
                />

                {/* Animated Filled Bar (if data logged) */}
                {hasData ? (
                  <rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    rx="6"
                    fill={isToday ? 'url(#grad-today)' : `url(#grad-${metric.key})`}
                    opacity={isHovered ? 1 : (isToday ? 1 : 0.85)}
                    style={{
                      transformOrigin: `${bx + bw / 2}px ${PAD.top + chartH}px`,
                      animation: `barGrowIntro 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s both`
                    }}
                  />
                ) : (
                  /* Subtle empty slot dot */
                  <circle
                    cx={bx + bw / 2}
                    cy={PAD.top + chartH - 4}
                    r="2"
                    fill={isDark ? '#334155' : '#cbd5e1'}
                  />
                )}

                {/* Today Pulsating Marker Glow if data logged */}
                {isToday && hasData && (
                  <circle
                    cx={bx + bw / 2}
                    cy={by}
                    r="3.5"
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth="1"
                    style={{ animation: 'pulseGlow 2s infinite ease-in-out' }}
                  />
                )}

                {/* Value label above bar */}
                <text
                  x={bx + bw / 2}
                  y={hasData ? by - 4 : PAD.top + chartH - 8}
                  textAnchor="middle"
                  fontSize="8"
                  fill={hasData ? (isToday ? '#f59e0b' : (isHovered ? metric.color : (isDark ? '#cbd5e1' : '#475569'))) : (isDark ? '#475569' : '#94a3b8')}
                  fontWeight={hasData && (isToday || isHovered) ? '900' : '700'}
                  className="transition-all"
                >
                  {hasData ? metric.format(val) : (isToday ? (activeMetric === 'water' ? '0L' : '0') : '--')}
                </text>

                {/* Day label */}
                <text
                  x={bx + bw / 2}
                  y={H - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isToday ? (isDark ? '#fbbf24' : '#b45309') : (isDark ? '#64748b' : '#94a3b8')}
                  fontWeight={isToday ? '900' : '700'}
                >
                  {day.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Hover Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-bold shadow-xl backdrop-blur-sm pointer-events-none flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
          >
            <span>{filled[hoveredIndex].label}:</span>
            <span className="text-emerald-400 dark:text-emerald-600 font-extrabold">
              {metric.format(metric.getValue(filled[hoveredIndex]))}
            </span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600 font-normal">
              ({Math.round((metric.getValue(filled[hoveredIndex]) / metric.target) * 100)}% of goal)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
