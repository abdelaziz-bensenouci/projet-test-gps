import type { Itineraire } from '../types/Itineraire';
import { versLngLat } from './coordonnees';

export function creerGeoJsonItineraire(
  itineraire: Itineraire | null,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: 'FeatureCollection',
    features: itineraire
      ? [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: itineraire.coordonnees.map(versLngLat),
            },
          },
        ]
      : [],
  };
}
