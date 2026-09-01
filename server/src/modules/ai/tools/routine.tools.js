/**
 * routine.tools.js — Controlled tool for retrieving the patient's daily routine
 *
 * Memora stores routines as recurring Reminder documents.
 * This tool fetches today's active reminders, sorts by time, and groups
 * them into morning / afternoon / evening buckets for natural conversation.
 *
 * Security:
 *   - userId always comes from the authenticated session (never from LLM).
 *   - Only non-sensitive fields are returned.
 */

import Reminder from '../../reminders/reminder.model.js';

/**
 * Parse "HH:MM" string to total minutes since midnight.
 * @param {string} time
 * @returns {number}
 */
function timeToMinutes(time = '00:00') {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Classify a time (minutes since midnight) into a day bucket.
 * @param {number} mins
 * @returns {'morning'|'afternoon'|'evening'|'night'}
 */
function timeBucket(mins) {
  if (mins < 720) return 'morning';   // before 12:00
  if (mins < 1020) return 'afternoon'; // 12:00–17:00
  if (mins < 1260) return 'evening';   // 17:00–21:00
  return 'night';
}

/**
 * Retrieve today's routine items (active reminders) for the patient.
 *
 * @param {string} userId - Authenticated patient ID
 * @returns {Object} { items: [...], buckets: { morning:[...], afternoon:[...], ... } }
 */
export async function getTodayRoutine(userId) {
  const reminders = await Reminder.find({ patientId: userId, isActive: true })
    .select('title description type schedule recurrence voiceEnabled')
    .sort({ 'schedule.time': 1 })
    .lean();

  const items = reminders.map((r) => ({
    id: r._id,
    title: r.title,
    description: r.description || null,
    type: r.type,
    time: r.schedule?.time || '00:00',
    isRecurring: !!r.recurrence,
    voiceEnabled: r.voiceEnabled,
  }));

  // Group into human-readable buckets
  const buckets = { morning: [], afternoon: [], evening: [], night: [] };
  for (const item of items) {
    const mins = timeToMinutes(item.time);
    buckets[timeBucket(mins)].push(item);
  }

  return { items, buckets };
}
