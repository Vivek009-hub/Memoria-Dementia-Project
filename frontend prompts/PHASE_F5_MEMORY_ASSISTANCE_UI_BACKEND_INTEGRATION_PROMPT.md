# Memora - Phase F5 Prompt: Memory Assistance UI + Backend Integration

**Phase:** F5  
**Name:** Memory Assistance UI + Backend Integration  
**Prerequisites:** F0, F1, F2, F3, and F4 completed and verified  
**Backend prerequisites:** Existing memory APIs and B11 AI/memory-assistance APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing Memory Assistance experience for Memora and connect it to the existing backend memory and AI systems.

F5 should make the memory portion of Memora usable through a simple, elder-friendly interface.

The target architecture is:

```text
Patient
   ↓
Memories
   ├── View Memories
   ├── Add Memory
   ├── Edit Memory
   ├── Delete Memory
   ├── Search Memories
   └── Ask Memora
          ↓
      Existing APIs
          ↓
      Memory Backend / B11 AI
```

The AI-assisted flow should remain grounded in the user's authorized memories:

```text
Patient Question
      ↓
Frontend
      ↓
B11 Memory Assistant API
      ↓
Authorized Memory Retrieval
      ↓
Grounded AI Response
      ↓
Frontend
```

The frontend must NOT directly access the AI provider.

---

# 1. READ FIRST

Before modifying anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F0_FRONTEND_FOUNDATION_REPORT.md
docs/F1_DESIGN_SYSTEM.md
docs/F1_DESIGN_SYSTEM_REPORT.md
docs/F2_AUTH_ROLE_UI_REPORT.md
docs/F3_PATIENT_DASHBOARD.md
docs/F3_PATIENT_DASHBOARD_REPORT.md
docs/F4_COGNITIVE_GAMES.md
docs/F4_COGNITIVE_GAMES_REPORT.md
```

Also inspect the actual implementation of:

```text
F0
F1
F2
F3
F4
B4
B11
Memory models
Memory routes
Memory controllers
Memory services
AI/memory-assistance routes
AI services
Authorization
```

Do not assume documentation exactly matches the repository.

The actual code and API contracts are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Inspect existing memory APIs first

Before creating frontend API modules, identify:

```text
Memory endpoints
Methods
Request fields
Response fields
Validation
Authorization
Ownership rules
Pagination
Search
Media support
AI/memory-assistance endpoints
```

Do not invent endpoints.

---

## Rule 2: Reuse F0-F4

Reuse:

```text
Central API client
Authentication state
Routing
Patient layout
Design tokens
Buttons
Cards
Forms
Dialogs
Loading
Empty states
Error states
Localization
Accessibility
```

Do not create duplicate systems.

---

## Rule 3: Backend authorization is authoritative

The frontend must not decide whether a patient can access another user's memory.

Correct:

```text
Frontend
 ↓
Backend authorization
 ↓
Authorized memory
```

Never:

```text
Frontend → all memories → filter by user
```

---

## Rule 4: AI must remain backend-only

Correct:

```text
Frontend
 ↓
B11 API
 ↓
Memory retrieval / grounding
 ↓
AI service
 ↓
AI provider
```

Never:

```text
Frontend
 ↓
OpenAI/Gemini/Anthropic API
```

---

# 3. F5 SCOPE

F5 should implement:

```text
Memory Library
Memory Cards
Memory Details
Create Memory
Edit Memory
Delete Memory
Memory Search
Memory Filtering where supported
Memory Media Display
Memory Empty States
Memory Loading States
Memory Errors
Memory AI Assistance
Grounded AI Questions
AI Response Display
AI Conversation State where supported
Voice UI foundation where supported
Accessibility
Localization
Responsive design
Privacy protections
```

Only implement functionality supported by the actual backend.

---

# 4. MEMORY HOME

Create:

```text
/app/memories
```

or the route established by F0/F3.

Example:

```text
💭 My Memories

[ + Add Memory ]

[ Search memories... ]

Recent Memories

