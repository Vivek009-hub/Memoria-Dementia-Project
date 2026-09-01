# MEMORA: Voice Notes in Memories + Playback

## Objective

Implement a complete, production-quality **voice note feature for the existing Memora Memories system**.

Users must be able to:

1. Record a voice note while creating a memory.
2. Preview the recorded voice note before saving.
3. Save the voice note together with the memory.
4. Store the audio **locally on the existing server/local host**, consistent with the current memory photo upload approach.
5. Play the saved voice note while viewing/watching that memory.
6. Keep existing memories working even when they do not have a voice note.

This is an **existing Memora project** with frontend, backend, database, authentication, and memory functionality already implemented.

The goal is to **extend the existing Memory feature**, NOT rebuild it.

---

# 1. CRITICAL INSTRUCTIONS

Before changing any code:

### 1.1 Inspect the existing project

First inspect:

- Existing frontend structure
- Existing backend structure
- Existing Memory components/pages
- Memory creation form
- Memory viewer/detail/watch page
- Memory API routes
- Memory controller/service
- Memory database model/schema
- Existing image upload implementation
- Existing local file storage implementation
- Existing authentication/authorization
- Existing patient ownership checks
- Existing frontend API service/client
- Existing error/loading/success handling
- Existing UI/design system
- Existing reusable buttons, dialogs, cards, inputs, icons, notifications, etc.

Trace the complete existing memory flow:

```text
Memory Creation UI
        ↓
Frontend API Request
        ↓
Backend Route
        ↓
Controller/Service
        ↓
Memory Model
        ↓
MongoDB
        ↓
Stored Media
        ↓
Memory Viewer
```

Do NOT assume filenames, routes, schemas, or architecture.

Use the architecture already present in the repository.

---

# 2. DO NOT CREATE A SECOND MEMORY SYSTEM

This is extremely important.

Do NOT:

- Create a second Memory model
- Create duplicate memory routes
- Create duplicate memory controllers
- Create a separate unrelated memory page
- Create a parallel upload system
- Replace the existing memory architecture
- Create mock memories
- Create fake voice-note data
- Hardcode audio URLs
- Introduce a second state-management system unnecessarily

Instead:

> Extend the existing Memory implementation with voice-note support.

If the existing project already has an upload utility, middleware, storage directory, media service, or file-serving mechanism, reuse it.

---

# 3. EXISTING DESIGN MUST NOT BE REDESIGNED

The current Memora frontend design must remain intact.

Do NOT:

- Change the overall layout
- Replace the current design system
- Change fonts globally
- Change colors globally
- Redesign the Memory page
- Create a completely different card design
- Replace existing navigation
- Move existing sections unnecessarily
- Add unnecessary animations
- Turn the feature into a visually huge audio application

The voice feature should feel like it was always part of Memora.

Use the existing:

- Buttons
- Cards
- Dialogs/modals
- Form components
- Icons
- Typography
- Spacing
- Colors
- Responsive behavior
- Toast/notification system

Only add the UI required for recording and playback.

---

# 4. MEMORY CREATION: ADD VOICE NOTE

Find the existing **Create Memory** form.

Add a new section:

```text
Voice Note

[ 🎙 Record Voice Note ]

or, after recording:

[ ▶ Play ] [ Pause ]
[ ──────────────── ]
[ Re-record ] [ Remove ]
```

The exact visual implementation must follow the existing Memora UI.

Do not copy the above layout literally if it conflicts with the current design.

---

# 5. USE THE BROWSER MEDIARECORDER API

Use the browser's native:

```javascript
MediaRecorder
```

API unless the existing project already contains a suitable audio-recording implementation.

Expected flow:

```text
User clicks Record
        ↓
Request microphone permission
        ↓
Start MediaRecorder
        ↓
Show recording state
        ↓
User clicks Stop
        ↓
Create audio Blob
        ↓
Create temporary object URL
        ↓
Show preview player
```

Recording state should clearly communicate that recording is active.

Example states:

```text
Idle
Recording
Recorded
Uploading
Saved
Error
```

Do not create a complicated audio editor.

---

# 6. RECORDING CONTROLS

At minimum implement:

### Before recording

```text
🎙 Record Voice Note
```

### During recording

```text
🔴 Recording...

[ Stop ]
```

Optionally show recording duration.

### After recording

```text
▶ Play
⏸ Pause

[ Re-record ]
[ Remove ]
```

The user must be able to discard the recording before saving the memory.

If the browser does not support MediaRecorder:

```text
Voice recording is not supported in this browser.
```

Use the existing notification/error UI where possible.

---

# 7. MICROPHONE PERMISSION

Handle microphone permission properly.

If permission is denied:

```text
Microphone permission is required to record a voice note.
```

Do not crash the page.

Handle:

- Permission denied
- MediaRecorder unavailable
- Microphone unavailable
- Recording failure
- Browser compatibility problems

