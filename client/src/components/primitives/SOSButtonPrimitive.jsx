import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function SOSButtonPrimitive({ onTrigger, loading = false, disabled = false }) {
  return (
    <button
      onClick={onTrigger}
      disabled={disabled || loading}
      className="w-44 h-44 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-2xl shadow-2xl shadow-red-950/80 border-4 border-red-400 flex flex-col items-center justify-center space-y-2 transform active:scale-95 transition-all touch-target animate-pulse disabled:opacity-50 disabled:pointer-events-none"
    >
      <ShieldAlert className="w-12 h-12" />
      <span>EMERGENCY SOS</span>
    </button>
  );
}
