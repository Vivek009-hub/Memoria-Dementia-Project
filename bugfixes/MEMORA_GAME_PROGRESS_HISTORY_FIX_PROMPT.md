# MEMORA - FIX GAME PROGRESS HISTORY
## Diagnose, Repair, Integrate & Verify Existing Game Progress

### Implementation Prompt

**Objective:** Fix the existing **Game Progress History** functionality in Memora so that completed cognitive-game sessions are correctly saved, retrieved, displayed, and kept associated with the correct patient.

**Critical constraint:** Do NOT redesign the Games section or rebuild the game system. Diagnose the existing implementation first, identify the actual break in the data flow, then make the smallest reliable changes necessary.

---

# 1. CORE REQUIREMENT

The expected flow is:

```text
Patient
   ↓
Opens Games
   ↓
Plays a game
   ↓
Completes game
   ↓
Game result generated
   ↓
Result saved to backend/database
   ↓
Progress/history API
   ↓
Frontend retrieves history
   ↓
Progress History displays actual completed games
```

Every stage must actually work.

Do not fix only the UI.

Do not fix only the database.

Trace the complete flow.

---

# 2. READ THE EXISTING PROJECT FIRST

Before changing anything, inspect the existing repository.

Read relevant documentation:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
```

Inspect the existing implementations from:

```text
B0-B14
F0-F17
```

Especially inspect:

```text
Cognitive Games
Game Results
Game Progress
Progress History
Patient Dashboard
Authentication
User model
Patient model
API client
Backend routes
Controllers
Services
Database models
MongoDB queries
```

---

# 3. SEARCH THE ENTIRE GAME FLOW

Search the repository for terms such as:

```text
game
games
gameResult
gameResults
score
progress
history
attempt
completion
completed
cognitive
patient
session
accuracy
duration
streak
```

Find:

```text
Game components
Game completion handlers
Result calculation
API calls
API routes
Controllers
Services
Models/schemas
Database queries
History components
Progress charts
Progress cards
```

---

# 4. DO NOT ASSUME THE CAUSE

Do not immediately rewrite the feature.

Determine exactly why Progress History is not working.

Potential causes include:

```text
Result never saved
Wrong API endpoint
Wrong HTTP method
Incorrect request body
Incorrect authenticated user
Patient ID mismatch
Database schema mismatch
Wrong field names
Frontend expects different response shape
History query returns empty data
Date filtering bug
Pagination bug
Game completion handler not firing
Result saved under wrong user
API response not mapped correctly
Frontend state not refreshed
Cache/stale state
Authorization failure
CORS/network issue
```

Find the actual cause from the code and runtime behavior.

---

# 5. TRACE FROM GAME COMPLETION

Start at the exact point where a game finishes.

Find the code that executes when:

```text
Game Completed
```

Verify:

```text
Score calculated
 ↓
Result object created
 ↓
Save API called
 ↓
Backend receives request
 ↓
Authentication identifies patient
 ↓
Validation passes
 ↓
Database write occurs
 ↓
Response returns
 ↓
Frontend updates state
```

If any step breaks, fix that step.

---

# 6. TRACE THE HISTORY READ FLOW

Then inspect the Progress History page/component.

Verify:

```text
History page opens
 ↓
Frontend requests history
 ↓
Correct API endpoint
 ↓
Correct authenticated user
 ↓
Backend queries correct records
 ↓
Database returns records
 ↓
Backend response shape
 ↓
Frontend parses response
 ↓
History UI renders records
```

---

# 7. USE EXISTING AUTHENTICATION

Do not introduce a second patient-identification mechanism.

Use the existing authenticated user/session.

The backend should determine the patient from authentication where possible.

Do not trust:

```text
patientId
userId
ownerId
```

from the request body as the sole authorization mechanism.

---

# 8. PATIENT DATA ISOLATION

A patient's progress must belong only to that patient.

Test:

```text
Patient A
 ↓
Own history
 = ALLOWED
```

```text
Patient A
 ↓
Attempts to retrieve Patient B history
 = DENIED
```

Never allow a patient to manipulate an ID in the URL/body and retrieve another patient's results.

---

# 9. INSPECT THE DATABASE MODEL

Find the existing game-progress/result model.

Do not create a second model unless the current one is genuinely unusable.

Determine the existing fields.

Potential fields may include:

```text
userId
patientId
gameId
gameType
score
accuracy
duration
difficulty
completedAt
createdAt
metadata
```

Use the fields that actually exist.

Do not blindly add duplicate fields.

---

# 10. SCHEMA CONSISTENCY

Check that the same field names are used consistently across:

```text
Frontend
 ↓
API request
 ↓
