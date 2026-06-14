import type { Coordonnees } from '../../types/Coordonnees';
import type { SegmentAxeRoutier } from './typesCentrageTrace';

const RAYON_TERRE_METRES = 6371000;

export type ProjectionPointSegment = {
  pointProjete: Coordonnees;
  distanceMetres: number;
  positionSegment: number;
};

export function calculerDistanceMetres(
  pointA: Coordonnees,
  pointB: Coordonnees,
): number {
  const latitudeA = convertirDegresEnRadians(pointA.latitude);
  const latitudeB = convertirDegresEnRadians(pointB.latitude);
  const deltaLatitude = convertirDegresEnRadians(pointB.latitude - pointA.latitude);
  const deltaLongitude = convertirDegresEnRadians(
    pointB.longitude - pointA.longitude,
  );
  const demiCorde =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(deltaLongitude / 2) ** 2;

  return (
    2 *
    RAYON_TERRE_METRES *
    Math.atan2(Math.sqrt(demiCorde), Math.sqrt(1 - demiCorde))
  );
}

export function calculerBearing(
  pointA: Coordonnees,
  pointB: Coordonnees,
): number {
  const latitudeA = convertirDegresEnRadians(pointA.latitude);
  const latitudeB = convertirDegresEnRadians(pointB.latitude);
  const deltaLongitude = convertirDegresEnRadians(
    pointB.longitude - pointA.longitude,
  );
  const y = Math.sin(deltaLongitude) * Math.cos(latitudeB);
  const x =
    Math.cos(latitudeA) * Math.sin(latitudeB) -
    Math.sin(latitudeA) * Math.cos(latitudeB) * Math.cos(deltaLongitude);

  return normaliserBearing(convertirRadiansEnDegres(Math.atan2(y, x)));
}

export function calculerEcartBearing(
  bearingA: number,
  bearingB: number,
): number {
  const ecart = Math.abs(normaliserBearing(bearingA) - normaliserBearing(bearingB));
  return Math.min(ecart, 360 - ecart);
}

export function projeterPointSurSegment(
  point: Coordonnees,
  segment: SegmentAxeRoutier,
): ProjectionPointSegment {
  const origine = convertirEnPointLocal(point, segment.debut);
  const fin = convertirEnPointLocal(segment.fin, segment.debut);
  const longueurCarree = fin.x ** 2 + fin.y ** 2;
  const positionSegment =
    longueurCarree === 0
      ? 0
      : borner((origine.x * fin.x + origine.y * fin.y) / longueurCarree, 0, 1);
  const projectionLocale = {
    x: fin.x * positionSegment,
    y: fin.y * positionSegment,
  };
  const pointProjete = convertirEnCoordonnees(projectionLocale, segment.debut);

  return {
    pointProjete,
    distanceMetres: calculerDistanceMetres(point, pointProjete),
    positionSegment,
  };
}

function convertirEnPointLocal(
  point: Coordonnees,
  origine: Coordonnees,
): { x: number; y: number } {
  const latitudeOrigine = convertirDegresEnRadians(origine.latitude);

  return {
    x:
      convertirDegresEnRadians(point.longitude - origine.longitude) *
      Math.cos(latitudeOrigine) *
      RAYON_TERRE_METRES,
    y: convertirDegresEnRadians(point.latitude - origine.latitude) *
      RAYON_TERRE_METRES,
  };
}

function convertirEnCoordonnees(
  point: { x: number; y: number },
  origine: Coordonnees,
): Coordonnees {
  const latitudeOrigine = convertirDegresEnRadians(origine.latitude);

  return {
    longitude:
      origine.longitude +
      convertirRadiansEnDegres(point.x / (RAYON_TERRE_METRES * Math.cos(latitudeOrigine))),
    latitude:
      origine.latitude +
      convertirRadiansEnDegres(point.y / RAYON_TERRE_METRES),
  };
}

function normaliserBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

function borner(valeur: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(valeur, minimum), maximum);
}

function convertirDegresEnRadians(valeur: number): number {
  return (valeur * Math.PI) / 180;
}

function convertirRadiansEnDegres(valeur: number): number {
  return (valeur * 180) / Math.PI;
}
