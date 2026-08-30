import React from 'react';

export function Switch({ label, description, checked, onChange, id, className = '' }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-center justify-between py-2 touch-target ${className}`}>
      <div className="space-y-0.5 pr-4">
        <label htmlFor={inputId} className="block text-base font-bold text-slate-100 cursor-pointer">
          {label}
        </label>
        {description && <p className="text-sm text-slate-400 font-medium">{description}</p>}
      </div>

      <button
        type="button"
        id={inputId}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
          checked ? 'bg-brand-600' : 'bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
