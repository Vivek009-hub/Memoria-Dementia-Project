import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

export function SafetyAlert({ status = 'WARNING', message, onAction, actionLabel = 'View Safety Event' }) {
  const configs = {
    SAFE: {
      bg: 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      title: '🟢 Safety Status Normal',
    },
    WARNING: {
      bg: 'bg-amber-950/80 border-amber-500/80 text-amber-100',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      title: '⚠️ Safety Warning',
    },
    EMERGENCY: {
      bg: 'bg-red-950/90 border-red-500 text-red-100 animate-pulse',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      title: '🚨 EMERGENCY SOS ALERT',
    },
  };

  const config = configs[status] || configs.WARNING;
  const Icon = config.icon;

  return (
    <div className={`p-6 rounded-3xl border-2 shadow-2xl space-y-4 ${config.bg}`}>
      <div className="flex items-center space-x-3">
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
        <h3 className="text-xl font-extrabold tracking-tight">{config.title}</h3>
      </div>
      <p className="text-base font-semibold">{message || 'Safety event requires caregiver attention.'}</p>
      {onAction && (
        <div className="pt-2">
          <Button variant={status === 'EMERGENCY' ? 'danger' : 'primary'} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
