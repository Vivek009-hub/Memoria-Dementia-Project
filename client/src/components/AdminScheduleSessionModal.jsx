/**
 * AdminScheduleSessionModal.jsx — Memora Admin Modal to Schedule Approved Community Sessions
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, ShieldCheck } from 'lucide-react';

export function AdminScheduleSessionModal({ isOpen, onClose, proposal, onSubmit, onScheduleSession }) {
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

    const submitFn = onSubmit || onScheduleSession;
    if (!submitFn) return;

    setSubmitting(true);
    try {
      const dateVal = scheduledDate || new Date().toISOString().split('T')[0];
      const timeVal = scheduledTime || '10:00 AM';
      await submitFn({
        ideaId: proposal?._id,
        title,
        date: dateVal,
        startTime: timeVal,
        scheduledAt: `${dateVal} ${timeVal}`,
        hostName,
        hostRole,
        featuredPerson: {
          name: hostName,
          role: hostRole,
        },
        maximumParticipants: Number(maxCapacity),
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
    <div className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#343434] pb-3">
          <div className="flex items-center space-x-2 text-[#45B982]">
            <Calendar className="w-5 h-5" />
            <h3 className="text-xl font-semibold text-[#F5F5F0]">Schedule Community Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
              Session Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
                Time
              </label>
              <input
                type="text"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
                Host / Speaker Name
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
                Host Role / Specialization
              </label>
              <input
                type="text"
                required
                value={hostRole}
                onChange={(e) => setHostRole(e.target.value)}
                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#A7A7A2] mb-1">
              Max Patient Capacity
            </label>
            <input
              type="number"
              min="5"
              max="100"
              required
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-full p-3 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="px-5 py-2.5 bg-[#45B982] hover:bg-[#45B982]/90 disabled:opacity-50 text-[#151515] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
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
