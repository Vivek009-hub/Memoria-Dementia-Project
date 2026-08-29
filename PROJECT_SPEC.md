# Memora - Project Specification

**Version:** 1.0  
**Status:** Phase 0 - Scope Frozen  
**Project:** Memora  
**Document:** Product and Feature Specification

---

## 1. Project Identity

### Project Name
**Memora**

### Full Project Name
**Memora: An AI-Powered Cognitive Care, Memory Assistance, Community and Safety Platform for Dementia Patients**

### Core Objective
Memora is a technology platform designed to support people living with dementia through:
- Cognitive stimulation
- Memory assistance
- Daily reminders
- AI-powered interaction
- Social and community engagement
- Caregiver support
- Personal safety monitoring

### Product Boundary
Memora is a support and assistance platform. It must not claim to diagnose dementia, cure dementia, replace doctors, or replace professional caregivers.

---

## 2. Target Users

### 2.1 Patient
The primary user of Memora.

Capabilities:
- Play cognitive games
- Interact with the AI assistant
- Receive reminders
- Access personal memories
- Vote for community sessions
- Pre-register for community sessions
- Join Meeting Circles
- Use safety features through the mobile app
- Trigger SOS

### 2.2 Caregiver
A person responsible for supporting one or more patients.

Capabilities:
- Manage authorized patient information
- Create and manage reminders
- Add memories and familiar people
- Monitor cognitive activity
- View authorized safety information
- Configure geofences
- Receive safety alerts
- Help with community-session registration

### 2.3 Admin
Controls the Memora platform.

Capabilities:
- Manage users
- Manage roles
- Manage platform content
- Create community-session proposals
- View voting results
- Approve/reject proposals
- Schedule community sessions
- Manage hosts/guests
- Manage registrations
- View platform activity
- Manage system configuration

### 2.4 Host / Guest
A person conducting a Community Session or Meeting Circle.

Examples:
- Doctor
- Therapist
- Psychologist
- Dementia specialist
- Researcher
- Caregiving expert
- Guest speaker

Permissions must be limited to assigned sessions and authorized functionality.

---

## 3. Core Product Modules

Memora consists of the following modules:

1. Authentication and Authorization
2. Patient Management
3. Caregiver Management
4. Simple Patient Interface
5. AI Voice Assistant
6. Regional Language Support
7. Cognitive Games
8. Memory Assistance
9. Smart Reminders
10. Community Sessions
11. Memora Meeting Circle
12. Notifications
13. Cognitive and Engagement Analytics
14. Safety Mobile Application
15. Location Tracking
16. Geofencing
17. SOS
18. Fall Detection
19. Admin Dashboard
20. Security and Privacy

---

# 4. Patient Interface

The patient experience is a core requirement.

## 4.1 Design Principles

The patient interface must prioritize:
- Large buttons
- Large icons
- Minimal text
- High contrast
- Simple navigation
- Familiar visual elements
- Consistent layouts
- Voice interaction
- Accessibility

The patient should not need to remember complex navigation procedures.

## 4.2 Main Patient Interface

The main screen should conceptually provide:

- Play Games
- Reminders
- Talk to Memora
- My Memories
- Community
- Help / SOS

The exact visual design may evolve, but simplicity is a fixed product requirement.

---

# 5. AI Voice Assistant

Memora will provide an AI-powered assistant.

## 5.1 Patient Use Cases

Patients can ask:
- What do I have today?
- When is my medicine?
- What is happening today?
- I want to play a game.
- Who is this?
- Tell me about this memory.
- Help me navigate Memora.

## 5.2 AI Responsibilities

The AI may:
- Understand simple patient requests
- Provide simple responses
- Read reminders aloud
- Help navigate the application
- Recommend activities
- Generate or adapt suitable cognitive activities
- Support memory-related interactions
- Support supported regional languages

## 5.3 Safety Boundary

The AI must not:
- Diagnose medical conditions
- Claim to diagnose dementia
- Provide unsafe medical instructions
- Present itself as a doctor
- Replace professional medical care

