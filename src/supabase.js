import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://ixouybhxjiijtpyhwhjv.supabase.co';
const supabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3V5Ymh4amlpanRweWh3aGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTI0NDYsImV4cCI6MjA5MTEyODQ0Nn0.TTOQNdFFQNW5OKzb4DkKlWuCL8cSw4zP9DmfpojU47o';

export const supabase = createClient(supabaseUrl, supabaseKey);
