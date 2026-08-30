/**
 * SafetyHistory.jsx — Recent safety events list component
 */

import React from 'react';
import { History, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export function SafetyHistory({ events = [] }) {
  const recentEvents = events.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </span>
        );
      case 'ACKNOWLEDGED':
        return (
          <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full border border-sky-500/40 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Acknowledged</span>
          </span>
        );
      case 'TRIGGERED':
      case 'OPEN':
      case 'ESCALATED':
        return (
          <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/40 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>Active Alert</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-md p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg">
      <div className="flex items-center space-x-2 mb-3">
        <History className="w-6 h-6 text-indigo-400" />
        <h3 className="text-xl font-bold text-slate-100">Safety Event History</h3>
      </div>

      {recentEvents.length > 0 ? (
        <div className="space-y-2.5">
          {recentEvents.map((evt) => (
            <div
              key={evt._id}
              className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl flex items-center justify-between"
            >
              <div>
                <span className="text-base font-bold text-slate-100 block">
                  {evt.type === 'SOS' ? '🚨 SOS Alert' : evt.type === 'POSSIBLE_FALL' ? '⚠️ Possible Fall' : '📍 Geofence Exit'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(evt.triggeredAt || evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>{getStatusBadge(evt.status)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-800/40 rounded-2xl text-center text-slate-400 text-sm">
          No recent safety events.
        </div>
      )}
    </div>
  );
}
