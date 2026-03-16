# System Architecture Document

## Table of Contents
1. [Introduction](#1-introduction)
2. [Architecture Style](#2-architecture-style)
3. [High-Level System Architecture](#3-high-level-system-architecture)
4. [Architectural Rationale](#4-architectural-rationale)
5. [Major System Components](#5-major-system-components)
6. [Detailed Interaction Flow](#6-detailed-interaction-flow)
7. [Communication Architecture](#7-communication-architecture)
8. [Authentication Architecture](#8-authentication-architecture)
9. [Data Architecture](#9-data-architecture)
10. [Backend Module Architecture](#10-backend-module-architecture)
11. [Frontend Integration Architecture](#11-frontend-integration-architecture)
12. [Attendance Check-in Architecture](#12-attendance-check-in-architecture)
13. [Security Architecture](#13-security-architecture)
14. [Scalability Architecture](#14-scalability-architecture)
15. [Reliability Architecture](#15-reliability-architecture)
16. [Deployment Architecture](#16-deployment-architecture)
17. [Future Extensions](#17-future-extensions)
18. [Architecture Summary](#18-architecture-summary)

---

## 1. Introduction

### 1.1. Purpose
This document defines the overall system architecture for the Smart Attendance Tracking System. It describes the major components, their responsibilities, how they communicate, and the technologies selected for implementation.

### 1.2. System Overview
The Smart Attendance Tracking System is a multi-platform application consisting of:
* **React Web Application** for administrators.
* **Flutter Mobile Application** for attendees.
* **Node.js/Express Backend** for business logic and API handling.
* **Supabase** for the data platform (PostgreSQL, Auth, Storage).

## 2. Architecture Style
The system uses a **client-server architecture** with a centralized backend and Supabase as the managed data platform.

### 2.1. Presentation Layer
* **Components:** Admin Web App (React), Attendee Mobile App (Flutter).
* **Responsibilities:** Collect user input, display data, QR scanning.

### 2.2. Application Layer
* **Component:** Backend API Server (Node.js + Express).
* **Responsibilities:** Auth verification, RBAC, session management, QR processing, report generation.

### 2.3. Data and Platform Layer
* **Component:** Supabase.
* **Responsibilities:** Structured data storage, user authentication sessions, file storage.

## 3. High-Level System Architecture
```text
+------------------------+        +------------------------+
|   Admin Web App        |        |   Attendee Mobile App  |
|   React                |        |   Flutter              |
+-----------+------------+        +-----------+------------+
            |                                 |
            | HTTPS / REST API                | HTTPS / REST API
            +----------------+----------------+
                             |
                             v
                 +-----------+------------+
                 |   Backend API          |
                 |   Node.js + Express    |
                 +-----------+------------+
                             |
                             |
                             v
                 +------------------------+
                 |       Supabase         |
                 | PostgreSQL + Auth      |
                 | Storage + Realtime     |
                 +------------------------+
```

## 4. Architectural Rationale
Separating concerns allows the React and Flutter apps to focus on UI/UX while the Express backend enforces critical business rules (QR token validation, duplicate prevention, etc.) that should not be trusted to clients.

## 5. Major System Components

### 5.1. Admin Web Application (React)
* **Responsibilities:** Admin login, Org/Dept/User management, Session creation, QR display, Reporting.

### 5.2. Attendee Mobile Application (Flutter)
* **Responsibilities:** User login, Session viewing, QR scanning, History viewing.

### 5.3. Backend API Server (Node.js + Express)
* **Responsibilities:** Token verification, Role permissions, QR token generation, Status classification.

### 5.4. Supabase Platform
* **Services:** PostgreSQL (Data), Auth (Identity), Storage (Files), Realtime (Live updates).

## 6. Detailed Interaction Flow

### 6.1. Admin Workflow
1. Admin logs into the React app.
2. Admin performs management actions (e.g., create session).
3. Backend processes requests and updates Supabase.

### 6.2. Attendee Workflow
1. Attendee logs into the Flutter app.
2. Attendee scans a session QR code.
3. Backend validates the token, session, and user eligibility.
4. Attendance record is stored in PostgreSQL.

## 7. Communication Architecture
* **Client to Backend:** HTTPS-based REST API (JSON).
* **Backend to Supabase:** Official Supabase client (Service Role key for secure operations).

## 8. Authentication Architecture
Uses **Supabase Auth** for identity management and **JWT** for backend authorization. Roles (`super_admin`, `org_admin`, `attendee`) are stored in the `profiles` table.

## 9. Data Architecture
Centralized storage in **Supabase PostgreSQL**. Integrity rules (unique emails, valid roles, no duplicate attendance) are enforced at the database level.

## 10. Backend Module Architecture
Modular feature-based structure:
```text
server/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── organizations/
    │   ├── departments/
    │   ├── users/
    │   ├── sessions/
    │   ├── attendance/
    │   └── reports/
    └── middlewares/
```

## 11. Frontend Integration Architecture
React and Flutter apps use dedicated API clients to communicate with the Express backend.

## 12. Attendance Check-in Architecture
Critical process: Admin creates session -> Backend generates secure token -> Attendee scans QR -> Backend validates (User + Session + Time + Duplicate) -> Record written to Supabase.

## 13. Security Architecture
* JWT/Session verification.
* Role-based authorization.
* Secure QR token generation.
* Input validation on all endpoints.

## 14. Scalability Architecture
Designed for growth via managed Supabase infrastructure, modular backend, and PostgreSQL indexing.

## 15. Reliability Architecture
Enforced via database constraints, transaction-safe operations, and server-side validation.

## 16. Deployment Architecture
* **Frontend:** Vercel/Netlify.
* **Backend:** Render/Railway/Fly.io.
* **Data:** Supabase Cloud.

## 17. Future Extensions
GPS/Selfie validation, push notifications, offline sync, and advanced analytics.

## 18. Architecture Summary
A secure, modular, and scalable system combining React, Flutter, Node.js, and Supabase to provide modern attendance tracking.
