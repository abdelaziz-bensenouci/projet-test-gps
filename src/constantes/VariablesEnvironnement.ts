const URL_OSRM_SECOURS = 'https://router.project-osrm.org';
const URL_NOMINATIM_SECOURS = 'https://nominatim.openstreetmap.org';

function retirerSlashFinal(url: string): string {
  return url.replace(/\/+$/, '');
}

export const CLE_MAPTILER = process.env.EXPO_PUBLIC_MAPTILER_KEY;
export const URL_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const CLE_ANON_SUPABASE = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const URL_OSRM = retirerSlashFinal(
  process.env.EXPO_PUBLIC_OSRM_URL ?? URL_OSRM_SECOURS,
);

export const URL_NOMINATIM = retirerSlashFinal(
  process.env.EXPO_PUBLIC_NOMINATIM_URL ?? URL_NOMINATIM_SECOURS,
);

if (__DEV__ && !CLE_MAPTILER) {
  console.error(
    'EXPO_PUBLIC_MAPTILER_KEY est absente. Ajoutez-la dans .env ou dans les variables Vercel.',
  );
}
