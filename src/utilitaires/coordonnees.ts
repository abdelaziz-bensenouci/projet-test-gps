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

export function calculerBearing(
  depart: Coordonnees,
  arrivee: Coordonnees,
): number {
  const latitudeDepart = convertirDegresEnRadians(depart.latitude);
  const latitudeArrivee = convertirDegresEnRadians(arrivee.latitude);
  const deltaLongitude = convertirDegresEnRadians(
    arrivee.longitude - depart.longitude,
  );
  const y = Math.sin(deltaLongitude) * Math.cos(latitudeArrivee);
  const x =
    Math.cos(latitudeDepart) * Math.sin(latitudeArrivee) -
    Math.sin(latitudeDepart) *
      Math.cos(latitudeArrivee) *
      Math.cos(deltaLongitude);

  return (convertirRadiansEnDegres(Math.atan2(y, x)) + 360) % 360;
}

function convertirDegresEnRadians(valeur: number): number {
  return (valeur * Math.PI) / 180;
}

function convertirRadiansEnDegres(valeur: number): number {
  return (valeur * 180) / Math.PI;
}
