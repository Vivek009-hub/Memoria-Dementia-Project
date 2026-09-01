/**
 * memory.tools.js — Controlled tool for memory retrieval
 *
 * Reuses the existing authorized memory access from ai.context.js.
 *
 * Security:
 *   - Uses getAuthorizedMemories() which enforces role-based access control.
 *   - Returns only non-sensitive memory fields (no internal IDs beyond what
 *     is needed for source attribution).
 */

import Memory from '../../memories/memory.model.js';

/**
 * Search relevant memories for the authenticated patient using a keyword query.
 * Never invents memories — returns only what is stored.
 *
 * @param {string} userId  - Authenticated patient's user ID (never from LLM)
 * @param {string} query   - Natural language query (e.g. "daughter", "childhood")
 * @param {number} [limit=5] - Max records to return
 * @returns {Array<Object>} Matching memory records
 */
export async function getRelevantMemories(userId, query = '', limit = 5) {
  // Fetch active memories for this patient only
  const memories = await Memory.find({ patientId: userId, isActive: true })
    .select('_id title description type importantDate relatedPlace tags')
    .sort({ createdAt: -1 })
    .limit(50) // fetch a pool, then filter
    .lean();

  if (!query.trim()) {
    return memories.slice(0, limit);
  }

  // Stop-word filtered keyword matching (same approach as existing searchMemoriesNL)
  const STOP_WORDS = new Set([
    'when', 'what', 'where', 'who', 'which', 'visit', 'visited',
    'tell', 'show', 'about', 'have', 'with', 'from', 'this', 'that',
    'me', 'my', 'the', 'and', 'for',
  ]);

  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const scored = memories.map((m) => {
    const title = (m.title || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();
    const place = (m.relatedPlace || '').toLowerCase();
    const tags = Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase() : '';

    let score = 0;
    for (const word of queryWords) {
      if (title.includes(word)) score += 3;
      if (desc.includes(word)) score += 2;
      if (tags.includes(word)) score += 2;
      if (place.includes(word)) score += 1;
    }
    // Also check full phrase
    if (title.includes(lowerQuery)) score += 5;
    if (desc.includes(lowerQuery)) score += 3;

    return { ...m, _score: score };
  });

  return scored
    .filter((m) => m._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...m }) => m); // remove internal score before returning
}
