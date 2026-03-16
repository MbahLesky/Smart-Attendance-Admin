# API Specification Document

## Table of Contents
1. [Introduction](#1-introduction)
2. [API Overview](#2-api-overview)
3. [API Design Principles](#3-api-design-principles)
4. [Standard Response Format](#4-standard-response-format)
5. [Authentication and Authorization Rules](#5-authentication-and-authorization-rules)
6. [Endpoint Groups](#6-endpoint-groups)
7. [Auth API](#7-auth-api)
8. [Organizations API](#8-organizations-api)
9. [Departments API](#9-departments-api)
10. [Profiles / Users API](#10-profiles--users-api)
11. [Sessions API](#11-sessions-api)
12. [Attendance API](#12-attendance-api)
13. [Reports API](#13-reports-api)
14. [Validation Rules](#14-validation-rules-by-endpoint-area)
15. [Error Handling](#15-error-handling)
16. [API Module Priority Summary](#16-api-module-priority-summary)
17. [Suggested Implementation Order](#17-suggested-implementation-order)

---

## 1. Introduction
This document defines the backend API for the **Smart Attendance Tracking System**. It explains API structure, endpoint groups, request/response formats, authentication flow, validation rules, error handling, and access control by role.

This API will be used by the **React admin web app** and the **Flutter attendee mobile app**.

## 2. API Overview
* **Base URL:** `/api/v1`
* **Data Format:** `application/json`
* **Authentication Method:** Bearer Token via `Authorization: Bearer <access_token>`.

## 3. API Design Principles
The API follows these rules:
* Resource-based routes.
* Clear separation by module.
* Backend-enforced business logic and validation.
* Consistent response format and role-based access control.

## 4. Standard Response Format

### Success Response
```json
{
 "success": true,
 "message": "Operation completed successfully",
 "data": {}
}
```

### Error Response
```json
{
 "success": false,
 "message": "Validation failed",
 "errors": [
   {
     "field": "email",
     "message": "Email is required"
   }
 ]
}
```

## 5. Authentication and Authorization Rules

### Roles
* `super_admin`
* `organization_admin`
* `attendee`

### Access Control Summary
| Endpoint Type | Super Admin | Org Admin | Attendee |
| :--- | :--- | :--- | :--- |
| Manage organizations | Yes | No | No |
| Manage departments | Yes | Yes | No |
| Manage profiles/users | Yes | Yes | No |
| Manage sessions | Yes | Yes | No |
| Submit attendance | No | No | Yes |
| View own history | No | No | Yes |
| View reports | Yes | Yes | No |

## 6. Endpoint Groups
1. Auth
2. Organizations
3. Departments
4. Profiles / Users
5. Sessions
6. Attendance
7. Reports

## 7. Auth API

### 7.1. Get Current User
* **Endpoint:** `GET /auth/me`
* **Purpose:** Returns the authenticated user's profile and role data.
* **Access:** Authenticated users only.

### 7.2. Complete Profile Setup
* **Endpoint:** `POST /auth/complete-profile`
* **Purpose:** Allows filling in required profile data after initial creation.

## 8. Organizations API
* `POST /organizations`: Create Org (Super Admin).
* `GET /organizations`: List Orgs (Super Admin).
* `GET /organizations/:id`: View Org (Super Admin).
* `PATCH /organizations/:id`: Update Org (Super Admin).

## 9. Departments API
* `POST /departments`: Create Dept (Super Admin / Org Admin).
* `GET /departments`: List Depts (Super Admin / Org Admin).
* `PATCH /departments/:id`: Update Dept (Super Admin / Org Admin).
* `DELETE /departments/:id`: Delete Dept (Super Admin / Org Admin).

## 10. Profiles / Users API
* `POST /users`: Create User/Attendee.
* `GET /users`: List Users (filtering by Org/Dept).
* `PATCH /users/:id`: Update User.
* `POST /users/import`: Bulk Import Users (CSV).

## 11. Sessions API
* `POST /sessions`: Create Session (Start/End time, Grace period).
* `GET /sessions`: List Sessions (Admins see org sessions; attendees see relevant sessions).
* `PATCH /sessions/:id/status`: Change Session Status (Draft, Active, Closed, Cancelled).
* `GET /sessions/:id/qr`: Get Session QR token info.

## 12. Attendance API

### 12.1. Check In via QR
* **Endpoint:** `POST /attendance/check-in`
* **Request Body:**
```json
{
 "qr_token": "secure-session-token",
 "latitude": 4.0511,
 "longitude": 9.7679,
 "device_info": "Android 14 - Samsung A15"
}
```

### 12.2. Manual Attendance Entry
* `POST /attendance/manual`: Manual check-in by admin.

### 12.3. Attendance History
* `GET /attendance/me`: Personal history for attendees.
* `GET /attendance/session/:sessionId`: Session records for admins.

## 13. Reports API
* `GET /reports/daily`: Daily org/dept summary.
* `GET /reports/session/:sessionId`: Detailed session breakdown.
* `GET /reports/export`: Export as CSV or PDF.

## 14. Validation Rules by Endpoint Area
* **Auth:** Valid Bearer token required.
* **Users:** Unique email, valid role.
* **Sessions:** `end_time > start_time`, `grace_minutes >= 0`.
* **Attendance:** QR token match, active session, unique entry per session.

## 15. Error Handling
* `200/201`: Success/Created.
* `400`: Bad Request / Validation error.
* `401`: Unauthorized.
* `403`: Forbidden (Role error).
* `404`: Resource not found.
* `409`: Conflict / Duplicate.
* `500`: Internal server error.

## 16. API Module Priority Summary
* **M (Must):** Auth me, Organizations, Departments, Users, Sessions, QR Check-in.
* **S (Should):** Manual Entry, History, Reports, Exports.
* **C (Could):** Bulk Import.

## 17. Suggested Implementation Order
1. **Phase 1:** Auth, Organizations, Departments, Users.
2. **Phase 2:** Sessions, QR generation.
3. **Phase 3:** Attendance check-in, History.
4. **Phase 4:** Reports, Exports.
