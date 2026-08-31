/**
 * AdminScheduleSessionModal.jsx — Modal for Admins to Schedule Approved Community Sessions
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, User, ShieldCheck } from 'lucide-react';

export function AdminScheduleSessionModal({ isOpen, onClose, proposal, onSubmit }) {
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [hostName, setHostName] = useState('Dr. Sarah Jenkins');
  const [hostRole, setHostRole] = useState('Music Therapist');
  const [maxCapacity, setMaxCapacity] = useState(25);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title || '');
    }
  }, [proposal]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ideaId: proposal?._id,
        title,
        scheduledAt: `${scheduledDate} ${scheduledTime}`,
        hostName,
        hostRole,
        maxCapacity: Number(maxCapacity),
        meetingType: 'MEETING_CIRCLE',
      });
      onClose();
    } catch {
      // Handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-xl font-black text-white">Schedule Community Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Session Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Time
              </label>
              <input
                type="text"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Host / Speaker Name
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Host Role / Specialization
              </label>
              <input
                type="text"
                required
                value={hostRole}
                onChange={(e) => setHostRole(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Max Patient Capacity
            </label>
            <input
              type="number"
              min="5"
              max="100"
              required
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-sm rounded-2xl border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish to Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
