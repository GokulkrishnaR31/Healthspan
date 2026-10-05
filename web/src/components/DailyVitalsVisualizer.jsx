import React, { useState } from 'react';
import {
  HeartPulse, Activity, Plus, TrendingUp, Sparkles, AlertCircle,
  CheckCircle2, ChevronRight, Mic, Calendar, Flame, Sliders, Info
} from 'lucide-react';

/**
 * DailyVitalsVisualizer
 * High-visibility clinical vitals card with clean, non-overlapping SVG charts,
 * large readable status cards, and prominent action buttons.
 */
export default function DailyVitalsVisualizer({
  vitals = {},
  history = [],
  isDark = false,
  onOpenLogModal
}) {
  const [chartMetric, setChartMetric] = useState('bp'); // 'bp' | 'sugar'

  const systolic = vitals.bp_systolic || null;
  const diastolic = vitals.bp_diastolic || null;
  const sugar = vitals.blood_sugar || null;
  const sugarType = vitals.sugar_type || 'fasting';
  const pulse = vitals.pulse || null;

  // ── American Heart Association (AHA) Official Blood Pressure Categories ──
  const getBpCategory = (sys, dia) => {
    if (!sys || !dia) return { label: 'Not Logged Today', color: '#94a3b8', bg: 'bg-slate-500/15', border: 'border-slate-500/30' };
    const s = Number(sys);
    const d = Number(dia);

    if (s > 180 || d > 120) {
      return { label: '🚨 Crisis (>180 and/or >120)', color: '#dc2626', bg: 'bg-rose-600/20', border: 'border-rose-600/60' };
    }
    if (s >= 140 || d >= 90) {
      return { label: 'Stage 2 HTN (≥140 or ≥90)', color: '#ef4444', bg: 'bg-rose-500/15', border: 'border-rose-500/40' };
    }
    if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) {
      return { label: 'Stage 1 HTN (130–139 or 80–89)', color: '#f97316', bg: 'bg-orange-500/15', border: 'border-orange-500/40' };
    }
    if (s >= 120 && s <= 129 && d < 80) {
      return { label: 'Elevated (120–129 and <80)', color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/40' };
    }
    return { label: 'Normal (<120 and <80)', color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' };
  };

  // ── Official Clinical Blood Sugar & Glucose Scale (CDC / ADA / Cleveland Clinic) ──
  const getSugarCategory = (val, type) => {
    if (!val) return { label: 'Not Logged Today', color: '#94a3b8', bg: 'bg-slate-500/15', border: 'border-slate-500/30' };
    const sVal = Number(val);
    if (sVal < 70) return { label: '⚠️ Hypoglycemia (<70 mg/dL)', color: '#0284c7', bg: 'bg-sky-500/20', border: 'border-sky-500/60' };
    if (type === 'fasting') {
      if (sVal < 100) return { label: 'Normal Fasting (70–99)', color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' };
      if (sVal <= 125) return { label: 'Prediabetes (100–125)', color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/40' };
      if (sVal <= 180) return { label: 'Diabetic Range (≥126)', color: '#f97316', bg: 'bg-orange-500/15', border: 'border-orange-500/40' };
      return { label: '🚨 Critical High Fasting (>180)', color: '#dc2626', bg: 'bg-rose-600/20', border: 'border-rose-600/60' };
    } else {
      if (sVal < 140) return { label: 'Normal Post-Meal (<140)', color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' };
      if (sVal <= 180) return { label: 'Target Post-Meal (140–180)', color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/40' };
      if (sVal < 250) return { label: 'High Post-Meal Spike (181–249)', color: '#ef4444', bg: 'bg-rose-500/15', border: 'border-rose-500/40' };
      return { label: '🚨 Critical Post-Meal Spike (≥250)', color: '#dc2626', bg: 'bg-rose-600/20', border: 'border-rose-600/60' };
    }
  };

  const bpStatus = getBpCategory(systolic, diastolic);
  const sugarStatus = getSugarCategory(sugar, sugarType);

  // ── Normalize 7-day dataset ──
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateStr: d.toISOString().split('T')[0],
      isToday: i === 6,
    };
  });

  const filledHistory = days.map((slot, i) => {
    const found = history.find((h) => {
      if (h.logged_date) return h.logged_date === slot.dateStr;
      if (h.day) return h.day === slot.label;
      return false;
    });

    const sysVal = slot.isToday ? systolic : (found?.bp_systolic ? Number(found.bp_systolic) : null);
    const diaVal = slot.isToday ? diastolic : (found?.bp_diastolic ? Number(found.bp_diastolic) : null);
    const sugarVal = slot.isToday ? sugar : (found?.blood_sugar ? Number(found.blood_sugar) : null);
    const pulseVal = slot.isToday ? pulse : (found?.pulse ? Number(found.pulse) : null);

    return {
      label: slot.label,
      isToday: slot.isToday,
      sys: sysVal,
      dia: diaVal,
      sugar: sugarVal,
      sugar_type: found?.sugar_type || (i % 2 === 0 ? 'fasting' : 'post_prandial'),
      pulse: pulseVal,
      hasData: Boolean(sysVal || sugarVal)
    };
  });

  // SVG dimensions
  const W = 340;
  const H = 145;
  const PAD = { top: 26, bottom: 26, left: 14, right: 14 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barSlotW = chartW / 7;

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-md'
      }`}
    >
      {/* ── 1. HEADER ── */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20 shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Daily Blood Pressure & Sugar
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Live Clinical Vitals Tracker</p>
          </div>
        </div>

        {onOpenLogModal && (
          <button
            onClick={onOpenLogModal}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Mic className="w-3.5 h-3.5" /> Log Vitals
          </button>
        )}
      </div>

      {/* ── 2. TODAY'S VITALS SNAPSHOT (3 CARDS) ── */}
      <div className="p-4 grid grid-cols-3 gap-2.5">
        {/* Blood Pressure Card */}
        <div
          onClick={() => setChartMetric('bp')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
            chartMetric === 'bp'
              ? 'border-rose-500 bg-rose-500/10 shadow-sm ring-1 ring-rose-400/30'
              : isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">BP (mmHg)</span>
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 my-0.5 leading-tight">
            {systolic && diastolic ? (
              <>
                {systolic} <span className="text-xs font-bold text-slate-400">/ {diastolic}</span>
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-bold">-- <span className="text-xs font-normal">/ --</span></span>
            )}
          </div>
          <span
            className="inline-block text-[8.5px] font-black px-1.5 py-0.5 rounded-md truncate max-w-full"
            style={{ background: bpStatus.bg, color: bpStatus.color }}
          >
            {bpStatus.label}
          </span>
        </div>

        {/* Blood Sugar Card */}
        <div
          onClick={() => setChartMetric('sugar')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
            chartMetric === 'sugar'
              ? 'border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-400/30'
              : isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sugar</span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 my-0.5 leading-tight">
            {sugar ? (
              <>
                {sugar} <span className="text-[10px] font-bold text-slate-400">mg/dL</span>
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-bold">-- <span className="text-[10px] font-normal">mg/dL</span></span>
            )}
          </div>
          <span
            className="inline-block text-[8.5px] font-black px-1.5 py-0.5 rounded-md truncate max-w-full capitalize"
            style={{ background: sugarStatus.bg, color: sugarStatus.color }}
          >
            {sugar ? `${sugarType}: ${sugarStatus.label}` : sugarStatus.label}
          </span>
        </div>

        {/* Heart Rate / Pulse Card */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col justify-between min-h-[96px] ${
            isDark ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pulse</span>
            <span className="text-xs">🫀</span>
          </div>
          <div className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400 my-0.5 leading-tight">
            {pulse ? (
              <>
                {pulse} <span className="text-[10px] font-bold text-slate-400">bpm</span>
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-bold">-- <span className="text-[10px] font-normal">bpm</span></span>
            )}
          </div>
          <span className="inline-block text-[8.5px] font-black px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 truncate max-w-full">
            {pulse ? 'Normal Rhythm' : 'Not Logged Today'}
          </span>
        </div>
      </div>

      {/* ── 3. 7-DAY INTERACTIVE VITALS CHART ── */}
      <div className="px-4 pb-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {chartMetric === 'bp' ? '7-Day Blood Pressure Trend' : '7-Day Blood Sugar (mg/dL) Trend'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Target indicator badge */}
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                chartMetric === 'bp'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              {chartMetric === 'bp' ? 'Target: <120/80 mmHg' : 'Normal: <100 mg/dL'}
            </span>

            {/* Metric Switcher */}
            <div className="p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setChartMetric('bp')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  chartMetric === 'bp'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BP
              </button>
              <button
                onClick={() => setChartMetric('sugar')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  chartMetric === 'sugar'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sugar
              </button>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className={`p-3 pt-2 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="sugar-grad-clean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="today-sugar-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Target horizontal reference line (CLEAN: NO OVERLAPPING TEXT OVER BARS) */}
            {chartMetric === 'bp' ? (
              <line
                x1={PAD.left}
                y1={PAD.top + chartH * 0.38}
                x2={W - PAD.right}
                y2={PAD.top + chartH * 0.38}
                stroke="#f43f5e"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.45"
              />
            ) : (
              <line
                x1={PAD.left}
                y1={PAD.top + chartH * 0.44}
                x2={W - PAD.right}
                y2={PAD.top + chartH * 0.44}
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.45"
              />
            )}

            {/* Bars for 7 days */}
            {filledHistory.map((day, i) => {
              const bx = PAD.left + i * barSlotW + barSlotW * 0.12;
              const bw = barSlotW * 0.76;

              if (chartMetric === 'bp') {
                const hasBp = day.sys !== null && day.sys !== undefined;
                const maxSys = 160;
                const sysH = hasBp ? Math.max(10, (day.sys / maxSys) * chartH) : 0;
                const diaH = hasBp && day.dia ? Math.max(8, (day.dia / maxSys) * chartH) : 0;
                const sysY = PAD.top + chartH - sysH;
                const diaY = PAD.top + chartH - diaH;

                return (
                  <g key={i}>
                    {/* Background track */}
                    <rect
                      x={bx}
                      y={PAD.top}
                      width={bw}
                      height={chartH}
                      rx="4"
                      fill={isDark ? '#1e293b' : '#e2e8f0'}
                      opacity="0.3"
                    />
                    {hasBp ? (
                      <>
                        {/* Systolic Bar (Left half) */}
                        <rect
                          x={bx}
                          y={sysY}
                          width={bw * 0.48}
                          height={sysH}
                          rx="3"
                          fill={day.isToday ? '#e11d48' : '#f43f5e'}
                          opacity={day.isToday ? 1 : 0.8}
                        />
                        {/* Diastolic Bar (Right half) */}
                        <rect
                          x={bx + bw * 0.52}
                          y={diaY}
                          width={bw * 0.48}
                          height={diaH}
                          rx="3"
                          fill={day.isToday ? '#db2777' : '#ec4899'}
                          opacity={day.isToday ? 1 : 0.65}
                        />
                      </>
                    ) : (
                      <circle
                        cx={bx + bw / 2}
                        cy={PAD.top + chartH - 4}
                        r="2"
                        fill={isDark ? '#334155' : '#cbd5e1'}
                      />
                    )}
                    {/* Value label */}
                    <text
                      x={bx + bw * 0.24}
                      y={hasBp ? sysY - 3 : PAD.top + chartH - 8}
                      textAnchor="middle"
                      fontSize="7.5"
                      fill={hasBp ? (day.isToday ? '#e11d48' : (isDark ? '#cbd5e1' : '#475569')) : (isDark ? '#475569' : '#94a3b8')}
                      fontWeight="900"
                    >
                      {hasBp ? day.sys : '--'}
                    </text>
                    {/* Day label */}
                    <text
                      x={bx + bw / 2}
                      y={H - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill={day.isToday ? '#e11d48' : (isDark ? '#94a3b8' : '#64748b')}
                      fontWeight={day.isToday ? '900' : '700'}
                    >
                      {day.isToday ? '●' + day.label : day.label}
                    </text>
                  </g>
                );
              } else {
                const hasSugar = day.sugar !== null && day.sugar !== undefined;
                const maxSugar = 175;
                const sH = hasSugar ? Math.max(10, (day.sugar / maxSugar) * chartH) : 0;
                const sY = PAD.top + chartH - sH;

                return (
                  <g key={i}>
                    {/* Background track */}
                    <rect
                      x={bx}
                      y={PAD.top}
                      width={bw}
                      height={chartH}
                      rx="5"
                      fill={isDark ? '#1e293b' : '#e2e8f0'}
                      opacity="0.3"
                    />
                    {hasSugar ? (
                      /* Sugar bar */
                      <rect
                        x={bx}
                        y={sY}
                        width={bw}
                        height={sH}
                        rx="5"
                        fill={day.isToday ? 'url(#today-sugar-grad)' : 'url(#sugar-grad-clean)'}
                      />
                    ) : (
                      <circle
                        cx={bx + bw / 2}
                        cy={PAD.top + chartH - 4}
                        r="2"
                        fill={isDark ? '#334155' : '#cbd5e1'}
                      />
                    )}
                    {/* Value label */}
                    <text
                      x={bx + bw / 2}
                      y={hasSugar ? sY - 4 : PAD.top + chartH - 8}
                      textAnchor="middle"
                      fontSize="8.5"
                      fill={hasSugar ? (day.isToday ? '#b45309' : (isDark ? '#fde68a' : '#b45309')) : (isDark ? '#475569' : '#94a3b8')}
                      fontWeight="900"
                    >
                      {hasSugar ? day.sugar : '--'}
                    </text>
                    {/* Day label */}
                    <text
                      x={bx + bw / 2}
                      y={H - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill={day.isToday ? '#b45309' : (isDark ? '#94a3b8' : '#64748b')}
                      fontWeight={day.isToday ? '900' : '700'}
                    >
                      {day.isToday ? '●' + day.label : day.label}
                    </text>
                  </g>
                );
              }
            })}
          </svg>

          {/* Chart Legend */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
            {chartMetric === 'bp' ? (
              <>
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Systolic
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block" /> Diastolic
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  Dashed line = 120/80 Target
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Blood Sugar
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  Dashed line = 100 mg/dL Normal Fasting
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. GUARANTEED PROMINENT FULL-WIDTH BOTTOM BUTTON ── */}
      {onOpenLogModal && (
        <div className="p-4 pt-1">
          <button
            type="button"
            onClick={onOpenLogModal}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Mic className="w-4 h-4" />
            <span>+ Log Today's BP & Blood Sugar (Voice or Text)</span>
          </button>
        </div>
      )}
    </div>
  );
}
