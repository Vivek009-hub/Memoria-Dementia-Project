import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-bounce-short">
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-bold text-slate-100">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