┌──────────────────────────┐
│ 👨‍👩‍👧 Family             │
│ A day with my family     │
│ 12 August 2026           │
│                          │
│ [ Open ]                 │
└──────────────────────────┘
```

Use actual backend data.

---

# 5. MEMORY LIBRARY

Display authorized memories.

Potential information:

```text
Title
Short description
Date
Category
Image
Tags
```

Only display fields returned by the backend.

Do not invent metadata.

---

# 6. MEMORY CARD

Reuse the F1 card system.

A patient-facing card should remain simple:

```text
Memory title
Short preview
Date/category if useful
[ Open ]
```

Avoid dense metadata.

---

# 7. MEMORY DETAILS

Create a memory details page.

Potential:

```text
Memory title
Date
Description
Images
Other media
Tags
```

Only show authorized information.

---

# 8. MEMORY CREATION

Implement the create-memory flow according to the actual backend API.

Possible fields:

```text
Title
Description
Date
Category
Tags
Media
```

Use only actual supported fields.

---

# 9. CREATE MEMORY UI

Example:

```text
Add a Memory

Title
[________________]

What do you remember?
[________________]

Date
[________________]

[ Add Memory ]
```

Keep the form simple.

---

# 10. MEMORY EDIT

If backend supports editing:

```text
Open memory
 ↓
Edit
 ↓
Update
 ↓
Backend
 ↓
Updated memory
```

Reuse the same form where appropriate.

---

# 11. MEMORY DELETE

If deletion is supported:

```text
Delete Memory?

This memory will be removed.

[ Cancel ]
[ Delete ]
```

Use F1 dialog conventions.

Do not silently delete.

---

# 12. DELETE AUTHORIZATION

Do not assume the user can delete every memory.

The backend must determine authorization.

---

# 13. MEMORY MEDIA

If the backend supports media:

```text
Image
Video
Audio
Document
```

display only supported media types.

Do not assume all memories contain media.

---

# 14. IMAGE DISPLAY

Images should support:

```text
Loading
Fallback
Alt text
Responsive sizing
```

Do not let broken media destroy the layout.

---

# 15. IMAGE ACCESSIBILITY

Use meaningful alt text when the image conveys information.

Do not expose unnecessary personal details in alt text.

---

# 16. MEDIA SECURITY

Do not assume a media URL is public.

Follow the backend's actual media authorization mechanism.

Do not bypass protected media endpoints.

---

# 17. MEMORY SEARCH

If B0-B14 provides memory search:

```text
[ Search memories... ]
```

Use the actual search API.

Do not download all memories and search them in the browser.

---

# 18. SEARCH UX

Search should support:

```text
Loading
No results
Error
Clear search
```

Example:

```text
No memories found.

Try another word.
```

---

# 19. SEARCH DEBOUNCING

If live search is used:

```text
Debounce requests
```

to avoid sending an API request for every keystroke.

Use the project's established utilities if available.

---

# 20. SEARCH PRIVACY

Search only within the authenticated user's authorized memory scope.

Do not expose another user's memory through search results.

---

# 21. FILTERING

If backend supports categories/tags:

```text
Filter
```

may be provided.

Do not invent filter parameters.

---

# 22. PAGINATION

If the memory API supports pagination:

```text
Use the backend pagination contract.
```

Do not implement a fake frontend-only pagination layer over all memories.

---

# 23. SORTING

If backend supports sorting:

```text
Newest
Oldest
Relevant
```

use the actual API contract.

Do not silently change backend ordering assumptions.

---

# 24. EMPTY MEMORY STATE

When the patient has no memories:

```text
💭

No memories yet.

Add a meaningful moment to your memory collection.

[ Add Memory ]
```

Keep it encouraging and simple.

---

# 25. LOADING STATE

Use F1/F0 loading patterns.

Example:

```text
Loading your memories...
```

Avoid an unexplained blank page.

---

# 26. ERROR STATE

Example:

```text
We couldn't load your memories.

[ Try Again ]
```

Do not show backend stack traces.

---

# 27. PARTIAL MEDIA FAILURE

If a memory loads but its image fails:

```text
Keep the memory usable.
```

Show a media fallback instead of failing the entire page.

---

# 28. MEMORY FORM ERRORS

Show validation close to the relevant field.

Example:

```text
Please enter a title.
```

Do not display schema implementation details.

---

# 29. SAVE STATE

During create/update:

```text
Save button → loading
 ↓
