/**
 * RemindersScreen.jsx — Reminders & Daily Routine Hub (Phase F6 / B6)
 *
 * Provides:
 * - Today's Routine view grouped by Morning, Afternoon, Evening
 * - Full Reminder List catalog with category filters
 * - Occurrence History Log tab
 * - Modals for Create, Edit, View Details, Delete, and Skip/Snooze
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, Plus, Filter, RefreshCw, AlertTriangle, Sun, Sunset, Moon,
  CheckCircle2, History, Repeat, Sparkles, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ReminderCard } from '../components/ReminderCard.jsx';
import { ReminderDetailModal } from '../components/ReminderDetailModal.jsx';
import { CreateEditReminderModal } from '../components/CreateEditReminderModal.jsx';
import { DeleteReminderDialog } from '../components/DeleteReminderDialog.jsx';
import { SnoozeSkipModal } from '../components/SnoozeSkipModal.jsx';
import { PatientSelector } from '../components/PatientSelector.jsx';
import * as remindersApi from '../api/reminders.api.js';
import * as caregiverApi from '../api/caregiver.api.js';

const CATEGORY_FILTERS = [
  { id: '', label: 'All' },
  { id: 'MEDICATION', label: 'Medication' },
  { id: 'MEAL', label: 'Meals' },
  { id: 'APPOINTMENT', label: 'Appointments' },
  { id: 'ACTIVITY', label: 'Activities' },
  { id: 'BIRTHDAY', label: 'Birthdays' },
  { id: 'IMPORTANT_EVENT', label: 'Events' },
];

export function RemindersScreen({ patientId: propPatientId }) {
  const { user } = useAuth();
  const isCaregiver = user?.role === 'CAREGIVER';

  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(isCaregiver);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reminders, setReminders] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Active view tab ('today' | 'all' | 'history')
  const [viewTab, setViewTab] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Track completed/skipped occurrence IDs in local UI state for instantaneous feedback
  const [completedMap, setCompletedMap] = useState({});
  const [skippedMap, setSkippedMap] = useState({});

  // Modal states
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [reminderToEdit, setReminderToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [reminderToSkip, setReminderToSkip] = useState(null);

  // Active target patient ID resolution
  const activePatientId = isCaregiver
    ? selectedPatientId || (propPatientId && propPatientId !== user?.id && propPatientId !== user?._id ? propPatientId : '')
    : propPatientId || user?.id || user?._id;

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
        const res = await caregiverApi.listRelationships();
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

  // Fetch reminders list
  const fetchReminders = useCallback(async () => {
    if (isCaregiver && !activePatientId) {
      setLoading(false);
      setReminders([]);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await remindersApi.listReminders({
        type: selectedCategory || undefined,
        patientId: activePatientId,
      });
      if (res.data) {
        setReminders(res.data);
      } else {
        setReminders([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'We couldn\'t load your reminders right now.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activePatientId, isCaregiver]);

  // Fetch occurrence history logs
  const fetchHistory = useCallback(async () => {
    if (!activePatientId) return;
    try {
      const res = await remindersApi.getReminderHistory({ patientId: activePatientId, limit: 20 });
      if (res.data) {
        setHistoryLogs(res.data);
      }
    } catch {
      // Non-blocking error
    }
  }, [activePatientId]);

  useEffect(() => {
    if (!loadingRelationships) {
      fetchReminders();
    }
  }, [fetchReminders, loadingRelationships]);

  useEffect(() => {
    if (viewTab === 'history' && !loadingRelationships) {
      fetchHistory();
    }
  }, [viewTab, fetchHistory, loadingRelationships]);

  // Actions
  const handleSaveReminder = async (formData, reminderId) => {
    if (reminderId) {
      await remindersApi.updateReminder(reminderId, formData);
    } else {
      await remindersApi.createReminder({ ...formData, patientId: activePatientId });
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

  const handleCompleteReminder = async (rem) => {
    const remId = rem?._id || rem?.id || rem;
    await remindersApi.completeReminder(remId, { patientId: activePatientId }, activePatientId);
    setCompletedMap((prev) => ({ ...prev, [remId]: true }));
    fetchHistory();
  };

  const handleConfirmSkip = async (reminderId, options) => {
    await remindersApi.skipReminder(reminderId, { ...options, patientId: activePatientId }, activePatientId);
    setSkippedMap((prev) => ({ ...prev, [reminderId]: true }));
    fetchHistory();
  };

  // Group reminders into Morning (00:00-11:59), Afternoon (12:00-16:59), Evening (17:00-23:59)
  const groupRemindersByPeriod = (remList) => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    remList.forEach((r) => {
      const timeStr = r.schedule?.time || '12:00';
      const [h] = timeStr.split(':').map(Number);
      if (h < 12) morning.push(r);
      else if (h < 17) afternoon.push(r);
      else evening.push(r);
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupRemindersByPeriod(reminders);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Caregiver Patient Selector */}
      {isCaregiver && relationships.length > 0 && (
        <div className="flex items-center justify-between bg-memora-surface border border-memora-border p-4 rounded-3xl shadow-lg">
          <div className="flex items-center space-x-2 text-memora-text-muted text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4 text-memora-accent" />
            <span>Viewing Patient:</span>
          </div>
          <PatientSelector
            patients={relationships}
            selectedPatientId={activePatientId}
            onSelectPatient={(id) => setSelectedPatientId(id)}
          />
        </div>
      )}

      {/* Caregiver with no linked patients */}
      {isCaregiver && !loadingRelationships && relationships.length === 0 && (
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 text-center space-y-2">
          <Users className="w-8 h-8 text-memora-accent mx-auto" />
          <h3 className="text-base font-bold text-memora-text">No Assigned Patients Found</h3>
          <p className="text-xs text-memora-text-muted">
            Please link with a patient account to view and manage their routine reminders.
          </p>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-memora-accent mb-1">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Daily Routine</span>
          </div>
          <h1 className="text-3xl font-black text-memora-text tracking-tight">My Reminders</h1>
          <p className="text-sm text-memora-text-muted mt-1">
            Stay on track with your medications, appointments, and daily routines.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setReminderToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-5 py-3 bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Navigation View Tabs & Filters */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-memora-border pb-3">
          {/* Main View Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewTab('today')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                viewTab === 'today'
                  ? 'bg-memora-accent text-memora-bg shadow-md font-black'
                  : 'bg-memora-surface-secondary text-memora-text-muted hover:text-memora-text border border-memora-border'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Today's Routine</span>
            </button>

            <button
              onClick={() => setViewTab('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                viewTab === 'all'
                  ? 'bg-memora-accent text-memora-bg shadow-md font-black'
                  : 'bg-memora-surface-secondary text-memora-text-muted hover:text-memora-text border border-memora-border'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>All Reminders</span>
            </button>

            <button
              onClick={() => setViewTab('history')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
                viewTab === 'history'
                  ? 'bg-memora-accent text-memora-bg shadow-md font-black'
                  : 'bg-memora-surface-secondary text-memora-text-muted hover:text-memora-text border border-memora-border'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>

          <button
            onClick={fetchReminders}
            className="p-2.5 bg-memora-surface-secondary border border-memora-border rounded-xl text-memora-text-muted hover:text-memora-text transition-colors"
            title="Refresh reminders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-memora-accent text-memora-bg font-black'
                  : 'bg-memora-surface-secondary border border-memora-border text-memora-text-muted hover:text-memora-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-memora-accent animate-spin mx-auto mb-3" />
          <p className="text-memora-text font-bold text-lg">Loading your schedule...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-memora-surface border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-memora-text mb-1">We Couldn't Load Your Reminders</h3>
            <p className="text-sm text-memora-text-muted">{errorMsg}</p>
          </div>
          <button
            onClick={fetchReminders}
            className="px-6 py-3 bg-memora-surface-secondary hover:bg-memora-surface-hover text-memora-text font-bold text-sm rounded-2xl border border-memora-border transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : viewTab === 'history' ? (
        /* History Log View */
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-memora-text flex items-center space-x-2">
            <History className="w-5 h-5 text-memora-accent" />
            <span>Recent Occurrence History</span>
          </h2>

          {historyLogs.length === 0 ? (
            <p className="text-sm text-memora-text-muted py-6 text-center">No occurrence history recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {historyLogs.map((log) => (
                <div key={log._id} className="p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-memora-text">
                      {log.reminderId?.title || 'Reminder Occurrence'}
                    </h4>
                    <span className="text-xs text-memora-text-muted">
                      Scheduled: {new Date(log.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                      log.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : log.status === 'CANCELLED' || log.status === 'SKIPPED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-memora-surface text-memora-text-muted border-memora-border'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : reminders.length === 0 ? (
        /* Empty State */
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg space-y-4">
          <div className="w-20 h-20 bg-memora-accent/10 border border-memora-accent/20 rounded-full flex items-center justify-center mx-auto text-memora-accent">
            <Clock className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-memora-text mb-2">No Reminders Found</h3>
            <p className="text-memora-text-muted max-w-md mx-auto text-sm leading-relaxed">
              You have no reminders set for this category. Add a reminder for medications, meals, or events to keep your day organized.
            </p>
          </div>
          <button
            onClick={() => {
              setReminderToEdit(null);
              setCreateEditModalOpen(true);
            }}
            className="px-6 py-3.5 bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-extrabold text-base rounded-2xl shadow-lg inline-flex items-center space-x-2 transition-all touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Reminder</span>
          </button>
        </div>
      ) : viewTab === 'today' ? (
        /* Today's Routine View (Grouped) */
        <div className="space-y-6">
          {/* Morning */}
          {morning.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Sun className="w-5 h-5" />
                <h2 className="text-lg font-black text-memora-text uppercase tracking-wider">Morning Routine</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {morning.map((r) => {
                  const targetId = r._id || r.id;
                  return (
                    <ReminderCard
                      key={targetId}
                      reminder={r}
                      status={completedMap[targetId] ? 'COMPLETED' : skippedMap[targetId] ? 'SKIPPED' : 'PENDING'}
                      onComplete={handleCompleteReminder}
                      onSkip={(rem) => {
                        setReminderToSkip(rem);
                        setSkipModalOpen(true);
                      }}
                      onSelect={(rem) => setSelectedReminder(rem)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Afternoon */}
          {afternoon.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-orange-400">
                <Sunset className="w-5 h-5" />
                <h2 className="text-lg font-black text-memora-text uppercase tracking-wider">Afternoon Routine</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {afternoon.map((r) => {
                  const targetId = r._id || r.id;
                  return (
                    <ReminderCard
                      key={targetId}
                      reminder={r}
                      status={completedMap[targetId] ? 'COMPLETED' : skippedMap[targetId] ? 'SKIPPED' : 'PENDING'}
                      onComplete={handleCompleteReminder}
                      onSkip={(rem) => {
                        setReminderToSkip(rem);
                        setSkipModalOpen(true);
                      }}
                      onSelect={(rem) => setSelectedReminder(rem)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Evening */}
          {evening.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-memora-accent">
                <Moon className="w-5 h-5" />
                <h2 className="text-lg font-black text-memora-text uppercase tracking-wider">Evening Routine</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evening.map((r) => {
                  const targetId = r._id || r.id;
                  return (
                    <ReminderCard
                      key={targetId}
                      reminder={r}
                      status={completedMap[targetId] ? 'COMPLETED' : skippedMap[targetId] ? 'SKIPPED' : 'PENDING'}
                      onComplete={handleCompleteReminder}
                      onSkip={(rem) => {
                        setReminderToSkip(rem);
                        setSkipModalOpen(true);
                      }}
                      onSelect={(rem) => setSelectedReminder(rem)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* All Reminders Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((r) => {
            const targetId = r._id || r.id;
            return (
              <ReminderCard
                key={targetId}
                reminder={r}
                status={completedMap[targetId] ? 'COMPLETED' : skippedMap[targetId] ? 'SKIPPED' : 'PENDING'}
                onComplete={handleCompleteReminder}
                onSkip={(rem) => {
                  setReminderToSkip(rem);
                  setSkipModalOpen(true);
                }}
                onSelect={(rem) => setSelectedReminder(rem)}
              />
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onComplete={handleCompleteReminder}
          onSkip={(rem) => {
            setSelectedReminder(null);
            setReminderToSkip(rem);
            setSkipModalOpen(true);
          }}
          onEdit={(rem) => {
            setReminderToEdit(rem);
            setCreateEditModalOpen(true);
          }}
          onDelete={(rem) => {
            setReminderToDelete(rem);
            setDeleteModalOpen(true);
          }}
        />
      )}

      {/* Create / Edit Modal */}
      <CreateEditReminderModal
        reminder={reminderToEdit}
        isOpen={createEditModalOpen}
        onClose={() => {
          setCreateEditModalOpen(false);
          setReminderToEdit(null);
        }}
        onSave={handleSaveReminder}
      />

      {/* Delete Confirmation Modal */}
      <DeleteReminderDialog
        reminder={reminderToDelete}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReminderToDelete(null);
        }}
        onConfirmDelete={handleDeleteReminder}
      />

      {/* Skip / Snooze Modal */}
      <SnoozeSkipModal
        reminder={reminderToSkip}
        isOpen={skipModalOpen}
        onClose={() => {
          setSkipModalOpen(false);
          setReminderToSkip(null);
        }}
        onConfirmSkip={handleConfirmSkip}
      />
    </div>
  );
}
