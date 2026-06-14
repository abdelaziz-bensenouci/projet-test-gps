import type { Coordonnees } from '../types/Coordonnees';
import type { Itineraire } from '../types/Itineraire';
import { versLngLat } from './coordonnees';

export function creerGeoJsonItineraire(
  itineraire: Itineraire | null,
  traceAffiche?: Coordonnees[],
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  const coordonnees = traceAffiche ?? itineraire?.coordonnees ?? [];

  return {
    type: 'FeatureCollection',
    features: coordonnees.length > 0
      ? [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordonnees.map(versLngLat),
            },
          },
        ]
      : [],
  };
}
