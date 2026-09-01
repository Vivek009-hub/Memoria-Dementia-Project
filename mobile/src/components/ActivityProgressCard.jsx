/**
 * ActivityProgressCard.jsx — Activity Stat Summary Card with Accessible Visual Progress Bar
 */

import React from 'react';

export function ActivityProgressCard({ title, value, subtext, icon: Icon, color = 'indigo', percentage = 100 }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-600/20',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      bar: 'bg-indigo-500',
    },
    amber: {
      bg: 'bg-amber-600/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-600/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
    },
    purple: {
      bg: 'bg-purple-600/20',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      bar: 'bg-purple-500',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-memora-surface border border-memora-border rounded-3xl p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${scheme.bg} ${scheme.border} ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-black text-memora-text-muted uppercase tracking-wider">{title}</span>
      </div>

      <div>
        <h4 className="text-2xl font-black text-memora-text">{value}</h4>
        <p className="text-xs text-memora-text-muted mt-0.5">{subtext}</p>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-memora-surface-secondary h-2 rounded-full overflow-hidden border border-memora-border">
        <div
          className={`h-full ${scheme.bar} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}
