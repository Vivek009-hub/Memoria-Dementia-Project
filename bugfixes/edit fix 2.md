# MEMORA - EDIT MEMORY: START CODING NOW

## 🚨 EXECUTION MODE

You are working directly inside the existing Memora codebase.

The existing **Edit Memory** functionality is broken. Users can open the Edit Memory modal and change fields such as:

- Title
- Description / What do you remember?
- Date
- Date Accuracy
- Location / Place
- Tags

but clicking **Update Memory** does not reliably persist those changes.

### ABSOLUTE RULE

**START CODING NOW. DO NOT GIVE ME A PLAN OR SUMMARY FIRST.**

You must:

1. Inspect the existing code.
2. Find the actual broken update path.
3. Modify the necessary files.
4. Run the relevant tests/build/checks.
5. Fix any errors you encounter.
6. Verify that the real database is updated.
7. Verify the UI shows the persisted values after refresh.

Do NOT stop after analysis.

Do NOT only explain the root cause.

Do NOT give me code snippets for me to implement manually.

Do NOT ask me to make the changes.

**Actually edit the repository.**

---

# 1. DO NOT REDESIGN THE UI

The existing Edit Memory modal is already designed.

**Keep the current Memora design exactly as much as possible.**

Do NOT unnecessarily change:

- Layout
- Colors
- Fonts
- Modal size
- Spacing
- Buttons
- Existing Memory page
- Navigation
- Overall design system

Only modify UI code where necessary to make the existing fields and update flow functional.

---

# 2. INSPECT THE EXISTING MEMORY SYSTEM FIRST

Immediately search the repository for:

```text
Edit Memory
EditMemory
editMemory
Update Memory
updateMemory
Memory
memoryId
PUT
PATCH
/api/memories
findByIdAndUpdate
findOneAndUpdate
```

Find the existing:

- Edit Memory component
- Memory list
- Memory detail/viewer
- Create Memory component
- Memory API service
- Memory hooks/state
- Backend Memory routes
- Backend controller/service
- Memory model/schema
- Authentication middleware
- Ownership/authorization logic
- Existing photo upload
- Existing voice-note/audio functionality if already implemented

**Reuse the existing architecture.**

Do NOT create a second Memory model, controller, API, route, or page.

---

# 3. REPRODUCE THE BUG

Use an actual existing memory.

Test:

```text
Current title:
My Childhood Days...

Current location:
Delhi
```

Change it to:

```text
Title:
Childhood Memories

Location:
Mumbai
```

Also test:

```text
Description
Date
Date Accuracy
Tags
```

Click:

```text
Update Memory
```

Then inspect what actually happens.

---

# 4. TRACE THE COMPLETE UPDATE PIPELINE

Trace:

```text
Edit Memory input
        ↓
React/form state
        ↓
Submit handler
        ↓
Payload/FormData
        ↓
API request
        ↓
Backend route
        ↓
Authentication
        ↓
Memory controller/service
        ↓
Validation
        ↓
MongoDB update
        ↓
API response
        ↓
Frontend state/cache
        ↓
Memory list/viewer
```

Find the exact point where the new value is lost.

Then **fix that point in the code immediately**.

---

# 5. CHECK FORM STATE

For every editable field verify:

```text
Input
 ↓
Editable state
 ↓
Submit handler
```

Check:

- `value`
- `onChange`
- `defaultValue`
- form-library registration
- initial state
- props
- `useEffect`

Look for bugs where the input is displaying the original memory value instead of editable state.

For example, investigate patterns like:

```javascript
value={memory.title}
```

when the field should use local/edit form state.

Do not blindly copy an example. Follow the existing architecture.

If this is the problem, **modify the code now**.

---

# 6. CHECK useEffect RESET BUGS

Search for effects involving:

```text
setTitle
setDescription
setDate
setDateAccuracy
setLocation
setTags
```

Check whether an effect is repeatedly resetting the form from the original memory.

For example:

```javascript
useEffect(() => {
    setTitle(memory.title);
}, [memory]);
```

If rerenders/refetches overwrite user input, fix the state lifecycle.

The form should initialize correctly but must not overwrite active edits.

---

# 7. CHECK THE UPDATE BUTTON

Find the exact implementation of:

```text
Update Memory
```

Verify:

```text
Button
 ↓
onClick/onSubmit
 ↓
update handler
 ↓
API request
```

Check:

- button type
- form submission
- click handler
- validation
- early returns
- disabled state
- memory ID

If the handler is not firing, fix it.

---

# 8. CHECK THE ACTUAL PAYLOAD

Inspect the request being sent.

For JSON, inspect the payload.

For FormData, inspect its entries.

The request must contain the NEW values.

Example:

