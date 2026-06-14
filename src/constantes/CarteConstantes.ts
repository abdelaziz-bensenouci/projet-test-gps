import { CLE_MAPTILER } from './VariablesEnvironnement';
import { creerStyleCarteNavigation } from '../carte/StyleCarteNavigation';
import type { Coordonnees } from '../types/Coordonnees';

export const STYLE_CARTE =
  creerStyleCarteNavigation() ??
  (CLE_MAPTILER
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${CLE_MAPTILER}`
    : 'https://demotiles.maplibre.org/style.json');

export const CENTRE_CARTE_INITIAL: Coordonnees = {
  longitude: 2.3522,
  latitude: 48.8566,
};

export const ZOOM_CARTE_INITIAL = 12;
