import type { StyleSpecification } from '@maplibre/maplibre-react-native';

import { CLE_MAPTILER } from '../constantes/VariablesEnvironnement';

const URL_TUILES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/tiles/v3/tiles.json?key=${CLE_MAPTILER}` : '';

const URL_GLYPHES_MAPTILER =
  CLE_MAPTILER ? `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${CLE_MAPTILER}` : '';

export function creerStyleCarteNavigation(): StyleSpecification | null {
  if (!CLE_MAPTILER) {
    return null;
  }

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
        paint: { 'background-color': '#101a2a' },
      },
      {
        id: 'eau',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': '#0b314a' },
      },
      {
        id: 'parcs-principaux',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: {
          'fill-color': '#16382f',
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
          'line-color': '#d7e2ec',
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
          'line-color': '#ccd8e3',
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
          'line-color': '#c2cfdb',
          'line-opacity': 0.66,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.2, 14, 3.2, 18, 8],
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
          'line-color': '#b7c5d2',
          'line-opacity': 0.58,
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1, 14, 2.4, 18, 6],
        },
      },
      {
        id: 'routes-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track', 'path']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#a9b7c5',
          'line-opacity': 0.42,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.7, 15, 1.8, 18, 4],
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
          'text-color': '#e8f1f8',
          'text-halo-color': '#101a2a',
          'text-halo-width': 2,
          'text-halo-blur': 0.8,
        },
      },
    ],
  };
}
