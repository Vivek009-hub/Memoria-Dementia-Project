# Memora - Phase F4 Prompt: Cognitive Games UI + Backend Integration

**Phase:** F4  
**Name:** Cognitive Games UI + Backend Integration  
**Prerequisites:** F0, F1, F2, and F3 completed and verified  
**Backend prerequisite:** Existing B4 cognitive-game APIs must be inspected and used  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing cognitive gaming experience for Memora and connect it to the existing backend game system.

F4 is responsible for the complete web UI and interaction layer for cognitive games.

The target flow is:

```text
Patient Dashboard
      ↓
🧠 Cognitive Games
      ↓
Game Library
      ↓
Select Game
      ↓
Game Instructions
      ↓
Start Game
      ↓
Play
      ↓
Submit Result
      ↓
Backend B4
      ↓
Result / Summary
      ↓
B10 Analytics
      ↓
B11 AI Recommendation
```

The frontend must use the existing B4 APIs and existing backend architecture.

Do NOT rebuild the game backend.

Do NOT bypass B4.

Do NOT create a second analytics system.

Do NOT make unsupported medical claims based on game performance.

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
```

Also inspect the actual implementation of:

```text
F0
F1
F2
F3
B4
B10
B11
```

Do not assume the documentation exactly matches the code.

The actual repository and backend implementation are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Inspect B4 before coding

Identify the actual:

```text
Game models
Game routes
Game controllers
Game services
Game types
Game configuration
Game result APIs
Game session APIs
Scoring behavior
Validation
Authorization
```

Do not invent endpoints or response properties.

---

## Rule 2: Reuse F0-F3

Reuse:

```text
API client
Auth state
Routing
Patient layout
Design tokens
Buttons
Cards
Dialogs
Loading
Error states
Empty states
Localization
Accessibility
```

Do not create duplicate implementations.

---

## Rule 3: Backend is authoritative

The backend determines:

```text
Which games exist
Which games are available
Game configuration
User authorization
Game session validity
Result validity
Score/result persistence
```

The frontend handles:

```text
Presentation
Interaction
Input collection
Timer display
Game state UI
Result display
```

Do not trust client-calculated results for security or authoritative analytics if B4 already calculates them.

---

# 3. F4 SCOPE

F4 should implement:

```text
Game Library
Game Cards
Game Details
Instructions
Game Start
Game Play UI
Game Progress
Timer UI where applicable
Answer/Input UI
Game Completion
Result Submission
Result Summary
Retry / Play Again
Navigation
Loading
Empty
Error
Offline handling
Accessibility
Localization
```

Only implement game types actually supported by B4.

---

# 4. GAME DISCOVERY

Build:

```text
/app/games
```

or the route established by F3/F0.

The page should show available games using real B4 data.

Example:

```text
🧠 Cognitive Games

Choose an activity

┌──────────────────────────┐
│ 🧩 Memory Match          │
│ Exercise your memory     │
│                          │
│ [ Play ]                 │
└──────────────────────────┘

┌──────────────────────────┐
│ 🔢 Number Recall         │
│ Remember the sequence    │
│                          │
│ [ Play ]                 │
└──────────────────────────┘
```

Use actual games from the backend.

Do not invent games solely for demonstration.

---

# 5. GAME LIBRARY

Each game card should provide:

```text
Game name
Simple description
Icon/image if available
Difficulty if backend provides it
Estimated duration if backend provides it
Primary action
```

Do not display unsupported metadata.

---

# 6. GAME CARD

Reuse the F1/F3 card system.

Avoid excessive information.

Patient-facing card:

```text
Game
Short explanation
[ Play ]
```

is preferable to a dense statistics card.

---

# 7. GAME DETAILS

If the backend supports game details/configuration, create a simple details page.

Possible:

```text
Game name
Description
What you will do
Estimated time
[ Start Game ]
```

Do not overwhelm the user with technical configuration.

---

# 8. INSTRUCTIONS

Every game must have a clear instruction state where appropriate.

Example:

```text
🧠 Memory Match

