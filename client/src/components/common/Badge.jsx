import React from 'react';

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    neutral: 'bg-[#1E1E1E] text-[#A0A0A0] border-[#343434]',
    success: 'bg-[#8BAA78]/10 text-[#8BAA78] border-[#8BAA78]/30',
    warning: 'bg-[#DDBB55]/10 text-[#DDBB55] border-[#DDBB55]/30',
    danger: 'bg-[#C95C5C]/10 text-[#C95C5C] border-[#C95C5C]/30',
    brand: 'bg-[#DDBB55]/10 text-[#DDBB55] border-[#DDBB55]/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

