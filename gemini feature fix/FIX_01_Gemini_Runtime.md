# MEMORA FIX 01
## Fix Gemini Runtime Integration and AI Agent Execution

The audit shows that Gemini integration exists, but runtime is falling back to MockAIProvider because `GEMINI_API_KEY` is missing and `server/src/config/env.js` contains unresolved Git merge-conflict markers.

**DO NOT BUILD A NEW AI SYSTEM. FIX THE EXISTING ONE.**

### Tasks

1. Inspect:
   - `server/src/config/env.js`
   - `server/.env`
   - `server/.env.example`
   - Gemini provider
   - AI agent service/prompt/context
   - AI routes/controllers
   - provider factory
   - `package.json`
   - server startup

2. Search the entire repository for:
```text
<<<<<<<
=======
>>>>>>>
```
Resolve all conflicts correctly. Do not blindly choose one side.

3. Make `GEMINI_API_KEY` available server-side only.
   - Never expose it to frontend.
   - Never hard-code it.
   - Never commit the real key.
   - Put only a placeholder in `.env.example`.

4. When the key is configured, the real `GeminiProvider` must be selected.
   MockAIProvider may remain only as an explicit development fallback.

5. Verify the installed `@google/genai` API is used correctly.

6. Verify the real runtime flow:
```text
Patient request
→ AI endpoint
→ Authentication
→ Memora Agent
→ Patient context
→ Conversation history
→ GeminiProvider
→ Gemini
→ Controlled tools if needed
→ Response
→ Conversation persistence
→ Frontend
```

7. Test:
```text
Hello Memora.
```
using an authenticated patient and verify that Gemini actually responds.

8. Test at least:
   - `getTodayRoutine`
   - `getActiveReminders`
   - `getRelevantMemories`
   - `createReminder`
   - `cancelReminder`

9. Gemini must never directly access MongoDB, execute arbitrary code, or access another patient.

10. Search the built frontend/client output and verify the Gemini API key is not exposed.

### Acceptance Criteria

- [ ] Git conflicts resolved.
- [ ] Backend reads `GEMINI_API_KEY`.
- [ ] Real Gemini provider is selected when configured.
- [ ] AI endpoint returns a real Gemini response.
- [ ] Conversation is persisted.
- [ ] Tools execute through backend validation.
- [ ] No secret is exposed client-side.
- [ ] Mock provider is not silently used.

### Final Report

Return:
- Exact files modified.
- Conflicts fixed.
- Provider-selection behavior.
- Endpoint tested.
- Actual Gemini test result.
- Whether MockAIProvider was used.
- Remaining limitations.

**Do not claim PASS without running the real test.**