Match the cards that belong together.

Take your time.

[ Start Game ]
```

Instructions must be:

```text
Short
Clear
Readable
Accessible
```

---

# 9. INSTRUCTION ACCESSIBILITY

Instructions should:

```text
Have readable text
Have sufficient contrast
Be screen-reader accessible
Not rely on color alone
```

---

# 10. GAME START FLOW

Preferred flow:

```text
Game selected
 ↓
Details/instructions
 ↓
Start
 ↓
Game initializes
 ↓
Play
```

Do not start a game unexpectedly when a card is clicked.

---

# 11. GAME SESSION

If B4 has a game-session concept, use it.

Possible:

```text
Create/start session
 ↓
Receive session/game state
 ↓
Play
 ↓
Submit result
```

Use the actual B4 API contract.

---

# 12. GAME STATE

Keep temporary gameplay state in the frontend only as required.

Examples:

```text
Current question
Current round
Selected answer
Elapsed time
Displayed sequence
Current UI state
```

Do not treat frontend state as authoritative persistence.

---

# 13. GAME STATE MACHINE

Use a clear conceptual state:

```text
IDLE
 ↓
STARTING
 ↓
PLAYING
 ↓
SUBMITTING
 ↓
COMPLETED
```

Error path:

```text
STARTING → ERROR
PLAYING → ERROR
SUBMITTING → ERROR
```

Avoid ambiguous state combinations.

---

# 14. GAME LOADING

During game initialization:

```text
Loading game...
```

Do not allow duplicate start requests.

---

# 15. START BUTTON

The Start button should:

```text
Be large
Be accessible
Show loading state
Prevent double submission
```

---

# 16. GAME UI

Game UI must be simple.

Avoid:

```text
Tiny controls
Dense panels
Unnecessary statistics
Distracting animations
```

Prefer:

```text
One task
One clear instruction
One primary interaction
```

---

# 17. LARGE INTERACTION TARGETS

Game controls should be comfortable for touch and mouse.

Especially:

```text
Answer buttons
Cards
Tiles
Choices
Navigation
Submit
```

---

# 18. TIMER

If B4 defines a time limit, display it clearly.

Example:

```text
Time left: 00:42
```

Do not invent a timer if the backend game does not have one.

---

# 19. TIMER ACCESSIBILITY

Do not communicate time only through rapidly changing visual effects.

Provide an accessible textual representation.

---

# 20. TIMER COMPLETION

When time expires:

```text
Stop accepting answers
 ↓
Finalize game
 ↓
Submit result
```

Use the actual B4 behavior.

Do not allow the patient to submit conflicting results.

---

# 21. QUESTION / ROUND DISPLAY

If the game contains multiple questions or rounds, display progress simply.

Example:

```text
Question 3 of 10
```

or:

```text
Round 3
```

Use only information supported by the game model.

---

# 22. PROGRESS

Use a simple progress indicator.

Avoid complicated charts during gameplay.

---

# 23. ANSWER INPUT

Use the appropriate F1 components:

```text
Large buttons
Radio options
Cards
Text input
Number input
```

depending on the actual game.

---

# 24. ANSWER FEEDBACK

If the game design includes immediate feedback:

```text
Correct
Try again
Next
```

follow the backend/game specification.

Do not expose answer correctness if the game is designed to reveal it only at the end.

---

# 25. GAME NAVIGATION

During active gameplay, prevent accidental navigation where appropriate.

If leaving the game would lose progress:

```text
Leave game?

Your current progress may be lost.

[ Stay ]
[ Leave ]
```

---

# 26. BACK BUTTON

Use appropriate confirmation when leaving an active game.

Do not block navigation unnecessarily for completed games.

---

# 27. GAME COMPLETION

When gameplay finishes:

```text
Finalize
 ↓
