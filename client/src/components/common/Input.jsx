import React from 'react';

export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors ${
          error ? 'border-red-500/80 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-semibold text-red-400 mt-1">{error}</p>}
    </div>
  );
}
