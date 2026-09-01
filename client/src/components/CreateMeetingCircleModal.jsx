/**
 * CreateMeetingCircleModal.jsx — Memora Form Modal to Create a Meeting Circle
 *
 * Enforces max 6 participants constraint visually and structurally.
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
        maxParticipants: 6,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151515]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-lg text-[#D8B24C]">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#F5F5F0]">
              Create Meeting Circle
            </h2>
            <p className="text-xs text-[#A7A7A2] mt-0.5">
              Start a live video gathering for up to 6 participants.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg text-xs font-medium text-[#D95C5C] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D95C5C]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider mb-1.5">
              Circle Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Music & Memories"
              maxLength={150}
              required
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] font-normal text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share what this gathering is about..."
              rows={3}
              maxLength={1000}
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider mb-2">
              Visibility & Discovery
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-3 transition-all ${
                  visibility === 'DISCOVERABLE'
                    ? 'bg-[#45B982]/10 border-[#45B982]/40 text-[#F5F5F0]'
                    : 'bg-[#151515] border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="DISCOVERABLE"
                  checked={visibility === 'DISCOVERABLE'}
                  onChange={() => setVisibility('DISCOVERABLE')}
                  className="mt-0.5 text-[#45B982] focus:ring-[#45B982]"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-semibold text-xs text-[#45B982]">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Discoverable</span>
                  </div>
                  <p className="text-[11px] text-[#A7A7A2] mt-1 leading-snug">
                    Visible to all patients in the Discover Circles tab.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start space-x-3 transition-all ${
                  visibility === 'INVITE_ONLY'
                    ? 'bg-[#D8B24C]/10 border-[#D8B24C]/40 text-[#F5F5F0]'
                    : 'bg-[#151515] border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="INVITE_ONLY"
                  checked={visibility === 'INVITE_ONLY'}
                  onChange={() => setVisibility('INVITE_ONLY')}
                  className="mt-0.5 text-[#D8B24C] focus:ring-[#D8B24C]"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-semibold text-xs text-[#D8B24C]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Invite Only</span>
                  </div>
                  <p className="text-[11px] text-[#A7A7A2] mt-1 leading-snug">
                    Private circle accessible only to invited peers.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="p-3 bg-[#151515] border border-[#343434] rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#A7A7A2] text-xs font-medium">
              <Users className="w-4 h-4 text-[#D8B24C]" />
              <span>Maximum Capacity</span>
            </div>
            <span className="px-2.5 py-0.5 bg-[#D8B24C]/10 border border-[#D8B24C]/30 text-[#D8B24C] text-xs font-semibold rounded-md">
              6 Participants Max
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-2 touch-target"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Circle...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
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
