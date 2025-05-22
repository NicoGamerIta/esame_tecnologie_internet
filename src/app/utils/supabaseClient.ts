import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,       // Rinnova automaticamente il token
        persistSession: true,         // Salva la sessione nel localStorage
        detectSessionInUrl: true,     // Rileva sessioni da URL (opzionale)
      }
    }
  );