/**
 * ActivityProgressCard.jsx — Activity Stat Summary Card with Accessible Visual Progress Bar
 */
import React from 'react';
import { Activity } from 'lucide-react';

export function ActivityProgressCard({ title, value, subtext, icon: Icon = Activity, color = 'gold', percentage = 100 }) {
  const IconComponent = Icon || Activity;

  const colorMap = {
    gold: {
      bg: 'bg-[#D8B24C]/10',
      border: 'border-[#D8B24C]/30',
      text: 'text-[#D8B24C]',
      bar: 'bg-[#D8B24C]',
    },
    amber: {
      bg: 'bg-[#D8B24C]/10',
      border: 'border-[#D8B24C]/30',
      text: 'text-[#D8B24C]',
      bar: 'bg-[#D8B24C]',
    },
    purple: {
      bg: 'bg-[#9B6B9E]/15',
      border: 'border-[#9B6B9E]/30',
      text: 'text-[#9B6B9E]',
      bar: 'bg-[#9B6B9E]',
    },
    indigo: {
      bg: 'bg-[#9B6B9E]/15',
      border: 'border-[#9B6B9E]/30',
      text: 'text-[#9B6B9E]',
      bar: 'bg-[#9B6B9E]',
    },
    emerald: {
      bg: 'bg-[#45B982]/15',
      border: 'border-[#45B982]/30',
      text: 'text-[#45B982]',
      bar: 'bg-[#45B982]',
    },
    green: {
      bg: 'bg-[#45B982]/15',
      border: 'border-[#45B982]/30',
      text: 'text-[#45B982]',
      bar: 'bg-[#45B982]',
    },
    pink: {
      bg: 'bg-[#E8688A]/15',
      border: 'border-[#E8688A]/30',
      text: 'text-[#E8688A]',
      bar: 'bg-[#E8688A]',
    },
  };

  const scheme = colorMap[color] || colorMap.gold;

  return (
    <div className="bg-[#202020] border border-[#343434] rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg border ${scheme.bg} ${scheme.border} ${scheme.text}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider">{title}</span>
      </div>

      <div>
        <h4 className="text-2xl font-bold text-[#F5F5F0]">{value}</h4>
        <p className="text-xs text-[#A7A7A2] mt-0.5">{subtext}</p>
      </div>

      <div className="w-full bg-[#151515] h-2 rounded-full overflow-hidden border border-[#343434]">
        <div
          className={`h-full ${scheme.bar} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}
