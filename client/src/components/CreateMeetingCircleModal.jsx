/**
 * CreateMeetingCircleModal.jsx — Modal Form to Create a Meeting Circle
 *
 * Enforces max 6 participants maximum constraint visually and structurally.
 */

import React, { useState } from 'react';
import { X, Users, Globe, Lock, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

export function CreateMeetingCircleModal({ isOpen, onClose, onCreateSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('DISCOVERABLE');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Circle name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onCreateSuccess({
        name: name.trim(),
        description: description.trim(),
        visibility,
        maxParticipants: 6, // Always hardlocked to 6
      });
      setName('');
      setDescription('');
      setVisibility('DISCOVERABLE');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create meeting circle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Create Meeting Circle
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Start a video gathering for up to 6 participants.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs font-bold text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Circle Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Circle Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Music & Memories"
              maxLength={150}
              required
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share what this gathering is about..."
              rows={3}
              maxLength={1000}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Visibility Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Visibility & Discovery
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  visibility === 'DISCOVERABLE'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="DISCOVERABLE"
                  checked={visibility === 'DISCOVERABLE'}
                  onChange={() => setVisibility('DISCOVERABLE')}
                  className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-emerald-300">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Discoverable</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Visible to all patients in the Discover Circles tab.
                  </p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-start space-x-3 transition-all ${
                  visibility === 'INVITE_ONLY'
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="INVITE_ONLY"
                  checked={visibility === 'INVITE_ONLY'}
                  onChange={() => setVisibility('INVITE_ONLY')}
                  className="mt-0.5 text-indigo-500 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-indigo-300">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Invite Only</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Private circle accessible only to invited peers.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Maximum Participants Display (Locked at 6) */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Maximum Capacity</span>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black rounded-xl">
              6 Participants Max
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 touch-target-xl"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Circle...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Circle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
