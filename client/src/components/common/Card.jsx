import React from 'react';

export function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          {title && <h3 className="text-xl font-bold text-slate-100">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
