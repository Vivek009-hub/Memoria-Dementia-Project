import React from 'react';

export function Progress({ value = 0, max = 100, label, className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs font-semibold text-[#A7A7A2]">
          <span>{label}</span>
          <span className="text-[#D8B24C]">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-[#151515] rounded-full h-2 overflow-hidden border border-[#343434]">
        <div
          className="bg-[#D8B24C] h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