Submit result
 ↓
Wait for backend
 ↓
Show result summary
```

---

# 28. RESULT SUBMISSION

Use the actual B4 result endpoint.

Do not send:

```text
Fake score
Fake duration
Fake answers
```

Use actual game state.

---

# 29. RESULT AUTHORITY

If B4 calculates the authoritative result:

```text
Frontend sends required inputs
 ↓
Backend calculates/validates
 ↓
Backend returns result
 ↓
Frontend displays result
```

Do not override backend results.

---

# 30. RESULT SCREEN

Create a simple result screen.

Potential:

```text
🎉 Game Complete

Well done!

Score
85

Time
02:14

[ Play Again ]
[ Back to Games ]
```

Only show metrics actually returned by B4.

---

# 31. SCORE LANGUAGE

Avoid medical language.

Do not say:

```text
Your dementia improved.
Your memory is getting worse.
You are clinically healthy.
```

Instead use neutral language:

```text
You completed the activity.
Your score was 85.
```

---

# 32. PERFORMANCE FEEDBACK

If the backend provides safe feedback:

```text
Completed
Score
Accuracy
Time
```

display it clearly.

Do not create unsupported interpretations.

---

# 33. ANALYTICS INTEGRATION

If B4 automatically feeds B10:

```text
Game result
 ↓
B10 analytics
```

the frontend should not duplicate analytics persistence.

---

# 34. AI RECOMMENDATION INTEGRATION

If B11 provides recommendations based on game results:

```text
Game
 ↓
B4 result
 ↓
B10 analytics
 ↓
B11 recommendation
```

the frontend may display the recommendation through its API.

Do not calculate AI recommendations in React.

---

# 35. RECOMMENDATION LANGUAGE

Do not frame recommendations as medical diagnosis.

Preferred:

```text
You may enjoy trying this activity next.
```

Avoid:

```text
You need this game because your memory is declining.
```

---

# 36. PLAY AGAIN

Allow retry if the backend/game specification permits.

Use:

```text
[ Play Again ]
```

Do not accidentally reuse the previous game session.

Start a new valid session if B4 requires one.

---

# 37. BACK TO GAMES

Provide:

```text
[ Back to Games ]
```

using normal routing.

---

# 38. DASHBOARD RETURN

Provide a simple way to return to the patient dashboard.

Reuse F3 navigation.

---

# 39. GAME HISTORY

Only implement game-history UI if B4/B10 already provides the necessary API and it is within the F4 scope.

If not, leave it for the appropriate analytics phase.

Do not create a new history backend.

---

# 40. EMPTY GAME LIBRARY

If no games are available:

```text
🧠
No games are available right now.

Please try again later.
```

Do not show fake games.

---

# 41. GAME NOT FOUND

If a requested game does not exist:

```text
We couldn't find that game.

[ Back to Games ]
```

---

# 42. GAME UNAVAILABLE

If backend returns unavailable/not authorized:

```text
This activity is not available right now.
```

Do not expose backend implementation details.

---

# 43. API ERROR

Handle:

```text
400
401
403
404
409
429
500
Network failure
Timeout
```

through the F0 error system.

---

# 44. RETRY

For recoverable failures:

```text
[ Try Again ]
```

Do not automatically retry result submission indefinitely.

---

# 45. SUBMISSION FAILURE

If result submission fails:

```text
We couldn't save your result.

[ Try Again ]
```

Do not silently discard the result.

Do not falsely show "saved" if the backend rejected it.

---

# 46. DUPLICATE SUBMISSION

Prevent duplicate result submissions caused by:

```text
Double-click
Slow network
Retry
Browser lag
```

Use a submission state.

---

# 47. OFFLINE GAMEPLAY

Only support offline gameplay if the existing project explicitly supports it.

Do not invent offline persistence for F4.

If the game requires connectivity:

```text
You need an internet connection to play this activity.
```

---

# 48. OFFLINE RESULT

If offline result persistence is not supported:

Do not claim:

```text
Result saved
```

until the backend confirms it.

---

# 49. NETWORK RECOVERY

If the game supports recovery:

```text
Connection lost
 ↓
