import React from 'react';
import { Loader2 } from 'lucide-react';

// ─── Stat Card ─────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, unit = '', icon: Icon, color = 'violet', trend }) => {
  const colors = {
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`p-2 rounded-xl border ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 leading-none">
          {value ?? <span className="text-slate-300">—</span>}
          {value != null && unit && <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>}
        </p>
        {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
      </div>
    </div>
  );
};

// ─── Progress Bar ───────────────────────────────────────────────────────────
export const NutrientBar = ({ label, current, goal, unit, color = 'bg-violet-500' }) => {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const over = goal > 0 && current > goal;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`text-xs font-semibold ${over ? 'text-rose-500' : 'text-slate-500'}`}>
          {(current || 0).toFixed(1)} / {goal} {unit}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-rose-400' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Alert Banner ──────────────────────────────────────────────────────────
export const AlertBanner = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  );
};

// ─── Loading Spinner ───────────────────────────────────────────────────────
export const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 gap-3">
    {Icon && <Icon className="w-12 h-12 text-slate-300" />}
    <p className="text-base font-semibold text-slate-600">{title}</p>
    {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ─── Section Header ────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
    <div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Pill Badge ────────────────────────────────────────────────────────────
export const Badge = ({ label, color = 'violet' }) => {
  const colors = {
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color]}`}>
      {label}
    </span>
  );
};

// ─── Score Ring ────────────────────────────────────────────────────────────
export const ScoreRing = ({ value, size = 120, strokeWidth = 10, label = 'Score' }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(value, 1));
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="text-center -mt-2" style={{ marginTop: `-${size / 2 + 8}px`, position: 'relative' }}>
        <p className="text-2xl font-extrabold" style={{ color }}>{pct}%</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
};

// ─── Card ──────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', padding = 'p-6' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 ${padding} ${className}`}>
    {children}
  </div>
);

// ─── Primary Button ────────────────────────────────────────────────────────
export const PrimaryButton = ({ children, onClick, loading, disabled, type = 'button', className = '', size = 'md' }) => {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// ─── Ghost Button ──────────────────────────────────────────────────────────
export const GhostButton = ({ children, onClick, className = '', size = 'md' }) => {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-2 font-medium rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

// ─── Input ─────────────────────────────────────────────────────────────────
export const Input = ({ label, type = 'text', value, onChange, placeholder, required, step, min, max, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      required={required} step={step} min={min} max={max}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
    />
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────────
export const Select = ({ label, value, onChange, options, className = '' }) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
    <select
      value={value} onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
