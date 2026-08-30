# Memora — Frontend Architecture Specification

**Version:** 1.0  
**Phase:** F0 — Frontend Foundation  
**Status:** Baseline Established  

---

## 1. Overview

The Memora Web Frontend is a responsive React + Vite + Tailwind CSS application (`client/`) providing elder-friendly, role-aware user experiences for Patients, Caregivers, and Administrators.

```text
               Web Browser / PWA
                       │
             Memora React Frontend (client/)
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
  Pages/Views   State Context    Component Base
       │               │               │
       └───────────────┼───────────────┘
                       ↓
              Central API Client
           (credentials: 'include')
                       ↓
             B0-B14 Express Backend
                       ↓
              MongoDB Database
```

---

## 2. Technical Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** Lucide React
- **Routing:** React Router DOM (v6)
- **State Management:** React Context (`AuthContext`)
- **Testing:** Vitest + JSDOM

---

## 3. Directory Layout

```text
client/
├── src/
│   ├── api/          # Canonical API client & domain modules
│   ├── components/   # Reusable UI component foundation
│   ├── context/      # AuthContext & global state providers
│   ├── layouts/      # Public, Patient, Caregiver & Admin shells
│   ├── localization/ # Regional language resources (EN, HI)
│   ├── pages/        # Route page views & placeholders
│   ├── routes/       # Central router & route guards
│   ├── styles/       # Tailwind CSS design tokens
│   └── utils/        # Error normalization & date formatters
├── tests/            # Vitest unit & integration test suites
```

---

## 4. Security & Authentication Architecture

1. **Session Cookies:** Frontend uses `credentials: 'include'` for all requests to automatically attach the secure `memora_session` HTTP-only cookie.
2. **Zero Insecure Secrets:** Browser code contains no JWT signing secrets, database connection URIs, or third-party AI provider keys.
3. **UX Route Guarding:** `ProtectedRoute` and `RoleRoute` manage navigation UX while backend endpoints enforce strict server-side authorization.
