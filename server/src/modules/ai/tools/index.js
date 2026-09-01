/**
 * tools/index.js — Memora Agent Tool Registry
 *
 * Two exports:
 *
 * 1. TOOL_HANDLERS — Map of tool name → async handler function.
 *    Used by agent.service.js to dispatch Gemini function calls.
 *
 * 2. GEMINI_TOOL_DECLARATIONS — Gemini FunctionDeclaration[] schemas.
 *    Passed to the Gemini API so it knows which tools are available.
 *
 * Security:
 *   Every handler receives `userId` as its first argument, which is always
 *   derived from the authenticated session — the LLM CANNOT supply it.
 */

export { getPatientProfile, getPatientPreferences } from './patient.tools.js';
export { getRelevantMemories } from './memory.tools.js';
export { getTodayRoutine } from './routine.tools.js';
export { getActiveReminders, createReminder, cancelReminder } from './reminder.tools.js';
export {
  getRecentConversation,
  findOrCreateConversation,
  appendMessage,
} from './conversation.tools.js';

// ── Gemini Function Declarations ─────────────────────────────────────────────
// These schemas tell Gemini what tools exist and what arguments they accept.
// userId is NOT declared here — it is injected by the backend at dispatch time.

export const GEMINI_TOOL_DECLARATIONS = [
  {
    name: 'getPatientProfile',
    description:
      "Retrieve the authenticated patient's basic profile: name, preferred language, accessibility settings.",
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getPatientPreferences',
    description:
      "Retrieve the patient's stored preferences and interests (e.g. hobbies, favorite topics).",
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getTodayRoutine',
    description:
      "Get the patient's scheduled activities and routine items for today, grouped by time of day.",
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getActiveReminders',
    description: "Get the patient's currently active reminders.",
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: [],
    },
  },
  {
    name: 'getRelevantMemories',
    description:
      'Search the patient\'s saved memories for records relevant to a topic or query. Only returns real stored memories — never invents data.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description:
            'The search query, e.g. "daughter", "childhood", "birthday party". Keep it concise.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'createReminder',
    description:
      'Create a one-time reminder for the patient. Only call this when the patient explicitly asks to be reminded of something.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: {
          type: 'STRING',
          description: 'Short description of what to remind the patient about (max 200 chars).',
        },
        timeExpression: {
          type: 'STRING',
          description:
            'Natural time expression e.g. "in 15 minutes", "in 2 hours", "at 6 PM", "tomorrow morning", "after lunch".',
        },
        delayMinutes: {
          type: 'NUMBER',
          description: 'Alternative: number of minutes from now (1–1440).',
        },
        type: {
          type: 'STRING',
          description:
            'Reminder category. One of: MEDICATION, MEAL, APPOINTMENT, ACTIVITY, OTHER.',
          enum: ['MEDICATION', 'MEAL', 'APPOINTMENT', 'ACTIVITY', 'OTHER'],
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'cancelReminder',
    description:
      'Cancel an existing active reminder. Only call when the patient explicitly asks to cancel one.',
    parameters: {
      type: 'OBJECT',
      properties: {
        reminderId: {
          type: 'STRING',
          description: 'The ID of the reminder to cancel (obtained from getActiveReminders).',
        },
      },
      required: ['reminderId'],
    },
  },
];
