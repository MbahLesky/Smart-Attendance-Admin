# Planning and Requirements Analysis

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Stakeholders](#4-stakeholders)
5. [Proposed System Overview](#5-proposed-system-overview)
6. [System Scope](#6-system-scope)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Constraints](#9-constraints)
10. [Assumptions](#10-assumptions)
11. [Feasibility Analysis](#11-feasibility-analysis)
12. [Success Criteria](#12-success-criteria)
13. [Conclusion](#13-conclusion)

---

## 1. Project Overview
Attendance tracking is an important administrative activity in organizations, schools, institutions, and events. Traditional attendance systems such as paper registers, spreadsheets, or manual roll calls are inefficient, time-consuming, and susceptible to errors or manipulation. These systems often make it difficult to generate accurate reports or monitor attendance patterns.

The **Smart Attendance Tracking System** is designed to address these challenges by providing a digital platform that automates attendance management. The system will consist of two main applications: a web application for administrators and a mobile application for attendees. Administrators will manage organizations, users, attendance sessions, and reports through the web application, while attendees will use the mobile application to mark their attendance using QR code scanning and other validation mechanisms.

The system aims to improve efficiency, reduce fraud in attendance recording, and provide accurate real-time attendance analytics.

## 2. Problem Statement
Traditional attendance systems are often manual, slow, and easy to manipulate. Paper registers, verbal roll calls, and basic spreadsheets can cause inaccurate records, wasted time, proxy attendance, and poor reporting. Organizations need a smarter system that makes attendance easier to record, validate, and analyze.

## 3. Project Objectives

### 3.1. Main Goal
To build a smart attendance platform that allows administrators to manage attendance sessions from a web app and allows attendees to mark attendance from a mobile app in a secure and efficient way.

### 3.2. Specific Objectives
* Provide secure authentication for admins and attendees.
* Allow admins to create and manage attendance sessions.
* Allow admins to manage organizations, departments, and attendees.
* Allow attendees to mark attendance using mobile devices.
* Reduce duplicate, proxy, or fake attendance.
* Automatically record attendance status such as **Present**, **Late**, **Absent**, or **Excused**.
* Generate attendance reports and analytics.
* Support future smart validation features like GPS and selfie verification.

## 4. Stakeholders

### 4.1. Primary Stakeholders
* System Administrators
* Organization Admins
* Attendees (Employees, Students, Participants)

### 4.2. Secondary Stakeholders
* Company Management / School Management
* HR Teams
* Lecturers / Supervisors / Coordinators
* Software Developers and System Maintainers

## 5. Proposed System Overview
The Smart Attendance Tracking System will consist of three major components:

### 5.1. Admin Web Application
This interface will allow administrators to:
* Log in to the admin dashboard.
* Create and manage organizations.
* Create departments or groups.
* Register attendees.
* Create attendance sessions and generate QR Codes.
* Monitor attendance in real-time and view analytics.
* Manually enter/edit attendance where necessary.

### 5.2. Mobile Application
This application will be used by attendees to:
* Log in to the mobile app.
* View assigned attendance sessions.
* Scan QR codes to check in.
* View personal attendance history.
* Receive attendance-related notifications.

### 5.3. Backend Server
The backend will handle authentication, data processing, attendance validation, and storage.

## 6. System Scope

### 6.1. In Scope
* Admin and Attendee authentication/authorization.
* Organization and Department management.
* Attendee registration and management.
* Attendance session creation and QR code generation.
* QR code-based attendance marking with automatic status classification.
* Manual attendance entry by admins.
* Attendance history tracking and reporting/analytics.
* Role-Based Access Control (RBAC).

### 6.2. Out of Scope (for MVP)
* Biometric hardware integration.
* Facial recognition.
* Payroll integration.
* Complex offline sync.
* Public API for third-party systems.
* Multi-language support.
* Billing/subscription system.

## 7. Functional Requirements

### 7.1. Admin Web Application
The system must allow administrators to:
* Log in securely.
* Manage Organizations, Departments, and Attendees.
* Create attendance sessions with specific dates, times, and grace periods.
* Generate QR codes for sessions.
* View and manually update attendance records.
* Export attendance reports.

### 7.2. Attendee Mobile Application
The system must allow attendees to:
* Log in securely.
* View active or upcoming sessions.
* Scan QR codes to check in and receive confirmation.
* View personal attendance history and status.

### 7.3. Backend System
The backend system must:
* Validate authentication credentials and manage data entities.
* Validate sessions before accepting check-ins.
* Prevent duplicate entries and automatically classify status (Late, Absent, Present).
* Provide RESTful APIs for web and mobile clients.

## 8. Non-Functional Requirements

### 8.1. Performance
* Responses to login and attendance requests should be near-instant.
* Confirmation of attendance should occur within seconds.

### 8.2. Security
* Passwords must be securely hashed.
* Implement strict RBAC and input validation.
* Server-side validation for all QR code check-ins.

### 8.3. Usability
* Intuitive UI for both admin dashboard and mobile app.
* Minimal steps for attendee check-in.

### 8.4. Scalability
* Support growth in users, organizations, and sessions.
* Modular architecture for future feature expansion.

### 8.5. Reliability
* Ensure data consistency and prevent duplicate records.

## 9. Constraints
* Web application built with **React**.
* Mobile application built with **Flutter**.
* Follows SDLC methodology.
* MVP focuses on core attendance flow.

## 10. Assumptions
* Users have smartphones and internet access.
* Admins use modern web browsers.
* QR code check-in is the primary method for the first version.

## 11. Feasibility Analysis

### 11.1. Technical Feasibility
Technically feasible using React, Flutter, Node.js/Express, and PostgreSQL (via Supabase).

### 11.2. Operational Feasibility
Significantly reduces manual work and improves accuracy for organizations.

### 11.3. Economic Feasibility
Utilizes open-source tools to minimize development costs.

## 12. Success Criteria
* Admins successfully manage attendees and sessions.
* Attendees successfully check in via QR code.
* Duplicate/invalid attempts are blocked.
* Accurate reports are generated.

## 13. Conclusion
The Smart Attendance Tracking System modernize attendance management through a secure digital platform, improving efficiency and accuracy for all stakeholders.
