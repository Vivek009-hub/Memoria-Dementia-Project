# MEMORA FIX 03
## Fix Natural-Language Reminders and Proactive Routine System

The existing implementation reportedly contains reminder parsing, scheduling, notifications, quiet hours, and proactive routines.

**DO NOT CREATE A SECOND REMINDER SYSTEM.**

### Tasks

1. Inspect:
   - reminder model/service/tools
   - reminder logs
   - time parser
   - proactive scheduler
   - server startup
   - notification system
   - existing reminder UI

2. Verify the scheduler actually starts with the backend and that multiple scheduler instances cannot run.

3. Test:
```text
Remind me to turn off the stove in 15 minutes.
```

Expected:
```text
Patient speech/text
→ AI Agent
→ createReminder
→ backend time validation
→ database
→ scheduler
→ notification
```

4. Gemini must not be trusted to determine the final timestamp. Backend validates and normalizes it using the patient's timezone.

5. Test:
```text
in 15 minutes
in half an hour
in 2 hours
at 6 PM
tomorrow at 10 AM
tomorrow morning
after lunch
```

6. For:
```text
Remind me tomorrow.
```
ask what the patient wants to be reminded about.

7. Only confirm reminder creation after backend success.

8. Create a test reminder for 1-2 minutes and verify actual delivery.

9. Test proactive routine reminders.

10. Verify quiet hours and cooldowns.

11. Verify repeated scheduler ticks do not create duplicate notifications.

### Acceptance Criteria

- [ ] Natural-language reminder creation works.
- [ ] Relative/absolute time works.
- [ ] Backend validates timestamps.
- [ ] Scheduler starts.
- [ ] Due reminders trigger.
- [ ] Notification is actually delivered.
- [ ] Proactive routine reminders work.
- [ ] Quiet hours work.
- [ ] Duplicate notifications are prevented.

### Final Report

Provide:
- Files modified.
- Scheduler startup result.
- Reminder creation test.
- Reminder delivery test.
- Proactive routine test.
- Quiet-hours test.
- Duplicate-prevention test.
- Remaining issues.
