import React from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatTime } from '../../utils/dateUtils.js';

export function ReminderCard({ title, time, status = 'PENDING', onComplete, onSnooze }) {
  return (
    <Card className="hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            {time && (
              <span className="flex items-center text-sm font-semibold text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {formatTime(time)}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === 'PENDING' && (onComplete || onSnooze) && (
        <div className="flex items-center space-x-3 pt-4 border-t border-slate-800/80">
          {onComplete && (
            <Button variant="primary" size="sm" className="flex-1" onClick={onComplete}>
              <Check className="w-4 h-4 mr-1.5" /> Mark Done
            </Button>
          )}
          {onSnooze && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onSnooze}>
              Snooze
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
