# Database Schema Document

## Table of Contents
1. [Introduction](#1-introduction)
2. [Design Notes](#2-design-notes)
3. [Enum Types](#3-enum-types)
4. [Core Tables](#4-core-tables)
5. [Recommended Supporting Tables](#5-recommended-supporting-tables)
6. [Indexes](#6-indexes)
7. [Updated At Trigger](#7-updated-at-trigger)
8. [Profile Auto-Creation Trigger](#8-profile-auto-creation-trigger)
9. [Core Business Rules](#9-core-business-rules)
10. [Recommended Row Level Security](#10-recommended-row-level-security)
11. [Schema Relationship Summary](#11-schema-relationship-summary)
12. [Example Data Flow](#12-example-data-flow)
13. [Full Schema Script Order](#13-full-schema-script-order)

---

## 1. Introduction
This document translates the ER Diagram into a concrete database structure for **Supabase PostgreSQL**. It defines tables, columns, keys, constraints, indexes, enum types, and core relationships.

## 2. Design Notes
Since you are using Supabase Auth, authentication users already exist in `auth.users`. Your app should not duplicate auth credentials. Instead, use a **profiles** table linked to `auth.users`. This provides Supabase-managed authentication with app-managed roles and profile data.

## 3. Enum Types
```sql
create type public.user_role as enum (
  'super_admin',
  'organization_admin',
  'attendee'
);

create type public.record_status as enum (
  'present',
  'late',
  'absent',
  'excused'
);

create type public.session_status as enum (
  'draft',
  'active',
  'closed',
  'cancelled'
);

create type public.attendance_method as enum (
  'qr',
  'manual',
  'hybrid'
);

create type public.account_status as enum (
  'active',
  'inactive'
);

create type public.entry_method as enum (
  'qr',
  'manual'
);
```

## 4. Core Tables

### 4.1. Organizations
```sql
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  logo_url text,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.2. Departments
```sql
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);
```

### 4.3. Profiles
```sql
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'attendee',
  employee_code text,
  avatar_url text,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.4. Sessions
```sql
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  grace_minutes integer not null default 0 check (grace_minutes >= 0),
  attendance_method public.attendance_method not null default 'qr',
  qr_token text not null unique,
  location_required boolean not null default false,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  radius_meters integer check (radius_meters is null or radius_meters >= 0),
  status public.session_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
```

### 4.5. Attendance Records
```sql
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_in_time timestamptz,
  status public.record_status not null,
  method public.entry_method not null default 'qr',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  device_info text,
  photo_url text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, user_id)
);
```

### 4.6. Attendance Logs
```sql
create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  attendance_record_id uuid not null references public.attendance_records(id) on delete cascade,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

## 5. Recommended Supporting Tables

### 5.1. Session Participants
```sql
create table public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);
```

## 6. Indexes
```sql
create index idx_departments_organization_id on public.departments(organization_id);
create index idx_profiles_organization_id on public.profiles(organization_id);
create index idx_profiles_department_id on public.profiles(department_id);
create index idx_profiles_role on public.profiles(role);
create index idx_sessions_organization_id on public.sessions(organization_id);
create index idx_sessions_department_id on public.sessions(department_id);
create index idx_sessions_created_by on public.sessions(created_by);
create index idx_sessions_session_date on public.sessions(session_date);
create index idx_sessions_status on public.sessions(status);
create index idx_attendance_records_session_id on public.attendance_records(session_id);
create index idx_attendance_records_user_id on public.attendance_records(user_id);
create index idx_attendance_records_status on public.attendance_records(status);
create index idx_attendance_logs_attendance_record_id on public.attendance_logs(attendance_record_id);
create index idx_session_participants_session_id on public.session_participants(session_id);
create index idx_session_participants_user_id on public.session_participants(user_id);
```

## 7. Updated At Trigger
```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger trg_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_sessions_updated_at before update on public.sessions for each row execute function public.set_updated_at();
create trigger trg_attendance_records_updated_at before update on public.attendance_records for each row execute function public.set_updated_at();
```

## 8. Profile Auto-Creation Trigger
```sql
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (auth_user_id, email, first_name, last_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'attendee'),
    'active'
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();
```

## 9. Core Business Rules
1. **Unique Attendance:** `unique (session_id, user_id)` ensures one record per user per session.
2. **Valid Time Range:** `check (end_time > start_time)` ensures sessions have a logical duration.
3. **Grace Minutes:** `check (grace_minutes >= 0)` prevents negative values.
4. **Valid Roles:** Enforced by `public.user_role` enum.
5. **Unique QR Tokens:** `qr_token text not null unique` prevents token collisions.

## 10. Recommended Row Level Security (RLS)
* **Profiles:** Users read/update own profile; admins read users in their organization.
* **Sessions:** Attendees read relevant sessions; admins manage org-specific sessions.
* **Attendance Records:** Attendees read own; admins read org-specific. Check-ins should happen through the backend.

## 11. Schema Relationship Summary
* `departments` -> `organizations`
* `profiles` -> `auth.users`, `organizations`, `departments`
* `sessions` -> `organizations`, `departments`, `profiles`
* `attendance_records` -> `sessions`, `profiles`
* `attendance_logs` -> `attendance_records`
* `session_participants` -> `sessions`, `profiles`

## 12. Example Data Flow
1. **Admin creates organization:** Recorded in `organizations`.
2. **Admin creates department:** Recorded in `departments`.
3. **User created via auth:** `auth.users` -> `profiles` (via trigger).
4. **Admin creates session:** Recorded in `sessions`.
5. **Attendee checks in:** `attendance_records` & `attendance_logs`.

## 13. Full Schema Script Order
1. Enum types
2. Tables
3. Trigger functions
4. Triggers
5. RLS policies
