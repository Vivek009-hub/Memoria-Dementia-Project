/**
 * SnoozeSkipModal.jsx — Modal for Skipping/Dismissing a Reminder Occurrence
 */

import React, { useState } from 'react';
import { X, XCircle, AlertCircle } from 'lucide-react';

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
      await onConfirmSkip(reminder._id, { note: note.trim() || undefined });
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skip-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <XCircle className="w-6 h-6" />
            <h2 id="skip-modal-title" className="text-xl font-black text-white">
              Skip Reminder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300">
          Skip this occurrence of <span className="font-bold text-white">"{reminder.title}"</span>?
        </p>

        {errorMsg && (
          <p className="text-xs text-red-400 font-bold">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Optional Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Taking medication later"
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-extrabold rounded-xl shadow-md"
            >
              {submitting ? 'Skipping...' : 'Confirm Skip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
