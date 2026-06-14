import type { AdresseGeocodee } from '../types/AdresseGeocodee';
import type { Coordonnees } from '../types/Coordonnees';
import type { Itineraire } from '../types/Itineraire';
import type { ModeCarte } from '../types/ModeCarte';

export type ProprietesCarte = {
  depart: AdresseGeocodee | null;
  destination: AdresseGeocodee | null;
  itineraire: Itineraire | null;
  cleRecentrage: number;
  modeCarte: ModeCarte;
  navigationPleinEcran: boolean;
  positionUtilisateur: Coordonnees | null;
};
