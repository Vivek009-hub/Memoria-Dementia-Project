import React from 'react';
import { Users, ThumbsUp } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';

export function SessionCard({ title, description, votes = 0, onVote, onRegister, isRegistered }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
          <Users className="w-6 h-6" />
        </div>
        {onVote && (
          <button
            onClick={onVote}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-sky-400" />
            <span>{votes} Votes</span>
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        {description && <p className="text-sm text-slate-400 font-medium mt-1">{description}</p>}
      </div>

      {onRegister && (
        <Button
          variant={isRegistered ? 'secondary' : 'primary'}
          className="w-full"
          onClick={onRegister}
        >
          {isRegistered ? 'Registered ✓' : 'Register for Session'}
        </Button>
      )}
    </Card>
  );
}
