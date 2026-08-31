import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export function VoiceButton({ isListening = false, onClick, label = 'Voice Assistant' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center space-x-3 px-6 py-4 rounded-3xl font-extrabold text-lg transition-all touch-target ${
        isListening
          ? 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/50 animate-pulse'
          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-950/50'
      }`}
    >
      {isListening ? <MicOff className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
      <span>{isListening ? 'Listening...' : label}</span>
    </button>
  );
}