Prevent duplicate submission
 ↓
Backend response
 ↓
Success/error
```

---

# 30. SUCCESS FEEDBACK

After creating a memory:

```text
Memory added.
```

Then show the created memory or return to the memory list according to the UX.

Do not require a manual refresh.

---

# 31. UPDATE FEEDBACK

After editing:

```text
Memory updated.
```

Refresh the relevant client state.

---

# 32. DELETE FEEDBACK

After deletion:

```text
Memory deleted.
```

Remove it from the current UI state after backend confirmation.

---

# 33. CONFLICT HANDLING

If the backend returns a conflict:

```text
409
```

handle it through the F0 error system.

Do not silently overwrite newer data.

---

# 34. MEMORY OWNERSHIP

The frontend should not allow arbitrary:

```text
userId
ownerId
patientId
```

to determine whose memories are modified.

Use authenticated identity and backend authorization.

---

# 35. MEMORY PRIVACY

Treat memories as sensitive personal information.

Avoid putting memory contents into:

```text
URLs
query parameters
console logs
analytics events
error messages
```

unless explicitly required and safe.

---

# 36. NO MEMORY CONTENT LOGGING

Do not use:

```text
console.log(memory)
```

in production code.

Avoid logging:

```text
Titles
Descriptions
Images
AI conversations
Private dates
```

unless there is a safe, documented reason.

---

# 37. AI MEMORY ASSISTANT

If B11 provides grounded memory assistance, create the patient-facing UI.

Potential route:

```text
/app/assistant
```

or the project's established route.

Example:

```text
🤖 Talk to Memora

What would you like to remember?

[ What did I do with my family last summer? ]

🎤 [ Speak ]

[ Ask ]
```

---

# 38. AI CHAT INTERFACE

Create a simple chat interface.

Support:

```text
User message
Assistant response
Loading
Error
Empty state
Conversation history where supported
```

Do not create a complex messaging interface.

---

# 39. AI CONVERSATION

If B11 supports conversation history:

```text
Use the backend conversation/session architecture.
```

Do not store complete AI conversations in random local state unless necessary.

---

# 40. AI API

Create/use the centralized API module:

```text
aiApi
```

Use the actual B11 endpoint.

Do not invent:

```text
POST /api/ai/chat
```

unless that is the actual backend route.

---

# 41. GROUNDED RESPONSE

The UI should present the AI response as information based on available memories.

Do not make the interface imply that the AI knows everything about the patient.

---

# 42. NO-MEMORY RESPONSE

If B11 says there is insufficient memory evidence:

Display the backend's safe response.

The frontend must not invent an answer.

Example concept:

```text
I couldn't find a memory about that.
```

Use the actual B11 response.

---

# 43. ANTI-HALLUCINATION

Do not:

```text
Generate fallback memories
Guess dates
Guess people
Guess locations
Invent events
```

If the backend returns uncertainty, preserve it.

---

# 44. AI ERROR

If AI service is unavailable:

```text
Memora couldn't answer right now.

