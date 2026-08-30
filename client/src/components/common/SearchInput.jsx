import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({ value, onChange, onClear, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:border-brand-500 touch-target"
      />
      {value && (
        <button
          onClick={onClear || (() => onChange(''))}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
