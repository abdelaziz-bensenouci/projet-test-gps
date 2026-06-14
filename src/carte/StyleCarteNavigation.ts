import type { StyleSpecification } from '@maplibre/maplibre-react-native';

import { CLE_MAPTILER } from '../constantes/VariablesEnvironnement';
import type { ModeCarte } from '../types/ModeCarte';

const URL_TUILES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/tiles/v3/tiles.json?key=${CLE_MAPTILER}` : '';

const URL_GLYPHES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${CLE_MAPTILER}` : '';

type PaletteCarteNavigation = {
  fond: string;
  eau: string;
  parcs: string;
  routeMotorway: string;
  routePrimary: string;
  routeSecondary: string;
  routeTertiary: string;
  routeMinor: string;
  texteRue: string;
  haloRue: string;
};

const PALETTES_CARTE: Record<ModeCarte, PaletteCarteNavigation> = {
  clair: {
    fond: '#f4f7f8',
    eau: '#cdebf7',
    parcs: '#dff2df',
    routeMotorway: '#ffffff',
    routePrimary: '#f8fafc',
    routeSecondary: '#d8dee5',
    routeTertiary: '#cbd3dc',
    routeMinor: '#c1cad4',
    texteRue: '#334155',
    haloRue: '#f4f7f8',
  },
  sombre: {
    fond: '#101a2a',
    eau: '#0b314a',
    parcs: '#16382f',
    routeMotorway: '#d7e2ec',
    routePrimary: '#ccd8e3',
    routeSecondary: '#c2cfdb',
    routeTertiary: '#b7c5d2',
    routeMinor: '#a9b7c5',
    texteRue: '#e8f1f8',
    haloRue: '#101a2a',
  },
};

export function creerStyleCarteNavigation(
  modeCarte: ModeCarte,
): StyleSpecification | null {
  if (!CLE_MAPTILER) {
    return null;
  }

  const palette = PALETTES_CARTE[modeCarte];

  return {
    version: 8,
    name: 'Navigation',
    glyphs: URL_GLYPHES_MAPTILER,
    sources: {
      openmaptiles: {
        type: 'vector',
        url: URL_TUILES_MAPTILER,
      },
    },
    layers: [
      {
        id: 'fond',
        type: 'background',
        paint: { 'background-color': palette.fond },
      },
      {
        id: 'eau',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': palette.eau },
      },
      {
        id: 'parcs-principaux',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: {
          'fill-color': palette.parcs,
          'fill-opacity': 0.55,
        },
      },
      {
        id: 'routes-motorway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'motorway'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': palette.routeMotorway,
          'line-opacity': 0.8,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 5, 18, 12],
        },
      },
      {
        id: 'routes-primary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'primary'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': palette.routePrimary,
          'line-opacity': 0.72,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.6, 14, 4, 18, 10],
        },
      },
      {
        id: 'routes-secondary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'secondary'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': palette.routeSecondary,
          'line-opacity': 0.48,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 14, 2.2, 18, 6],
        },
      },
      {
        id: 'routes-tertiary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'tertiary'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': palette.routeTertiary,
          'line-opacity': 0.28,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.5, 14, 1.4, 18, 3.2],
        },
      },
      {
        id: 'routes-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 16,
        filter: ['==', ['get', 'class'], 'minor'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': palette.routeMinor,
          'line-opacity': 0.08,
          'line-width': ['interpolate', ['linear'], ['zoom'], 16, 0.4, 18, 1.4],
        },
      },
      {
        id: 'noms-rues',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 13,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 11, 17, 14],
          'text-rotation-alignment': 'map',
        },
        paint: {
          'text-color': palette.texteRue,
          'text-halo-color': palette.haloRue,
          'text-halo-width': 2,
          'text-halo-blur': 0.8,
        },
      },
    ],
  };
}
