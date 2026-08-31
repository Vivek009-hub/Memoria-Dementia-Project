/**
 * MemoryDetailModal.jsx — Detailed View Modal for a Memory
 */

import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Edit3, Trash2, User, Image, Sparkles, AlertCircle } from 'lucide-react';

export function MemoryDetailModal({ memory, onClose, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);

  if (!memory) return null;

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-detail-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-extrabold rounded-full border border-indigo-500/30 uppercase">
              {memory.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {(memory.mediaUrl || memory.thumbnailUrl) && (
            <div className="w-full max-h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {!imageError ? (
                <img
                  src={memory.mediaUrl || memory.thumbnailUrl}
                  alt={memory.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain max-h-72"
                />
              ) : (
                <div className="p-6 flex flex-col items-center text-slate-500">
                  <Image className="w-12 h-12 mb-2" />
                  <p className="text-sm">Unable to display photo preview</p>
                </div>
              )}
            </div>
          )}

          <h2 id="memory-detail-title" className="text-2xl font-black text-white tracking-tight leading-tight">
            {memory.title}
          </h2>

          {memory.description ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
              {memory.description}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No detailed description provided.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Date</span>
                <span className="text-slate-200 font-medium">{formattedDate}</span>
              </div>
            </div>

            {memory.relatedPlace && (
              <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Location</span>
                  <span className="text-slate-200 font-medium">{memory.relatedPlace}</span>
                </div>
              </div>
            )}

            {memory.relatedPersonId && (
              <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <User className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Family Member</span>
                  <span className="text-slate-200 font-medium">
                    {typeof memory.relatedPersonId === 'object' ? memory.relatedPersonId.name : 'Linked Family Member'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {memory.tags && memory.tags.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Tags</span>
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end space-x-3">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(memory);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => {
                onClose();
                onDelete(memory);
              }}
              className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white text-sm font-bold rounded-xl border border-red-800/50 flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
