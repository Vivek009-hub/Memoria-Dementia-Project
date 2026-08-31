# Memoria — Patient Profile & Safety Architecture

**Version:** 1.0  
**Domain:** Patient Profile, Safety Settings, Location Privacy & Caregiver Synchronization  

---

## 1. Executive Overview

The Patient Profile module provides authenticated patients with self-service capabilities to view and manage personal details, safety configurations, emergency contacts, and caregiver sharing permissions. All sensitive health, location, and progress data follow strict server-enforced access controls.

---

## 2. Architecture & Data Model

```text
                     MEMORA API
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
  PATIENT USER                     CAREGIVER USER
        │                                 │
        └────────────────┬────────────────┘
                         ↓
                   AUTHORIZATION
               (canAccessPatient)
                         │
      ┌──────────────────┼──────────────────┐
      ↓                  ↓                  ↓
PatientProfile    EmergencyContact    CaregiverRelationship
 (User info,      (CRUD per patient)   (Permissions & Status)
  safetySettings,
  accessibility)
```

### Models

1. **User** (`users` collection): Stores baseline credentials and user profile information (`name`, `email`, `phone`, `profileImageUrl`, `role`, `preferredLanguage`).
2. **PatientProfile** (`patientProfiles` collection): Stores patient-specific attributes:
   - `dateOfBirth`: Date
   - `preferredLanguage`: String
   - `accessibilitySettings`: `{ largeText, highContrast, voiceEnabled, reducedMotion }`
   - `safetySettings`: `{ locationSharingEnabled, fallDetectionEnabled, sosEnabled }`
3. **EmergencyContact** (`emergencyContacts` collection): Stores contact records bound to `patientId` with priority levels (1–10).
4. **CaregiverRelationship** (`caregiverRelationships` collection): Tracks caregiver binding (`caregiverId`, `patientId`, `relationshipType`, `status`, `permissions`).
5. **CaregiverInvitation** (`caregiverInvitations` collection): Manages 6-character short-lived pairing codes (`inviteCode`, `patientId`, `expiresAt`, `status`).

---

## 3. Privacy & Security Policies

- **Server-Side Authorization**: `canAccessPatient(user, patientId, permission)` checks that:
  1. The caregiver user has an `ACTIVE` relationship with the patient.
  2. The relationship includes the specific permission requested (e.g. `viewProfile`, `viewLocation`, `receiveSafetyAlerts`).
- **Location Privacy Gate**: Location requests from caregivers are granted ONLY if `relationship.permissions.viewLocation` IS `true` AND `patientProfile.safetySettings.locationSharingEnabled` IS `true`.
- **Immediate Revocation**: When a patient or caregiver revokes a connection (sets `status: 'REVOKED'`), all subsequent requests by that caregiver for patient data fail immediately with `403 FORBIDDEN`.
