import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

export function SafetyAlert({ status = 'WARNING', message, onAction, actionLabel = 'View Safety Event' }) {
  const configs = {
    SAFE: {
      bg: 'bg-[#45B982]/10 border-[#45B982]/40 text-[#F5F5F0]',
      icon: ShieldCheck,
      iconColor: 'text-[#45B982]',
      title: '🟢 Safety Status Normal',
    },
    WARNING: {
      bg: 'bg-[#E5A83B]/10 border-[#E5A83B]/40 text-[#F5F5F0]',
      icon: AlertTriangle,
      iconColor: 'text-[#E5A83B]',
      title: '⚠️ Safety Warning',
    },
    EMERGENCY: {
      bg: 'bg-[#D95C5C]/20 border-[#D95C5C] text-[#F5F5F0]',
      icon: ShieldAlert,
      iconColor: 'text-[#D95C5C]',
      title: '🚨 EMERGENCY SOS ALERT',
    },
  };

  const config = configs[status] || configs.WARNING;
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-xl border shadow-sm space-y-3 ${config.bg}`}>
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
        <h3 className="text-lg font-bold tracking-tight">{config.title}</h3>
      </div>
      <p className="text-sm text-[#A7A7A2]">{message || 'Safety event requires caregiver attention.'}</p>
      {onAction && (
        <div className="pt-1">
          <Button variant={status === 'EMERGENCY' ? 'danger' : 'primary'} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