```text
title = Childhood Memories
description = NEW DESCRIPTION
date = NEW DATE
dateAccuracy = NEW ACCURACY
location = Mumbai
tags = family, childhood
```

If old values are being sent, **fix the frontend code**.

Do not merely report the problem.

---

# 9. CHECK JSON VS FORMDATA

Inspect how the existing Memory system handles uploads.

If the Memory API uses:

```text
multipart/form-data
```

because of photos or voice notes, make sure the update request and backend middleware support it correctly.

Do not break existing media uploads.

Do not create a second upload system.

---

# 10. CHECK FIELD NAME MISMATCHES

Compare:

```text
Frontend field
 ↓
Request field
 ↓
Backend field
 ↓
Database field
```

Look for mismatches such as:

```text
date vs memoryDate
location vs place
description vs content
```

Use the ACTUAL names already present in the repository.

**Do not create duplicate database fields.**

If the mismatch is the cause, fix the incorrect side.

---

# 11. CHECK MEMORY ID

Verify that the Edit modal sends the ID of the selected memory.

Trace:

```text
Selected memory
 ↓
Edit modal
 ↓
memory._id / id
 ↓
API URL
 ↓
Backend
```

Do not use:

- array index
- patient ID instead of memory ID
- stale ID
- undefined ID

If the wrong ID is being used, fix it.

---

# 12. CHECK THE BACKEND ROUTE

Find the REAL update route.

Verify:

- HTTP method
- URL
- API prefix
- `:id` parameter
- authentication middleware
- controller
- frontend URL

If frontend and backend disagree, fix the actual mismatch.

---

# 13. CHECK THE BACKEND CONTROLLER/SERVICE

Inspect the existing update controller/service.

Verify it:

1. Receives the request.
2. Gets the correct memory ID.
3. Authenticates the user.
4. Checks ownership.
5. Validates input.
6. Updates every supported editable field.
7. Saves the document.
8. Returns the updated memory.

Make sure the controller is not only updating one field while silently ignoring the others.

Fix it if necessary.

---

# 14. CHECK DATABASE UPDATE

If MongoDB/Mongoose is used, inspect:

```text
findByIdAndUpdate
findOneAndUpdate
$set
document.save()
runValidators
new: true
```

Verify that the update actually persists.

Do not assume HTTP 200 means MongoDB changed.

If the database update is broken:

**FIX THE BACKEND CODE NOW.**

---

# 15. VERIFY THE DATABASE

After fixing the code, perform a real update.

Example:

Before:

```text
title: My Childhood Days...
location: Delhi
```

Update:

```text
title: Childhood Memories
location: Mumbai
```

Verify the actual database document becomes:

```text
title: Childhood Memories
location: Mumbai
```

If MongoDB changes but the UI does not, fix the frontend state/cache.

---

# 16. CHECK FRONTEND STATE/CACHE

If the database is correct but the UI displays old values, inspect the existing:

- React state
- Context
- Redux
- Zustand
- React Query
- SWR
- Custom hooks
- Parent state

Use the existing architecture.

Do NOT introduce another state-management library.

Do NOT use:

```javascript
window.location.reload()
```

as a fake fix.

Update/invalidate the existing state/cache correctly.

---

# 17. CHECK DATE HANDLING

The current UI displays dates such as:

```text
02-09-2026
```

Inspect how dates are actually stored and transmitted.

Trace:

```text
UI date
 ↓
API date
 ↓
Database date
 ↓
API response
 ↓
UI date
```

Make sure timezone conversion does not change the intended calendar date.

Use the existing date format/architecture.

---

# 18. CHECK DATE ACCURACY

Verify the dropdown actually updates state and reaches the backend.

Test changing:

```text
Exact Date
```

to another available value.

The database must reflect the selected value.

---

# 19. CHECK TAGS

Inspect the existing Memory schema.

If the UI accepts:

```text
family, childhood, school
```

make sure the backend receives/stores the format expected by the existing schema.

Do not create a new tag representation.

---

# 20. PRESERVE EXISTING MEDIA

If the Memory system supports photos and/or voice notes:

Editing:

```text
title
description
date
location
tags
```

must NOT accidentally remove:

```text
existing photo
existing voice note
```

Test this explicitly.

---

# 21. ERROR HANDLING

Fix silent failures.

Search for patterns such as:

```javascript
catch(() => {})
```

or:

```javascript
catch(error) {
    console.log(error);
}
```

or:

```javascript
if (!response.ok) return;
```

Failed requests must not look successful.

The existing error/toast system should show a real failure.

---

# 22. SUCCESS FLOW

Correct behavior:

```text
Click Update Memory
        ↓
Loading state
        ↓
Real API request
        ↓
Backend success
        ↓
Database persisted
        ↓
Updated memory returned/reflected
        ↓
Update frontend state/cache
        ↓
Close modal
        ↓
Success message
```

