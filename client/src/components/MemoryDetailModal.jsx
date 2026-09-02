import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Edit3, Trash2, User, Image, Mic } from 'lucide-react';
import { VoiceNotePlayer } from './VoiceNotePlayer.jsx';

export function MemoryDetailModal({ memory, onClose, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);

  if (!memory) return null;

  const audioTargetUrl = memory.voiceNote?.audioUrl || memory.audioUrl;
  const audioDurationVal = memory.voiceNote?.duration || memory.audioDuration || 0;

  let formattedDate = 'Not specified';
  if (memory.importantDate) {
    try {
      const d = new Date(memory.importantDate);
      if (!isNaN(d.getTime())) {
        if (memory.datePrecision === 'year') {
          formattedDate = d.getFullYear().toString();
        } else if (memory.datePrecision === 'month') {
          formattedDate = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        } else {
          formattedDate = d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        }
      }
    } catch {
      formattedDate = 'Not specified';
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-detail-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#343434] bg-[#1B1B1B]">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-[#D8B24C]/10 text-[#D8B24C] text-xs font-semibold rounded-md border border-[#D8B24C]/30 uppercase">
              {memory.type}
            </span>
            {audioTargetUrl && (
              <span className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-semibold rounded-md border border-[#8B5CF6]/30 flex items-center space-x-1">
                <Mic className="w-3 h-3" />
                <span>Voice Note</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {(memory.mediaUrl || memory.thumbnailUrl) && (
            <div className="w-full max-h-72 bg-[#151515] rounded-lg overflow-hidden border border-[#343434] flex items-center justify-center">
              {!imageError ? (
                <img
                  src={memory.mediaUrl || memory.thumbnailUrl}
                  alt={memory.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain max-h-72"
                />
              ) : (
                <div className="p-6 flex flex-col items-center text-[#74746F]">
                  <Image className="w-12 h-12 mb-2 stroke-1" />
                  <p className="text-xs">Unable to display photo preview</p>
                </div>
              )}
            </div>
          )}

          <h2 id="memory-detail-title" className="text-2xl font-semibold text-[#F5F5F0] tracking-tight leading-tight">
            {memory.title}
          </h2>

          {memory.description ? (
            <div className="bg-[#151515] p-4 rounded-lg border border-[#343434] text-[#F5F5F0] text-sm leading-relaxed whitespace-pre-wrap">
              {memory.description}
            </div>
          ) : (
            <p className="text-xs text-[#74746F] italic">No detailed description provided.</p>
          )}

          {/* Voice Note Player */}
          {audioTargetUrl && (
            <VoiceNotePlayer audioUrl={audioTargetUrl} duration={audioDurationVal} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-3 p-3 bg-[#151515] rounded-lg border border-[#343434]">
              <Calendar className="w-4 h-4 text-[#D8B24C] shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-[#74746F] uppercase block">Date</span>
                <span className="text-[#F5F5F0] font-medium">{formattedDate}</span>
              </div>
            </div>

            {memory.relatedPlace && (
              <div className="flex items-center space-x-3 p-3 bg-[#151515] rounded-lg border border-[#343434]">
                <MapPin className="w-4 h-4 text-[#D8B24C] shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-[#74746F] uppercase block">Location</span>
                  <span className="text-[#F5F5F0] font-medium">{memory.relatedPlace}</span>
                </div>
              </div>
            )}

            {memory.relatedPersonId && (
              <div className="flex items-center space-x-3 p-3 bg-[#151515] rounded-lg border border-[#343434]">
                <User className="w-4 h-4 text-[#45B982] shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold text-[#74746F] uppercase block">Family Member</span>
                  <span className="text-[#F5F5F0] font-medium">
                    {typeof memory.relatedPersonId === 'object' ? memory.relatedPersonId.name : 'Linked Family Member'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {memory.tags && memory.tags.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-2">Tags</span>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#151515] text-[#A7A7A2] text-xs font-medium rounded-md border border-[#343434] flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3 text-[#74746F]" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#343434] bg-[#1B1B1B] flex items-center justify-end space-x-3">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(memory);
              }}
              className="px-4 py-2 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] flex items-center space-x-2 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => {
                onClose();
                onDelete(memory);
              }}
              className="px-4 py-2 bg-[#D95C5C]/10 hover:bg-[#D95C5C]/20 text-[#D95C5C] text-xs font-semibold rounded-lg border border-[#D95C5C]/30 flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
