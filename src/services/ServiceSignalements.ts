import { obtenirClientSupabase, supabase, supabaseConfigure } from './supabase';
import type { Coordonnees } from '../types/Coordonnees';
import type {
  NiveauDangerSignalement,
  Signalement,
} from '../types/Signalement';

type LigneSignalement = {
  id: string;
  type: string;
  label: string;
  details: string | null;
  severity: string;
  latitude: number;
  longitude: number;
  validations: number;
  user_id?: string | null;
  created_at: string;
  expires_at: string;
};

export type NouveauSignalement = {
  libelle: string;
  details?: string;
  niveauDanger: NiveauDangerSignalement;
  coordonnees: Coordonnees;
};

export async function chargerSignalements(): Promise<Signalement[]> {
  if (!supabaseConfigure || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('reports')
    .select(
      'id,type,label,details,severity,latitude,longitude,validations,user_id,created_at,expires_at',
    )
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: true })
    .limit(80);

  if (error) {
    throw error;
  }

  return (data ?? []).map((ligne) =>
    mapperSignalement(ligne as LigneSignalement),
  );
}

export async function creerSignalement(
  signalement: NouveauSignalement,
): Promise<Signalement | null> {
  const client = obtenirClientSupabase();
  const { data, error } = await client
    .from('reports')
    .insert({
      type: 'user',
      label: signalement.libelle,
      details: signalement.details ?? 'Signalement communautaire',
      severity: mapperNiveauDangerBase(signalement.niveauDanger),
      latitude: signalement.coordonnees.latitude,
      longitude: signalement.coordonnees.longitude,
      validations: 1,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    .select(
      'id,type,label,details,severity,latitude,longitude,validations,user_id,created_at,expires_at',
    )
    .single();

  if (error) {
    throw error;
  }

  return mapperSignalement(data as LigneSignalement);
}

export async function validerSignalement(id: string, validations: number) {
  const client = obtenirClientSupabase();
  const { error } = await client
    .from('reports')
    .update({
      validations: validations + 1,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export function ecouterSignalements(
  surChangement: () => void,
): () => void {
  if (!supabaseConfigure || !supabase) {
    return () => undefined;
  }

  const client = supabase;
  const canal = client
    .channel('signalements-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reports' },
      surChangement,
    )
    .subscribe();

  return () => {
    void client.removeChannel(canal);
  };
}

function mapperSignalement(ligne: LigneSignalement): Signalement {
  return {
    id: ligne.id,
    type: ligne.type,
    libelle: ligne.label,
    details: ligne.details ?? 'Signalement communautaire',
    niveauDanger: mapperNiveauDanger(ligne.severity),
    coordonnees: {
      latitude: Number(ligne.latitude),
      longitude: Number(ligne.longitude),
    },
    validations: Number(ligne.validations ?? 0),
    utilisateurId: ligne.user_id ?? null,
    creeLe: ligne.created_at,
    expireLe: ligne.expires_at,
  };
}

function mapperNiveauDanger(valeur: string): NiveauDangerSignalement {
  if (valeur === 'high' || valeur === 'eleve') return 'eleve';
  if (valeur === 'medium' || valeur === 'modere') return 'modere';
  return 'faible';
}

function mapperNiveauDangerBase(valeur: NiveauDangerSignalement) {
  if (valeur === 'eleve') return 'high';
  if (valeur === 'modere') return 'medium';
  return 'low';
}
