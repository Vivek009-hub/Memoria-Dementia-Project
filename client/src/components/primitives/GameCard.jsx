import React from 'react';
import { Gamepad2, Play } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';

export function GameCard({ title, category, difficulty = 'MEDIUM', onPlay }) {
  return (
    <Card className="hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-400">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <StatusBadge status={difficulty} />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 font-semibold mb-6">{category || 'Cognitive Stimulation'}</p>
      {onPlay && (
        <Button variant="primary" className="w-full" onClick={onPlay}>
          <Play className="w-4 h-4 mr-2" /> Play Game
        </Button>
      )}
    </Card>
  );
}