[ Try Again ]
```

Do not expose provider errors or API keys.

---

# 45. AI LOADING

During response generation:

```text
Memora is thinking...
```

or an equivalent accessible status.

Do not make the UI appear frozen.

---

# 46. AI MESSAGE ACCESSIBILITY

Each message should be screen-reader understandable.

Use appropriate semantic roles.

---

# 47. VOICE INPUT

If the existing project supports browser voice input, prepare/use the established voice mechanism.

Potential:

```text
🎤 Speak
```

Do not build a new speech backend in F5.

---

# 48. VOICE STATES

If voice is supported, clearly show:

```text
Ready
Listening
Processing
Error
```

Do not silently activate the microphone.

---

# 49. MICROPHONE PERMISSION

If browser microphone access is required:

```text
Request permission only when needed.
```

Provide a clear explanation.

---

# 50. TEXT-TO-SPEECH

If supported:

```text
🔊 Read aloud
```

Use an accessible control.

Do not autoplay long AI responses unexpectedly.

---

# 51. VOICE SAFETY

Never send microphone data to an unknown external service.

Use only the project's approved voice architecture.

---

# 52. AI LANGUAGE

If B11 supports regional languages:

```text
Use the selected language.
```

Do not hardcode English-only AI controls.

---

# 53. MEMORY CATEGORIES

If categories exist in the backend:

```text
Use backend categories/enums.
```

Do not create conflicting frontend categories.

---

# 54. MEMORY TAGS

If tags are supported:

```text
Display
Create
Edit
```

according to the backend contract.

Do not invent tag persistence.

---

# 55. MEMORY DATE

If the memory has a date:

```text
Display using the project's standard date/time utilities.
```

Do not create custom date formatting.

---

# 56. MEMORY TIMELINE

If appropriate and supported, provide a simple chronological view.

Do not build a complex timeline unless useful.

---

# 57. MEMORY FAVORITES

Only implement favorites if the backend already supports them.

Do not create client-only favorites that disappear on refresh.

---

# 58. MEMORY SHARING

Only implement sharing if explicitly supported by the backend and project specification.

Do not create public sharing links for private memories.

---

# 59. CAREGIVER ACCESS

If caregivers can view selected patient memories, use the existing backend authorization model.

Do not expose caregiver access controls in the patient UI unless specified.

---

# 60. ADMIN ACCESS

Do not expose admin memory-management functionality through the patient memory interface.

Role-specific functionality belongs to appropriate later phases.

---

# 61. PATIENT DASHBOARD INTEGRATION

Update F3 only where necessary to link:

```text
Dashboard
 ↓
Memories
```

Do not redesign the dashboard.

---

# 62. AI DASHBOARD ENTRY

If F3 already contains the AI entry point:

```text
Make it navigate to the F5 AI/memory-assistance interface.
```

Do not duplicate the AI interface.

---

# 63. GAME INTEGRATION

Do not mix memory assistance with the F4 game engine.

Game results may later be used by B10/B11, but F5 should remain focused on memory assistance.

---

# 64. RESPONSIVE DESIGN

Memory UI must work on:

```text
Desktop
Tablet
Mobile browser
```

---

# 65. ELDER-FRIENDLY MEMORY UI

Prioritize:

```text
Large buttons
Readable text
Simple forms
Clear labels
Large images
Short descriptions
Simple navigation
```

---

# 66. ACCESSIBILITY

Support:

```text
Keyboard navigation
Screen readers
Visible focus
Semantic headings
Accessible forms
Accessible dialogs
Accessible status messages
```

---

# 67. IMAGE ACCESSIBILITY

Use appropriate:

```text
Alt text
Captions where applicable
Keyboard-accessible media controls
```

---

# 68. LOCALIZATION

All patient-facing memory UI must use the established localization architecture.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

---

# 69. TRANSLATION-SAFE LAYOUT

Long translated labels must not break:

```text
Buttons
Cards
Forms
Navigation
Dialogs
```

---

# 70. AI RESPONSE LOCALIZATION

If B11 supports language selection, send the correct language/context according to the backend contract.

Do not translate AI responses blindly in the frontend if B11 already handles language.

---

# 71. DATE/TIME LOCALIZATION

Use centralized date/time utilities.

---

# 72. SEARCH LANGUAGE

Search should work with supported language text according to backend capabilities.

Do not pretend multilingual semantic search works if the backend does not support it.

---

# 73. MEDIA UPLOAD

If memory creation supports file uploads:

Inspect the existing backend upload contract before implementation.

Determine:

```text
Upload endpoint
Multipart fields
Allowed types
Maximum size
Authentication
Error responses
```

Do not guess.

---

# 74. UPLOAD UX

If supported, provide:

```text
Select file
Upload progress if supported
Preview
Remove
Error
Retry
```

Keep the interaction simple.

---

# 75. FILE VALIDATION

Frontend validation may check:

```text
File type
File size
```

but backend validation remains authoritative.

---

# 76. UPLOAD SECURITY

Never trust:

```text
Filename
MIME type from browser
File extension
```

for backend security.

The backend must validate uploaded files.

---

# 77. IMAGE PREVIEW

If supported, show a preview before submission.

Do not upload repeatedly because of component rerenders.

---

# 78. UPLOAD FAILURE

Example:

```text
We couldn't upload this file.

