# Application Structure & Interface Specification

## Table of Contents
1. [Purpose of the Document](#1-purpose-of-the-document)
2. [System Component Overview](#2-system-component-overview)
3. [Backend Project Structure](#3-backend-project-structure)
4. [Admin Web Application Structure (React)](#4-admin-web-application-structure-react)
5. [Admin Web Application Pages](#5-admin-web-application-pages)
6. [Mobile Application Structure (Flutter)](#6-mobile-application-structure-flutter)
7. [Mobile App Screens](#7-mobile-app-screens)
8. [Navigation Structure](#8-navigation-structure)
9. [Feature-to-Module Mapping](#9-feature-to-module-mapping)

---

## 1. Purpose of the Document
This document defines the structural organization of the Smart Attendance Tracking System. It outlines how the applications will be divided into modules, the folder structures for development, and the pages or screens that will compose the user interfaces.

## 2. System Component Overview
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Admin Web App** | React | Administration and system management |
| **Mobile App** | Flutter | Attendance scanning and user access |
| **Backend API** | Node.js / Express | Business logic and data processing |

## 3. Backend Project Structure
The backend follows a modular feature-based architecture:
```text
server/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── environment.js
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   ├── organizations/
│   │   ├── departments/
│   │   ├── users/
│   │   ├── sessions/
│   │   ├── attendance/
│   │   ├── reports/
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validation.middleware.js
│   ├── utils/
│   │   ├── qrGenerator.js
│   │   ├── dateUtils.js
│   ├── app.js
│   └── server.js
```

## 4. Admin Web Application Structure (React)
Built using React with a feature-based architecture:
```text
src/
├── app/
│   ├── router.jsx
│   └── providers.jsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   └── charts/
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── departments/
│   ├── users/
│   ├── sessions/
│   ├── attendance/
│   └── reports/
├── layouts/
│   ├── AuthLayout.jsx
│   └── DashboardLayout.jsx
├── pages/
├── services/
│   └── apiClient.js
```

## 5. Admin Web Application Pages
* **Authentication:** Login, Registration, Forgot Password.
* **Dashboard:** Summary stats (Total attendees, Sessions today, Attendance rate).
* **Organization Management:** List, Create, Edit.
* **Department Management:** List, Create, Edit, User Assignment.
* **User Management:** List, Create, Profile, Deactivate.
* **Session Management:** List, Create, Details, QR Code View.
* **Attendance Monitoring:** Records, Session Attendance, Manual Edit.
* **Reports:** Daily, Session, Department, Analytics Export.

## 6. Mobile Application Structure (Flutter)
```text
lib/
├── core/
│   ├── constants/
│   └── utils/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── attendance/ (Scanner, Result)
│   ├── history/
│   └── profile/
├── services/
│   └── api_service.dart
├── widgets/
└── main.dart
```

## 7. Mobile App Screens
* **Auth:** Login, Registration.
* **Dashboard:** Active and upcoming sessions.
* **QR Scanner:** Uses device camera to scan and submit attendance.
* **Attendance Result:** Success message, status, and session info.
* **Attendance History:** Chronological list of records.
* **Profile:** User info and account settings.

## 8. Navigation Structure

### 8.1. Web Application Navigation
`Login -> Dashboard -> [Organizations, Departments, Users, Sessions, Attendance, Reports, Settings]`

### 8.2. Mobile Application Navigation
`Login -> Dashboard -> [Scan QR, Attendance Result, History, Profile]`

## 9. Feature-to-Module Mapping
| Feature | Backend Module | Web Module | Mobile Module |
| :--- | :--- | :--- | :--- |
| Authentication | Auth | Auth | Auth |
| Organization | Organizations | Organizations | — |
| User Management | Users | Users | — |
| Sessions | Sessions | Sessions | — |
| QR Attendance | Attendance | Attendance | Attendance |
| Reports | Reports | Reports | — |
