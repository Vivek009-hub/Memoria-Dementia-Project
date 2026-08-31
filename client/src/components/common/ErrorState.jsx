import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-950/20 border border-red-500/30 rounded-3xl">
      <div className="p-4 bg-red-500/10 rounded-2xl mb-3 text-red-400">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h4 className="text-xl font-bold text-red-300">{title}</h4>
      <p className="text-sm text-red-200/80 max-w-sm mt-1 mb-4">
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
