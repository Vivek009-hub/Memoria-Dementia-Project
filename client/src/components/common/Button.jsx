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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none touch-target';

  const variants = {
    primary: 'bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] shadow-sm',
    secondary: 'bg-[#252525] hover:bg-[#2A2A2A] text-[#E8E8E8] border border-[#343434]',
    danger: 'bg-[#C95C5C] hover:bg-[#D96C6C] text-[#FFFFFF]',
    outline: 'bg-transparent hover:bg-[#252525] text-[#E8E8E8] border border-[#343434]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}

