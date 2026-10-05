/**
 * AdminUI.jsx — Shared admin UI components:
 *   AdminTable, Pagination, Modal, SearchBar, FilterSelect, ConfirmModal,
 *   InlineForm, DataBadge, StatCard (admin variant), AdminSectionHeader
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Plus, AlertTriangle, Loader2, Filter } from 'lucide-react';

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spin = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  violet: 'bg-violet-100 text-violet-700',
  slate: 'bg-slate-100 text-slate-600',
};
export const ABadge = ({ label, color = 'slate' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_MAP[color] || BADGE_MAP.slate}`}>
    {label}
  </span>
);

// ── Section Header ────────────────────────────────────────────────────────────
export const AdminSectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
    <div className="flex-1 min-w-0">
      <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────────────────
export const AdminAlert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="shrink-0 mt-0.5 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>}
    </div>
  );
};

// ── Search Bar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm"
    />
    {value && (
      <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// ── Filter Select ─────────────────────────────────────────────────────────────
export const FilterSelect = ({ value, onChange, options, className = '', placeholder = 'Filter…' }) => (
  <div className={`relative ${className}`}>
    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    <select value={value} onChange={e => onChange(e.target.value)}
      className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none shadow-sm font-medium text-slate-700 min-w-[140px]">
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ── Admin Table ───────────────────────────────────────────────────────────────
export const AdminTable = ({ columns, data, loading, emptyMessage = 'No records found', rowKey = 'id' }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map(col => (
              <th key={col.key} className={`px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <Spin />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-sm text-slate-400">{emptyMessage}</td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={row[rowKey]} className="hover:bg-slate-50/70 transition-colors group">
                {columns.map(col => (
                  <td key={col.key} className={`px-5 py-3.5 ${col.cellClass || ''}`}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ── Pagination ─────────────────────────────────────────────────────────────────
export const Pagination = ({ page, pageSize, total, onChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-slate-400">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {p}
            </button>
          );
        })}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-8 px-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div ref={ref} className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

// ── Form Field ─────────────────────────────────────────────────────────────────
export const Field = ({ label, required, children, error }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-rose-500">{error}</p>}
  </div>
);

export const TextInput = ({ label, required, error, textarea, rows = 3, className = '', ...props }) => (
  <Field label={label} required={required} error={error}>
    {textarea ? (
      <textarea rows={rows} {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none ${error ? 'border-rose-300' : ''} ${className}`}
      />
    ) : (
      <input {...props}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${error ? 'border-rose-300' : ''} ${className}`}
      />
    )}
  </Field>
);

export const SelectInput = ({ label, required, error, options = [], className = '', ...props }) => (
  <Field label={label} required={required} error={error}>
    <select {...props}
      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${error ? 'border-rose-300' : ''} ${className}`}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
);

// ── Action Button ─────────────────────────────────────────────────────────────
export const ActionBtn = ({ color = 'blue', onClick, children, loading: isLoading, className = '', ...props }) => {
  const map = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200',
    rose: 'bg-rose-600 hover:bg-rose-700 text-white',
    slate: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700',
  };
  return (
    <button onClick={onClick} disabled={isLoading} {...props}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${map[color] || map.blue} ${className}`}>
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
};

// ── Icon Button ────────────────────────────────────────────────────────────────
export const IconBtn = ({ onClick, title, hoverColor = 'blue', children }) => {
  const map = { blue: 'hover:text-blue-600 hover:bg-blue-50', rose: 'hover:text-rose-600 hover:bg-rose-50', amber: 'hover:text-amber-600 hover:bg-amber-50' };
  return (
    <button onClick={onClick} title={title}
      className={`p-1.5 text-slate-400 ${map[hoverColor] || map.blue} rounded-lg transition-colors`}>
      {children}
    </button>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const AdminStatCard = ({ label, value, icon: Icon, color = 'blue', sub }) => {
  const map = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'text-violet-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', icon: 'text-rose-500' },
  };
  const c = map[color] || map.blue;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      {Icon && <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}><Icon className={`w-5 h-5 ${c.icon}`} /></div>}
      <div>
        <p className={`text-2xl font-extrabold ${c.text}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Save/Cancel footer ─────────────────────────────────────────────────────────
export const FormFooter = ({ onCancel, loading, saveLabel = 'Save' }) => (
  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
    <button type="button" onClick={onCancel}
      className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">
      Cancel
    </button>
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60">
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {saveLabel}
    </button>
  </div>
);