Retry / Resume
```

Use actual supported behavior.

---

# 50. ACCESSIBILITY

All games must follow F1 accessibility standards.

At minimum:

```text
Keyboard access
Visible focus
Screen-reader labels
Large controls
Sufficient contrast
Semantic structure
```

---

# 51. COLOR ACCESSIBILITY

Never make a game answer depend only on:

```text
Red
Green
Blue
```

Use:

```text
Shape
Text
Icon
Position
```

where necessary.

---

# 52. AUDIO

If audio is used:

```text
Provide visual alternative where appropriate
Provide controls
Do not autoplay unexpected sound
```

---

# 53. ANIMATION

Avoid rapid flashing or excessive motion.

Respect reduced-motion preferences.

---

# 54. COGNITIVE LOAD

Games should not have:

```text
Unnecessary menus
Multiple competing actions
Tiny instructions
Dense statistics
```

---

# 55. ELDER-FRIENDLY GAME DESIGN

Prefer:

```text
Large interaction areas
Short instructions
High readability
Predictable interaction
Clear progress
Clear completion
```

---

# 56. VOICE SUPPORT

If the game specification supports voice interaction, design the UI so it can later integrate:

```text
Voice input
Voice instructions
Text-to-speech
```

Do not implement a new voice backend in F4.

---

# 57. LOCALIZATION

All user-facing game UI must use the established localization system.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

---

# 58. TRANSLATION-SAFE GAME UI

Do not hardcode widths that break when translated text becomes longer.

Test longer labels.

---

# 59. DATE/TIME

Use the project's standard time/date utilities.

Do not create custom date formatting inside game components.

---

# 60. GAME COMPONENT ARCHITECTURE

Create reusable game components where justified.

Potential:

```text
GameCard
GameHeader
GameInstructions
GameProgress
GameTimer
AnswerOption
GameResult
GameError
```

Only create components that improve reuse.

---

# 61. GAME-SPECIFIC COMPONENTS

Game-specific mechanics should remain isolated.

Example:

```text
games/
├── GameLibrary
├── GameDetails
├── components/
└── types/
```

Adapt to the actual architecture.

Do not put every game into one giant component.

---

# 62. GAME REGISTRY

If multiple game types exist, use a clean mapping/registry where appropriate.

Avoid giant conditionals such as:

```text
if game === "A"
else if game === "B"
else if game === "C"
...
```

unless the number of game types is genuinely small.

---

# 63. BACKEND GAME TYPES

Use actual backend game identifiers/enums.

Do not create frontend-only game IDs that conflict with B4.

---

# 64. GAME CONFIGURATION

If B4 returns configuration:

```text
Use backend configuration.
```

Do not duplicate configuration values in frontend code unless explicitly required.

---

# 65. SECURITY

Do not trust:

```text
Frontend score
Frontend user ID
Frontend role
Frontend game permissions
```

for authorization.

---

# 66. USER ID

Do not allow users to submit arbitrary user IDs.

Use authenticated session identity according to the B4 API.

---

# 67. GAME RESULT PRIVACY

Game results are user data.

Do not display another user's results.

Do not put private game results into URLs unnecessarily.

---

# 68. MEDICAL SAFETY

Do not turn game scores into diagnosis.

Do not claim:

```text
Dementia diagnosis
Disease progression
Clinical improvement
Clinical deterioration
```

unless the backend/project explicitly provides a validated clinical workflow.

---

# 69. ANALYTICS PRIVACY

Do not expose internal analytics fields that are not intended for patients.

Use patient-safe API responses.

---

# 70. PERFORMANCE

Games should remain responsive.

Avoid:

```text
Unnecessary rerenders
Huge assets
Unbounded timers
Excessive state updates
Memory leaks
```

---

# 71. TIMER CLEANUP

If timers are used:

```text
Start timer
 ↓
