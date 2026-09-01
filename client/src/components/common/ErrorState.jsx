import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#202020] border border-[#D95C5C]/30 rounded-xl">
      <div className="p-3 bg-[#D95C5C]/10 border border-[#D95C5C]/20 rounded-lg mb-3 text-[#D95C5C]">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-[#F5F5F0]">{title}</h4>
      <p className="text-xs text-[#A7A7A2] max-w-sm mt-1 mb-4 leading-relaxed">
        {message || 'We ran into a problem loading this information.'}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
