import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import {
  CLE_ANON_SUPABASE,
  URL_SUPABASE,
} from '../constantes/VariablesEnvironnement';

export const supabaseConfigure = Boolean(URL_SUPABASE && CLE_ANON_SUPABASE);

export const supabase = supabaseConfigure
  ? createClient(URL_SUPABASE!, CLE_ANON_SUPABASE!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: AsyncStorage,
      },
    })
  : null;

export function obtenirClientSupabase() {
  if (!supabaseConfigure || !supabase) {
    throw new Error("Supabase n'est pas configuré.");
  }

  return supabase;
}
