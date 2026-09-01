import React from 'react';

export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#E8E8E8]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-[#252525] border border-[#383838] rounded-lg text-[#E8E8E8] placeholder-[#747474] focus:outline-none focus:border-[#DDBB55] transition-colors text-sm ${
          error ? 'border-[#C95C5C] focus:border-[#C95C5C]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-[#C95C5C] mt-1">{error}</p>}
    </div>
  );
}

