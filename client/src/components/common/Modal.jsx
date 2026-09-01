import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-[#202020] border border-[#343434] rounded-xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#343434]">
          {title && <h3 className="text-lg font-semibold text-[#F5F5F0]">{title}</h3>}
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg hover:bg-[#242424] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
