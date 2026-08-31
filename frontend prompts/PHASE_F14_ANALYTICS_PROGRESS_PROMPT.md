# Memora - Phase F14 Prompt: Analytics & Progress UI

**Phase:** F14  
**Name:** Analytics & Progress UI  
**Prerequisites:** F0-F13 completed, especially F11 integration audit, F12 Caregiver Dashboard, and F13 Admin Dashboard.

## Objective

Build the complete frontend analytics and progress experience for:

- Patient
- Caregiver
- Admin

Use the **actual analytics/activity APIs already implemented in B0-B14**. Do not invent metrics, mock production data, or create a second analytics engine.

Analytics must describe **activity and engagement**, not diagnose dementia or provide unsupported clinical conclusions.

---

## 1. READ FIRST

Read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F11_FULL_SYSTEM_INTEGRATION_REPORT.md
docs/F12_CAREGIVER_DASHBOARD_REPORT.md
docs/F13_ADMIN_DASHBOARD_REPORT.md
```

Inspect the actual B0-B14 implementation:

```text
Analytics routes
Analytics controllers
Analytics services
Game result/activity services
Reminder services
Community services
Notification services
AI services
Safety services
Patient APIs
Caregiver APIs
Admin APIs
```

Reports are not proof. The repository is authoritative.

---

# 2. CRITICAL IMPLEMENTATION RULE

Before implementing every metric:

```text
Actual backend data
        ↓
Response schema
        ↓
Authorization rules
        ↓
Metric meaning
        ↓
Frontend presentation
        ↓
Real API verification
```

If a requested metric does not exist in the backend:

```text
Do not fake it.
Do not invent an endpoint.
Document it as unavailable.
```

---

# 3. F14 SCOPE

Implement, where actually supported:

```text
Patient Progress
Patient Activity
Game Performance
Game History
Reminder Progress
Community Engagement
Memory Activity
AI Activity
Safety/Event summaries where authorized
Caregiver Progress
Admin Platform Analytics
Date Ranges
Filters
Charts
Tables
Summary Cards
Empty States
Loading States
Error States
Privacy
Role-Based Access
Accessibility
Localization
Responsive Design
```

---

# 4. PATIENT PROGRESS

Create/integrate the patient progress page using the existing routing architecture.

Potential:

```text
/app/progress
```

Example presentation:

```text
📊 My Progress

This Week

🧩 Games
8 completed

⏰ Reminders
85% completed

🫂 Community
2 sessions