Controller
 ↓
Service
 ↓
Database model
 ↓
History response
 ↓
Frontend
```

Example of a bug to look for:

```text
Frontend sends:
patientId

Backend expects:
userId
```

or:

```text
Database stores:
completedAt

Frontend expects:
date
```

Fix the contract consistently.

---

# 11. GAME IDENTIFICATION

Inspect how games are identified.

Use the existing game identifier.

Do not create duplicate IDs for the same game.

History should be able to distinguish games such as:

```text
Memory Match
Pattern Recall
Word Recall
Sequence Game
```

or whatever games actually exist in the project.

Do not invent games that do not exist.

---

# 12. GAME COMPLETION SAVE

Every legitimate completed game should create a progress record if the existing product design expects this.

Verify that:

```text
Game completion
```

actually triggers the save operation.

Watch for:

```text
onComplete not called
handleComplete not awaited
API call after navigation
component unmount before request
silent catch()
```

Fix such issues where found.

---

# 13. ASYNC HANDLING

Make sure result persistence completes before the application assumes success.

Avoid:

```text
saveResult();
navigate("/games");
```

when the request can be cancelled or lost.

Prefer appropriate async handling:

```text
await saveResult();
then continue
```

according to the existing architecture.

Do not block the UI unnecessarily.

---

# 14. DUPLICATE RESULTS

Prevent accidental duplicate result records caused by:

```text
Double click
Repeated completion event
React effect firing twice
Network retry
User refreshing completion screen
```

Use an appropriate strategy compatible with the existing schema.

Do not create duplicate history entries for a single completed attempt.

---

# 15. FAILED SAVE

If saving a game result fails:

```text
Do not pretend it succeeded.
```

Use the existing error UI/notification system.

Do not silently swallow errors.

The user should receive a clear indication that progress could not be saved if the product flow requires that information.

---

# 16. HISTORY API

Inspect the existing history endpoint.

Do not create another endpoint if an existing one already serves this purpose.

If an endpoint is broken, fix it.

Conceptually:

```text
GET /api/games/progress
```

or the existing equivalent.

---

# 17. HISTORY QUERY

Verify the backend query:

```text
authenticated patient
+
game progress records
```

The query must use the correct ownership field.

Example concept:

```text
find({
  userId: authenticatedUserId
})
```

Do not hardcode a patient ID.

---

# 18. SORT ORDER

History should normally show the most recent completed games first.

Use actual timestamps.

Conceptually:

```text
completedAt DESC
```

Use the existing product convention if different.

---

# 19. DATE HANDLING

Inspect timezone/date conversion.

Avoid bugs where:

```text
UTC date
```

becomes the wrong local day.

Use consistent date handling across backend and frontend.

Do not hardcode dates.

---

# 20. HISTORY RESPONSE

Inspect the actual backend response.

Make sure the frontend expects exactly what the backend returns.

For example, if backend returns:

```json
{
  "results": [...]
}
```

the frontend must not expect:

```text
response.data.history
```

unless that is actually the API contract.

Fix the mismatch.

---

# 21. EMPTY HISTORY

If the patient has never completed a game, show the existing empty-state design.

Example concept:

```text
No game history yet.

Complete a game to start tracking your progress.
```

Do not display fake progress records.

---

# 22. LOADING STATE

Reuse the existing loading component.

Do not redesign the Games page.

History should not briefly display fake/old records while loading.

---

# 23. ERROR STATE

Reuse existing error handling.

If history retrieval fails:

```text
Show a clear error
```

Do not silently render an empty history and make it appear as though the patient has no records.

---

# 24. REFRESH AFTER GAME COMPLETION

After completing a game, ensure the newly saved result can appear in Progress History.

Possible approaches:

```text
Refetch history
```

or:

```text
Update existing state/store
```

Use whichever matches the existing architecture.

Do not create duplicate state-management systems.

---

# 25. NAVIGATION TEST

Test:

```text
Play game
 ↓
Complete game
 ↓
Navigate to Progress History
 ↓
New result appears
```

Also test:

```text
Complete game
 ↓
Refresh browser
 ↓
