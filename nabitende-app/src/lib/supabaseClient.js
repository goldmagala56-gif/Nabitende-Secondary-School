// src/lib/supabaseClient.js
// One shared Supabase client for the whole app. Replaces the old
// axios-based api.js instance that talked to the Express/Render backend.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars. Check that .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

npm run deploy
git add .
git commit -m "nabitende-app"
git push