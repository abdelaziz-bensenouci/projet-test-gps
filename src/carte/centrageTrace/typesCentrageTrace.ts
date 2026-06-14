import type { Coordonnees } from '../../types/Coordonnees';

export type AxeRoutier = {
  identifiant: string;
  nom: string | null;
  typeVoie: string | null;
  coordonnees: Coordonnees[];
};

export type SegmentAxeRoutier = {
  identifiantAxe: string;
  nom: string | null;
  typeVoie: string | null;
  debut: Coordonnees;
  fin: Coordonnees;
};
