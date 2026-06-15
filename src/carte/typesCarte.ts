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
  directionUtilisateur: number | null;
  onTraceItinerairePrete: (prete: boolean) => void;
  onInteractionUtilisateurCarte: () => void;
  positionUtilisateur: Coordonnees | null;
  precisionUtilisateur: number | null;
  suiviCameraActif: boolean;
};
