import React from 'react';
import { Heart, Calendar } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { formatDate } from '../../utils/dateUtils.js';

export function MemoryCard({ title, date, description, imageUrl, relationship }) {
  return (
    <Card className="overflow-hidden p-0 border border-slate-800">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-32 bg-slate-800/80 flex items-center justify-center text-slate-500">
          <Heart className="w-10 h-10" />
        </div>
      )}
      <div className="p-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold px-2.5 py-1 bg-brand-500/10 text-brand-300 rounded-full border border-brand-500/30">
            {relationship || 'Memory Log'}
          </span>
          {date && (
            <span className="flex items-center text-xs font-semibold text-slate-400">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formatDate(date)}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        {description && <p className="text-sm text-slate-400 font-medium line-clamp-3">{description}</p>}
      </div>
    </Card>
  );
}
