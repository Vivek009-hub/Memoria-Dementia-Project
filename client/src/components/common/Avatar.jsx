import React from 'react';

export function Avatar({ name = '', src = null, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-brand-700 text-white font-extrabold flex-shrink-0 border-2 border-slate-700 ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