History still contains result
```

This proves the data is persisted rather than merely stored in React state.

---

# 26. DIRECT API TEST

Test the history API independently.

For an authenticated patient:

```text
GET history
```

should return the patient's actual records.

If it returns empty:

```text
Determine whether the database is empty
OR
the query is wrong.
```

Do not patch the frontend to hide an API/database problem.

---

# 27. DATABASE VERIFICATION

After completing a game, inspect the database.

Verify that a record actually exists.

The record should contain the correct:

```text
Patient/user ownership
Game
Score
Relevant metrics
Completion timestamp
```

Use the existing database schema.

---

# 28. BACKEND RESPONSE VERIFICATION

Confirm:

```text
HTTP status
Response body
Validation errors
Authorization errors
Database errors
```

Do not hide backend errors.

---

# 29. FRONTEND NETWORK VERIFICATION

Use browser/network testing to verify:

```text
Game completion request
History request
HTTP status
Request payload
Response payload
```

Identify any:

```text
400
401
403
404
409
500
```

and fix the actual cause.

---

# 30. PROGRESS CALCULATIONS

If the existing Progress History calculates:

```text
Average score
Best score
Average accuracy
Games completed
Recent performance
Streak
```

verify these calculations use actual records.

Do not hardcode them.

---

# 31. DO NOT CHANGE GAME LOGIC UNNECESSARILY

Do not rewrite the cognitive games themselves if they are already working.

Only change game logic if the progress-saving bug originates there.

Keep the scope focused on:

```text
Completion
Persistence
Retrieval
Display
```

---

# 32. DO NOT REDESIGN GAMES

Do not modify:

```text
Game colors
Game layout
Game cards
Game animations
Game navigation
Typography
Global design
```

unless a change is strictly necessary to fix the progress functionality.

---

# 33. DO NOT REBUILD THE PROGRESS UI

If the Progress History UI already exists:

```text
Keep it.
```

Fix the data connection behind it.

Only make minimal UI changes if the current component cannot correctly display the existing backend response.

---

# 34. DO NOT USE MOCK DATA

Search for:

```text
mockProgress
dummyProgress
sampleResults
hardcodedHistory
fakeScore
```

Remove production mock behavior.

The history must use real persisted data.

---

# 35. CACHE / STALE STATE

Inspect:

```text
React state
Context
Redux/Zustand
React Query
localStorage
sessionStorage
browser cache
```

If stale progress is being displayed, fix the actual caching/state invalidation issue.

Do not disable caching globally.

---

# 36. LOCAL STORAGE

If localStorage is currently being used for temporary game state, ensure it is not incorrectly treated as the permanent source of progress history.

Preferred:

```text
Database = source of truth
```

Local storage may be used for appropriate temporary/offline functionality if already supported.

---

# 37. OFFLINE BEHAVIOR

If the existing Games architecture supports offline play:

```text
Offline game result
 ↓
Temporary local queue
 ↓
Network restored
 ↓
Sync backend
 ↓
History updated
```

Only implement this if offline game functionality already exists.

Do not add a new offline system during this fix unless required.

---

# 38. AUTH TOKEN / SESSION

Inspect whether the history API request includes the correct authentication.

Verify:

```text
Logged-in patient
 ↓
History request
 ↓
Authenticated backend request
```

Fix token/cookie/API-client issues if found.

Reuse the existing auth client.

---

# 39. API CLIENT

Reuse the existing API client.

Do not scatter:

```text
fetch()
axios()
```

through components if the project already has a centralized API service.

---

# 40. ERROR LOGGING

Add useful server-side logging where necessary to diagnose:

```text
Result save failure
History query failure
Authorization failure
Validation failure
```

Do not log:

```text
passwords
tokens
secrets
unnecessary sensitive patient information
```

---

# 41. INDEXING

Inspect the history query.

If the database query filters by:

```text
userId/patientId
+
completedAt
```

consider an appropriate index if one does not already exist.

Only add an index justified by the real query.

---

# 42. TEST CASES

Create or update tests for:

## Result Saving

```text
Completed game → result saved
```

## History Retrieval

```text
Patient → own history
```

## Isolation

```text
Patient A → Patient B history = DENIED
```

## Persistence

```text
Complete game
 ↓
Refresh page
 ↓
Result remains
```

## Multiple Results

```text
Complete game 1
Complete game 2
Complete game 3
 ↓
