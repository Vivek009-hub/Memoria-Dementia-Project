import React from 'react';

export function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toUpperCase();

  const configs = {
    ACTIVE: { label: 'Active', variant: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    COMPLETED: { label: 'Completed', variant: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
    PENDING: { label: 'Pending', variant: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    SCHEDULED: { label: 'Scheduled', variant: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
    RESOLVED: { label: 'Resolved', variant: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    CANCELLED: { label: 'Cancelled', variant: 'bg-slate-800 text-slate-400 border-slate-700' },
    SAFE: { label: '🟢 Safe', variant: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    WARNING: { label: '⚠️ Warning', variant: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    EMERGENCY: { label: '🚨 Emergency SOS', variant: 'bg-red-500/20 text-red-300 border-red-500/50' },
  };

  const config = configs[normalized] || { label: status || 'Unknown', variant: 'bg-slate-800 text-slate-300 border-slate-700' };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${config.variant} ${className}`}
    >
      {config.label}
    </span>
  );
}
