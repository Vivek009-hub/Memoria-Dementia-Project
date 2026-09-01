/**
 * ElderButton.jsx — Accessible Large Touch Target Button (60px+ height)
 */

import React from 'react';

export function ElderButton({ title, onClick, variant = 'primary', icon, style = {}, disabled = false, className = '' }) {
  let variantClasses = 'bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-black border-transparent';

  if (variant === 'danger') {
    variantClasses = 'bg-memora-danger hover:bg-red-600 text-white font-black border-transparent shadow-red-950/40';
  } else if (variant === 'success') {
    variantClasses = 'bg-memora-success hover:bg-emerald-600 text-white font-black border-transparent';
  } else if (variant === 'secondary' || variant === 'outline') {
    variantClasses = 'bg-memora-surface hover:bg-memora-surface-hover text-memora-text font-bold border-memora-border';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`min-h-[60px] min-w-[60px] px-6 py-4 rounded-2xl border text-lg flex items-center justify-center gap-3 w-full text-center transition-all shadow-lg active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed touch-target-xl ${variantClasses} ${className}`}
    >
      {icon && <span className="text-xl flex items-center shrink-0">{icon}</span>}
      <span>{title}</span>
    </button>
  );
}
