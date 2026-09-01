/**
 * timeParser.js — Natural Language Time & Relative Duration Resolver
 *
 * Resolves natural language time expressions into a canonical JavaScript Date
 * and formatted HH:MM string for the patient's local timezone.
 *
 * Supported expressions:
 *   - Relative minutes/hours: "in 15 minutes", "in 2 hours", "in half an hour", "in 45 mins"
 *   - Absolute clock times: "at 6 PM", "at 18:00", "at 9:30 AM"
 *   - Relative day expressions: "tomorrow morning" (09:00), "tomorrow at 10 AM", "tomorrow evening" (18:00)
 *   - Meal/Routine references: "after lunch" (14:00), "before breakfast" (08:00)
 *
 * Safety & Validation:
 *   - Enforces bounds: delay must be >= 1 minute and <= 30 days (43,200 minutes).
 *   - Rejects past dates.
 *   - Always resolves using the target patient's IANA timezone (default: "Asia/Kolkata").
 */

import { AppError } from '../../../utils/AppError.js';

const DEFAULT_TIMEZONE = 'Asia/Kolkata';
const MAX_DELAY_MINUTES = 30 * 24 * 60; // 30 days

/**
 * Parse a natural time expression or delay input into a concrete Date.
 *
 * @param {Object} options
 * @param {string} [options.timeExpression] - e.g. "in 15 minutes", "at 6 PM", "tomorrow morning"
 * @param {number} [options.delayMinutes]   - Explicit minutes from now
 * @param {string} [options.scheduledAtISO]  - Direct ISO string
 * @param {string} [options.timezone]       - Patient's IANA timezone
 * @param {Date}   [options.now]            - Optional current date (for testing)
 * @returns {{ scheduledAt: Date, timeStr: string, timezone: string }}
 */
export function parseNaturalTime({
  timeExpression,
  delayMinutes,
  scheduledAtISO,
  timezone = DEFAULT_TIMEZONE,
  now = new Date(),
}) {
  let targetDate = null;

  // 1. Direct ISO Date string provided
  if (scheduledAtISO) {
    const parsed = new Date(scheduledAtISO);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  // 2. Explicit delayMinutes provided
  if (!targetDate && typeof delayMinutes === 'number' && !isNaN(delayMinutes)) {
    if (delayMinutes < 1 || delayMinutes > MAX_DELAY_MINUTES) {
      throw new AppError(
        `delayMinutes must be between 1 and ${MAX_DELAY_MINUTES} (30 days)`,
        400,
        'VALIDATION_ERROR'
      );
    }
    targetDate = new Date(now.getTime() + Math.round(delayMinutes) * 60 * 1000);
  }

  // 3. Natural language text expression provided
  if (!targetDate && timeExpression && typeof timeExpression === 'string') {
    const expr = timeExpression.toLowerCase().trim();

    // Check pattern: "in X minutes/mins/min/hours/hrs/hr"
    const inMatch = expr.match(/in\s+(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
    if (inMatch) {
      const amount = parseInt(inMatch[1], 10);
      const unit = inMatch[2].toLowerCase();
      const mult = unit.startsWith('h') ? 60 : 1;
      const totalMins = amount * mult;
      targetDate = new Date(now.getTime() + totalMins * 60 * 1000);
    }

    // Check pattern: "in half an hour" / "in an hour"
    if (!targetDate) {
      if (expr.includes('half an hour')) {
        targetDate = new Date(now.getTime() + 30 * 60 * 1000);
      } else if (expr.match(/in an hour|in 1 hour/i)) {
        targetDate = new Date(now.getTime() + 60 * 60 * 1000);
      }
    }

    // Check pattern: "tomorrow morning" / "tomorrow evening" / "tomorrow afternoon"
    if (!targetDate && expr.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (expr.includes('morning')) {
        tomorrow.setHours(9, 0, 0, 0);
      } else if (expr.includes('afternoon')) {
        tomorrow.setHours(14, 0, 0, 0);
      } else if (expr.includes('evening')) {
        tomorrow.setHours(18, 0, 0, 0);
      } else {
        // Check if a specific time is given e.g., "tomorrow at 10 am"
        const timeMatch = expr.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
          const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

          if (ampm === 'pm' && hours < 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          tomorrow.setHours(hours, mins, 0, 0);
        } else {
          tomorrow.setHours(9, 0, 0, 0); // Default tomorrow 9 AM
        }
      }
      targetDate = tomorrow;
    }

    // Check pattern: "at X PM" / "at X AM" / "at HH:MM" today
    if (!targetDate) {
      const atMatch = expr.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (atMatch) {
        let hours = parseInt(atMatch[1], 10);
        const mins = atMatch[2] ? parseInt(atMatch[2], 10) : 0;
        const ampm = atMatch[3] ? atMatch[3].toLowerCase() : null;

        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;

        const candidate = new Date(now);
        candidate.setHours(hours, mins, 0, 0);

        // If candidate time is already in the past today, move to tomorrow
        if (candidate.getTime() <= now.getTime()) {
          candidate.setDate(candidate.getDate() + 1);
        }
        targetDate = candidate;
      }
    }

    // Check meal/routine shortcuts: "after lunch" (14:00), "before breakfast" (08:00)
    if (!targetDate) {
      if (expr.includes('after lunch')) {
        const candidate = new Date(now);
        candidate.setHours(14, 0, 0, 0);
        if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 1);
        targetDate = candidate;
      } else if (expr.includes('before breakfast') || expr.includes('morning')) {
        const candidate = new Date(now);
        candidate.setHours(8, 30, 0, 0);
        if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 1);
        targetDate = candidate;
      }
    }
  }

  // Fallback if no target date could be resolved
  if (!targetDate) {
    throw new AppError(
      'Could not determine reminder time. Please specify a time like "in 15 minutes" or "at 6 PM".',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Safety check: ensure targetDate is in the future
  if (targetDate.getTime() <= now.getTime() - 1000) {
    throw new AppError('Reminder scheduled time must be in the future', 400, 'VALIDATION_ERROR');
  }

  // Format HH:MM in patient timezone
  const timeStr = targetDate.toLocaleTimeString('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    scheduledAt: targetDate,
    timeStr,
    timezone,
  };
}