---

# 6. Regional Language Support

Memora should support multiple languages.

## Initial Languages
- English
- Hindi

## Future Languages
The architecture should allow additional Indian regional languages, including:
- Punjabi
- Bengali
- Tamil
- Telugu
- Marathi
- Gujarati
- Other supported languages

Language preference belongs to the patient profile.

The preference should affect, where supported:
- UI text
- AI responses
- Voice interaction
- Reminders
- Cognitive activities
- Community content

---

# 7. Personalized Cognitive Games

Memora provides cognitive stimulation activities.

## 7.1 Initial Game Categories

- Memory Matching
- Picture Recognition
- Familiar Face Recognition
- Sequence and Pattern Activities
- Simple Puzzles
- Word and Language Activities
- Music and Audio Memory
- Daily-Life Activities

## 7.2 Game Performance Data

The system may record:
- Score
- Accuracy
- Response time
- Mistakes
- Hints used
- Completion
- Difficulty level

## 7.3 Personalization

Memora should use previous activity data to recommend or adapt games.

Conceptual behavior:

Good performance:
-> Gradually increase difficulty

Poor performance:
-> Reduce difficulty and/or provide more support

## 7.4 Medical Boundary

Game performance is an activity and engagement indicator. It must not be presented as a medical diagnosis or definitive measurement of dementia progression.

---

# 8. Memory Assistance

Memora provides a personalized memory library.

## 8.1 Memory Content

Authorized caregivers can add:
- Family photographs
- Family member names
- Relationships
- Important places
- Personal stories
- Important dates
- Important events
- Familiar objects

## 8.2 Memory Interaction

Example:
- Show a family photograph
- Identify the person
- Display their relationship
- Allow the patient to ask Memora about the memory

Example response:
"This is Rahul. Rahul is your grandson."

All memory data must be access-controlled.

---

# 9. Smart Memory and Daily Reminders

Memora supports reminders for:

- Medication
- Meals
- Appointments
- Daily activities
- Walks
- Important events
- Birthdays
- Community Sessions
- Meeting Circles

## 9.1 Reminder Interaction

A reminder can provide:
- Visual notification
- Voice notification
- Large "Done" button
- Option to hear the reminder again

## 9.2 Reminder Tracking

The system may record:
- Scheduled
- Delivered
- Acknowledged
- Completed
- Missed
- Cancelled

Missed reminders may notify caregivers depending on configuration.

---

# 10. Community Sessions

Community Sessions are a structured event-management feature with two main sections:

1. Voting
2. Schedule

The Community Sessions system is NOT an unrestricted public social network.

---

## 10.1 Voting Section

This section displays session ideas that have not yet been officially scheduled.

### Admin
Admin can:
- Create a session proposal
- Add title
- Add description
- Add image
- Open/close voting
- View vote totals
- Approve/reject proposals

### Patient
Patients can:
- View proposals
- Vote for a proposal
- See interest/vote count where enabled
- Remove/change a vote while voting is open, if allowed

A patient should not be able to create arbitrary votes or vote multiple times for the same proposal.

### Example

Music & Memory

Description:
Share memories connected to songs, music, and important moments.

Interested:
42 patients

Action:
Vote for this Session

---

## 10.2 Voting Flow

Admin creates proposal
-> Patients view proposal
-> Patients vote
-> Admin reviews results
-> Admin approves or rejects

Once approved, the proposal moves out of the Voting section and becomes eligible for scheduling.

---

# 11. Community Session Schedule

The Schedule section contains officially approved and scheduled events.

## 11.1 Admin-Configurable Details

Each scheduled event may contain:
- Session title
- Description
- Date
- Start time
- End time
- Duration
- Host
- Featured guest
- Guest image
- Guest designation
- Session image
- Maximum participants
- Current registrations
- Registration status
- Meeting type: Voice or Video
- Meeting/session link

## 11.2 Pre-Registration

