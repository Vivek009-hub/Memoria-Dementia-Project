import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No items found', description = 'There are no items to display at this time.', icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#202020] border border-[#343434] rounded-xl">
      <div className="p-3 bg-[#151515] border border-[#343434] rounded-lg mb-3 text-[#D8B24C]">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-[#F5F5F0]">{title}</h4>
      <p className="text-xs text-[#A7A7A2] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
