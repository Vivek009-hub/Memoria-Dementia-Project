/**
 * CreateEditReminderModal.jsx — Memora Create/Edit Reminder Form Modal
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Clock, Pill, Utensils, Calendar, Activity, Gift } from 'lucide-react';

const REMINDER_TYPES = [
  { id: 'MEDICATION', label: 'Medication', icon: Pill },
  { id: 'MEAL', label: 'Meal', icon: Utensils },
  { id: 'APPOINTMENT', label: 'Appointment', icon: Calendar },
  { id: 'ACTIVITY', label: 'Activity', icon: Activity },
  { id: 'BIRTHDAY', label: 'Birthday', icon: Gift },
  { id: 'IMPORTANT_EVENT', label: 'Event', icon: Clock },
  { id: 'OTHER', label: 'Other', icon: Clock },
];

const WEEKDAYS = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

export function CreateEditReminderModal({ reminder, isOpen, onClose, onSave }) {
  const isEditing = Boolean(reminder && reminder._id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('MEDICATION');
  const [time, setTime] = useState('08:00');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
  );
  const [recurrenceFreq, setRecurrenceFreq] = useState('');
  const [selectedWeekdays, setSelectedWeekdays] = useState([1, 2, 3, 4, 5]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title || '');
      setDescription(reminder.description || '');
      setType(reminder.type || 'MEDICATION');
      setTime(reminder.schedule?.time || '08:00');
      setTimezone(reminder.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');
      setVoiceEnabled(Boolean(reminder.voiceEnabled));

      if (reminder.recurrence) {
        setRecurrenceFreq(reminder.recurrence.frequency || 'DAILY');
        setSelectedWeekdays(reminder.recurrence.weekdays || [0, 1, 2, 3, 4, 5, 6]);
      } else {
        setRecurrenceFreq('');
        setSelectedWeekdays([1, 2, 3, 4, 5]);
      }
    } else {
      setTitle('');
      setDescription('');
      setType('MEDICATION');
      setTime('08:00');
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');
      setRecurrenceFreq('');
      setSelectedWeekdays([1, 2, 3, 4, 5]);
      setVoiceEnabled(false);
    }
    setErrorMsg('');
  }, [reminder, isOpen]);

  if (!isOpen) return null;

  const toggleWeekday = (dayId) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim()) {
      setErrorMsg('Please enter a title for this reminder.');
      return;
    }

    if (title.length > 200) {
      setErrorMsg('Title cannot exceed 200 characters.');
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      setErrorMsg('Time must be in HH:MM 24-hour format.');
      return;
    }

    if (recurrenceFreq === 'WEEKLY' && selectedWeekdays.length === 0) {
      setErrorMsg('Please select at least one day of the week for weekly recurrence.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const isOneTime = !recurrenceFreq;
    const now = new Date();
    const [h, m] = time.split(':').map(Number);
    const startAtDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    if (startAtDate < now) {
      startAtDate.setDate(startAtDate.getDate() + 1);
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      timezone: timezone.trim(),
      schedule: {
        time,
        startAt: isOneTime ? startAtDate.toISOString() : undefined,
      },
      recurrence: recurrenceFreq
        ? {
            frequency: recurrenceFreq,
            interval: 1,
            weekdays: recurrenceFreq === 'WEEKLY' ? selectedWeekdays : [],
          }
        : null,
      voiceEnabled,
    };

    try {
      await onSave(payload, reminder?._id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save reminder. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#343434] bg-[#1B1B1B]">
          <h2 id="modal-title" className="text-xl font-semibold text-[#F5F5F0] flex items-center space-x-2">
            <span>{isEditing ? '✏️ Edit Reminder' : '⏰ Add Reminder'}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-4 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg flex items-start space-x-3 text-[#D95C5C] text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-[#D95C5C] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Reminder Title <span className="text-[#D95C5C]">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Take morning heart medication"
              className="w-full p-3.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Reminder Category <span className="text-[#D95C5C]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REMINDER_TYPES.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      isSelected
                        ? 'bg-[#D8B24C] border-[#D8B24C] text-[#151515] shadow-xs'
                        : 'bg-[#151515] border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                Time (24-Hour) <span className="text-[#D95C5C]">*</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] font-semibold text-base focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                Timezone <span className="text-[#D95C5C]">*</span>
              </label>
              <input
                type="text"
                required
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Asia/Kolkata"
                className="w-full p-3.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Repeat Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '', label: 'One-Time' },
                { id: 'DAILY', label: 'Every Day' },
                { id: 'WEEKLY', label: 'Every Week' },
                { id: 'MONTHLY', label: 'Every Month' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRecurrenceFreq(opt.id)}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all ${
                    recurrenceFreq === opt.id
                      ? 'bg-[#D8B24C] border-[#D8B24C] text-[#151515] shadow-xs'
                      : 'bg-[#151515] border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {recurrenceFreq === 'WEEKLY' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
                Select Repeat Days
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const isSelected = selectedWeekdays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleWeekday(day.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#D8B24C] text-[#151515]'
                          : 'bg-[#151515] border border-[#343434] text-[#74746F]'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7A7A2] mb-2">
              Description / Notes
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Take 1 pill after breakfast with water..."
              className="w-full p-3.5 bg-[#151515] border border-[#343434] rounded-lg text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D8B24C] transition-colors placeholder:text-[#74746F] resize-none"
            />
          </div>

          <div className="flex items-center space-x-3 p-3.5 bg-[#151515] border border-[#343434] rounded-lg">
            <input
              type="checkbox"
              id="voiceEnabled"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#D8B24C] focus:ring-[#D8B24C] bg-[#202020] border-[#343434]"
            />
            <label htmlFor="voiceEnabled" className="text-xs font-medium text-[#F5F5F0] cursor-pointer">
              Enable Voice Prompt Announcement
            </label>
          </div>

          <div className="pt-4 border-t border-[#343434] flex items-center justify-end space-x-3">
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
              disabled={submitting}
              className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Reminder' : 'Save Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
