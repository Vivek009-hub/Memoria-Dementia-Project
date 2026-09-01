/**
 * agent.context.js — Compact Patient Context Builder
 *
 * Builds a minimal, relevant snapshot of patient data to include in the
 * Gemini system prompt. Only fetches what is needed — does NOT dump the
 * entire database into the AI context.
 *
 * Per Prompt §11 (Patient Context System) and §28 (Performance).
 */

import { getPatientProfile, getPatientPreferences } from '../tools/patient.tools.js';
import { getTodayRoutine } from '../tools/routine.tools.js';
import { getActiveReminders } from '../tools/reminder.tools.js';

/**
 * Build a compact patient context string for the Gemini system prompt.
 * This is included once at the start of the conversation — dynamic
 * retrieval (memories, fresh reminders) happens via function calls.
 *
 * @param {string} userId - Authenticated patient ID
 * @returns {string} Formatted context block
 */
export async function buildPatientContext(userId) {
  // Fetch in parallel for performance
  const [profile, preferences, routine, reminders] = await Promise.allSettled([
    getPatientProfile(userId),
    getPatientPreferences(userId),
    getTodayRoutine(userId),
    getActiveReminders(userId),
  ]);

  const safeValue = (settled) => (settled.status === 'fulfilled' ? settled.value : null);

  const p = safeValue(profile);
  const prefs = safeValue(preferences);
  const routineData = safeValue(routine);
  const activeReminders = safeValue(reminders);

  let ctx = '=== PATIENT CONTEXT (start of session) ===\n';

  // Patient identity
  if (p) {
    ctx += `Patient name: ${p.name}\n`;
    ctx += `Preferred language: ${p.preferredLanguage || 'en'}\n`;
    if (p.companionSettings?.quietHours?.enabled) {
      ctx += `Quiet hours: ${p.companionSettings.quietHours.start} to ${p.companionSettings.quietHours.end}\n`;
    }
  } else {
    ctx += 'Patient profile: unavailable\n';
  }

  // Preferences
  const prefObj = prefs?.preferences || {};
  const prefKeys = Object.keys(prefObj);
  if (prefKeys.length > 0) {
    ctx += `\nKnown preferences:\n`;
    for (const key of prefKeys.slice(0, 10)) {
      const val = typeof prefObj[key] === 'object'
        ? JSON.stringify(prefObj[key])
        : String(prefObj[key]);
      ctx += `  - ${key}: ${val}\n`;
    }
  }

  // Today's routine (top 5 items)
  if (routineData?.items?.length > 0) {
    ctx += `\nToday's routine (${routineData.items.length} item(s)):\n`;
    for (const item of routineData.items.slice(0, 5)) {
      ctx += `  - ${item.time} — ${item.title} (${item.type})\n`;
    }
    if (routineData.items.length > 5) {
      ctx += `  ... and ${routineData.items.length - 5} more.\n`;
    }
  } else {
    ctx += '\nNo routine items configured for today.\n';
  }

  // Active reminders (top 3)
  if (Array.isArray(activeReminders) && activeReminders.length > 0) {
    ctx += `\nActive reminders (${activeReminders.length}):\n`;
    for (const r of activeReminders.slice(0, 3)) {
      ctx += `  - [${r.id}] ${r.title} at ${r.time || 'unscheduled'}\n`;
    }
  } else {
    ctx += '\nNo active reminders.\n';
  }

  ctx += '=== END PATIENT CONTEXT ===\n';
  return ctx;
}
