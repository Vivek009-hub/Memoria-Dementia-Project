import React from 'react';

export function Progress({ value = 0, max = 100, label, className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm font-bold text-slate-300">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
        <div
          className="bg-brand-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