Patients can pre-register for scheduled sessions.

The system should support:
- Registration confirmation
- Participant count
- Capacity limits
- Registration open/closed state
- Cancellation
- Waiting list

If capacity is reached:
- Prevent further confirmed registrations
- Offer a waiting list where enabled

## 11.3 Community Session Lifecycle

Admin creates proposal
-> Patients vote
-> Admin reviews votes
-> Admin approves proposal
-> Admin adds date/time/guest/details
-> Event appears in Schedule
-> Patients pre-register
-> Memora sends reminders
-> Session occurs
-> Session is marked completed

## 11.4 Voter Notifications

When a proposal that a patient voted for becomes scheduled, Memora should notify that patient where notification permissions allow.

---

# 12. Memora Meeting Circle

Memora Meeting Circle is separate from Community Sessions.

It is intended for smaller or more personal group interactions.

Potential functionality:
- Scheduled group meetings
- Guided conversations
- Memory sharing
- Family interaction
- Group cognitive activities
- Voice meetings
- Video meetings
- Simple joining experience
- Session reminders

The exact Meeting Circle workflow will be defined in a later technical/product-design phase.

---

# 13. Notifications

Memora supports notifications for:

## Patient Notifications
- Reminders
- Community Sessions
- Meeting Circle
- Registration confirmation
- Important events
- Safety-related instructions

## Caregiver Notifications
- SOS
- Possible fall
- Geofence exit
- Missed reminders
- Device offline
- Low battery
- Relevant community activity

## Admin Notifications
- Relevant platform events
- Administrative events
- Community management events

Notification channels may include:
- In-app notifications
- Push notifications
- Voice notifications where applicable

---

# 14. Cognitive and Engagement Analytics

Memora can record activity and engagement information.

## 14.1 Cognitive Activity Metrics
- Games played
- Scores
- Accuracy
- Response time
- Difficulty
- Completion
- Hints
- Mistakes

## 14.2 Engagement Metrics
- Activity frequency
- Community participation
- Session attendance
- Reminder acknowledgement
- Voice interaction frequency

## 14.3 Safety Metrics
- SOS events
- Possible fall events
- Geofence events
- Device connectivity events

## 14.4 Medical Boundary

Analytics must be presented as activity/engagement information and must not be represented as a medical diagnosis or definitive clinical measurement.

---

# 15. Safety Mobile Application

Memora will have a lightweight companion mobile application.

The mobile application is primarily responsible for safety functionality.

## 15.1 Core Mobile Responsibilities

- GPS location
- Background/location updates where permitted
- Geofencing
- SOS
- Possible fall detection
- Battery status
- Connectivity status
- Safety communication

The mobile application should not duplicate the complete web application.

---

# 16. Location Tracking

The mobile application may send authorized location information to the Memora backend.

## 16.1 Location Data

Potential data:
- Latitude
- Longitude
- Timestamp
- Location accuracy where available
- Device status
- Battery status
- Connectivity status

## 16.2 Caregiver View

Authorized caregivers may see:
- Current/most recent location
- Last update time
- Safety status

Location access must be strictly authorization-controlled.

---

# 17. Geofencing

Caregivers can configure safe zones for authorized patients.

Examples:
- Home
- Hospital
- Park
- Relative's house

## 17.1 Geofence Data

Potential configuration:
- Name
- Center coordinates
- Radius
- Active/inactive status
- Patient association

## 17.2 Events

The system should record:
- Entered zone
- Exited zone
- Timestamp
- Relevant location

## 17.3 Alert Flow

Patient exits configured safe zone
-> Safety system detects exit
-> Backend records event
-> Authorized caregiver receives alert
-> Caregiver can view latest available location

---

# 18. SOS Emergency System

The mobile application must provide a prominent SOS button.

## 18.1 SOS Flow

Patient presses SOS
-> Confirmation, where appropriate
-> SOS activated
-> Latest available location is obtained
-> Authorized caregiver/emergency contacts are notified according to configuration
-> SOS event is recorded

