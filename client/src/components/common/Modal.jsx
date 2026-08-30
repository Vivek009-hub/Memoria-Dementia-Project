import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          {title && <h3 className="text-xl font-bold text-slate-100">{title}</h3>}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
