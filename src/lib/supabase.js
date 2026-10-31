import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && publicKey && !url.includes("VOTRE-PROJET"));
export const supabase = supabaseConfigured ? createClient(url, publicKey) : null;
