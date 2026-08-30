import React from 'react';

export function PageHeader({ title, description, action, badge }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-800/80 gap-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-base text-slate-400 font-medium">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