Cleanup on unmount
 ↓
Stop timer after completion
```

Do not leave timers running after navigation.

---

# 72. EVENT LISTENER CLEANUP

Remove:

```text
Keyboard listeners
Pointer listeners
Resize listeners
Timers
Subscriptions
```

when components unmount.

---

# 73. GAME SESSION CLEANUP

When a game completes or is abandoned, clean up temporary client state.

Do not accidentally reuse an old session.

---

# 74. BROWSER REFRESH

Decide how refresh behaves during active gameplay based on B4 capabilities.

If recovery is not supported:

```text
Refresh may end the game.
```

Do not falsely claim recovery.

---

# 75. BACKEND INTEGRATION TEST

Use the real development backend.

Test:

```text
Get games
 ↓
Open game
 ↓
Start session if supported
 ↓
Play
 ↓
Submit
 ↓
Receive result
```

---

# 76. B10 VERIFICATION

If B4 result integration with B10 exists, verify:

```text
Game completion
 ↓
B10 receives/contains result
```

Do not duplicate analytics storage.

---

# 77. B11 VERIFICATION

If B11 recommendations are already available after game completion, verify:

```text
Game result
 ↓
B11
 ↓
Recommendation
```

Only display the recommendation if the backend actually returns one.

---

# 78. PATIENT DASHBOARD INTEGRATION

Update F3 dashboard only if necessary to link to the games feature.

Do not redesign the entire dashboard.

---

# 79. TESTING

Add tests for:

```text
Game library
Game selection
Instructions
Start
Gameplay state
Timer
Answer input
Completion
Submission
Result screen
Retry
Errors
```

---

# 80. API TESTING

Test:

```text
Successful game fetch
Unauthorized request
Game not found
Game unavailable
Successful start
Successful result submission
Submission failure
Network failure
```

Use actual API contracts.

---

# 81. GAME STATE TESTING

Test:

```text
IDLE
STARTING
PLAYING
SUBMITTING
COMPLETED
ERROR
```

Ensure invalid state transitions do not occur.

---

# 82. DUPLICATE SUBMISSION TEST

Verify that:

```text
Rapid double click
```

does not submit the same result twice.

---

# 83. TIMER TESTING

If timers exist, test:

```text
Starts correctly
Counts correctly
Stops correctly
Cleans up
Expires correctly
Does not continue after completion
```

---

# 84. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Focus
Screen reader labels
Contrast
Large controls
Reduced motion
```

---