[ Try Again ]
```

Do not expose storage-provider errors.

---

# 79. AI PRIVACY

Before sending a user question to B11:

```text
Send only the data required by the B11 contract.
```

Do not send the entire memory library from React.

---

# 80. AI AUTHORIZATION

The backend must determine which memories the AI can access.

The frontend must not construct its own authorization filter.

---

# 81. AI CONVERSATION PRIVACY

Do not expose:

```text
Another user's conversation
Another patient's memory
Another user's AI history
```

---

# 82. AI PROMPT INJECTION

Do not provide a frontend mechanism that allows arbitrary users to modify protected system instructions.

B11 remains responsible for prompt-injection defenses.

---

# 83. MEDICAL SAFETY

Memory assistance must not be presented as:

```text
Medical diagnosis
Clinical assessment
Disease progression measurement
Medical advice
```

If B11 returns a medical-safety response, display it appropriately.

Do not override safety messaging.

---

# 84. MEMORY CONTENT SAFETY

Do not transform personal memories into medical claims.

Example:

```text
Memory:
"I forgot where I left my keys."
```

Do not display:

```text
This indicates dementia progression.
```

---

# 85. ERROR HANDLING

Use F0 error handling for:

```text
400
401
403
404
409
413
429
500
Network failure
Timeout
Upload failure
AI failure
```

Only handle errors that actually apply to the existing APIs.

---

# 86. RETRY

Use bounded retry behavior for recoverable operations.

Do not repeatedly submit:

```text
Create
Update
Delete
AI request
```

without user intent.

---

# 87. DUPLICATE SUBMISSION

Prevent:

```text
Double-click create
Double-click update
Repeated delete
Repeated AI request
```

where appropriate.

---

# 88. CACHING

Use the F0 server-state architecture.

Do not create ad-hoc memory caches in every component.

---

# 89. CACHE INVALIDATION

After:

```text
Create
Update
Delete
```

ensure the relevant memory list/details state is refreshed or invalidated correctly.

---

# 90. STALE DATA

If memory details become stale:

```text
Use backend response as authoritative.
```

Do not silently overwrite newer server data.

---

# 91. OPTIMISTIC UPDATES

Use optimistic updates only where safe.

Avoid optimistic deletion/update if it can cause confusing private-data state.

If used, provide rollback behavior.

---

# 92. PERFORMANCE

Avoid:

```text
Downloading all memories unnecessarily
Rendering huge lists at once
Repeated AI requests
Repeated search requests
Large unoptimized images
```

---

# 93. LONG MEMORY CONTENT

Long memory descriptions should remain readable.

Use:

```text
Readable width
Spacing
Expandable content
```

where appropriate.

Do not truncate important content without a way to view it.

---

# 94. LONG AI RESPONSES

AI responses should remain readable.

Use:

```text
Paragraph spacing
Readable width
Scroll behavior
Read-aloud where supported
```

Do not create giant dense chat bubbles.

---

# 95. CHAT SCROLLING

If chat automatically scrolls to the newest message:

```text
Do not forcibly steal scroll position when the user is reading older content.
```

Use sensible scroll behavior.

---

# 96. AI RESPONSE STREAMING

If B11 supports streaming:

```text
Use the actual streaming contract.
```

If not, do not invent streaming.

---

# 97. AI STOP GENERATION

Only implement stop-generation if the backend supports cancellation.

Do not create a fake stop button.

---

# 98. MEMORY ACCESSIBILITY

Memory cards and details must be keyboard accessible.

---

# 99. DELETE ACCESSIBILITY

Delete confirmation must clearly state:

```text
What will be deleted
What action confirms deletion
How to cancel
```

---

# 100. TESTING

Add tests for:

```text
Memory library
Memory details
Create
Edit
Delete
Search
Empty state
Error state
Loading state
Media
AI assistant
AI loading
AI error
AI no-memory response
```

---

# 101. API TESTING

Test actual backend integration for:

```text
Get memories
Get memory
Create memory
Update memory
Delete memory
Search
AI request
```

Only test endpoints that actually exist.

---

# 102. AUTHORIZATION TESTING

Verify:

```text
Authenticated patient → own memories
Unauthorized user → denied
```

Do not rely solely on frontend tests.

---

# 103. MEMORY PRIVACY TESTING

Verify that:

```text
User A cannot see User B's memory
User A cannot edit User B's memory
User A cannot delete User B's memory
```

using the real backend authorization behavior.

---

# 104. AI PRIVACY TESTING

Verify:

```text
AI request uses authenticated user
AI retrieves only authorized memories
```

Use B11's actual security model.

---

# 105. AI GROUNDING TESTING

Test at least:

```text
Question answered from existing memory
Question with no matching memory
Question requesting unsupported information
```

The frontend must preserve the backend's safe response.

---

# 106. NO-HALLUCINATION TEST

Verify the frontend does not:

```text
Replace empty response
Guess missing facts
Insert fake memories
Rewrite uncertainty as certainty
```

---

# 107. CREATE/UPDATE TESTING

Test:

```text
Valid create
Invalid create
Successful update
Invalid update
Backend validation failure
Network failure
Duplicate submission
```

---

# 108. DELETE TESTING

Test:

```text
Cancel delete
Confirm delete
Delete failure
Successful delete
```

---

# 109. SEARCH TESTING

Test:

```text
Search success
No results
Search error
Clear search
Debounced request
```

---

# 110. MEDIA TESTING

If uploads exist:

```text
Valid file
Invalid file
Oversized file
Upload failure
Preview
Retry
```

Use actual backend constraints.

---

# 111. ACCESSIBILITY TESTING

Test:

```text
Keyboard navigation
Focus
Screen-reader labels
Forms
Dialogs
Images
AI messages
Status announcements
```

---

# 112. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile browser
```

