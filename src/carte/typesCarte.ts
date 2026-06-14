import type { AdresseGeocodee } from '../types/AdresseGeocodee';
import type { Coordonnees } from '../types/Coordonnees';
import type { Itineraire } from '../types/Itineraire';

export type ProprietesCarte = {
  depart: AdresseGeocodee | null;
  destination: AdresseGeocodee | null;
  itineraire: Itineraire | null;
  positionUtilisateur: Coordonnees | null;
};