💭 Memories
4 added
```

Use real backend values only.

---

# 5. PATIENT ACTIVITY

Show supported activity such as:

```text
Games completed
Reminders completed
Memories added
Community participation
AI interactions
```

Do not assume every metric exists.

---

# 6. GAME ANALYTICS

Integrate F4/backend game results.

Potential fields:

```text
Games played
Games completed
Score
Accuracy
Response time
Difficulty
Duration
```

Only display fields returned by the backend.

Use neutral terminology:

```text
Game performance
Activity trend
Score trend
```

Never label a game trend as:

```text
Dementia progression
Cognitive decline
Medical improvement
```

---

# 7. REMINDER ANALYTICS

Integrate F6/backend data.

Potential:

```text
Completed
Pending
Snoozed
Missed
Completion rate
```

Only use actual backend status definitions.

Do not interpret missed reminders as a medical condition.

---

# 8. MEMORY ANALYTICS

If supported:

```text
Memories created
Memory interactions
Memory activity
```

Never put private memory text or media inside analytics.

---

# 9. COMMUNITY ANALYTICS

If supported:

```text
Sessions voted
Sessions registered
Sessions attended
```

Do not expose other users' private participation.

---

# 10. MEETING ANALYTICS

If supported:

```text
Meetings registered
Meetings attended
Upcoming meetings
```

Never expose protected meeting links through analytics.

---

# 11. AI ANALYTICS

If supported:

```text
AI interactions
Voice interactions
Recommendations used
```

Do not expose:

```text
AI prompts
AI responses
Voice transcripts
```

unless explicitly authorized and required.

---

# 12. SAFETY ANALYTICS

If explicitly supported and authorized:

```text
SOS events
Fall events
Device connectivity
Safety event status
```

Do not expose precise location history merely because safety analytics exist.

Never create unsupported:

```text
Medical risk score
Dementia score
Health score
```

---

# 13. CAREGIVER ANALYTICS

Integrate into F12.

Caregivers may see analytics only for patients they are authorized to support.

Test:

```text
Caregiver A → Patient A → allowed
Caregiver A → Patient B → denied
```

Backend authorization must enforce this.

---

# 14. ADMIN ANALYTICS

Integrate into F13.

Potential platform metrics:

```text
Total users
Active users
Game participation
Reminder usage
Community participation
AI usage
Notification activity
Safety events
```

Only use actual backend metrics.

Prefer aggregate data where possible.

---

# 15. DASHBOARD INTEGRATION

Add concise progress entry points to F3/F12/F13 rather than duplicating entire analytics dashboards.

Example:

```text
Your Progress
[ View Full Progress ]
```

---

# 16. DATE RANGE

If backend supports filtering:

```text
Today
Last 7 days
Last 30 days
Custom
```

Do not invent unsupported filters.

Validate:

```text
From <= To
```

---

# 17. TIMEZONE

Use the project's centralized date/time architecture.

Verify:

```text
Games
Reminders
Community
Meetings
Notifications
Activities
Safety events
```

Do not manually add/subtract offsets inside components.

---

# 18. CHARTS

Use simple charts:

```text
Line
Bar
Donut
Progress
```

Only use visualizations that improve understanding.

Do not overwhelm patient users.

---

# 19. CHART ACCESSIBILITY

Every chart needs a text alternative.

Example:

```text
Game activity increased from 3 sessions
to 6 sessions during the selected period.
```

Only describe what actual data supports.

Do not communicate meaning by color alone.

---

# 20. TABLES

Use accessible tables for detailed history:

```text
Date
Activity
Result
```

Use server-side pagination where supported.

---

# 21. FILTERS

If backend supports filtering:

```text
Game
Activity
Date
Session
Reminder
```

Prefer server-side filtering.

Do not download massive datasets just to filter in the browser.

---

# 22. EXPORT

Only implement export if the backend already supports secure export.

Ensure export authorization is enforced.

Never generate unauthorized exports from client-side data.

---

# 23. METRIC DEFINITIONS

Document what every metric means.

Example:

```text
Games Completed
= Number of game sessions marked completed by the backend.
```

Do not invent definitions.

---

# 24. CONSISTENCY

The same metric should not unexpectedly differ between:

```text
Patient
Caregiver
Admin
```

unless backend scope/definition intentionally differs.

---

# 25. DATA REFRESH

After actions such as:

```text
Complete game
Complete reminder
Register for session
Create memory
```

refresh/invalidate relevant analytics where appropriate.

Do not leave clearly stale values indefinitely.

---

# 26. LOADING

Implement clear loading states:

```text
Loading your progress...
```

Use skeletons where appropriate.

---

# 27. EMPTY STATES

Handle:

```text
No activity
No games
No reminders
No community activity
No memories
No analytics
```

Never display fake charts.

---

# 28. ERROR STATES

Handle:

```text
401
403
404
409
429
500
Network failure
Timeout
```

Use user-friendly messages.

---

# 29. PARTIAL DATA

If one analytics source fails:

```text
Show available sections.
Clearly mark unavailable data.
```

Do not fabricate missing information.

---

# 30. API ARCHITECTURE

Reuse the existing centralized API client.

Conceptual only:

```text
analyticsApi.getPatientProgress()
analyticsApi.getPatientActivity()
analyticsApi.getGameAnalytics()
analyticsApi.getReminderAnalytics()
analyticsApi.getCommunityAnalytics()
analyticsApi.getCaregiverProgress(patientId)
analyticsApi.getAdminOverview()
```

Use actual endpoints from the repository.

Do not create duplicate analytics infrastructure.

---

# 31. AUTHORIZATION

Test:

```text
Patient → own analytics → allowed
Patient → another patient → denied
Caregiver → authorized patient → allowed
Caregiver → unauthorized patient → denied
Admin → authorized admin analytics → allowed
```

Backend authorization remains authoritative.

---

# 32. IDOR TESTING

Attempt changing patient/resource IDs.

Verify unauthorized analytics cannot be accessed.

Do not rely on hidden UI controls.

---

# 33. PRIVACY

Do not expose unnecessarily:

```text
Private memories
AI conversations
Voice transcripts
Precise location
Emergency contacts
Private safety details
```

Do not log sensitive analytics payloads.

---

# 34. MEDICAL BOUNDARY

Search the UI for unsupported medical claims.

Do not write:

```text
Dementia is improving
Dementia is worsening
Cognitive decline detected
Treatment is working
```

Prefer neutral activity language:

```text
Game participation increased
Reminder completion decreased
Activity changed
```

---

# 35. ELDER-FRIENDLY PATIENT UX

Patient progress should be:

```text
Simple
Readable
Positive but not misleading
Non-clinical
Low-text
```

Use large cards and limited charts.

---

# 36. CAREGIVER UX

Caregiver analytics can be more detailed but must remain understandable.

---

# 37. ADMIN UX

Admin analytics can be denser and may use:

```text
Tables
Charts
Filters
Date ranges
```

---

# 38. PERFORMANCE

Avoid:

```text
Duplicate requests
Repeated analytics queries
Huge histories
Excessive chart points
Unnecessary polling
```

Heavy aggregation belongs in the backend.

---

# 39. CACHING

Use existing server-state/cache architecture.

Invalidate appropriately after mutations.

Do not permanently cache sensitive patient analytics.

Clear patient-specific data on:

```text
Logout
Patient switch
Authorization change
```

---

# 40. REALTIME

If realtime analytics already exist:

```text
Reuse existing realtime infrastructure.
```

Do not create another websocket/SSE system.

---

# 41. COMPONENTS

Potential components:

```text
ProgressDashboard
MetricCard
ActivityChart
GamePerformanceChart
ReminderProgressCard
CommunityEngagementCard
AnalyticsTable
DateRangePicker
AnalyticsFilter
ChartEmptyState
AnalyticsError
AnalyticsSkeleton
```

Reuse F1 components.

---

# 42. ROUTES

Use existing route conventions.

Possible:

```text
/app/progress
/app/caregiver/patient/:id/progress
/app/admin/analytics
```

Do not create conflicting routes.

---

# 43. ACCESSIBILITY

Verify:

```text
Keyboard navigation
Screen readers
Visible focus
Chart summaries
Tables
Date pickers
Filters
Dialogs
```

---

# 44. LOCALIZATION

Use the existing localization system.

Support configured:

```text
English
Hindi
Other configured languages
```

Do not hardcode strings.

Use localization-aware:

```text
Dates
Times
Numbers
Percentages
```

---

# 45. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

Ensure charts do not overflow.

On small screens:

```text
Stack cards
Resize charts
Allow horizontal table scrolling when needed
```

---

# 46. TESTING

Add tests for:

```text
Patient progress
Caregiver analytics
Admin analytics
Game metrics
Reminder metrics
Community metrics
Date filters
Empty states
Error states
Authorization
```

---

# 47. DATA TESTING

Test:

```text
No data
One data point
Many data points
Zero values
Large values
Null values
Missing optional fields
```

---

# 48. DATE TESTING

Test:

```text
Today
Week boundary
Month boundary
Custom date range
Timezone boundary
```

---

# 49. SECURITY TESTING

Test:

```text
IDOR
Role bypass
Unauthorized analytics
Export authorization
Sensitive data leakage
```

---

# 50. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Screen reader
Chart alternatives
Tables
Date picker
Filters
```

