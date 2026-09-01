# MEMORA FIX 04
## Fix and Verify Real Mobile Geofencing

The audit claims geofencing exists.

**Do not build another geofence system. Verify the existing implementation works on the real mobile flow.**

### Tasks

1. Inspect:
   - mobile location service
   - SafetyContext
   - safety API
   - safe-zone model
   - geofence service
   - safety service/controller/routes
   - notification system
   - caregiver safety UI

2. Determine the actual mobile platform and use its appropriate location APIs.

3. Verify:
   - foreground permission
   - background permission where supported
   - location retrieval
   - location updates
   - authenticated backend transmission

4. Verify caregiver can configure:
   - safe-zone name
   - latitude
   - longitude
   - radius
   - enabled state

5. Use deterministic geographic distance:
```text
distance <= radius → INSIDE
distance > radius → OUTSIDE
```

6. Verify state transitions:
```text
INSIDE → OUTSIDE = one GEOFENCE_EXIT
OUTSIDE → OUTSIDE = nothing
OUTSIDE → INSIDE = one GEOFENCE_REENTRY
```

7. Test GPS fluctuations near the boundary and prevent alert spam.

8. Verify a confirmed exit creates a safety event AND reaches the actual caregiver notification experience.

9. Test:
   - app foreground
   - background
   - phone locked
   - app reopened

Do not claim background functionality unless tested.

10. Preserve latitude, longitude, accuracy, and timestamp.

11. Patient identity must come from authentication. A client must not update another patient's location.

### Acceptance Criteria

- [ ] Safe-zone configuration works.
- [ ] Location permissions work.
- [ ] Location updates work.
- [ ] Exit detection works.
- [ ] Re-entry works.
- [ ] GPS noise is handled.
- [ ] Duplicate events are prevented.
- [ ] Caregiver actually receives exit alert.
- [ ] Authorization prevents cross-patient access.

### Final Report

Provide:
- Mobile platform.
- Location implementation.
- Permission behavior.
- Background behavior.
- Safe-zone test.
- Exit/re-entry tests.
- GPS-noise test.
- Caregiver alert test.
- Security test.
- Remaining platform limitations.
