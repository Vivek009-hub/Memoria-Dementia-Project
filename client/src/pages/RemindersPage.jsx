/**
 * RemindersPage.jsx — Smart Reminders & Daily Routine Page (Phase F6 / B6)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Plus, RefreshCw, AlertTriangle, Calendar, Users, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ReminderCard } from '../components/ReminderCard.jsx';
import { CreateEditReminderModal } from '../components/CreateEditReminderModal.jsx';
import { ReminderDetailModal } from '../components/ReminderDetailModal.jsx';
import { DeleteReminderDialog } from '../components/DeleteReminderDialog.jsx';
import { SnoozeSkipModal } from '../components/SnoozeSkipModal.jsx';
import { PatientSelector } from '../components/PatientSelector.jsx';
import * as remindersApi from '../api/reminders.api.js';
import * as caregiverApi from '../api/caregiver.api.js';

const TYPE_FILTERS = [
  { id: '', label: 'All Routines' },
  { id: 'MEDICATION', label: 'Medication' },
  { id: 'MEAL', label: 'Meals' },
  { id: 'APPOINTMENT', label: 'Appointments' },
  { id: 'ACTIVITY', label: 'Activities' },
  { id: 'BIRTHDAY', label: 'Birthdays' },
  { id: 'IMPORTANT_EVENT', label: 'Events' },
];

export function RemindersPage({ patientId: propPatientId }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(role === 'CAREGIVER');
  const [selectedPatientId, setSelectedPatientId] = useState('');

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

  // Determine active target patient ID
  const isCaregiver = role === 'CAREGIVER';
  const activePatientId = isCaregiver
    ? selectedPatientId || (propPatientId && propPatientId !== user?.id && propPatientId !== user?._id ? propPatientId : '')
    : user?.id || user?._id;

  // Load caregiver patient relationships if logged in as caregiver
  useEffect(() => {
    if (!isCaregiver) {
      setLoadingRelationships(false);
      return;
    }
    let isMounted = true;
    const fetchRelationships = async () => {
      setLoadingRelationships(true);
      try {
        const res = await caregiverApi.getCaregiverRelationships();
        const rels = res.data?.relationships || (Array.isArray(res.data) ? res.data : []);
        if (isMounted) {
          if (rels && rels.length > 0) {
            setRelationships(rels);
            const firstPatientObj = rels[0].patientId || rels[0].patient || rels[0];
            const firstId = firstPatientObj._id || firstPatientObj.id || firstPatientObj;
            setSelectedPatientId((prev) => prev || firstId);
          } else {
            setRelationships([]);
          }
        }
      } catch (err) {
        console.error('Failed to load caregiver relationships:', err);
      } finally {
        if (isMounted) setLoadingRelationships(false);
      }
    };

    fetchRelationships();
    return () => {
      isMounted = false;
    };
  }, [isCaregiver]);

  const fetchReminders = useCallback(async () => {
    if (isCaregiver && !activePatientId) {
      setLoading(false);
      setReminders([]);
      setOccurrences([]);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (selectedType) params.type = selectedType;
      if (selectedDate) params.date = selectedDate;
      if (activePatientId) params.patientId = activePatientId;

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
  }, [selectedType, selectedDate, activePatientId, isCaregiver]);

  useEffect(() => {
    if (!loadingRelationships) {
      fetchReminders();
    }
  }, [fetchReminders, loadingRelationships]);

  const handleSaveReminder = async (formData, reminderId) => {
    if (reminderId) {
      await remindersApi.updateReminder(reminderId, { ...formData, patientId: activePatientId });
    } else {
      const payload = { ...formData };
      if (activePatientId) payload.patientId = activePatientId;
      await remindersApi.createReminder(payload);
    }
    fetchReminders();
  };

  const handleDeleteReminder = async (reminderId) => {
    await remindersApi.deleteReminder(reminderId, activePatientId);
    if (selectedReminder && selectedReminder._id === reminderId) {
      setSelectedReminder(null);
    }
    fetchReminders();
  };

  const handleCompleteReminder = async (reminder) => {
    const remId = reminder?._id || reminder?.id || reminder;
    await remindersApi.completeReminder(remId, { date: selectedDate, patientId: activePatientId });
    fetchReminders();
  };

  const handleSkipReminder = async (reminderOrId, data) => {
    const remId = typeof reminderOrId === 'object' ? (reminderOrId._id || reminderOrId.id) : reminderOrId;
    await remindersApi.skipReminder(remId, { note: data?.note || '', date: selectedDate, patientId: activePatientId });
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

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {isCaregiver && relationships.length > 0 && (
            <PatientSelector
              patients={relationships}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => setSelectedPatientId(id)}
            />
          )}

          <button
            onClick={() => {
              setReminderToEdit(null);
              setCreateEditModalOpen(true);
            }}
            disabled={isCaregiver && !activePatientId}
            className="px-4 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] font-semibold text-sm rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
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

      {loading || loadingRelationships ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] text-sm">Loading routine schedule...</p>
        </div>
      ) : isCaregiver && relationships.length === 0 ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center space-y-4">
          <Users className="w-12 h-12 text-[#D8B24C] mx-auto opacity-60" />
          <div>
            <h3 className="text-xl font-semibold text-[#F5F5F0] mb-2">No Connected Patient Accounts</h3>
            <p className="text-[#A7A7A2] max-w-md mx-auto text-sm leading-relaxed">
              You do not currently have an active patient connected. Ask your patient to generate a pairing code on their profile, then pair on the Caregiver Dashboard to manage their routine schedule.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/caregiver')}
            className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-sm rounded-lg inline-flex items-center space-x-2 transition-colors shadow-xs"
          >
            <Key className="w-4 h-4" />
            <span>Go to Caregiver Dashboard</span>
          </button>
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
