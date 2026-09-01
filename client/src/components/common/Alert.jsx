import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function Alert({ title, children, variant = 'info', className = '' }) {
  const configs = {
    info: {
      bg: 'bg-[#D8B24C]/10 border-[#D8B24C]/30 text-[#F5F5F0]',
      icon: Info,
      iconColor: 'text-[#D8B24C]',
    },
    success: {
      bg: 'bg-[#45B982]/10 border-[#45B982]/30 text-[#F5F5F0]',
      icon: CheckCircle2,
      iconColor: 'text-[#45B982]',
    },
    warning: {
      bg: 'bg-[#E5A83B]/10 border-[#E5A83B]/30 text-[#F5F5F0]',
      icon: AlertTriangle,
      iconColor: 'text-[#E5A83B]',
    },
    danger: {
      bg: 'bg-[#D95C5C]/10 border-[#D95C5C]/30 text-[#F5F5F0]',
      icon: AlertCircle,
      iconColor: 'text-[#D95C5C]',
    },
  };

  const config = configs[variant] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start space-x-3.5 p-4 rounded-xl border ${config.bg} ${className}`} role="alert">
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="space-y-0.5 flex-1">
        {title && <h4 className="text-sm font-semibold">{title}</h4>}
        <div className="text-sm leading-relaxed text-[#A7A7A2]">{children}</div>
      </div>
    </div>
  );
}
