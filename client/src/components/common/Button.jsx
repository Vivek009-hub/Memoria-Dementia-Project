import React from 'react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, danger, outline
  size = 'md',        // sm, md, lg, xl
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none touch-target';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/30 border border-brand-500/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 border border-red-500/30',
    outline: 'bg-transparent hover:bg-slate-800 text-slate-200 border border-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
    xl: 'px-8 py-4 text-xl touch-target-xl',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
