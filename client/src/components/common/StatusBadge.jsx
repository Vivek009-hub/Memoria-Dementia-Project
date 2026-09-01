import React from 'react';

export function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toUpperCase();

  const configs = {
    ACTIVE: { label: 'Active', variant: 'bg-[#45B982]/10 text-[#45B982] border-[#45B982]/30' },
    COMPLETED: { label: 'Completed', variant: 'bg-[#45B982]/10 text-[#45B982] border-[#45B982]/30' },
    PENDING: { label: 'Pending', variant: 'bg-[#E5A83B]/10 text-[#E5A83B] border-[#E5A83B]/30' },
    SCHEDULED: { label: 'Scheduled', variant: 'bg-[#D8B24C]/10 text-[#D8B24C] border-[#D8B24C]/30' },
    RESOLVED: { label: 'Resolved', variant: 'bg-[#45B982]/10 text-[#45B982] border-[#45B982]/30' },
    CANCELLED: { label: 'Cancelled', variant: 'bg-[#202020] text-[#74746F] border-[#343434]' },
    SAFE: { label: '🟢 Safe', variant: 'bg-[#45B982]/10 text-[#45B982] border-[#45B982]/30' },
    WARNING: { label: '⚠️ Warning', variant: 'bg-[#E5A83B]/10 text-[#E5A83B] border-[#E5A83B]/30' },
    EMERGENCY: { label: '🚨 Emergency SOS', variant: 'bg-[#D95C5C]/20 text-[#D95C5C] border-[#D95C5C]/50' },
  };

  const config = configs[normalized] || { label: status || 'Unknown', variant: 'bg-[#202020] text-[#A7A7A2] border-[#343434]' };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.variant} ${className}`}
    >
      {config.label}
    </span>
  );
}
