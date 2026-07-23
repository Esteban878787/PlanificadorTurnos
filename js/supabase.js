const SUPABASE_URL = "https://dkmvtvikkrhasohnmoxn.supabase.co";

const SUPABASE_KEY = "sb_publishable_2OxvmkcSk7-oNz_pwbY-bQ_7F8snD4K";

window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);