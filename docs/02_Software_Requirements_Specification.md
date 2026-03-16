# Software Requirements Specification (SRS)

## Table of Contents
1. [Introduction](#1-introduction)
2. [System Actors](#2-system-actors)
3. [Use Case Identification](#3-use-case-identification)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Requirement Prioritization (MoSCoW)](#7-requirement-prioritization-moscow)
8. [Acceptance Criteria](#8-acceptance-criteria)

---

## 1. Introduction

### 1.1. Purpose of the SRS
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the Smart Attendance Tracking System. The document serves as a reference for developers, designers, and stakeholders to understand how the system should behave and what features it must support.

The system consists of:
* **Admin Web Application (React)** – used by administrators to manage organizations, users, sessions, and reports.
* **Mobile Application (Flutter)** – used by attendees to mark attendance.
* **Backend API** – handles authentication, session validation, attendance processing, and data storage.

This document focuses primarily on the core system features (functional requirements) and the detailed processes involved in each.

## 2. System Actors

### 2.1. Super Admin
Controls the entire platform.
* Manage organizations.
* Assign organization administrators.
* Monitor system activity.
* Manage platform settings.

### 2.2. Organization Admin
Manages attendance within a specific organization.
* Manage departments or groups.
* Register attendees.
* Create attendance sessions and generate QR codes.
* Monitor attendance records and generate reports.

### 2.3. Attendee
A registered participant who marks attendance using the mobile application.
* Log in to the mobile application.
* Scan QR codes to mark attendance.
* View personal attendance history and receive confirmation.

## 3. Use Case Identification

### 3.1. Admin Use Cases
| Use Case | Description |
| :--- | :--- |
| Login | Admin logs into the dashboard |
| Create Organization | Admin registers a new organization |
| Manage Departments | Admin creates and manages departments |
| Register Attendees | Admin adds attendees to the system |
| Create Session | Admin creates attendance session |
| Generate QR Code | System generates QR code for session |
| Monitor Attendance | Admin views attendance records |
| Update Attendance | Admin manually edits attendance |
| Generate Reports | Admin generates attendance reports |

### 3.2. Attendee Use Cases
| Use Case | Description |
| :--- | :--- |
| Login | Attendee logs into the mobile app |
| View Sessions | Attendee sees available sessions |
| Scan QR Code | Attendee scans QR code to check in |
| Confirm Attendance | System confirms attendance |
| View History | Attendee views past attendance |

## 4. User Stories

### 4.1. Admin User Stories
* As an admin, I want to create attendance sessions so that I can track attendance for specific events.
* As an admin, I want to generate QR codes so that attendees can easily mark attendance.
* As an admin, I want to monitor attendance records so that I can see who attended.
* As an admin, I want to export attendance reports so that I can analyze attendance patterns.

### 4.2. Attendee User Stories
* As an attendee, I want to log in to the mobile app so that I can access attendance sessions.
* As an attendee, I want to scan a QR code so that I can mark my attendance quickly.
* As an attendee, I want to view my attendance history so that I can track my participation.

## 5. Functional Requirements (Core Features)

### 5.1. User Authentication (Priority: M)
* **Description:** Secure login based on roles.
* **Process:** Verify credentials, generate JWT/Auth token, grant role-based access.
* **Required Data:** `email`, `password`.

### 5.2. Organization Management (Priority: M)
* **Description:** Super Admin creates and manages organizations.
* **Process:** Validate organization fields, store record, assign org admin.
* **Required Data:** `name`, `email`, `phone`, `address`.

### 5.3. Department or Group Management (Priority: M)
* **Description:** Manage units within an organization.
* **Process:** Select org, define department, assign attendees.
* **Required Data:** `name`, `organization_id`, `description`.

### 5.4. Attendee Registration (Priority: M)
* **Description:** Register attendees for sessions.
* **Process:** Enter details, hash password, assign to department.
* **Required Data:** `name`, `email`, `phone`, `department_id`.

### 5.5. Attendance Session Creation (Priority: M)
* **Description:** Create sessions for events or classes.
* **Process:** Define details, generate secure token and QR code.
* **Required Data:** `title`, `date`, `start_time`, `end_time`, `grace_period`.

### 5.6. QR Code Attendance Check-in (Priority: M)
* **Description:** Scan QR to mark attendance.
* **Process:** Read token, validate session status and user eligibility on backend.
* **Required Data:** `qr_token`, `user_id`, `timestamp`.

### 5.7. Attendance Status Processing (Priority: M)
* **Description:** Automatically determine status.
* **Logic:**
    * **Present:** `check-in <= start_time + grace_period`
    * **Late:** `check-in > start_time + grace_period`
    * **Absent:** No check-in before session closes.

### 5.8. Manual Attendance Entry (Priority: S)
* **Description:** Admin manually marks attendance if QR fails.
* **Process:** Select session/user, update status manually.

### 5.9. Attendance Reporting (Priority: M)
* **Description:** View stats and export reports.
* **Process:** Aggregate data, display charts/tables, export to CSV/PDF.

### 5.10. Attendance History (Priority: S)
* **Description:** Attendees view past records chronologically.

## 6. Non-Functional Requirements
* **Performance:** Check-ins processed in seconds.
* **Security:** Encrypted passwords, JWT authentication, RBAC.
* **Usability:** Intuitive interface for all actors.
* **Reliability:** Prevent duplicates, maintain accurate logs.
* **Scalability:** Support growth in users and organizations.

## 7. Requirement Prioritization (MoSCoW)
* **Must Have:** Auth, Org/User Management, Session Creation, QR Check-in, Basic Reporting.
* **Should Have:** Automatic late detection, manual editing, history.
* **Could Have:** GPS/Selfie verification, notifications.
* **Won't Have (MVP):** Biometrics, payroll integration.

## 8. Acceptance Criteria
* Admins can successfully manage sessions and users.
* Attendees can check in via QR code.
* System correctly classifies Present/Late/Absent.
* Accurate reports are generated.
