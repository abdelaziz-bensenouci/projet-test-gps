import type { StyleSpecification } from '@maplibre/maplibre-react-native';

import { CLE_MAPTILER } from '../constantes/VariablesEnvironnement';
import type { ModeCarte } from '../types/ModeCarte';
import { COUCHES_CARTE_WALKZEN_CLAIR } from './stylesWalkZen/couchesCarteWalkZenClair';
import { COUCHES_CARTE_WALKZEN_SOMBRE } from './stylesWalkZen/couchesCarteWalkZenSombre';

const URL_TUILES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/tiles/v3/tiles.json?key=${CLE_MAPTILER}` : '';

const URL_GLYPHES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${CLE_MAPTILER}` : '';

export function creerStyleCarteNavigation(
  modeCarte: ModeCarte,
): StyleSpecification | null {
  if (!CLE_MAPTILER) {
    return null;
  }

  return {
    version: 8,
    name: `WalkZen ${modeCarte}`,
    glyphs: URL_GLYPHES_MAPTILER,
    sources: {
      'walkzen-dark-vector': {
        type: 'vector',
        url: URL_TUILES_MAPTILER,
        attribution: '&copy; OpenStreetMap contributors &copy; MapTiler',
      },
    },
    layers:
      modeCarte === 'clair'
        ? COUCHES_CARTE_WALKZEN_CLAIR
        : COUCHES_CARTE_WALKZEN_SOMBRE,
  };
}
