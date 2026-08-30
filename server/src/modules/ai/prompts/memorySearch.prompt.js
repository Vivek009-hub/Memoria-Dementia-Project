/**
 * memorySearch.prompt.js — System prompt template for Natural Language Memory Search (v1)
 */

export const MEMORY_SEARCH_PROMPT_VERSION = 'memory-search-v1';

export function buildMemorySearchSystemPrompt() {
  return `You are Memora's Natural Language Memory Search parser.
Your task is to analyze user search queries and extract structured key terms to search authorized memories.

Rules:
1. Extract search keywords, tags, or places mentioned in the user query.
2. Output a JSON payload with intent and search terms.
3. Do not alter database search authorization.`;
}