Stop all media tracks when recording ends or the component unmounts.

For example, ensure:

```javascript
stream.getTracks().forEach(track => track.stop())
```

is handled appropriately.

---

# 8. RECORDING LIMITS

Do not allow unlimited recordings.

Inspect the existing application's conventions first.

If no existing limit exists, implement a reasonable configurable limit such as:

```text
Maximum recording duration: 2 minutes
```

Do NOT hardcode this in multiple places.

Keep it configurable.

If the limit is reached:

```text
Maximum voice note duration reached.
```

and stop recording safely.

Also enforce a backend file-size limit.

---

# 9. AUDIO FORMAT

Use a browser-supported MediaRecorder MIME type.

Detect support instead of blindly assuming one format.

For example, check supported types before selecting:

```javascript
MediaRecorder.isTypeSupported(...)
```

Possible formats may include:

```text
audio/webm
audio/webm;codecs=opus
audio/mp4
```

Use whichever format is supported by the user's browser and existing backend/storage setup.

Do not force an unsupported MIME type.

---

# 10. CREATE MEMORY REQUEST

Integrate the voice note into the **existing memory creation request**.

The ideal flow is:

```text
Create Memory Form
    |
    |-- title
    |-- description
    |-- photo
    |-- voice note
    |
    ↓
multipart/form-data
    |
    ↓
Existing Memory API
```

If the current memory API already uses:

```text
multipart/form-data
```

extend that existing request.

Do NOT create a separate API request unless the current architecture genuinely requires it.

For example, conceptually:

```text
photo
voiceNote
title
description
...
```

Use the project's existing field naming conventions.

---

# 11. BACKEND FILE UPLOAD

Inspect the existing image upload implementation.

If the project already uses something such as:

```text
Multer
uploads/
local storage
media middleware
file service
```

reuse the same architecture.

Add audio handling to it rather than creating a separate unrelated upload architecture.

The backend must:

- Accept the voice-note file
- Validate MIME type
- Validate file size
- Generate a safe filename
- Store it locally
- Return/store the media path
- Handle upload errors cleanly

---

# 12. LOCAL STORAGE

Voice notes must be stored locally for the current Memora implementation.

Use the existing local upload/storage structure.

For example, if the current application has:

```text
uploads/memories/
```

then voice notes may be stored in an appropriate subdirectory such as:

```text
uploads/memories/audio/
```

or another structure consistent with the repository.

Do NOT invent a completely new storage system if one already exists.

The database should store a reference/path/URL, NOT the raw audio binary, unless the existing project specifically uses GridFS or another database-backed media system.

---

# 13. DATABASE / MEMORY MODEL

Extend the existing Memory schema/model.

Add only the minimum required information.

For example, conceptually:

```javascript
voiceNote: {
    path: String,
    mimeType: String,
    duration: Number
}
```

OR whatever structure best fits the existing schema.

Do NOT blindly use this exact structure.

First inspect the existing Memory model and follow its conventions.

At minimum the system must be able to determine:

- Whether a voice note exists
- Where it is stored
- How it should be played
- Which memory it belongs to

Existing memories must remain valid.

For old memories:

```text
voiceNote = null / undefined
```

must NOT cause errors.

---

# 14. MEMORY OWNERSHIP AND SECURITY

Voice notes are personal memory content.

Follow the existing Memory ownership and authorization system.

A patient must not be able to access another patient's private voice note simply by guessing its filename/path.

If the existing application already has protected media/download routes, reuse them.

If local static files are currently publicly exposed, inspect whether the new voice-note implementation needs a protected endpoint to maintain the existing privacy model.

Do not weaken existing authorization.

---

# 15. MEMORY VIEWER / WATCH MEMORY

Find the existing page/component where users:

- Open a memory
- View memory details
- Watch memories
- Browse memories
- View a memory slideshow

Add voice-note playback there.

Expected concept:

```text
Memory

[ Photo ]

Memory Title
Description

🎙 Voice Note

[ ▶ Play ] [ ━━━━━━━━━ ]

0:00 / 0:37
```

Use the existing UI components and styling.

Do NOT redesign the Memory Viewer.

---

# 16. AUDIO PLAYER

Use native HTML5 audio or the existing audio/player component.

Example:

```html
<audio controls />
```

or integrate it into an existing Memora player component.

The player should support:

- Play
- Pause
- Seek/progress
- Duration
- Current playback time
- Error handling

Do NOT autoplay the voice note.

The user should explicitly press Play.

This is important for accessibility and browser compatibility.

---

# 17. MEMORY WITHOUT VOICE NOTE

Existing memories may not have audio.

Therefore:

```text
Memory A
Photo + Description + Voice Note
```

should show the player.

While:

```text
Memory B
Photo + Description
```

should continue working normally.