especially:

```text
Memory cards
Forms
Images
AI chat
Dialogs
```

---

# 113. BROWSER CONSOLE

Check for:

```text
Unhandled exceptions
React/framework warnings
Failed requests
Memory leaks
Accessibility warnings
```

Do not leave meaningful errors unresolved.

---

# 114. SECURITY REVIEW

Inspect for:

```text
Memory content in logs
Tokens in logs
Sensitive data in URLs
Unsafe HTML rendering
Unsafe media URLs
Direct AI provider calls
Direct database access
```

---

# 115. RICH TEXT

If memory descriptions or AI responses contain rich text:

```text
Sanitize untrusted HTML.
```

Do not use unsafe `dangerouslySetInnerHTML` without proper sanitization.

---

# 116. MARKDOWN

If B11 returns Markdown:

```text
Use a safe Markdown renderer.
```

Do not allow arbitrary unsafe HTML.

---

# 117. URL HANDLING

If memories contain links:

```text
Validate/safely render URLs.
```

Do not blindly render arbitrary JavaScript URLs.

---

# 118. USER EXPERIENCE

The patient should be able to:

```text
Open Memories
 ↓
Find a memory
 ↓
Read it
 ↓
Add/edit if permitted
 ↓
Ask Memora about memories
```

without complicated navigation.

---

# 119. PATIENT DASHBOARD

Ensure F3's:

```text
Memories card
AI Assistant card
```

lead to the actual F5 interfaces.

Do not duplicate these features inside the dashboard.

---

# 120. NO FEATURE CREEP

Do NOT implement:

```text
Caregiver memory management
Admin content management
Community sessions
Meeting Circle
Notifications backend
Safety backend
Game engine
Analytics dashboard
```

unless explicitly required by the existing memory feature contract.

---

# 121. MULTI-DEVELOPER RULE

Future developers must use:

```text
F0 API architecture
F1 design system
F2 authentication
F3 patient shell
```

Do not create a second memory UI architecture.

If multiple developers work on:

```text
Memory Library
Memory Editor
AI Assistant
Media
```

they must share the same components and API conventions.

---

# 122. GIT SAFETY

Before modifying:

```bash
git status
```

Do not use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's work.

---

# 123. DEFINITION OF DONE

