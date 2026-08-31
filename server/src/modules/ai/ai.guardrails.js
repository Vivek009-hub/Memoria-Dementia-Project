/**
 * ai.guardrails.js — Safety Guardrails & Prompt Injection Defenses
 *
 * Per Prompt §3 (Non-diagnostic safety), §23-25 (Prompt Injection), and §38 (Safety Responses).
 */

import { AppError } from '../../utils/AppError.js';

// Patterns that attempt to override system instructions or extract keys
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /give\s+me\s+(provider\s+)?api\s+keys/i,
  /ignore\s+authorization/i,
  /show\s+me\s+every\s+patient/i,
];

// Medical diagnosis question patterns
const MEDICAL_DIAGNOSIS_PATTERNS = [
  /do\s+i\s+have\s+dementia/i,
  /diagnose\s+me/i,
  /is\s+my\s+dementia\s+(getting\s+)?worse/i,
  /medical\s+diagnosis/i,
  /should\s+i\s+stop\s+taking\s+my\s+medicine/i,
];

export const MEDICAL_SAFETY_DISCLAIMER =
  'I cannot diagnose medical conditions, assess disease progression, or prescribe treatments. Please consult a qualified healthcare professional for medical advice.';

/**
 * Sanitize prompt input from untrusted user messages or stored memories.
 */
export function sanitizePromptInput(input = '') {
  if (typeof input !== 'string') return '';

  let sanitized = input;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      // Strip malicious instruction pattern
      sanitized = sanitized.replace(pattern, '[filtered instruction]');
    }
  }

  return sanitized.trim();
}

/**
 * Detect prompt injection attack attempts that try to bypass security/authorization.
 */
export function isInjectionAttempt(input = '') {
  if (typeof input !== 'string') return false;
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Check if user message is asking for a medical diagnosis or treatment advice.
 */
export function isMedicalDiagnosticQuery(input = '') {
  if (typeof input !== 'string') return false;
  return MEDICAL_DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Wrap memory items safely in context delimiters so stored memory text is treated strictly as data.
 */
export function formatDelimitedMemoryContext(memories = []) {
  if (!Array.isArray(memories) || memories.length === 0) {
    return 'NO_MEMORY_DATA_AVAILABLE';
  }

  const memoryBlocks = memories.map((m, idx) => {
    const title = sanitizePromptInput(m.title || '');
    const desc = sanitizePromptInput(m.description || '');
    const type = m.type || 'PHOTO';
    const place = sanitizePromptInput(m.relatedPlace || '');
    const dateStr = m.importantDate ? new Date(m.importantDate).toISOString().split('T')[0] : '';

    return `[RECORD #${idx + 1}]
id: ${m._id || m.id}
type: ${type}
title: ${title}
description: ${desc}
place: ${place}
date: ${dateStr}`;
  });

  return `<authorized_memory_data>\n${memoryBlocks.join('\n\n')}\n</authorized_memory_data>`;
}

/**
 * Sanitize output to prevent leakage of credentials or sensitive tokens.
 */
export function sanitizeOutput(text = '') {
  if (typeof text !== 'string') return '';
  return text
    .replace(/(eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/g, '[TOKEN_REDACTED]')
    .replace(/(sk-[A-Za-z0-9]{20,})/g, '[KEY_REDACTED]')
    .trim();
}
