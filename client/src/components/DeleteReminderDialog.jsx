/**
 * DeleteReminderDialog.jsx — Memora Delete Confirmation Modal for Reminders
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
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-reminder-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
        <div className="flex items-center space-x-3 text-[#D95C5C]">
          <div className="p-2.5 bg-[#D95C5C]/10 rounded-lg border border-[#D95C5C]/30">
            <AlertTriangle className="w-6 h-6 text-[#D95C5C]" />
          </div>
          <div>
            <h2 id="delete-reminder-title" className="text-lg font-semibold text-[#F5F5F0]">
              Delete Reminder?
            </h2>
            <p className="text-xs text-[#D95C5C] font-medium uppercase tracking-wider">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-[#151515] p-4 rounded-lg border border-[#343434] text-[#A7A7A2] text-sm leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-[#F5F5F0]">"{reminder.title}"</span>? Future occurrences will be cancelled.
        </div>

        {errorMsg && (
          <p className="text-xs text-[#D95C5C] font-medium text-center">{errorMsg}</p>
        )}

        <div className="flex items-center justify-end space-x-3 pt-1">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-5 py-2.5 bg-[#D95C5C] hover:bg-[#D95C5C]/90 disabled:opacity-50 text-[#F5F5F0] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Deleting...' : 'Delete Reminder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
