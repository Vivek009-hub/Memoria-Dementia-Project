# MEMORA FIX 07
## Gemini Timeout / "Please Connect to Internet" Diagnostic and Runtime Fix

> **Objective:** Fix the current Memora AI Companion error:
> **"Request timed out. Please connect to internet."**
>
> The user has confirmed that the device has an active internet connection.
>
> **DO NOT assume the problem is the user's internet.**
> **DO NOT rebuild the AI architecture.**
> Diagnose the actual failure in the existing Memora implementation, fix it, and prove the fix with runtime tests.

---

## 1. Critical Rule

Do not simply replace the error message.

Do not hide the error.

Do not increase the timeout blindly.

Do not switch AI providers.

Do not create a new AI architecture.

Find exactly where this chain is failing:

```text
Frontend
   ↓
AI API
   ↓
Backend
   ↓
Agent
   ↓
GeminiProvider
   ↓
Gemini API
   ↓
Response
   ↓
Frontend
```

---

## 2. Inspect the Existing Implementation

Inspect:

### Frontend / Mobile
- AI assistant screen
- AI API client
- API base URL
- authentication/token handling
- request timeout configuration
- error handling

### Backend
- AI routes
- AI controller
- agent service
- Gemini provider
- provider factory
- environment configuration
- server startup
- middleware
- request timeout middleware
- CORS
- error middleware

### Configuration
- `server/.env`
- `server/.env.example`
- `server/src/config/env.js`
- `package.json`

Also inspect the installed version of `@google/genai`.

---

## 3. Find the Generic Timeout Error

Search the complete repository for:

```text
Request timed out
Please connect to internet
timeout
ETIMEDOUT
ECONNRESET
fetch failed
network error
```

Find the exact file and function generating:

```text
Request timed out. Please connect to internet.
```

Do not assume it comes from Gemini.

---

## 4. Do Not Mask Different Errors

The application must distinguish:

```text
MISSING_API_KEY
INVALID_API_KEY
UNAUTHORIZED
FORBIDDEN
MODEL_NOT_FOUND
RATE_LIMITED
GEMINI_TIMEOUT
NETWORK_ERROR
DNS_ERROR
SERVER_ERROR
DATABASE_ERROR
CLIENT_TIMEOUT
UNKNOWN_ERROR
```

Do not convert every failure into:

```text
"Please connect to internet."
```

---

## 5. Safe Backend Debug Logging

Add temporary or structured diagnostic logging.

Log:

```text
AI_REQUEST_START
AI_GEMINI_REQUEST_START
AI_GEMINI_REQUEST_SUCCESS
AI_GEMINI_REQUEST_FAILURE
AI_REQUEST_SUCCESS
AI_REQUEST_FAILURE
```

Include:
- request/correlation ID
- duration
- error name
- HTTP status if available
- error code
- selected model

Never log:
- Gemini API key
- authorization headers
- patient secrets
- full sensitive patient context
- private credentials

Example:

```text
[AI] requestId=abc123
[AI] Gemini request started
[AI] model=...
[AI] Gemini request failed
[AI] status=...
[AI] code=...
[AI] duration=...
```

---

## 6. Verify Gemini API Key

Verify that the backend process loads:

```text
GEMINI_API_KEY
```

Log only:

```text
GEMINI_API_KEY_LOADED=true
```

or:

```text
GEMINI_API_KEY_LOADED=false
```

Never print the key.

If missing:
- explain where it is expected
- fix environment loading if broken
- update `.env.example`

Never commit the actual key.

---

## 7. Check Git Merge Conflicts

Search the repository for:

```text
<<<<<<<
=======
>>>>>>>
```

Resolve any remaining conflicts, especially in:

```text
server/src/config/env.js
```

Do not leave merge-conflict markers in executable code.

---

## 8. Verify Gemini Provider

Inspect the existing Gemini provider.

Verify it uses the installed `@google/genai` SDK correctly.