# 85. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile browser
```

especially during gameplay.

---

# 86. BROWSER CONSOLE

Check for:

```text
Unhandled exceptions
React warnings
Failed API calls
Memory leaks
Timer warnings
Accessibility warnings
```

---

# 87. REAL DATA

Use real B4 data in development/integration testing.

Do not ship fake games or fake scores.

---

# 88. DOCUMENTATION

Create:

```text
docs/F4_COGNITIVE_GAMES.md
```

Document:

```text
Game architecture
Game API integration
Game states
Game components
Result flow
B10 integration
B11 integration
Accessibility
Localization
Error handling
Testing
```

---

# 89. CLAUDE RULES

Update `CLAUDE.md` where appropriate.

Future Claude sessions working on games must:

```text
Read F4 documentation
Inspect B4 APIs
Reuse F1 components
Reuse F0 API client
Reuse F3 patient layout
Use actual game enums
Use actual API response fields
Run tests
Run lint
Run build
```

Do not create another game architecture.

---

# 90. MULTI-DEVELOPER RULE

If multiple developers implement individual games:

```text
Developer A → Game A
Developer B → Game B
Developer C → Game C
```

they must all use:

```text
Shared GameShell
Shared GameHeader
Shared GameProgress
Shared GameResult
Shared Error Handling
Shared API Layer
Shared Design System
```

Game-specific logic should remain isolated.

---

# 91. GAME FEATURE BRANCHING

Recommended:

```text
feature/f4-game-foundation
feature/f4-game-memory-match
feature/f4-game-number-recall
```

Follow the team's actual Git strategy.

Do not work directly on another developer's feature branch.

---

# 92. GIT SAFETY

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

# 93. DEFINITION OF DONE

F4 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] B4 implementation inspected  
[ ] B10 integration inspected  
[ ] B11 integration inspected  
[ ] Actual game APIs verified  
[ ] Actual game enums verified  
[ ] Game library implemented  
[ ] Game cards implemented  
[ ] Game details implemented where required  
[ ] Instructions implemented  
[ ] Start flow implemented  
[ ] Game session integrated where supported  
[ ] Game state architecture implemented  
[ ] Gameplay UI implemented  
[ ] Progress implemented where applicable  
[ ] Timer implemented where applicable  
[ ] Answer/input UI implemented  
[ ] Completion flow implemented  
[ ] Result submission implemented  
[ ] Backend result displayed  
[ ] Retry implemented where supported  
[ ] Back-to-games navigation implemented  
[ ] Dashboard link verified  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Retry handling implemented  
[ ] Duplicate submission prevented  
[ ] Offline behavior documented/implemented according to backend capability  
[ ] Accessibility verified  
[ ] Responsive behavior verified  
[ ] Localization verified  
[ ] Translation-safe UI verified  
[ ] Timer cleanup verified  
[ ] Event-listener cleanup verified  
[ ] Game-session cleanup verified  
[ ] No direct database access  
[ ] No direct AI provider access  
[ ] No duplicate analytics storage  
[ ] No medical claims introduced  
[ ] Patient data authorization respected  
[ ] B10 integration verified where applicable  
[ ] B11 integration verified where applicable  
[ ] Component tests added  
[ ] API integration tests added  
[ ] Game-state tests added  
[ ] Accessibility tests performed  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No major backend rewrite performed  

---

# 94. FINAL REPORT

Create:

```text
docs/F4_COGNITIVE_GAMES_REPORT.md
```

Use:

```text
# Memora F4 Cognitive Games Report

## Objective

## B4 APIs Used

## Game Types Implemented

## Game Library

## Game Details

## Instructions

## Game Session Architecture

## Gameplay Architecture

## Timer

## Progress

## Answer Handling

## Result Submission

## Result Screen

## B10 Analytics Integration

## B11 AI Integration

## Error Handling

## Offline Behavior

## Accessibility

## Responsive Design

## Localization

## Security

## Privacy

## Performance

## Components Created

## Files Modified

## Tests Executed

## API Integration Tests

## Accessibility Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Recommendations for F5
```

---

# 95. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Game library result
Game start result
Gameplay result
Result submission result
Result display result
Retry result
B4 integration result
B10 integration result
B11 integration result
Accessibility result
Responsive result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 96. STOP CONDITION

After F4 is complete:

**STOP.**

Do not automatically implement F5.

The next phase is:

```text
F5
Memory Assistance UI + Backend Integration
```

F5 will build the patient-facing memory system using the existing memory APIs and will connect the UI to the already-implemented backend memory functionality.

---

# FINAL PRINCIPLE

F4 should create a cognitive-game experience that is:

```text
Simple
Accessible
Engaging
Patient-friendly
Backend-connected
Safe
Consistent
```

The architecture should allow:

```text
Game Library
     ↓
Shared Game Shell
     ↓
Individual Game
     ↓
B4 Game API
     ↓
Result
     ↓
B10 Analytics
     ↓
B11 Recommendations
```

without creating separate architectures for each game.

Build the game framework once. Reuse it for every cognitive activity.
