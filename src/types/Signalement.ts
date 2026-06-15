import type { Coordonnees } from './Coordonnees';

export type NiveauDangerSignalement = 'faible' | 'modere' | 'eleve';

export type Signalement = {
  id: string;
  type: string;
  libelle: string;
  details: string;
  niveauDanger: NiveauDangerSignalement;
  coordonnees: Coordonnees;
  validations: number;
  utilisateurId: string | null;
  creeLe: string;
  expireLe: string;
};

export type CompteursSignalements = Record<NiveauDangerSignalement, number>;
