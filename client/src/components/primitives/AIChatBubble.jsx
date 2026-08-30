import React from 'react';
import { Bot, User } from 'lucide-react';

export function AIChatBubble({ message, isUser = false, timestamp }) {
  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div
        className={`p-2.5 rounded-full flex-shrink-0 ${
          isUser ? 'bg-brand-600 text-white' : 'bg-slate-800 text-brand-400 border border-slate-700'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div
        className={`max-w-md p-4 rounded-3xl text-base font-medium leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-tr-none shadow-lg'
            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-xl'
        }`}
      >
        <p>{message}</p>
        {timestamp && <span className="block text-[11px] opacity-70 mt-1.5 font-semibold">{timestamp}</span>}
      </div>
    </div>
  );
}
