import { calculerBearing } from './geometrieCentrage';
import type { SegmentAxeRoutier } from './typesCentrageTrace';
import type { Coordonnees } from '../../types/Coordonnees';

export function calculerAngleTrace(
  pointA: Coordonnees,
  pointB: Coordonnees,
  pointC: Coordonnees,
): number {
  return calculerEcartBearingCompatible(
    calculerBearing(pointB, pointA),
    calculerBearing(pointB, pointC),
  );
}

export function calculerEcartBearingCompatible(
  bearingA: number,
  bearingB: number,
): number {
  const ecart = Math.abs(((bearingA - bearingB + 540) % 360) - 180);
  return Math.min(ecart, 180 - ecart);
}

export function interpolerBezier(
  pointA: Coordonnees,
  pointB: Coordonnees,
  pointC: Coordonnees,
  position: number,
): Coordonnees {
  return interpolerPoint(
    interpolerPoint(pointA, pointB, position),
    interpolerPoint(pointB, pointC, position),
    position,
  );
}

export function interpolerPoint(
  pointA: Coordonnees,
  pointB: Coordonnees,
  position: number,
): Coordonnees {
  return {
    longitude:
      pointA.longitude + (pointB.longitude - pointA.longitude) * position,
    latitude:
      pointA.latitude + (pointB.latitude - pointA.latitude) * position,
  };
}

export function convertirEnPointLocal(
  point: Coordonnees,
  origine: Coordonnees,
): { x: number; y: number } {
  const metresParDegreLongitude =
    Math.max(1, Math.cos((origine.latitude * Math.PI) / 180) * 111320);

  return {
    x: (point.longitude - origine.longitude) * metresParDegreLongitude,
    y: (point.latitude - origine.latitude) * 111320,
  };
}

export function convertirEnPointPlan(
  point: Coordonnees,
  latitudeReference: number,
): { x: number; y: number } {
  return {
    x: point.longitude * metresParLongitude(latitudeReference),
    y: point.latitude * 111320,
  };
}

export function convertirDepuisPointPlan(
  point: { x: number; y: number },
  latitudeReference: number,
): Coordonnees {
  return {
    longitude: point.x / metresParLongitude(latitudeReference),
    latitude: point.y / 111320,
  };
}

export function projeterPointSurSegmentCompatible(
  point: Coordonnees,
  segment: SegmentAxeRoutier,
): { pointProjete: Coordonnees; distanceMetres: number; positionSegment: number } {
  const pointPlan = convertirEnPointPlan(point, point.latitude);
  const debutPlan = convertirEnPointPlan(segment.debut, point.latitude);
  const finPlan = convertirEnPointPlan(segment.fin, point.latitude);
  const segmentX = finPlan.x - debutPlan.x;
  const segmentY = finPlan.y - debutPlan.y;
  const pointX = pointPlan.x - debutPlan.x;
  const pointY = pointPlan.y - debutPlan.y;
  const longueurCarree = segmentX * segmentX + segmentY * segmentY;
  const positionSegment =
    longueurCarree === 0
      ? 0
      : Math.max(0, Math.min(1, (pointX * segmentX + pointY * segmentY) / longueurCarree));
  const projectionPlan = {
    x: debutPlan.x + segmentX * positionSegment,
    y: debutPlan.y + segmentY * positionSegment,
  };
  const pointProjete = convertirDepuisPointPlan(projectionPlan, point.latitude);

  return {
    pointProjete,
    distanceMetres: Math.sqrt(
      (pointPlan.x - projectionPlan.x) ** 2 +
        (pointPlan.y - projectionPlan.y) ** 2,
    ),
    positionSegment,
  };
}

export function convertirEnCoordonnees(
  point: { x: number; y: number },
  origine: Coordonnees,
): Coordonnees {
  const metresParDegreLongitude =
    Math.max(1, Math.cos((origine.latitude * Math.PI) / 180) * 111320);

  return {
    longitude: origine.longitude + point.x / metresParDegreLongitude,
    latitude: origine.latitude + point.y / 111320,
  };
}

export function normaliserNomVoie(nom: string | null | undefined): string {
  return (nom ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function metresParLongitude(latitude: number): number {
  return Math.max(1, Math.cos((latitude * Math.PI) / 180) * 111320);
}
