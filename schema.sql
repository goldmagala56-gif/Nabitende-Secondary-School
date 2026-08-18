-- ============================================================
-- Nabitende Secondary School — Operations App
-- Phase 1 schema: classes, streams, students, attendance
-- Run this in your Supabase project's SQL editor (one paste, run once)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Profiles (one row per logged-in user: admin/teacher) ----------
-- Phase 3 will add 'parent' and 'student' roles to this same table.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'teacher', 'parent', 'student')) default 'teacher',
  phone text,
  created_at timestamptz default now()
);

-- ---------- Classes: S1 through S6 ----------
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,        -- 'S1', 'S2', ... 'S6'
  order_index int not null          -- for sorting: 1..6
);

-- ---------- Streams: sub-divisions within a class, e.g. S1 East / S1 West ----------
create table if not exists streams (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,               -- 'East', 'West', etc.
  unique (class_id, name)
);

-- ---------- Students ----------
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  admission_no text not null unique,
  first_name text not null,
  last_name text not null,
  stream_id uuid references streams(id) on delete set null,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

-- ---------- Which teacher is assigned to which stream(s) ----------
create table if not exists teacher_streams (
  teacher_id uuid not null references profiles(id) on delete cascade,
  stream_id uuid not null references streams(id) on delete cascade,
  primary key (teacher_id, stream_id)
);

-- ---------- Attendance ----------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  stream_id uuid not null references streams(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late')),
  marked_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (student_id, date)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table classes enable row level security;
alter table streams enable row level security;
alter table students enable row level security;
alter table teacher_streams enable row level security;
alter table attendance enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Helper: is the current user a teacher assigned to this stream?
create or replace function is_teacher_of(check_stream_id uuid) returns boolean as $$
  select exists (
    select 1 from teacher_streams
    where teacher_id = auth.uid() and stream_id = check_stream_id
  );
$$ language sql security definer stable;

-- ---------- profiles ----------
create policy "view own profile or admin views all" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "admin manages profiles" on profiles
  for all using (is_admin());
create policy "user updates own profile" on profiles
  for update using (auth.uid() = id);

-- ---------- classes & streams: any logged-in staff can view; only admin edits ----------
create policy "staff view classes" on classes
  for select using (auth.role() = 'authenticated');
create policy "admin manages classes" on classes
  for all using (is_admin());

create policy "staff view streams" on streams
  for select using (auth.role() = 'authenticated');
create policy "admin manages streams" on streams
  for all using (is_admin());

-- ---------- students: admin sees all; teacher sees only their assigned streams ----------
create policy "admin or assigned teacher views students" on students
  for select using (is_admin() or is_teacher_of(stream_id));
create policy "admin manages students" on students
  for all using (is_admin());

-- ---------- teacher_streams: admin manages; teachers can see their own assignments ----------
create policy "view own assignments or admin" on teacher_streams
  for select using (teacher_id = auth.uid() or is_admin());
create policy "admin manages assignments" on teacher_streams
  for all using (is_admin());

-- ---------- attendance: admin full access; teacher can read/write only their streams ----------
create policy "admin or assigned teacher views attendance" on attendance
  for select using (is_admin() or is_teacher_of(stream_id));
create policy "admin or assigned teacher marks attendance" on attendance
  for insert with check (is_admin() or is_teacher_of(stream_id));
create policy "admin or assigned teacher updates attendance" on attendance
  for update using (is_admin() or is_teacher_of(stream_id));
create policy "admin deletes attendance" on attendance
  for delete using (is_admin());

-- ============================================================
-- Seed the six class levels (streams you'll add yourself in the app,
-- since only you know your actual stream names)
-- ============================================================
insert into classes (name, order_index) values
  ('S1', 1), ('S2', 2), ('S3', 3), ('S4', 4), ('S5', 5), ('S6', 6)
on conflict (name) do nothing;