Do NOT show a broken audio player for memories without voice notes.

Possible UI:

```text
No voice note
```

or simply omit the voice-note section.

Follow the existing UI philosophy.

---

# 18. DELETE / UPDATE MEMORY

Inspect the existing Memory functionality.

If users can delete a memory:

```text
Delete Memory
     ↓
Delete database record
     ↓
Clean up associated local voice-note file
```

If users can edit a memory:

Allow the voice note to be:

- Kept
- Replaced
- Removed

Do not add editing functionality if the existing Memory system does not support editing. Instead, make sure the new field does not break the existing edit flow.

When replacing/removing audio, prevent orphaned local files where practical.

---

# 19. ERROR HANDLING

Handle all important failures.

### Frontend

- Microphone permission denied
- Browser unsupported
- Recording failed
- Recording too long
- Audio preview failed
- Upload failed
- Memory creation failed
- Network failure

### Backend

- Invalid file type
- File too large
- Missing required fields
- Storage failure
- Database failure
- Unauthorized request

Use the existing error-handling architecture.

Do not expose raw stack traces to users.

---

# 20. CLEANUP

Pay special attention to cleanup.

If the user records a voice note but cancels memory creation:

```text
Temporary audio
        ↓
must not remain unnecessarily
```

If upload succeeds but database creation fails:

```text
Uploaded audio
        ↓
cleanup orphaned file where practical
```

If the user re-records:

```text
Old temporary recording
        ↓
release/revoke object URL
```

Use:

```javascript
URL.revokeObjectURL(...)
```

where appropriate.

Do not leave microphone streams running after recording stops.

---

# 21. FRONTEND API INTEGRATION

Inspect the existing API client/service.

Do not introduce a second API client.

Use the existing:

```text
axios
fetch
API service
hooks
query system
```

whatever the project already uses.

Make sure the request includes the voice note correctly.

Do not convert a multipart request into JSON if the existing upload architecture requires multipart.

---

# 22. AUTHENTICATION

The voice-note feature must work under the existing authenticated user flow.

Verify:

```text
Login
 ↓
Memory page
 ↓
Create memory
 ↓
Record voice
 ↓
Save memory
 ↓
Fetch memory
 ↓
Play voice
```

The correct authenticated patient/user should own the memory.

Do not bypass existing auth middleware.

---

# 23. ACCESSIBILITY

Because Memora is designed for accessibility and older users:

Use:

- Large enough record button
- Clear text labels
- Visible recording state
- Strong focus states
- Keyboard accessibility
- Clear error messages
- No color-only indication of recording
- Screen-reader-friendly labels where applicable

Avoid tiny icon-only controls unless the existing design system provides an accessible tooltip/label.

Example:

```text
🎙 Record Voice Note
```

is preferable to an unexplained microphone icon.

---

# 24. RESPONSIVE DESIGN

Verify the feature on:

- Desktop
- Tablet
- Mobile

The recording and playback controls must not overflow the existing Memory form or Memory Viewer.

Do not alter the overall responsive layout.

---

# 25. DO NOT USE MOCK DATA

This feature must use the actual:

```text
Browser microphone
        ↓
Real audio Blob
        ↓
Real multipart upload
        ↓
Real backend
        ↓
Real local file
        ↓
Real database reference
        ↓
Real memory viewer
        ↓
Real audio playback
```

Absolutely do NOT use:

```text
fakeAudioUrl
mockVoiceNote
dummyVoice
hardcoded audio
setTimeout()
fake success
```

to simulate functionality.

---

# 26. END-TO-END TESTING

After implementation, test the complete flow.

## Test 1: Create memory without audio

```text
Login
→ Create Memory
→ Add photo
→ Add title/description
→ Save
→ Open memory
```

Expected:

Memory works exactly as before.

---

## Test 2: Create memory with voice note

```text
Login
→ Create Memory
→ Add photo
→ Record voice
→ Stop
→ Preview
→ Save
→ Open memory
→ Press Play
```

Expected:

The exact recorded voice note plays.

---

## Test 3: Re-record

```text
Record
→ Stop
→ Re-record
→ Record again
→ Save
```

Expected:

Only the intended final recording is associated with the saved memory.

---

## Test 4: Remove recording

```text
Record
→ Stop
→ Remove
→ Save memory
```

Expected:

Memory saves successfully without a voice note.

---

## Test 5: Permission denied

```text
Create Memory
→ Record
→ Deny microphone permission
```

Expected:

Friendly error message.

No crash.

---

## Test 6: Old memory

Open a memory created before the voice-note feature.

Expected:

It displays normally.

No broken player.

No JavaScript errors.

---

## Test 7: Refresh

```text
Create memory with voice
→ Save
→ Refresh page
→ Open memory
→ Play voice
```

Expected:

Voice note still plays from the stored local file.

---

## Test 8: Patient isolation

