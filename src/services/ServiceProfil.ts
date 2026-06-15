import type { User } from '@supabase/supabase-js';

import { obtenirClientSupabase, supabase, supabaseConfigure } from './supabase';
import type {
  ContactConfiance,
  HistoriqueAdresse,
  LieuFavori,
  NotificationUtilisateur,
  ProfilUtilisateur,
} from '../types/ProfilUtilisateur';

type LigneProfil = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  walkzen_id?: string | null;
};

export async function recupererUtilisateurCourant() {
  if (!supabaseConfigure || !supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function recupererOuCreerProfil(
  utilisateur: User | null,
): Promise<ProfilUtilisateur | null> {
  if (!utilisateur || !supabaseConfigure || !supabase) {
    return null;
  }

  const profilExistant = await recupererProfil(utilisateur.id);

  if (profilExistant) {
    return profilExistant;
  }

  const profil = {
    id: utilisateur.id,
    full_name: String(utilisateur.user_metadata?.full_name ?? ''),
    email: utilisateur.email ?? '',
    walkzen_id: creerIdentifiantWalkZen(utilisateur.id),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profil, { onConflict: 'id' })
    .select('id,full_name,email,walkzen_id')
    .single();

  if (error) {
    return null;
  }

  return mapperProfil(data as LigneProfil);
}

export async function recupererDonneesUtilisateur() {
  const client = obtenirClientSupabase();
  const [contacts, favoris, historique, notifications] = await Promise.all([
    client
      .from('trusted_contacts')
      .select('id,name,email,phone,walkzen_id,contact_user_id')
      .order('created_at', { ascending: false }),
    client
      .from('favorite_places')
      .select('id,label,address,kind,latitude,longitude')
      .order('created_at', { ascending: false }),
    client
      .from('address_search_history')
      .select('id,label,latitude,longitude,usage_type,source,created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    client
      .from('user_notifications')
      .select('id,title,body,read,type,created_at')
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (contacts.error) throw contacts.error;
  if (favoris.error) throw favoris.error;
  if (historique.error) throw historique.error;
  if (notifications.error) throw notifications.error;

  return {
    contacts: (contacts.data ?? []).map(mapperContact),
    favoris: (favoris.data ?? []).map(mapperFavori),
    historique: (historique.data ?? []).map(mapperHistorique),
    notifications: (notifications.data ?? []).map(mapperNotification),
  };
}

async function recupererProfil(id: string) {
  const client = obtenirClientSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id,full_name,email,walkzen_id')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapperProfil(data as LigneProfil);
}

function mapperProfil(ligne: LigneProfil): ProfilUtilisateur {
  return {
    id: ligne.id,
    nomComplet: ligne.full_name ?? '',
    email: ligne.email ?? '',
    identifiantWalkZen: ligne.walkzen_id ?? creerIdentifiantWalkZen(ligne.id),
  };
}

function mapperContact(ligne: Record<string, unknown>): ContactConfiance {
  return {
    id: String(ligne.id),
    nom: String(ligne.name ?? ''),
    email: String(ligne.email ?? ''),
    telephone: String(ligne.phone ?? ''),
    identifiantWalkZen: String(ligne.walkzen_id ?? ''),
    utilisateurContactId: String(ligne.contact_user_id ?? ''),
    avatarUrl: null,
  };
}

function mapperFavori(ligne: Record<string, unknown>): LieuFavori {
  const latitude = Number(ligne.latitude);
  const longitude = Number(ligne.longitude);

  return {
    id: String(ligne.id),
    libelle: String(ligne.label ?? ''),
    adresse: String(ligne.address ?? ''),
    type: ligne.kind === 'departure' ? 'depart' : 'destination',
    coordonnees:
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null,
  };
}

function mapperHistorique(ligne: Record<string, unknown>): HistoriqueAdresse {
  return {
    id: String(ligne.id),
    libelle: String(ligne.label ?? ''),
    coordonnees: {
      latitude: Number(ligne.latitude),
      longitude: Number(ligne.longitude),
    },
    usage:
      ligne.usage_type === 'departure'
        ? 'depart'
        : ligne.usage_type === 'destination'
          ? 'destination'
          : 'recherche',
    source:
      ligne.source === 'favorite'
        ? 'favori'
        : ligne.source === 'manual'
          ? 'manuel'
          : 'autocomplete',
    creeLe: String(ligne.created_at ?? ''),
  };
}

function mapperNotification(ligne: Record<string, unknown>): NotificationUtilisateur {
  return {
    id: String(ligne.id),
    titre: String(ligne.title ?? ''),
    corps: String(ligne.body ?? ''),
    lue: Boolean(ligne.read),
    type: String(ligne.type ?? 'general'),
    creeLe: String(ligne.created_at ?? ''),
  };
}

function creerIdentifiantWalkZen(id: string) {
  return `WZ-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
