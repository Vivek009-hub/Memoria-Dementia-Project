import React from 'react';

export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#F5F5F0]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-[#202020] border border-[#343434] rounded-lg text-[#F5F5F0] placeholder-[#74746F] focus:outline-none focus:border-[#D8B24C] focus:ring-1 focus:ring-[#D8B24C] transition-colors text-sm ${
          error ? 'border-[#D95C5C] focus:border-[#D95C5C] focus:ring-[#D95C5C]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-[#D95C5C] mt-1">{error}</p>}
    </div>
  );
}