On failure:

```text
Keep modal open
Show error
Preserve user input
```

Do not close the modal before successful persistence.

---

# 23. PREVENT DOUBLE SUBMISSION

Use the existing loading state/button pattern.

For example:

```text
Updating...
```

Prevent duplicate update requests.

Do not redesign the button.

---

# 24. TEST EVERY FIELD

Actually test:

```text
Title
Description
Date
Date Accuracy
Location
Tags
```

Test each field individually.

Then test all fields together.

Acceptance table:

| Field | Update | Database | Refresh |
|---|---|---|---|
| Title | PASS | PASS | PASS |
| Description | PASS | PASS | PASS |
| Date | PASS | PASS | PASS |
| Date Accuracy | PASS | PASS | PASS |
| Location | PASS | PASS | PASS |
| Tags | PASS | PASS | PASS |

Do not mark PASS unless actually verified.

---

# 25. TEST MULTIPLE MEMORIES

Test:

```text
Memory A → edit
Memory B → edit
Memory C → edit
```

Editing one memory must never change another.

---

# 26. TEST OLD MEMORIES

Open a memory created before this fix.

Edit it.

Save it.

Refresh the page.

It must still work.

Do not break backward compatibility.

---

# 27. TEST USER OWNERSHIP

If multiple users exist:

```text
User A → Memory A
User B → Memory B
```

User B must not be able to update User A's memory.

Keep backend authorization intact.

---

# 28. RUN EXISTING PROJECT CHECKS

Inspect `package.json` and run the appropriate existing:

```text
lint
test
build
```

commands where available.

Also check for:

- compile errors
- broken imports
- runtime errors
- API errors
- database errors

Fix errors caused by your implementation.

---

# 29. DO NOT REBUILD UNRELATED FEATURES

Only modify code necessary for Edit Memory and closely related integration.

Do NOT:

- redesign the application
- rebuild the Memory system
- create duplicate APIs
- create duplicate models
- create mock data
- change unrelated components

---

# 30. FINAL ACCEPTANCE TEST

The implementation is complete ONLY when this works:

```text
Login
 ↓
My Memories
 ↓
Open existing memory
 ↓
Click Edit
 ↓
Change title
 ↓
Change description
 ↓
Change date
 ↓
Change date accuracy
 ↓
Change location
 ↓
Change tags
 ↓
Click Update Memory
 ↓
Real API request
 ↓
Backend receives NEW values
 ↓
MongoDB actually updates
 ↓
Frontend shows NEW values
 ↓
Close modal
 ↓
Refresh browser
 ↓
Open same memory
 ↓
NEW values still exist
```

Also test:

```text
Edit only title
Edit only date
Edit only location
Edit only tags
Edit all fields
```

---

# 31. 🚨 DO NOT STOP AFTER ANALYSIS

This is the most important instruction in this entire prompt.

If you discover:

```text
"The frontend is sending stale data"
```

DO NOT STOP AND TELL ME THAT.

**FIX THE FRONTEND.**

If you discover:

```text
"The backend ignores location"
```

DO NOT STOP AND TELL ME THAT.

**FIX THE BACKEND.**

If you discover:

```text
"The database updates correctly but UI is stale"
```

DO NOT STOP AND TELL ME THAT.

**FIX THE FRONTEND STATE/CACHE.**

If you discover multiple issues:

**FIX ALL OF THEM.**

Continue until the end-to-end Edit Memory flow works.

---

# 32. 🚨 DO NOT GIVE ME A SUMMARY BEFORE CODING

Your workflow must be:

```text
INSPECT
   ↓
IDENTIFY
   ↓
EDIT FILES
   ↓
RUN
   ↓
TEST
   ↓
FIX ERRORS
   ↓
VERIFY
   ↓
SHORT FINAL REPORT
```

NOT:

```text
INSPECT
   ↓
SUMMARY
   ↓
STOP
```

---

# 33. FINAL RESPONSE AFTER IMPLEMENTATION

Only AFTER actually modifying and testing the code, give a short report:

```text
EDIT MEMORY FIXED

Root cause:
<actual root cause>

Files changed:
<files>

Tests:
Title: PASS
Description: PASS
Date: PASS
Date Accuracy: PASS
Location: PASS
Tags: PASS
Database persistence: PASS
Refresh persistence: PASS

Status:
PASS
```

If something genuinely cannot be tested because of an environment limitation:

```text
BLOCKED
```

and state the exact blocker.

## FINAL COMMAND

**START CODING NOW.**

Do not give me a plan.

Do not give me a summary.

Do not wait for confirmation.

**Inspect the existing Memora code, find the broken Edit Memory update path, modify the necessary files, run the available checks, fix errors, and verify real database persistence.**