F5 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] Memory backend inspected  
[ ] B11 implementation inspected  
[ ] Actual memory APIs verified  
[ ] Actual B11 APIs verified  
[ ] Memory library implemented  
[ ] Memory cards implemented  
[ ] Memory details implemented  
[ ] Create memory implemented  
[ ] Edit memory implemented where supported  
[ ] Delete memory implemented where supported  
[ ] Search implemented where supported  
[ ] Filtering implemented where supported  
[ ] Sorting implemented where supported  
[ ] Pagination implemented where supported  
[ ] Media display implemented where supported  
[ ] Media upload implemented where supported  
[ ] Empty state implemented  
[ ] Loading state implemented  
[ ] Error state implemented  
[ ] Retry handling implemented  
[ ] Duplicate submissions prevented  
[ ] Cache invalidation implemented  
[ ] Patient authorization respected  
[ ] Memory privacy verified  
[ ] AI assistant UI implemented  
[ ] AI API integrated through B11  
[ ] No direct AI provider access  
[ ] AI loading state implemented  
[ ] AI error state implemented  
[ ] No-memory response handled  
[ ] Grounded-response behavior preserved  
[ ] No hallucinated frontend fallback  
[ ] AI conversation implemented where supported  
[ ] Voice UI implemented where supported  
[ ] Text-to-speech implemented where supported  
[ ] Microphone permission handled where supported  
[ ] Localization implemented  
[ ] Translation-safe layouts verified  
[ ] Responsive design verified  
[ ] Accessibility verified  
[ ] Keyboard navigation verified  
[ ] Screen-reader semantics verified  
[ ] Media accessibility verified  
[ ] Rich text safely rendered if applicable  
[ ] No sensitive memory logging  
[ ] No sensitive data in URLs  
[ ] No direct database access  
[ ] No direct AI provider access  
[ ] No medical claims introduced  
[ ] Component tests added  
[ ] API integration tests added  
[ ] Authorization/privacy tests performed  
[ ] AI grounding tests performed  
[ ] Create/update/delete tests performed  
[ ] Search tests performed  
[ ] Media tests performed where applicable  
[ ] Accessibility tests performed  
[ ] Responsive tests performed  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 124. FINAL REPORT

Create:

```text
docs/F5_MEMORY_ASSISTANCE_REPORT.md
```

Use:

```text
# Memora F5 Memory Assistance Report

## Objective

## Memory Backend APIs Used

## B11 APIs Used

## Memory Library

## Memory Cards

## Memory Details

## Create Memory

## Edit Memory

## Delete Memory

## Search

## Filtering

## Sorting

## Pagination

## Media

## Uploads

## AI Assistant

## AI Grounding

## No-Memory Handling

## AI Conversation

## Voice Support

## Accessibility

## Localization

## Responsive Design

## Privacy

## Security

## Cache Strategy

## Error Handling

## Files Created

## Files Modified

## Tests Executed

## Authorization Tests

## AI Grounding Tests

## Accessibility Tests

## Media Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Backend Changes

## Recommendations for F6
```

---

# 125. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Memory library result
Memory details result
Create result
Edit result
Delete result
Search result
Media result
AI assistant result
B11 integration result
Grounding result
Privacy result
Authorization result
Accessibility result
Responsive result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 126. STOP CONDITION

After F5 is complete:

**STOP.**

Do not automatically implement F6.

The next phase is:

```text
F6
Reminders & Daily Routine UI + Backend Integration
```

F6 will build the patient-facing reminder and daily-routine experience using the existing reminder APIs.

---

# FINAL PRINCIPLE

F5 should make Memora's memory system feel like:

```text
A personal memory library
        +
A simple memory editor
        +
A safe memory search
        +
A grounded AI companion
```

The critical architecture is:

```text
Patient
  ↓
Memora UI
  ↓
Central API Layer
  ├───────────────┐
  ↓               ↓
Memory APIs       B11
  ↓               ↓
Memory Data       Authorized Memory Retrieval
                  ↓
                AI Service
                  ↓
             Grounded Response
```

The frontend must remain a presentation and interaction layer.

Never move authorization, memory ownership, grounding, hallucination prevention, or AI security into client-side business logic.