Confirm the actual SDK initialization and generation method are compatible with the installed version.

Do not copy an outdated SDK example without checking the dependency version.

---

## 9. Verify Model

Safely log the configured model name.

Verify that the model is available to the configured Gemini API/project.

Do not randomly change models.

If the configured model is unavailable, select a currently supported compatible model and update configuration consistently.

---

## 10. Create a Direct Gemini Diagnostic Test

Create a temporary backend test script or diagnostic function that bypasses Memora business logic.

It should do ONLY:

```text
Load GEMINI_API_KEY
 ↓
Initialize GoogleGenAI
 ↓
Call Gemini
 ↓
Ask:
"Reply with exactly: MEMORA GEMINI WORKS"
 ↓
Print response
```

It must NOT use:
- patient context
- MongoDB
- memories
- routines
- reminders
- tools
- voice
- frontend

Purpose:

> Determine whether this backend process can reach Gemini successfully.

---

## 11. Run the Direct Test

Actually run the diagnostic.

If successful:

```text
MEMORA GEMINI WORKS
```

then Gemini itself works and continue through the Memora request chain.

If it fails:
- capture the exact error
- classify it
- do not hide it behind a generic timeout

---

## 12. Test Backend Without Frontend

If direct Gemini works, test the real authenticated AI endpoint directly.

Use the actual route discovered in the codebase.

Send:

```text
Hello Memora.
```

Verify:

```text
Request
 ↓
Backend route
 ↓
Controller
 ↓
Agent
 ↓
Gemini
 ↓
Response
```

Identify the exact failing layer if it fails.

---

## 13. Test Frontend → Backend

If backend testing succeeds, test the actual Memora frontend/mobile app.

Verify:

```text
UI
 ↓
API client
 ↓
Correct backend URL
 ↓
Authentication
 ↓
AI endpoint
```

Pay particular attention to:
- `localhost`
- `127.0.0.1`
- LAN IP
- emulator host address
- Android/iOS network configuration
- HTTP/HTTPS
- CORS
- request timeout

If using a physical mobile device, remember that `localhost` refers to the phone itself, not the development computer.

---

## 14. Check Client Timeout

Inspect the frontend/mobile HTTP client.

Determine:
- timeout duration
- AbortController usage
- axios/fetch configuration
- whether the request is aborted before Gemini responds

Do not simply increase the timeout.

First measure backend/Gemini response time, then choose a reasonable timeout.

---

## 15. Check Server Timeout

Inspect:
- Express middleware
- development server
- production server
- reverse proxy/hosting configuration

Determine whether the backend request is terminated before Gemini responds.

---

## 16. Check CORS

If frontend reaches backend but the client rejects the response, inspect CORS.

Verify the actual development origin is allowed.

Do not weaken security unnecessarily.

---

## 17. Check DNS / Network Only If Proven Necessary

Only if the direct Gemini request fails at the network layer, investigate:

```text
DNS
HTTPS
proxy
VPN
firewall
antivirus
college/corporate network
Node fetch
```

Do not tell the user to reconnect to the internet unless the actual error indicates a network problem.

---

## 18. Check Rate Limits

If Gemini returns:

```text
429
```

identify it as a rate/quota issue.

Do not call it an internet problem.

Use a patient-friendly response such as:

> "I'm having trouble responding right now. Please try again in a moment."

Do not expose provider internals.

---

## 19. Check Authentication

Verify the AI endpoint is not failing before Gemini because of:
- missing token
- expired token
- invalid token
- incorrect patient identity
- authorization middleware

Authentication failures must not become internet errors.

---

## 20. Check Database

The agent may load:
- patient profile
- memories
- routine
- reminders
- conversation history

Test Gemini independently first.

If direct Gemini works but the full Agent fails, isolate which context/tool/database operation causes the failure.

---

## 21. Test Tool Calling Separately

After basic Gemini conversation works, test:

```text
What do I need to do today?
```

Verify routine retrieval.

Then:

