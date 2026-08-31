import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function Alert({ title, children, variant = 'info', className = '' }) {
  const configs = {
    info: {
      bg: 'bg-blue-950/40 border-blue-500/40 text-blue-200',
      icon: Info,
      iconColor: 'text-blue-400',
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    danger: {
      bg: 'bg-red-950/40 border-red-500/40 text-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-400',
    },
  };

  const config = configs[variant] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start space-x-3.5 p-4 rounded-2xl border ${config.bg} ${className}`} role="alert">
      <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="space-y-0.5 flex-1">
        {title && <h4 className="text-base font-extrabold">{title}</h4>}
        <div className="text-sm font-medium leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
