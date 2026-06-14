import type { Coordonnees } from './Coordonnees';

export type Itineraire = {
  coordonnees: Coordonnees[];
  distanceMetres: number;
  dureeSecondes: number;
};
