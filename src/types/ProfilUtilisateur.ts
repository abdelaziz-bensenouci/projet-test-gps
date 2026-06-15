import type { Coordonnees } from './Coordonnees';

export type ProfilUtilisateur = {
  id: string;
  nomComplet: string;
  email: string;
  identifiantWalkZen: string;
};

export type ContactConfiance = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  identifiantWalkZen: string;
  utilisateurContactId: string;
  avatarUrl: string | null;
};

export type LieuFavori = {
  id: string;
  libelle: string;
  adresse: string;
  type: 'depart' | 'destination';
  coordonnees: Coordonnees | null;
};

export type HistoriqueAdresse = {
  id: string;
  libelle: string;
  coordonnees: Coordonnees;
  usage: 'depart' | 'destination' | 'recherche';
  source: 'autocomplete' | 'favori' | 'manuel';
  creeLe: string;
};
