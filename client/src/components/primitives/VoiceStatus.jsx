import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function VoiceStatus({ isSpeaking = false, text = '' }) {
  if (!text) return null;

  return (
    <div className="flex items-center space-x-3 p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-indigo-200 text-sm font-medium">
      {isSpeaking ? (
        <Volume2 className="w-5 h-5 text-indigo-400 animate-bounce flex-shrink-0" />
      ) : (
        <VolumeX className="w-5 h-5 text-slate-500 flex-shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}
