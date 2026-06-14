import type { Coordonnees } from '../types/Coordonnees';

export function versLngLat(coordonnees: Coordonnees): [number, number] {
  return [coordonnees.longitude, coordonnees.latitude];
}

export function creerBornes(
  coordonnees: Coordonnees[],
): [number, number, number, number] | null {
  if (coordonnees.length === 0) {
    return null;
  }

  const longitudes = coordonnees.map((point) => point.longitude);
  const latitudes = coordonnees.map((point) => point.latitude);

  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ];
}
