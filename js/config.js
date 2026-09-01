// =============================================
// MIZAARA - Supabase Configuration
// =============================================

const SUPABASE_URL = 'https://pwifoolozezljnkevxsv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWZvb2xvemV6bGpua2V2eHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTMxNzksImV4cCI6MjEwMzU4OTE3OX0.gdstBQ1-zHBCNaGg45QEYkX6TAKD5g4e5_KlbCj2DJg';
// Initialize Supabase (NO const declaration — use the global object)
supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Mizaara Supabase Connected');