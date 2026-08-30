import React from 'react';
import { Video, Calendar, User } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatDateTime } from '../../utils/dateUtils.js';

export function MeetingCard({ title, hostName, scheduledAt, status = 'SCHEDULED', onJoin }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
          <Video className="w-6 h-6" />
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        {hostName && (
          <p className="flex items-center text-sm font-semibold text-slate-400">
            <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Host: {hostName}
          </p>
        )}
        {scheduledAt && (
          <p className="flex items-center text-xs font-semibold text-slate-400">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {formatDateTime(scheduledAt)}
          </p>
        )}
      </div>

      {onJoin && (
        <Button variant="primary" className="w-full" onClick={onJoin}>
          <Video className="w-4 h-4 mr-2" /> Join Meeting Circle
        </Button>
      )}
    </Card>
  );
}
