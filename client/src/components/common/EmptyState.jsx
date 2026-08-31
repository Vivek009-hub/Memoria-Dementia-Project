import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No items found', description = 'There are no items to display at this time.', icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 border border-slate-800/60 rounded-3xl">
      <div className="p-4 bg-slate-800/80 rounded-2xl mb-4 text-slate-400">
        <Icon className="w-10 h-10" />
      </div>
      <h4 className="text-xl font-bold text-slate-200">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
