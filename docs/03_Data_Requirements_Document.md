# Data Requirements Document (DRD)

## Table of Contents
1. [Introduction](#1-introduction)
2. [Data Entities Overview](#2-data-entities-overview)
3. [Data Entity Definitions](#3-data-entity-definitions)
4. [Data Relationships Summary](#4-data-relationships-summary)
5. [Data Validation Requirements](#5-data-validation-requirements)
6. [Data Security Requirements](#6-data-security-requirements)
7. [Data Retention Requirements](#7-data-retention-requirements)
8. [Data Flow Overview](#8-data-flow-overview)

---

## 1. Introduction

### 1.1. Purpose
The purpose of this document is to define the data required by the **Smart Attendance Tracking System**. It identifies the key data entities, their attributes, relationships, and constraints necessary to support the system’s functionality.

### 1.2. Scope
The system manages data related to:
* Organizations
* Departments or groups
* Users
* Attendance sessions
* Attendance records
* Authentication

The data will be stored in a centralized database accessed by both the **React web application** and the **Flutter mobile application** through the backend API.

## 2. Data Entities Overview
The system will use the following primary data entities:

| Entity | Description |
| :--- | :--- |
| **Organization** | Represents institutions or companies using the system. |
| **Department** | Represents groups or units within an organization. |
| **User** | Represents system users including admins and attendees. |
| **Session** | Represents an attendance event. |
| **Attendance Record** | Represents attendance entries for sessions. |
| **Attendance Log** | Records attendance-related actions for auditing. |
| **Authentication Token** | Stores session authentication information. |

## 3. Data Entity Definitions

### 3.1. Organization Entity
Represents organizations that use the attendance system. Each organization may contain multiple departments and users.

**Attributes:**
* `organization_id`: UUID (Primary Key)
* `name`: String
* `email`: String
* `phone`: String
* `address`: String
* `created_at`: Timestamp
* `status`: Boolean (Active/Inactive)

### 3.2. Department Entity
Represents departments, classes, or groups within an organization.

**Attributes:**
* `department_id`: UUID (Primary Key)
* `organization_id`: UUID (Foreign Key)
* `name`: String
* `description`: String
* `created_at`: Timestamp

### 3.3. User Entity
Represents all system users including admins and attendees.

**Attributes:**
* `user_id`: UUID (Primary Key)
* `organization_id`: UUID (Foreign Key)
* `department_id`: UUID (Foreign Key)
* `first_name`: String
* `last_name`: String
* `email`: String (Unique)
* `phone`: String
* `password_hash`: String (Encrypted)
* `role`: Enum (`super_admin`, `admin`, `attendee`)
* `status`: Boolean
* `created_at`: Timestamp

### 3.4. Session Entity
Represents an attendance session created by an administrator.

**Attributes:**
* `session_id`: UUID (Primary Key)
* `organization_id`: UUID (Foreign Key)
* `department_id`: UUID (Foreign Key)
* `title`: String
* `session_date`: Date
* `start_time`: Time
* `end_time`: Time
* `grace_period`: Integer (Minutes)
* `qr_token`: String (Unique)
* `status`: Enum (`active`, `closed`)
* `created_at`: Timestamp

### 3.5. Attendance Record Entity
Stores attendance entries for each user during a session.

**Attributes:**
* `attendance_id`: UUID (Primary Key)
* `session_id`: UUID (Foreign Key)
* `user_id`: UUID (Foreign Key)
* `check_in_time`: Timestamp
* `status`: Enum (`present`, `late`, `absent`)
* `method`: Enum (`QR`, `Manual`)
* `device_info`: String
* `created_at`: Timestamp

### 3.6. Attendance Log Entity
Tracks actions related to attendance events for auditing purposes.

**Attributes:**
* `log_id`: UUID (Primary Key)
* `attendance_id`: UUID (Foreign Key)
* `action`: String
* `created_at`: Timestamp

### 3.7. Authentication Token Entity
Stores authentication sessions for users.

**Attributes:**
* `token_id`: UUID (Primary Key)
* `user_id`: UUID (Foreign Key)
* `token`: String
* `expires_at`: Timestamp
* `created_at`: Timestamp

## 4. Data Relationships Summary
| Relationship | Type |
| :--- | :--- |
| Organization → Department | One-to-Many |
| Organization → Users | One-to-Many |
| Organization → Sessions | One-to-Many |
| Department → Users | One-to-Many |
| Session → Attendance Records | One-to-Many |
| User → Attendance Records | One-to-Many |

## 5. Data Validation Requirements

### 5.1. User Data
* Email must be unique and formatted correctly.
* Password must be encrypted (e.g., bcrypt).
* Role must be one of the defined enum values.

### 5.2. Session Data
* `end_time` must be after `start_time`.
* `grace_period` must be non-negative.

### 5.3. Attendance Data
* User cannot check in twice for the same session.
* Attendance must belong to a valid active session.
* Check-in timestamp must be within the session time window.

## 6. Data Security Requirements
* Sensitive data like `password_hash` must never be stored in plain text.
* Authentication tokens must be secure and use industry-standard formats (e.g., JWT).
* Implement role-based access control (RBAC) at the data layer.

## 7. Data Retention Requirements
Maintain historical records for reporting and auditing. Define retention periods based on organization policies (e.g., 1 year or as required by law).

## 8. Data Flow Overview
1. Admin creates Organization.
2. Admin creates Departments.
3. Admin registers Users.
4. Admin creates Attendance Sessions.
5. Attendees scan QR codes.
6. Attendance Records are stored.
7. Admin generates Reports.