## 18.2 SOS States

An SOS event may have states such as:
- Initiated
- Confirmed
- Cancelled
- Acknowledged
- Resolved

The exact emergency escalation process must be defined and tested before production use.

---

# 19. Fall Detection

The mobile application may use smartphone sensors including:
- Accelerometer
- Gyroscope
- Device orientation
- Motion patterns

## 19.1 Conceptual Flow

Sensor activity
-> Motion analysis
-> Possible fall detected
-> Ask patient "Are you okay?"
-> Patient responds

If OK:
-> Cancel alert

If Help:
-> Notify caregiver

If no response within configured period:
-> Notify caregiver according to configured safety policy

## 19.2 Safety Boundary

This is **possible-fall detection**, not guaranteed medical-grade fall detection.

False positives are possible and must be handled.

The feature must not claim to guarantee detection of every fall.

---

# 20. Safety App Device Status

The caregiver should be able to understand whether the safety system is functioning.

Potential status information:
- App connected
- Last communication
- Battery percentage
- Location availability
- Network connectivity
- Safety monitoring status

Example:

Location: Active
Fall Detection: Active
SOS: Active
App: Connected
Battery: 68%

If the device stops communicating, the system should generate an appropriate warning rather than silently assuming the patient is safe.

---

# 21. Caregiver Dashboard

The caregiver dashboard should provide authorized information about connected patients.

## 21.1 Patient Management
- Patient profile
- Basic information
- Preferred language
- Emergency contacts
- Caregiver relationship

## 21.2 Memory Management
- Add family members
- Upload photographs
- Add personal memories
- Add important places
- Add important dates
- Manage personalized memory content

## 21.3 Reminder Management
- Create reminder
- Edit reminder
- Delete reminder
- Configure recurrence
- View reminder history
- View missed reminders

## 21.4 Cognitive Activity
- Game history
- Performance metrics
- Engagement indicators
- Activity trends

## 21.5 Community
- View upcoming sessions
- Help patient register
- View registrations
- View participation

## 21.6 Safety
- View authorized location
- Configure geofences
- View SOS events
- View possible fall events
- View safety history
- View device status

---

# 22. Admin Dashboard

## 22.1 User Management
- View registered users
- Assign roles
- Activate/deactivate accounts
- Manage user information
- Manage access

## 22.2 Community Management
- Create proposals
- Manage voting
- View vote results
- Approve/reject proposals
- Schedule events
- Manage hosts and guests
- Manage capacity
- Manage registrations

## 22.3 Content Management
- Manage cognitive games
- Manage memory-related content
- Manage community content
- Manage language content

## 22.4 Safety Management
- View safety events according to authorization
- View SOS events
- View possible fall events
- View geofence alerts
- Monitor system status

---

# 23. Authentication and Authorization

Memora requires secure authentication.

The authorization system must support role-based access control.

Potential roles:
- Patient
- Caregiver
- Admin
- Host/Guest

Rules:
- Users must authenticate before accessing protected resources.
- Backend APIs must enforce authorization.
- A user must not gain access to another patient's information by manipulating IDs.
- Role permissions must be checked server-side.
- Sensitive resources must have ownership/relationship checks.

---

# 24. Security and Privacy

Because Memora may process sensitive personal, location, and health-related information, privacy and security are mandatory.

Requirements:
- Secure authentication
- Password hashing
- Role-based access control
- Input validation
- Secure API authorization
- Secure file uploads
- Secure location access
- Patient-caregiver access restrictions
- Audit logging
- Secure secret management
- Encrypted network communication
- Appropriate consent/privacy controls
- Data minimization

Secrets and API keys must never be committed to GitHub.

---

# 25. Data Ownership and Access

Patient data must be accessed only by authorized users.

Examples:
- Patient can access their own permitted data.
- Caregiver can access data for patients they are authorized to support.
- Admin access must follow the platform's defined administrative policy.
- Hosts/guests should only access information required for assigned sessions.
- Location and safety information requires additional access restrictions.

