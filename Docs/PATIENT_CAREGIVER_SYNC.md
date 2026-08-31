# Memoria — Patient-Caregiver Synchronization Architecture

**Version:** 1.0  

---

## Data Synchronization Flow

Data flow between Patient and Caregiver operates with the Memora Backend as the single source of truth:

```text
PATIENT ACTION
   │ (e.g. Update Profile / Emergency Contact / Toggle Location Sharing)
   ↓
MEMORA BACKEND & DB
   │
   ├─► Authorization Layer checks active relationship & explicit permissions
   │
   ↓
CAREGIVER DASHBOARD SYNC
   (Caregiver API queries or realtime events deliver authorized fields only)
```

## Permission Matrix

| Category | Default State | Configurable By Patient |
| :--- | :--- | :--- |
| Basic Profile (`viewProfile`) | `ON` | Yes |
| Emergency Contacts | `ON` (if profile viewable) | Yes |
| Location Sharing (`viewLocation`) | `OFF` | Yes (requires both toggle & permission) |
| Reminders (`manageReminders`) | `OFF` | Yes |
| Memories (`manageMemories`) | `OFF` | Yes |
| Game Progress (`viewCognitiveActivity`) | `OFF` | Yes |
| Safety Alerts (`receiveSafetyAlerts`) | `OFF` | Yes |
| Private Memories & AI Chats | `OFF` (Protected) | Unshared by default |
