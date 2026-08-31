/**
 * RemindersPage.jsx — Smart Reminders & Daily Routine Page (Phase F6 / B6)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Plus, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
  Filter, CheckCircle2, Calendar, Pill, Utensils, SlidersHorizontal
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
      const res = await remindersApi.getReminders({
        type: selectedType || undefined,
        date: selectedDate,
        patientId,
      });

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
      await remindersApi.createReminder({ ...formData, patientId });
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
    await remindersApi.completeReminder(reminder._id, { date: selectedDate });
    fetchReminders();
  };

  const handleSkipReminder = async (reminderId, data) => {
    await remindersApi.skipReminder(reminderId, data?.note || '');
    fetchReminders();
  };

  const getReminderStatus = (reminderId) => {
    const occ = occurrences.find((o) => o.reminderId === reminderId);
    return occ ? occ.status : 'PENDING';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Routine Companion</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Smart Reminders</h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay on track with daily medications, meals, appointments, and routine activities.
          </p>
        </div>

        <button
          onClick={() => {
            setReminderToEdit(null);
            setCreateEditModalOpen(true);
          }}
          className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedType === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading routine schedule...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Could Not Load Reminders</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={fetchReminders}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-4">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Clock className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">No Reminders Scheduled</h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              No daily reminders scheduled for this period. Click below to schedule medications, meals, or routine activities.
            </p>
          </div>
          <button
            onClick={() => {
              setReminderToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-lg inline-flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Reminder</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => (
            <ReminderCard
              key={rem._id}
              reminder={rem}
              status={getReminderStatus(rem._id)}
              onComplete={handleCompleteReminder}
              onSkip={(r) => {
                setReminderToSkip(r);
                setSkipModalOpen(true);
              }}
              onSelect={(r) => setSelectedReminder(r)}
            />
          ))}
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