---

# 26. MVP Scope

The first production-oriented MVP should prioritize:

### Foundation
- Authentication
- User roles
- Patient/caregiver relationships
- Basic database and backend

### Patient
- Simple patient UI
- Patient profile
- Basic cognitive games
- Memory assistance
- Reminders

### Community
- Community proposals
- Voting
- Admin approval
- Scheduling
- Pre-registration
- Capacity management
- Notifications

### Management
- Admin dashboard
- Caregiver dashboard
- Basic analytics

---

# 27. Phase 2 Scope

After the MVP is stable:

- AI voice assistant
- Regional voice interaction
- Adaptive/personalized games
- Advanced memory assistance
- Memora Meeting Circle
- Advanced analytics
- Expanded notification system

---

# 28. Advanced Safety Scope

Safety functionality should be developed and tested independently because of its higher reliability requirements.

Features:
- Companion mobile application
- Background location
- Geofencing
- SOS
- Possible fall detection
- Device health monitoring
- Safety event history
- Caregiver safety alerts

---

# 29. Features Explicitly Out of Scope for Initial Version

The initial version will NOT include:

- Automated dementia diagnosis
- Dementia cure claims
- Automated medical treatment decisions
- Medical-grade guaranteed fall detection
- Fully autonomous emergency response
- Open public social networking
- Unrestricted patient-to-patient messaging
- Full hospital management system

These may be considered in future versions only after appropriate product, safety, legal, and technical evaluation.

---

# 30. Product Principles

All development must follow these principles:

1. Patient simplicity comes first.
2. Safety features must fail visibly rather than silently.
3. Privacy and authorization are mandatory.
4. AI assists; it does not replace professional medical care.
5. Activity analytics are not medical diagnoses.
6. The backend is the source of truth for authorization and business rules.
7. Mobile safety functionality should remain lightweight and focused.
8. Community features must remain controlled and moderated.
9. New features must not silently change existing behavior.
10. Major architecture or scope changes require team agreement and documentation.

---

# 31. Definition of Done for Phase 0

Phase 0 is complete when the team agrees on:

- Project identity
- Target users
- User roles
- Core feature list
- Patient experience
- AI boundaries
- Language support
- Cognitive gaming scope
- Memory system
- Reminder system
- Community Sessions workflow
- Meeting Circle scope
- Safety mobile app
- Location tracking
- Geofencing
- SOS
- Fall detection
- Notifications
- Analytics
- Security/privacy requirements
- MVP scope
- Phase 2 scope
- Advanced safety scope
- Explicitly excluded features

---

# 32. Change Control

This document is the product-level source of truth for Phase 0.

Before adding or substantially changing a feature:
1. Describe the proposed change.
2. Identify affected modules.
3. Identify affected users.
4. Identify database/API implications.
5. Update this specification.
6. Get team agreement.
7. Only then begin implementation.

Developers and AI coding assistants must not independently redefine product requirements.

---

# 33. Development Rule for AI-Assisted Coding

Memora will be developed using AI coding assistants, including Claude.

AI-generated code must follow the project specification and technical architecture.

Claude must:
- Read project instructions before implementation.
- Inspect existing code before creating new code.
- Reuse existing modules where appropriate.
- Avoid duplicate APIs/models/components.
- Avoid unnecessary architectural changes.
- Follow existing naming conventions.
- Never expose secrets.
- Add/update tests for meaningful functionality.
- Report assumptions instead of silently changing requirements.

The product specification does not grant an AI coding assistant permission to change the product scope.

---

## Phase 0 Status

**STATUS: READY FOR TEAM REVIEW**

Next phase:
**Phase 1 - Technical Architecture**

Phase 1 will define:
- Monorepo structure
- Web architecture
- Backend architecture
- Mobile architecture
- Database architecture
- API architecture
- Authentication architecture
- AI architecture
- Notification architecture
- Safety architecture
- Git/GitHub workflow
- Claude development workflow
