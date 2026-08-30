import React from 'react';

export function TimeInput({ label, error, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-base font-bold text-slate-200">
          {label}
        </label>
      )}
      <input
        type="time"
        id={inputId}
        className={`w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 text-base focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500 transition-colors touch-target ${
          error ? 'border-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm font-semibold text-red-400 mt-1">{error}</p>}
    </div>
  );
}
