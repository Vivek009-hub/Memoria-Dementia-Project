import React from 'react';

export function Radio({ label, description, checked, onChange, name, value, id, className = '', ...props }) {
  const inputId = id || `radio-${name}-${value}`;

  return (
    <label htmlFor={inputId} className={`flex items-start space-x-3.5 cursor-pointer touch-target py-1.5 ${className}`}>
      <input
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-6 h-6 mt-0.5 border-2 border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-950 transition-colors"
        {...props}
      />
      <div className="space-y-0.5">
        <span className="block text-base font-bold text-slate-100">{label}</span>
        {description && <p className="text-sm text-slate-400 font-medium">{description}</p>}
      </div>
    </label>
  );
}
