import React from 'react';

export function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-[#202020] border border-[#343434] rounded-xl p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#343434]">
          {title && <h3 className="text-lg font-semibold text-[#F5F5F0]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
