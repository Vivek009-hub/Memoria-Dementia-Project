/**
 * RemindersPage.jsx — Smart Reminders & Daily Routine Page (Phase F6 / B6)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Plus, RefreshCw, AlertTriangle, Calendar
} from 'lucide-react';
import { ReminderCard } from '../components/ReminderCard.jsx';
import { CreateEditReminderModal } from '../components/CreateEditReminderModal.jsx';
import { ReminderDetailModal } from '../components/ReminderDetailModal.jsx';
import { DeleteReminderDialog } from '../components/DeleteReminderDialog.jsx';
import { SnoozeSkipModal } from '../components/SnoozeSkipModal.jsx';
import * as remindersApi from '../api/reminders.api.js';

const TYPE_FILTERS = [
  { id: '', label: 'All Routines' },
  { id: 'MEDICATION', label: 'Medication' },
  { id: 'MEAL', label: 'Meals' },
  { id: 'APPOINTMENT', label: 'Appointments' },
  { id: 'ACTIVITY', label: 'Activities' },
  { id: 'BIRTHDAY', label: 'Birthdays' },
  { id: 'IMPORTANT_EVENT', label: 'Events' },
];

export function RemindersPage({ patientId }) {
  const [reminders, setReminders] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [selectedReminder, setSelectedReminder] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [reminderToEdit, setReminderToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [reminderToSkip, setReminderToSkip] = useState(null);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (selectedType) params.type = selectedType;
      if (selectedDate) params.date = selectedDate;
      if (patientId) params.patientId = patientId;

      const res = await remindersApi.getReminders(params);

      if (res.data) {
        setReminders(res.data);
      } else {
        setReminders([]);
      }

      if (res.occurrences) {
        setOccurrences(res.occurrences);
      } else {
        setOccurrences([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load routine reminders right now.');
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedDate, patientId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSaveReminder = async (formData, reminderId) => {
    if (reminderId) {
      await remindersApi.updateReminder(reminderId, formData);
    } else {
      const payload = { ...formData };
      if (patientId) payload.patientId = patientId;
      await remindersApi.createReminder(payload);
    }
    fetchReminders();
  };

  const handleDeleteReminder = async (reminderId) => {
    await remindersApi.deleteReminder(reminderId);
    if (selectedReminder && selectedReminder._id === reminderId) {
      setSelectedReminder(null);
    }
    fetchReminders();
  };

  const handleCompleteReminder = async (reminder) => {
    const remId = reminder?._id || reminder?.id || reminder;
    await remindersApi.completeReminder(remId, { date: selectedDate, patientId });
    fetchReminders();
  };

  const handleSkipReminder = async (reminderOrId, data) => {
    const remId = typeof reminderOrId === 'object' ? (reminderOrId._id || reminderOrId.id) : reminderOrId;
    await remindersApi.skipReminder(remId, { note: data?.note || '', date: selectedDate, patientId });
    fetchReminders();
  };

  const getReminderStatus = (reminderId) => {
    if (!reminderId) return 'PENDING';
    const occ = occurrences.find((o) => {
      const oRemId = o.reminderId || (typeof o.reminder === 'object' ? o.reminder?.id || o.reminder?._id : o.reminder);
      return String(oRemId) === String(reminderId);
    });
    return occ ? occ.status : 'PENDING';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B24C] mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Routine Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">Today's Reminders</h1>
          <p className="text-sm text-[#A7A7A2] mt-1">
            View and add medications, appointments, and daily routines.
          </p>
        </div>

        <button
          onClick={() => {
            setReminderToEdit(null);
            setCreateEditModalOpen(true);
          }}
          className="px-4 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-sm rounded-lg shadow-xs flex items-center space-x-2 transition-colors self-start md:self-auto touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Type Filters & Date Selector */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedType === cat.id
                  ? 'bg-[#D8B24C] text-[#151515] font-semibold'
                  : 'bg-[#151515] border border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Calendar className="w-4 h-4 text-[#74746F]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#151515] border border-[#343434] text-[#F5F5F0] text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D8B24C]"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] text-sm">Loading routine schedule...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#202020] border border-[#D95C5C]/30 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Could Not Load Reminders</h3>
            <p className="text-sm text-[#A7A7A2]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchReminders}
            className="px-4 py-2 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-sm rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#D8B24C]/10 border border-[#D8B24C]/20 rounded-full flex items-center justify-center mx-auto text-[#D8B24C]">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#F5F5F0] mb-2">No Reminders Scheduled</h3>
            <p className="text-[#A7A7A2] max-w-md mx-auto text-sm leading-relaxed">
              No reminders scheduled for this date. Click below to add a medication, meal, or activity reminder.
            </p>
          </div>
          <button
            onClick={() => {
              setReminderToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-sm rounded-lg inline-flex items-center space-x-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Reminder</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => {
            const targetId = rem._id || rem.id;
            return (
              <ReminderCard
                key={targetId}
                reminder={rem}
                status={getReminderStatus(targetId)}
                onComplete={handleCompleteReminder}
                onSkip={(r) => {
                  setReminderToSkip(r);
                  setSkipModalOpen(true);
                }}
                onSelect={(r) => setSelectedReminder(r)}
              />
            );
          })}
        </div>
      )}

      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onComplete={handleCompleteReminder}
          onEdit={(r) => {
            setReminderToEdit(r);
            setCreateEditModalOpen(true);
          }}
          onDelete={(r) => {
            setReminderToDelete(r);
            setDeleteModalOpen(true);
          }}
        />
      )}

      <CreateEditReminderModal
        reminder={reminderToEdit}
        isOpen={createEditModalOpen}
        onClose={() => {
          setCreateEditModalOpen(false);
          setReminderToEdit(null);
        }}
        onSave={handleSaveReminder}
      />

      <DeleteReminderDialog
        reminder={reminderToDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReminderToDelete(null);
        }}
        onConfirmDelete={handleDeleteReminder}
      />

      <SnoozeSkipModal
        reminder={reminderToSkip}
        isOpen={skipModalOpen}
        onClose={() => {
          setSkipModalOpen(false);
          setReminderToSkip(null);
        }}
        onConfirmSkip={handleSkipReminder}
      />
    </div>
  );
}