If the existing application supports multiple users:

```text
Patient A creates memory + voice
Patient B logs in
```

Expected:

Patient B cannot access Patient A's private memory/voice note unless the existing sharing/permission system explicitly allows it.

---

# 27. CHECK FOR EXISTING PARTIAL IMPLEMENTATION

Because this Memora project has already gone through multiple development phases, first search for any existing voice-note/audio implementation.

Search for terms such as:

```text
voice
voiceNote
audio
MediaRecorder
recording
microphone
media
audioUrl
audioPath
```

If something already exists:

1. Determine whether it is functional.
2. Reuse it if possible.
3. Fix/integrate it instead of creating another implementation.
4. Remove only clearly dead/duplicate code if necessary.

Do NOT assume that missing UI means missing backend functionality.

Trace the entire flow first.

---

# 28. VERIFY NO BROKEN IMPORTS OR ROUTES

After implementation, verify:

- Frontend imports
- Backend imports
- API routes
- Controller references
- Model fields
- Upload middleware
- Static/protected media serving
- Environment configuration
- Build process

Run the project's existing lint/build/test commands where available.

Fix actual errors caused by this feature.

Do not rewrite unrelated parts of the application.

---

# 29. PRESERVE BACKWARD COMPATIBILITY

Existing Memory functionality must continue to work.

The feature must not break:

- Existing memories
- Existing photos
- Memory creation
- Memory editing
- Memory deletion
- Memory listing
- Memory viewer
- Authentication
- Patient ownership
- Caregiver access
- Existing API consumers

Voice notes are an additive feature.

---

# 30. FINAL VERIFICATION CHECKLIST

Before declaring completion, verify:

### Recording

- [ ] Record button works
- [ ] Microphone permission works
- [ ] Recording starts
- [ ] Recording stops
- [ ] Recording duration works
- [ ] Recording limit works
- [ ] Re-record works
- [ ] Remove works

### Upload

- [ ] Audio is included in the real memory request
- [ ] Backend receives the file
- [ ] MIME validation works
- [ ] Size validation works
- [ ] Audio is stored locally
- [ ] Database stores the correct reference

### Playback

- [ ] Existing memory viewer displays voice note when available
- [ ] Play works
- [ ] Pause works
- [ ] Seeking works
- [ ] Duration is shown
- [ ] Refresh still works
- [ ] Old memories without audio still work

### Security

- [ ] Authentication is preserved
- [ ] Ownership is preserved
- [ ] Unauthorized audio access is prevented according to existing privacy architecture

### Quality

- [ ] No mock data
- [ ] No duplicate Memory system
- [ ] No unnecessary redesign
- [ ] No broken existing Memory functionality
- [ ] No console errors
- [ ] No obvious memory leaks
- [ ] Microphone streams are cleaned up
- [ ] Object URLs are cleaned up

---

# 31. REQUIRED FINAL REPORT

When finished, provide a concise implementation report.

Use this format:

```text
MEMORA VOICE NOTE IMPLEMENTATION REPORT

Status:
PASS / PARTIAL / BLOCKED

Frontend:
- Files changed:
- Recording implemented:
- Preview implemented:
- Playback implemented:

Backend:
- Files changed:
- Upload implemented:
- Local storage implemented:
- Validation implemented:

Database:
- Memory schema updated:
- Backward compatibility verified:

Integration:
- Create Memory → Voice Upload: PASS/FAIL
- Save → Database: PASS/FAIL
- Memory Viewer → Playback: PASS/FAIL

Testing:
- New memory with voice: PASS/FAIL
- New memory without voice: PASS/FAIL
- Existing memory: PASS/FAIL
- Re-record: PASS/FAIL
- Remove voice: PASS/FAIL
- Permission denied: PASS/FAIL
- Refresh playback: PASS/FAIL
- Ownership/privacy: PASS/FAIL

Issues:
- P0:
- P1:
- P2:
- P3:

Remaining work:
- None
OR
- Explicit list of unfinished items
```

Do NOT report PASS unless the actual flow has been tested.

If something cannot be tested because of an environment limitation, clearly mark it as:

```text
BLOCKED
```

and explain why.

---

# 32. MOST IMPORTANT RULE

**Do not stop after creating the UI.**

The feature is only complete when this entire chain works:

```text
🎙 User records voice
        ↓
🔊 Browser creates real audio
        ↓
📦 Form uploads real audio
        ↓
🖥 Backend receives audio
        ↓
💾 Audio saved locally
        ↓
🗄 Memory stores audio reference
        ↓
📖 Memory is retrieved
        ↓
▶ User opens/watches memory
        ↓
🎧 User presses Play
        ↓
🔊 Original voice note plays
```

If any link in this chain is broken, continue debugging it.

**Build the smallest correct extension of the existing Memora architecture. Do not rebuild the application.**
