import { obtenirClientSupabase, supabase, supabaseConfigure } from './supabase';
import type { Coordonnees } from '../types/Coordonnees';

export type AlerteSos = {
  id: string;
  expediteurId: string;
  nomExpediteur: string;
  coordonnees: Coordonnees;
  precision: number | null;
  statut: 'active' | 'cancelled' | 'resolved';
  creeLe: string;
};

export async function recupererAlerteSosActive(utilisateurId: string) {
  if (!supabaseConfigure || !supabase) return null;

  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .eq('sender_user_id', utilisateurId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapperAlerteSos(data);
}

export async function creerAlerteSos({
  coordonnees,
  nomExpediteur,
  precision,
}: {
  coordonnees: Coordonnees;
  nomExpediteur: string;
  precision: number | null;
}) {
  const client = obtenirClientSupabase();
  const { data, error } = await client.rpc('create_sos_alert', {
    initial_latitude: coordonnees.latitude,
    initial_longitude: coordonnees.longitude,
    initial_accuracy: precision,
    provided_sender_name: nomExpediteur,
  });

  if (error) throw error;
  return mapperAlerteSos(data as Record<string, unknown>);
}

export async function envoyerNotificationsSos(alerteId: string) {
  const client = obtenirClientSupabase();
  const { error } = await client.functions.invoke('send-sos-push', {
    body: { sosAlertId: alerteId },
  });

  if (error) throw error;
}

export async function annulerAlerteSos(alerteId: string) {
  const client = obtenirClientSupabase();
  const { data, error } = await client.rpc('cancel_sos_alert', {
    alert_id: alerteId,
  });

  if (error) throw error;
  return mapperAlerteSos(data as Record<string, unknown>);
}

function mapperAlerteSos(ligne: Record<string, unknown>): AlerteSos {
  const statut = String(ligne.status ?? 'active');

  return {
    id: String(ligne.id),
    expediteurId: String(ligne.sender_user_id ?? ''),
    nomExpediteur: String(ligne.sender_name ?? 'Un utilisateur WalkZen'),
    coordonnees: {
      latitude: Number(ligne.latitude),
      longitude: Number(ligne.longitude),
    },
    precision: typeof ligne.accuracy === 'number' ? ligne.accuracy : null,
    statut:
      statut === 'cancelled' || statut === 'resolved'
        ? statut
        : 'active',
    creeLe: String(ligne.created_at ?? ''),
  };
}
