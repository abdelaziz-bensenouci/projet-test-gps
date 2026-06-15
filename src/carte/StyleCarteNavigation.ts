import type { StyleSpecification } from '@maplibre/maplibre-react-native';

import { CLE_MAPTILER } from '../constantes/VariablesEnvironnement';
import type { ModeCarte } from '../types/ModeCarte';
import { COUCHES_CARTE_WALKZEN_CLAIR } from './stylesWalkZen/couchesCarteWalkZenClair';
import { COUCHES_CARTE_WALKZEN_SOMBRE } from './stylesWalkZen/couchesCarteWalkZenSombre';

const URL_TUILES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/tiles/v3/tiles.json?key=${CLE_MAPTILER}` : '';

const URL_GLYPHES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${CLE_MAPTILER}` : '';

const CLASSES_PIETONNES_MASQUEES = [
  'foot',
  'footway',
  'path',
  'pedestrian',
  'steps',
  'crossing',
  'sidewalk',
] as const;

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
      const sourceLayer = String(
        (couche as Record<string, unknown>)['source-layer'] ?? '',
      ).toLowerCase();
      const coucheSansPietons =
        sourceLayer.includes('transportation') ? masquerClassesPietonnes(couche) : couche;

      if (coucheSansPietons.type === 'background') {
        return {
          ...coucheSansPietons,
          paint: { ...coucheSansPietons.paint, 'background-color': '#F2F4F5' },
        } as typeof coucheSansPietons;
      }

      if (id.includes('landcover') || id.includes('landuse')) {
        return {
          ...coucheSansPietons,
          paint: { ...coucheSansPietons.paint, 'fill-opacity': 0.34 },
        } as typeof coucheSansPietons;
      }

      if (coucheSansPietons.type === 'fill' && id.includes('water')) {
        return {
          ...coucheSansPietons,
          paint: {
            ...coucheSansPietons.paint,
            'fill-color': '#DDE8EC',
            'fill-opacity': 0.34,
          },
        } as typeof coucheSansPietons;
      }

      if (coucheSansPietons.type === 'line' && id.includes('water')) {
        return {
          ...coucheSansPietons,
          paint: {
            ...coucheSansPietons.paint,
            'line-color': '#DDE8EC',
            'line-opacity': 0.34,
          },
        } as typeof coucheSansPietons;
      }

      if (masquerCouchePietonne(id)) {
        return masquerCoucheSelonType(coucheSansPietons);
      }

      if (coucheSansPietons.type === 'line' && sourceLayer.includes('transportation')) {
        return appliquerStyleRouteNavigation(coucheSansPietons, id);
      }

      if (id.includes('street-label')) {
        return {
          ...coucheSansPietons,
          paint: {
            ...coucheSansPietons.paint,
            'text-color': '#526671',
            'text-halo-color': '#F5FBFD',
            'text-opacity': 0.82,
          },
        } as typeof coucheSansPietons;
      }

      return coucheSansPietons;
    }) as StyleSpecification['layers'];
}

function masquerCouchePietonne(id: string) {
  return CLASSES_PIETONNES_MASQUEES.some((classe) => id.includes(classe));
}

function masquerClassesPietonnes<T extends StyleSpecification['layers'][number]>(
  couche: T,
): T {
  const filtre = (couche as Record<string, unknown>).filter;
  const exclusion = [
    'all',
    ['!', ['in', ['get', 'class'], ['literal', CLASSES_PIETONNES_MASQUEES]]],
    ['!', ['in', ['get', 'subclass'], ['literal', CLASSES_PIETONNES_MASQUEES]]],
  ];

  return {
    ...couche,
    filter: filtre ? [...exclusion, filtre] : exclusion,
  } as T;
}

function masquerCoucheSelonType<T extends StyleSpecification['layers'][number]>(
  couche: T,
): T {
  if (couche.type === 'line') {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'line-opacity': 0,
      },
    } as unknown as T;
  }

  if (couche.type === 'symbol') {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'text-opacity': 0,
        'icon-opacity': 0,
      },
    } as unknown as T;
  }

  if (couche.type === 'fill') {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'fill-opacity': 0,
      },
    } as unknown as T;
  }

  if (couche.type === 'circle') {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'circle-opacity': 0,
      },
    } as unknown as T;
  }

  return couche;
}

function appliquerStyleRouteNavigation<T extends StyleSpecification['layers'][number]>(
  couche: T,
  id: string,
): T {
  if (id.includes('major-road-fill')) {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'line-color': '#AEB6BA',
        'line-opacity': 0.92,
      },
    } as unknown as T;
  }

  if (id.includes('major-road-casing')) {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'line-color': '#8D969B',
        'line-opacity': 0.58,
      },
    } as unknown as T;
  }

  if (id.includes('road-fill') || id.includes('road-centerline')) {
    const paintSansTirets = { ...couche.paint } as Record<string, unknown>;
    delete paintSansTirets['line-dasharray'];

    return {
      ...couche,
      paint: {
        ...paintSansTirets,
        'line-color': '#C3C9CC',
        'line-opacity': 0.88,
      },
    } as unknown as T;
  }

  if (id.includes('road-casing') || id.includes('bridge-underlay')) {
    return {
      ...couche,
      paint: {
        ...couche.paint,
        'line-color': '#A0A9AD',
        'line-opacity': 0.54,
      },
    } as unknown as T;
  }

  return couche;
}