---

# 51. LOCALIZATION TESTING

Test:

```text
English
Hindi
Long translated strings
Large numbers
Dates
Percentages
```

---

# 52. PERFORMANCE TESTING

Review:

```text
Initial analytics requests
Chart rendering
Large datasets
Repeated filters
Date range changes
```

---

# 53. BROWSER CHECK

Check for:

```text
React warnings
Chart errors
Failed API calls
Accessibility warnings
Unhandled exceptions
```

---

# 54. GIT SAFETY

Before changes:

```bash
git status
git branch
```

Never use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's changes.

Suggested branch:

```text
feature/f14-analytics-progress
```

Optional:

```text
feature/f14-patient-progress
feature/f14-caregiver-analytics
feature/f14-admin-analytics
feature/f14-analytics-components
```

---

# 55. DEFINITION OF DONE

F14 is complete only when:

[ ] F0-F13 inspected  
[ ] F11 findings reviewed  
[ ] Backend analytics inspected  
[ ] Actual analytics endpoints mapped  
[ ] Metric definitions verified  
[ ] Patient progress implemented where supported  
[ ] Patient activity implemented where supported  
[ ] Game analytics implemented where supported  
[ ] Reminder analytics implemented where supported  
[ ] Memory analytics implemented where supported  
[ ] Community analytics implemented where supported  
[ ] Meeting analytics implemented where supported  
[ ] AI analytics implemented where supported  
[ ] Safety analytics implemented where supported  
[ ] Caregiver analytics implemented where supported  
[ ] Admin analytics implemented where supported  
[ ] Date filtering implemented where supported  
[ ] Timezone handling verified  
[ ] Charts implemented  
[ ] Chart text alternatives implemented  
[ ] Tables implemented where needed  
[ ] Pagination implemented where required  
[ ] Export implemented only where backend supports it  
[ ] Patient authorization verified  
[ ] Caregiver authorization verified  
[ ] Admin authorization verified  
[ ] IDOR tests performed  
[ ] Privacy reviewed  
[ ] No medical claims introduced  
[ ] No medical scores introduced  
[ ] No fake metrics  
[ ] No mock production data  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Partial-data handling implemented  
[ ] Cache/invalidation verified  
[ ] Realtime reused where supported  
[ ] Performance reviewed  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] Tests pass  
[ ] Lint passes  
[ ] Build passes  
[ ] Browser console checked  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 56. FINAL REPORT

