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

export function MemoryCard({ memory, onSelect }) {
  const [imageError, setImageError] = useState(false);

  const TypeIcon = TYPE_ICONS[memory.type] || Sparkles;
  const hasAudioNote = Boolean(memory.voiceNote?.audioUrl || memory.audioUrl);

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
      className="group relative bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-3.5 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
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
        {/* Photo Container */}
        <div className="w-full h-48 bg-[#151515] rounded-lg overflow-hidden mb-3 border border-[#343434] relative flex items-center justify-center">
          {memory.mediaUrl || memory.thumbnailUrl ? (
            !imageError ? (
              <img
                src={memory.thumbnailUrl || memory.mediaUrl}
                alt={memory.title || 'Memory photo'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#74746F] p-4">
                <Image className="w-8 h-8 mb-1 stroke-1" />
                <span className="text-xs">Photo unavailable</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-[#74746F] p-4">
              <TypeIcon className="w-10 h-10 stroke-1 text-[#74746F] mb-1" />
              <span className="text-xs uppercase font-medium tracking-wider text-[#A7A7A2]">{memory.type}</span>
            </div>
          )}

          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1B1B1B]/90 text-[#F5F5F0] border border-[#343434] flex items-center space-x-1.5 backdrop-blur-xs">
            <TypeIcon className="w-3 h-3 text-[#D8B24C]" />
            <span className="capitalize">{memory.type?.toLowerCase()}</span>
          </div>

          {hasAudioNote && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#8B5CF6]/90 text-white border border-[#8B5CF6]/40 flex items-center space-x-1 backdrop-blur-xs shadow-xs">
              <Mic className="w-3 h-3" />
              <span>Voice Note</span>
            </div>
          )}
        </div>

        {/* Memory Info */}
        <h3 className="text-base font-semibold text-[#F5F5F0] mb-1 line-clamp-1 group-hover:text-[#D8B24C] transition-colors">
          {memory.title}
        </h3>

        {memory.description && (
          <p className="text-xs text-[#A7A7A2] line-clamp-2 mb-3 leading-relaxed">
            {memory.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-[#A7A7A2] mb-2">
          {formattedDate && (
            <div className="flex items-center space-x-1.5 bg-[#151515] px-2 py-0.5 rounded-md border border-[#343434]">
              <Calendar className="w-3 h-3 text-[#D8B24C]" />
              <span>{formattedDate}</span>
            </div>
          )}
          {memory.relatedPlace && (
            <div className="flex items-center space-x-1.5 bg-[#151515] px-2 py-0.5 rounded-md border border-[#343434] line-clamp-1">
              <MapPin className="w-3 h-3 text-[#D8B24C]" />
              <span>{memory.relatedPlace}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2.5 mt-1 border-t border-[#343434] flex items-center justify-between text-[#D8B24C] font-medium text-xs">
        <span>View Memory</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
