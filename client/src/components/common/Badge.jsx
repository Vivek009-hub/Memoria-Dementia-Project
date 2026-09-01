import React from 'react';

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    neutral: 'bg-[#151515] text-[#A7A7A2] border-[#343434]',
    success: 'bg-[#45B982]/10 text-[#45B982] border-[#45B982]/30',
    warning: 'bg-[#E5A83B]/10 text-[#E5A83B] border-[#E5A83B]/30',
    danger: 'bg-[#D95C5C]/10 text-[#D95C5C] border-[#D95C5C]/30',
    brand: 'bg-[#D8B24C]/10 text-[#D8B24C] border-[#D8B24C]/30',
    purple: 'bg-[#9B6B9E]/10 text-[#9B6B9E] border-[#9B6B9E]/30',
    pink: 'bg-[#E8688A]/10 text-[#E8688A] border-[#E8688A]/30',
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
