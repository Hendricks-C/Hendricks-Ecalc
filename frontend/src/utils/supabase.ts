import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables for Supabase project URL and anonymous public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client instance using the URL and key
// This client allows you to interact with your Supabase backend (e.g., auth, database, storage)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the configured client for use throughout the app
export default supabase;