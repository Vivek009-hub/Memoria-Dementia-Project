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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none touch-target';

  const variants = {
    primary: 'bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] shadow-xs active:scale-[0.99]',
    secondary: 'bg-[#202020] hover:bg-[#242424] text-[#F5F5F0] border border-[#343434]',
    danger: 'bg-[#D95C5C]/15 hover:bg-[#D95C5C]/25 text-[#D95C5C] border border-[#D95C5C]/40',
    outline: 'bg-transparent hover:bg-[#D8B24C]/10 text-[#D8B24C] border border-[#D8B24C]/40',
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
