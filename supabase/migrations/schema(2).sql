-- ============================================================
-- Nabitende Secondary School — Phase 2
-- Parent↔student linking, student login linking, fees, grades,
-- announcements, notifications
-- ============================================================

-- ---------- Link a logged-in student to their student record ----------
alter table students add column if not exists user_id uuid unique references auth.users(id);

-- ---------- Link parents to their children (many-to-many) ----------
create table if not exists parent_students (
  parent_id  uuid not null references profiles(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (parent_id, student_id)
);
alter table parent_students enable row level security;

create policy "parent views own links or admin" on parent_students
  for select using (parent_id = auth.uid() or is_admin());
create policy "admin manages parent links" on parent_students
  for all using (is_admin());

-- Parents can now see their own linked children; students can see themselves
create policy "parent or student views own record" on students
  for select using (
    is_admin()
    or is_teacher_of(stream_id)
    or user_id = auth.uid()
    or exists (select 1 from parent_students where student_id = students.id and parent_id = auth.uid())
  );

-- ---------- Helper functions for the new policies below ----------
create or replace function is_parent_of(check_student_id uuid) returns boolean as $$
  select exists (
    select 1 from parent_students where student_id = check_student_id and parent_id = auth.uid()
  );
$$ language sql security definer stable;

create or replace function is_self_student(check_student_id uuid) returns boolean as $$
  select exists (
    select 1 from students where id = check_student_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- ---------- Fees ----------
create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  term text not null,
  academic_year text not null,
  term_fee numeric not null default 0,
  paid numeric not null default 0,
  balance numeric generated always as (term_fee - paid) stored,
  status text not null default 'pending' check (status in ('pending', 'partial', 'paid', 'overdue')),
  created_at timestamptz default now(),
  unique (student_id, term, academic_year)
);
alter table fees enable row level security;

create policy "admin or own family views fees" on fees
  for select using (is_admin() or is_parent_of(student_id) or is_self_student(student_id));
create policy "admin manages fees" on fees
  for all using (is_admin());

-- ---------- Grades ----------
create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  subject text not null,
  score numeric not null check (score >= 0 and score <= 100),
  term text not null,
  academic_year text not null,
  recorded_by uuid references profiles(id),
  created_at timestamptz default now()
);
alter table grades enable row level security;

create policy "admin, teacher of stream, or own family views grades" on grades
  for select using (
    is_admin()
    or is_parent_of(student_id)
    or is_self_student(student_id)
    or exists (
      select 1 from students s where s.id = grades.student_id and is_teacher_of(s.stream_id)
    )
  );
create policy "admin or teacher records grades" on grades
  for insert with check (
    is_admin()
    or exists (select 1 from students s where s.id = grades.student_id and is_teacher_of(s.stream_id))
  );
create policy "admin or teacher updates grades" on grades
  for update using (
    is_admin()
    or exists (select 1 from students s where s.id = grades.student_id and is_teacher_of(s.stream_id))
  );
create policy "admin deletes grades" on grades
  for delete using (is_admin());

-- ---------- Announcements ----------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text default 'general',
  pinned boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
alter table announcements enable row level security;

create policy "any logged-in user views announcements" on announcements
  for select using (auth.role() = 'authenticated');
create policy "admin manages announcements" on announcements
  for all using (is_admin());

-- ---------- Notifications ----------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;

create policy "user views own notifications" on notifications
  for select using (user_id = auth.uid());
create policy "user marks own notifications read" on notifications
  for update using (user_id = auth.uid());
create policy "admin creates notifications" on notifications
  for insert with check (is_admin());
create policy "admin deletes notifications" on notifications
  for delete using (is_admin());