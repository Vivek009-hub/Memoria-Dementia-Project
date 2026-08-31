/**
 * DeleteReminderDialog.jsx — Accessible Delete Confirmation Modal for Reminders
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function DeleteReminderDialog({ reminder, isOpen, onClose, onConfirmDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !reminder) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    setErrorMsg('');
    try {
      await onConfirmDelete(reminder._id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete reminder. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-reminder-title"
    >
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center space-x-3 text-red-400">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 id="delete-reminder-title" className="text-xl font-black text-white">
              Delete Reminder?
            </h2>
            <p className="text-xs text-red-300 font-semibold uppercase tracking-wider">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 text-sm">
          Are you sure you want to delete <span className="font-bold text-white">"{reminder.title}"</span>? Future occurrences will be cancelled.
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400 font-medium text-center">{errorMsg}</p>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg flex items-center space-x-2 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            <span>{deleting ? 'Deleting...' : 'Delete Reminder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
