/**
 * SnoozeSkipModal.jsx — Memora Modal for Skipping/Dismissing a Reminder Occurrence
 */

import React, { useState } from 'react';
import { X, XCircle } from 'lucide-react';

export function SnoozeSkipModal({ reminder, isOpen, onClose, onConfirmSkip }) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !reminder) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const remId = reminder._id || reminder.id;
      await onConfirmSkip(remId, { note: note.trim() || undefined });
      setNote('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to skip reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skip-modal-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#343434] pb-3">
          <div className="flex items-center space-x-2 text-[#E5A83B]">
            <XCircle className="w-5 h-5" />
            <h2 id="skip-modal-title" className="text-lg font-semibold text-[#F5F5F0]">
              Skip Reminder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#A7A7A2] leading-relaxed">
          Skip this occurrence of <span className="font-semibold text-[#F5F5F0]">"{reminder.title}"</span>?
        </p>

        {errorMsg && (
          <p className="text-xs text-[#D95C5C] font-medium">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">Optional Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Taking medication later"
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#E5A83B] hover:bg-[#E5A83B]/90 text-[#151515] text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              {submitting ? 'Skipping...' : 'Confirm Skip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