```text
What reminders do I have?
```

Verify reminder retrieval.

Then:

```text
Remind me to turn off the stove in 15 minutes.
```

Verify `createReminder`.

If basic chat works but tools fail, fix the tool layer rather than Gemini connectivity.

---

## 22. Test Conversation Persistence

Verify:

```text
Patient message
 ↓
Gemini response
 ↓
Conversation saved
```

A MongoDB failure must not be reported as:

```text
Please connect to internet.
```

---

## 23. Fix Frontend Error Mapping

Map errors appropriately.

Conceptually:

```text
401 → "Your session has expired. Please log in again."

403 → "You don't have permission to do that."

429 → "I'm busy right now. Please try again shortly."

Gemini/network failure →
"I'm having trouble connecting to my AI service right now."

Backend unavailable →
"Memora's server is temporarily unavailable."

Timeout →
"Memora took too long to respond. Please try again."

Unknown →
"Something went wrong. Please try again."
```

Keep patient-facing language simple.

Never expose stack traces.

---

## 24. Do Not Show False Internet Errors

These must NOT become:

```text
"Please connect to internet."
```

Examples:
- invalid API key
- Gemini 403
- Gemini 429
- model unavailable
- MongoDB failure
- authentication failure
- authorization failure
- server exception
- tool exception

---

## 25. Verify Real Gemini Response in UI

After fixing the backend:

Open the actual Memora AI Companion.

Send:

```text
Hello Memora.
```

The UI must display a real Gemini-generated response.

Then test:

```text
What do I need to do today?
```

The AI should use the actual patient's routine.

---

## 26. Test Voice Only After Text AI Works

First establish:

```text
TEXT → GEMINI → TEXT
```

Then test:

```text
VOICE → GEMINI → VOICE
```

Do not debug voice and Gemini connectivity simultaneously.

---

## 27. Remove Temporary Diagnostics

After debugging:
- remove temporary public diagnostic endpoints
- remove unsafe debug output
- keep useful structured server logs if appropriate
- never leave secrets exposed

---

## 28. Acceptance Tests

### Test 1: Direct Gemini

```text
Backend
→ Gemini
→ "MEMORA GEMINI WORKS"
```

### Test 2: AI API

```text
Authenticated patient
→ AI endpoint
→ Gemini
→ response
```

### Test 3: Patient Context

```text
"What do I need to do today?"
→ actual routine
→ personalized response
```

### Test 4: Reminder

```text
"Remind me to turn off the stove in 15 minutes."
→ createReminder
→ database
→ confirmation
```

### Test 5: Frontend

```text
Memora UI
→ AI Companion
→ real Gemini response
```

### Test 6: Voice

```text
Microphone
→ STT
→ Gemini
→ TTS
```

Only mark a test PASS if it was actually run.

---

## 29. Final Report

After completing the work, provide:

### Root Cause

Exactly why the timeout occurred.

### Failure Layer

Choose:

```text
Frontend
API Client
Network
Backend
Authentication
Agent
Gemini SDK
Gemini API
Tool
Database
Configuration
```

### Gemini Status

```text
API key loaded: YES/NO
Direct Gemini request: PASS/FAIL
Model: ...
```

### Runtime Status

```text
Frontend → Backend: PASS/FAIL
Backend → Gemini: PASS/FAIL
Agent → Gemini: PASS/FAIL
Tools: PASS/FAIL
Conversation persistence: PASS/FAIL
```

### Files Modified

List exact paths.

### Tests Run

List each test with:

```text
PASS / FAIL / PARTIAL
```

### Remaining Issues

Be honest.

---

# FINAL RULE

Do not finish with:

> "The issue has been fixed."

unless the actual Memora application has been run and tested.

The goal is to find the REAL reason for:

> "Request timed out. Please connect to internet"

and make:

```text
PATIENT
 ↓
MEMORA
 ↓
REAL GEMINI
 ↓
PERSONALIZED RESPONSE
```

work reliably.