All appear in history
```

## Ordering

```text
Newest result appears first
```

## Empty State

```text
No records → correct empty state
```

## Error Handling

```text
Backend unavailable → proper error
```

---

# 43. END-TO-END TEST

Run this exact workflow:

```text
1. Log in as Patient A
2. Open Games
3. Start a game
4. Complete the game
5. Confirm score/result is calculated
6. Confirm save request succeeds
7. Confirm database record exists
8. Open Progress History
9. Confirm the result appears
10. Refresh browser
11. Confirm result remains
12. Complete another game
13. Confirm both results appear
14. Log out
15. Log in as Patient B
16. Open Progress History
17. Confirm Patient A's results are NOT visible
```

---

# 44. REGRESSION TESTING

Verify that fixing progress history does not break:

```text
Game launch
Game gameplay
Score calculation
Game completion
Game restart
Game navigation
Patient Dashboard
Analytics
Achievements/streaks if already implemented
```

Do not modify unrelated features.

---

# 45. FRONTEND PROTECTION

The existing Games UI is approved.

At completion verify:

```text
Games page design = unchanged
Game cards = unchanged
Game gameplay UI = unchanged
Progress History visual design = unchanged
Navigation = unchanged
Global styling = unchanged
```

Only data/integration bugs should be fixed.

---

# 46. FILE CHANGE REPORT

At completion, list every modified file.

For each file:

```text
File:
Reason:
Change:
```

Separate:

```text
Frontend
Backend
Database
Tests
Documentation
```

If a file does not need modification, do not touch it.

---

# 47. DOCUMENTATION

Create/update:

```text
docs/GAME_PROGRESS_HISTORY.md
docs/GAME_PROGRESS_DEBUG_REPORT.md
```

Document:

```text
Game completion flow
Result persistence
History API
Database model
Authentication/ownership
Frontend data flow
Known edge cases
Tests
```

---

# 48. FINAL DEFINITION OF DONE

## Diagnosis

[ ] Existing game completion flow inspected
[ ] Existing history retrieval flow inspected
[ ] Actual root cause identified
[ ] No unnecessary rewrite

## Saving

[ ] Completed game result saved
[ ] Correct patient ownership
[ ] Correct game identifier
[ ] Score saved
[ ] Relevant metrics saved
[ ] Completion timestamp saved
[ ] Duplicate-save protection addressed

## Retrieval

[ ] History endpoint works
[ ] Correct patient identified
[ ] Correct records queried
[ ] Correct sort order
[ ] Correct response shape

## Frontend

[ ] Existing Progress History UI reused
[ ] Real data displayed
[ ] Loading state works
[ ] Empty state works
[ ] Error state works
[ ] Newly completed games appear
[ ] Refresh preserves history
[ ] No mock data

## Security

[ ] Authentication enforced
[ ] Patient ownership enforced
[ ] IDOR tested
[ ] Cross-patient access denied
[ ] Sensitive information protected

## Quality

[ ] Unit tests pass
[ ] Backend tests pass
[ ] Frontend tests pass
[ ] Integration tests pass
[ ] E2E test passes
[ ] Build passes
[ ] Lint passes
[ ] No unrelated UI changes
[ ] Documentation updated
[ ] No secrets committed

---

# 49. FINAL REPORT

Return exactly:

```text
GAME PROGRESS HISTORY FIX
STATUS: COMPLETE / BLOCKED

ROOT CAUSE:
...

GAME COMPLETION:
Result calculation: PASS/FAIL
Result persistence: PASS/FAIL
Database write: PASS/FAIL

HISTORY:
History API: PASS/FAIL
Database query: PASS/FAIL
Response mapping: PASS/FAIL
Frontend rendering: PASS/FAIL
Sorting: PASS/FAIL

PERSISTENCE:
Refresh test: PASS/FAIL
Multiple-result test: PASS/FAIL

SECURITY:
Authentication: PASS/FAIL
Patient isolation: PASS/FAIL
IDOR test: PASS/FAIL

ERROR HANDLING:
Save failure: PASS/FAIL
History failure: PASS/FAIL
Empty history: PASS/FAIL

FRONTEND:
Existing Games UI preserved: YES/NO
Existing Progress History UI preserved: YES/NO
Unrelated UI changed: YES/NO

TESTING:
Unit: PASS/FAIL
Backend: PASS/FAIL
Frontend: PASS/FAIL
Integration: PASS/FAIL
E2E: PASS/FAIL
Build: PASS/FAIL
Lint: PASS/FAIL

FILES CHANGED:
...

DATABASE CHANGES:
...

ROOT CAUSE FIX:
...

P0 ISSUES: X
P1 ISSUES: X
P2 ISSUES: X
P3 ISSUES: X

PRODUCTION BLOCKER: YES/NO
```

Never claim PASS without actually testing.

---

# 50. FINAL PRINCIPLE

Do not solve this problem by rebuilding the Games section.

Solve the actual data-flow problem:

```text
GAME
 ↓
COMPLETION
 ↓
RESULT
 ↓
SAVE
 ↓
DATABASE
 ↓
HISTORY API
 ↓
FRONTEND
 ↓
PROGRESS HISTORY
```

Every arrow must work.

The database must be the source of truth for persistent game history.

The authenticated patient must own their own records.

The existing Games and Progress History frontend design must remain intact.

**Diagnose first. Fix the actual broken link. Test the entire flow. Do not declare completion until a real completed game survives browser refresh and appears in the patient's Progress History.**
