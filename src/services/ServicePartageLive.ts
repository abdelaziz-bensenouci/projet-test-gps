import { obtenirClientSupabase } from './supabase';
import type { Coordonnees } from '../types/Coordonnees';

export type PartageLive = {
  id: string;
  proprietaireId: string;
  observateurId: string;
  statut: 'pending' | 'active' | 'ended';
  coordonnees: Coordonnees | null;
  destination: string;
  expireLe: string;
};

export async function creerPartageLive({
  coordonnees,
  destination,
  observateurId,
}: {
  coordonnees: Coordonnees;
  destination: string;
  observateurId: string;
}) {
  const client = obtenirClientSupabase();
  const { data, error } = await client.rpc('create_live_trip_share', {
    target_viewer_user_id: observateurId,
    initial_latitude: coordonnees.latitude,
    initial_longitude: coordonnees.longitude,
    initial_route_data: null,
    target_destination_label: destination,
  });

  if (error) throw error;
  return mapperPartageLive(data as Record<string, unknown>);
}

export async function arreterPartageLive(partageId: string) {
  const client = obtenirClientSupabase();
  const { data, error } = await client
    .from('live_trip_shares')
    .update({
      ended_at: new Date().toISOString(),
      status: 'ended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', partageId)
    .select('*')
    .single();

  if (error) throw error;
  return mapperPartageLive(data as Record<string, unknown>);
}

export async function mettreAJourPositionPartage(
  partageId: string,
  coordonnees: Coordonnees,
) {
  const client = obtenirClientSupabase();
  const { data, error } = await client
    .from('live_trip_shares')
    .update({
      last_latitude: coordonnees.latitude,
      last_longitude: coordonnees.longitude,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partageId)
    .neq('status', 'ended')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data ? mapperPartageLive(data as Record<string, unknown>) : null;
}

function mapperPartageLive(ligne: Record<string, unknown>): PartageLive {
  const latitude = Number(ligne.last_latitude);
  const longitude = Number(ligne.last_longitude);
  const statut = String(ligne.status ?? 'pending');

  return {
    id: String(ligne.id),
    proprietaireId: String(ligne.owner_user_id ?? ''),
    observateurId: String(ligne.viewer_user_id ?? ''),
    statut: statut === 'active' || statut === 'ended' ? statut : 'pending',
    coordonnees:
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null,
    destination: String(ligne.destination_label ?? ''),
    expireLe: String(ligne.expires_at ?? ''),
  };
}
