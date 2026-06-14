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
  navigationActive = false,
): StyleSpecification | null {
  if (!CLE_MAPTILER) {
    return null;
  }

  const couches =
    modeCarte === 'clair'
      ? COUCHES_CARTE_WALKZEN_CLAIR
      : COUCHES_CARTE_WALKZEN_SOMBRE;

  return {
    version: 8,
    name: `WalkZen ${modeCarte}${navigationActive ? ' navigation' : ''}`,
    glyphs: URL_GLYPHES_MAPTILER,
    sources: {
      'walkzen-dark-vector': {
        type: 'vector',
        url: URL_TUILES_MAPTILER,
        attribution: '&copy; OpenStreetMap contributors &copy; MapTiler',
      },
    },
    layers: navigationActive ? creerCouchesNavigationMinimalistes(couches) : couches,
  };
}

function creerCouchesNavigationMinimalistes(
  couches: StyleSpecification['layers'],
): StyleSpecification['layers'] {
  return couches
    .filter((couche) => {
      const id = couche.id.toLowerCase();
      const sourceLayer = String(
        (couche as Record<string, unknown>)['source-layer'] ?? '',
      ).toLowerCase();

      if (id.includes('building') || sourceLayer.includes('building')) {
        return false;
      }

      if (
        id.includes('poi') ||
        id.includes('commerce') ||
        id.includes('transit') ||
        id.includes('health') ||
        id.includes('education') ||
        id.includes('railway') ||
        id.includes('tram') ||
        sourceLayer.includes('poi')
      ) {
        return false;
      }

      return true;
    })
    .map((couche) => {
      const id = couche.id.toLowerCase();

      if (couche.type === 'background') {
        return {
          ...couche,
          paint: { ...couche.paint, 'background-color': '#EEF7FA' },
        } as typeof couche;
      }

      if (id.includes('landcover') || id.includes('landuse')) {
        return {
          ...couche,
          paint: { ...couche.paint, 'fill-opacity': 0.34 },
        } as typeof couche;
      }

      if (couche.type === 'fill' && id.includes('water')) {
        return {
          ...couche,
          paint: { ...couche.paint, 'fill-opacity': 0.42 },
        } as typeof couche;
      }

      if (couche.type === 'line' && id.includes('water')) {
        return {
          ...couche,
          paint: { ...couche.paint, 'line-opacity': 0.42 },
        } as typeof couche;
      }

      if (id.includes('pedestrian')) {
        return {
          ...couche,
          paint: { ...couche.paint, 'line-opacity': 0.22 },
        } as typeof couche;
      }

      if (id.includes('street-label')) {
        return {
          ...couche,
          paint: {
            ...couche.paint,
            'text-color': '#526671',
            'text-halo-color': '#F5FBFD',
            'text-opacity': 0.82,
          },
        } as typeof couche;
      }

      return couche;
    }) as StyleSpecification['layers'];
}
