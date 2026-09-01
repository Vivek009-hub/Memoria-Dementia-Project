# MEMORA FIX 05
## Fix and Verify SOS End-to-End

The audit reports that SOS exists.

**Do not build a second SOS system. Make the existing one work end-to-end.**

### Tasks

1. Inspect:
   - SOS screen
   - Safety dashboard
   - safety API
   - safety controller/service/routes
   - safety event model
   - notification service
   - caregiver UI

2. Verify:
```text
Patient
→ SOS button
→ simple confirmation
→ authenticated backend request
→ safety event
→ latest location if available
→ caregiver notification
```

3. If location exists, attach:
   - latitude
   - longitude
   - accuracy
   - timestamp

4. If location is unavailable, SOS should still be attempted.

5. Prevent duplicate SOS events caused by double taps/retries.

6. Verify caregiver receives the actual alert. Creating a database record alone does not count.

7. Verify:
```text
TRIGGERED
→ ACKNOWLEDGED
→ RESOLVED
```

Only authorized caregiver/admin users can acknowledge or resolve.

8. AI must never resolve SOS automatically.

9. Test network loss. Never tell the patient the caregiver was notified unless delivery is confirmed.

### Acceptance Criteria

- [ ] SOS button works.
- [ ] Confirmation works.
- [ ] Backend event persists.
- [ ] Location attaches when available.
- [ ] SOS works without location where possible.
- [ ] Caregiver receives alert.
- [ ] Duplicate protection works.
- [ ] Offline behavior is honest.
- [ ] Acknowledge works.
- [ ] Resolve works.

### Final Report

Provide:
- Patient SOS test.
- Backend test.
- Location test.
- Caregiver notification test.
- Duplicate test.
- Offline test.
- Acknowledgement test.
- Resolution test.
- Remaining issues.
