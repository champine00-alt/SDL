import { createClient } from '@supabase/supabase-js';

// Clés publiques (anon/publishable) : sûres côté navigateur tant que le RLS est actif (voir supabase/migrations).
const url = import.meta.env.VITE_SUPABASE_URL || 'https://shgmthlbhxmexgsicsjv.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EooCVDvc1i5lWZmEBRLvyw_urUlE6q4';

export const supabase = createClient(url, key);
