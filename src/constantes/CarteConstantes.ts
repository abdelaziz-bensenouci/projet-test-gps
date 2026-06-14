import { CLE_MAPTILER } from './VariablesEnvironnement';
import { creerStyleCarteNavigation } from '../carte/StyleCarteNavigation';
import type { Coordonnees } from '../types/Coordonnees';
import type { ModeCarte } from '../types/ModeCarte';

export function obtenirStyleCarte(modeCarte: ModeCarte) {
  return (
    creerStyleCarteNavigation(modeCarte) ??
  (CLE_MAPTILER
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${CLE_MAPTILER}`
      : 'https://demotiles.maplibre.org/style.json')
  );
}

export const CENTRE_CARTE_INITIAL: Coordonnees = {
  longitude: 2.3522,
  latitude: 48.8566,
};

export const ZOOM_CARTE_INITIAL = 12;

export const ZOOM_NAVIGATION = 17;

export const PITCH_NAVIGATION = 55;

export const OFFSET_VERTICAL_NAVIGATION = 260;

export const CENTRAGE_TRACE_ACTIF = true;
