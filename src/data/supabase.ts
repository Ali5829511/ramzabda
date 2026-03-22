import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// NOTE: createClient throws when called with an empty URL string.
// We use placeholder values so the client can always be constructed safely.
// The isConfigured() guard in supabaseSync.ts ensures no real requests are
// made when the actual env vars are absent.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
