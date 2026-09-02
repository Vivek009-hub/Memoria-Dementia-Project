import React, { useState } from 'react';
import { Image, Heart, MapPin, Calendar, User, BookOpen, Camera, Sparkles, ChevronRight, Mic } from 'lucide-react';

const TYPE_ICONS = {
  PHOTO: Camera,
  PERSON: User,
  PLACE: MapPin,
  STORY: BookOpen,
  EVENT: Calendar,
  OBJECT: Heart,
};

const TYPE_COLOR_MAP = {
  PHOTO: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  PERSON: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PLACE: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  STORY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  EVENT: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  OBJECT: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export function MemoryCard({ memory, onSelect }) {
  const [imageError, setImageError] = useState(false);

  const TypeIcon = TYPE_ICONS[memory.type] || Sparkles;
  const badgeStyle = TYPE_COLOR_MAP[memory.type] || 'bg-slate-800 text-slate-300 border-slate-700';
  const hasAudioNote = Boolean(memory.voiceNote?.audioUrl || memory.audioUrl);

  // Format date display
  let formattedDate = null;
  if (memory.importantDate) {
    try {
      const d = new Date(memory.importantDate);
      if (!isNaN(d.getTime())) {
        if (memory.datePrecision === 'year') {
          formattedDate = d.getFullYear().toString();
        } else if (memory.datePrecision === 'month') {
          formattedDate = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        } else {
          formattedDate = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
    } catch {
      formattedDate = null;
    }
  }

  return (
    <div
      onClick={() => onSelect && onSelect(memory)}
      className="group relative bg-memora-surface border border-memora-border hover:border-memora-accent/50 rounded-2xl p-4 shadow-lg transition-all cursor-pointer flex flex-col justify-between"
      role="button"
      tabIndex={0}
      aria-label={`Open memory: ${memory.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect && onSelect(memory);
        }
      }}
    >
      <div>
        {/* Media Thumbnail Container */}
        <div className="w-full h-44 bg-memora-surface-secondary rounded-xl overflow-hidden mb-3 border border-memora-border relative flex items-center justify-center">
          {memory.mediaUrl || memory.thumbnailUrl ? (
            !imageError ? (
              <img
                src={memory.thumbnailUrl || memory.mediaUrl}
                alt={memory.title || 'Memory photo'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-memora-text-muted p-4">
                <Image className="w-10 h-10 mb-1 stroke-1" />
                <span className="text-xs">Photo unavailable</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-memora-text-muted p-4">
              <TypeIcon className="w-12 h-12 stroke-1 text-memora-text-subtle mb-1" />
              <span className="text-xs uppercase font-bold tracking-wider text-memora-text-subtle">{memory.type}</span>
            </div>
          )}

          {hasAudioNote && (
            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#8B5CF6]/90 text-white border border-[#8B5CF6]/40 flex items-center space-x-1 backdrop-blur-xs shadow-md">
              <Mic className="w-3 h-3" />
              <span>Voice Note</span>
            </div>
          )}

          {/* Type Badge Floating Overlay */}
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 backdrop-blur-md ${badgeStyle}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{memory.type}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-memora-text mb-1 line-clamp-1 group-hover:text-memora-accent transition-colors">
          {memory.title}
        </h3>

        {/* Short Description */}
        {memory.description && (
          <p className="text-sm text-memora-text-muted line-clamp-2 mb-3 leading-relaxed">
            {memory.description}
          </p>
        )}

        {/* Metadata pills (Date, Place) */}
        <div className="flex flex-wrap gap-2 text-xs text-memora-text-muted mb-2">
          {formattedDate && (
            <div className="flex items-center space-x-1 bg-memora-surface-secondary px-2 py-1 rounded-md border border-memora-border">
              <Calendar className="w-3 h-3 text-memora-text-subtle" />
              <span>{formattedDate}</span>
            </div>
          )}
          {memory.relatedPlace && (
            <div className="flex items-center space-x-1 bg-memora-surface-secondary px-2 py-1 rounded-md border border-memora-border line-clamp-1">
              <MapPin className="w-3 h-3 text-memora-text-subtle" />
              <span>{memory.relatedPlace}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Open Button */}
      <div className="pt-2 border-t border-memora-border flex items-center justify-between text-memora-accent font-bold text-sm">
        <span>View Details</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
