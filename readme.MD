# Nabitende S.S. Operations App — Phase 1

Covers: classes/streams, student records, daily attendance. Admin and teacher roles only (parent/student login comes in Phase 3).

## Setup

1. **Create a free Supabase project** at supabase.com → New Project. Pick a name and a database password (save it somewhere safe), pick a region close to Uganda if offered (e.g. Europe or a nearby region), and wait ~2 minutes for it to provision.

2. **Run the schema.** In your Supabase project, go to the SQL Editor → New Query → paste the entire contents of `schema.sql` → Run. This creates all tables, security rules, and the six class levels (S1-S6).

3. **Get your API keys.** Project Settings → API. Copy the "Project URL" and the "anon public" key.

4. **Fill in `app.html`.** Near the top, replace:
   ```
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   with the values from step 3.

5. **Create your first admin account.** In Supabase: Authentication → Users → Add User (enter your email + a password, mark email as confirmed). Then in SQL Editor, run:
   ```sql
   insert into profiles (id, full_name, role)
   values ('paste-the-user-id-here', 'Your Name', 'admin');
   ```
   You can find the user's id in the Authentication → Users list after creating them.

6. **Open `app.html` in a browser** (or push it to GitHub Pages / Netlify like the main site) and sign in with that email/password. You should land on the Dashboard.

## Adding teachers

For each teacher: Authentication → Add User (their email + a temporary password they'll change later), then insert a `profiles` row with `role = 'teacher'`. To let them mark attendance for a specific stream, insert a row into `teacher_streams` linking their user id to that stream's id (both admin can do from the Table Editor in Supabase directly — no UI for this yet in Phase 1, it's a two-minute manual step per teacher).

## What's in Phase 1

- Admin: create streams under each class, add/view students, mark attendance for any stream
- Teacher: view students and mark attendance only for streams they're assigned to
- Dashboard: active student count, stream count, today's attendance-marked count

## What's next (Phase 2)

Fees tracking and exam results — built on top of the same `students` table, so nothing here needs to change to add them.