Create:

```text
docs/F14_ANALYTICS_PROGRESS_REPORT.md
```

Use:

```text
# Memora F14 Analytics & Progress Report

## Objective
## Backend Analytics Audit
## Available Metrics
## Metric Definitions
## Patient Progress
## Patient Activity
## Game Analytics
## Reminder Analytics
## Memory Analytics
## Community Analytics
## Meeting Analytics
## AI Analytics
## Safety Analytics
## Caregiver Analytics
## Admin Analytics
## Date Filtering
## Timezone Handling
## Charts
## Tables
## API Integration
## Authorization
## Privacy
## Security
## Accessibility
## Localization
## Responsive Design
## Performance
## Components Created
## Files Created
## Files Modified
## Tests Executed
## Authorization Tests
## IDOR Tests
## Privacy Tests
## Chart Tests
## Date Tests
## Accessibility Tests
## Localization Tests
## Performance Tests
## Lint Result
## Build Result
## Browser Testing
## Known Issues
## Missing Backend Capabilities
## Recommendations for F15
```

---

# 57. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Backend analytics audit: PASS/FAIL
Patient progress: PASS/FAIL/NOT SUPPORTED
Patient activity: PASS/FAIL/NOT SUPPORTED
Game analytics: PASS/FAIL/NOT SUPPORTED
Reminder analytics: PASS/FAIL/NOT SUPPORTED
Memory analytics: PASS/FAIL/NOT SUPPORTED
Community analytics: PASS/FAIL/NOT SUPPORTED
Meeting analytics: PASS/FAIL/NOT SUPPORTED
AI analytics: PASS/FAIL/NOT SUPPORTED
Safety analytics: PASS/FAIL/NOT SUPPORTED
Caregiver analytics: PASS/FAIL/NOT SUPPORTED
Admin analytics: PASS/FAIL/NOT SUPPORTED
Date filtering: PASS/FAIL/NOT SUPPORTED
Timezone handling: PASS/FAIL
Charts: PASS/FAIL
Chart accessibility: PASS/FAIL
Tables: PASS/FAIL
Export: PASS/FAIL/NOT SUPPORTED
Patient authorization: PASS/FAIL
Caregiver authorization: PASS/FAIL
Admin authorization: PASS/FAIL
IDOR protection: PASS/FAIL
Privacy: PASS/FAIL
Medical-claim audit: PASS/FAIL
Performance: PASS/FAIL
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive UI: PASS/FAIL
Tests: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Browser testing: PASS/FAIL
```

Do not claim success unless verified.

---

# 58. STOP CONDITION

After F14 is complete:

**STOP.**

Do not implement F15 automatically.

F15 will be the dedicated:

```text
Complete Frontend ↔ Backend Integration
```

phase.

Before F15 begins, inspect:

```text
F11 findings
F12 implementation
F13 implementation
F14 implementation
Actual backend state
API contracts
Database behavior
Authentication
Authorization
```

---

# FINAL PRINCIPLE

Analytics should help Memora users understand **activity and engagement**, not pretend to provide clinical diagnosis.

The backend owns:

```text
Data
Aggregation
Authorization
Metric definitions
```

The frontend owns:

```text
Presentation
Charts
Tables
Filters
Accessible explanations
```

Never create medical scores from activity data.

Never expose another patient's analytics.

Never expose private memories, AI conversations, voice transcripts, precise location, or safety information without explicit authorization.

Never use fake numbers to make a dashboard look complete.

Never create a duplicate analytics engine.

Never claim an analytics value is current if the backend has not supplied it.

**F14 is complete when patients, authorized caregivers, and administrators can understand the activity data they are permitted to see through a clear, accessible, secure analytics experience.**
