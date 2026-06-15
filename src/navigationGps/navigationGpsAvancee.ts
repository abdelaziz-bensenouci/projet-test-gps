import type { Coordonnees } from '../types/Coordonnees';
import { calculerBearing } from '../utilitaires/coordonnees';

const RAYON_TERRE_METRES = 6371000;
const SEUIL_SNAP_METRES = 30;
const SEUIL_HORS_TRACE_METRES = 45;
const SEUIL_MAUVAIS_SENS_DEGRES = 120;
const PRECISION_MAX_METRES = 35;
const DEPLACEMENT_MIN_METRES = 3;

export type DonneesGpsNavigation = {
  position: Coordonnees;
  precisionMetres: number | null;
  directionDegres: number | null;
};

export type EtatNavigationGps = {
  indexSegment: number;
  distanceTraceMetres: number | null;
  horsTrace: boolean;
  mauvaisSens: boolean;
  positionAffichee: Coordonnees;
  pointProjete: Coordonnees;
  snapActif: boolean;
  bearingNavigation: number | null;
};

type ProjectionTrace = {
  distanceMetres: number;
  indexSegment: number;
  point: Coordonnees;
  bearingSegment: number;
};

export function analyserNavigationGps({
  gps,
  indexSegmentMinimum = 0,
  positionPrecedente,
  trace,
}: {
  gps: DonneesGpsNavigation | null;
  indexSegmentMinimum?: number;
  positionPrecedente: Coordonnees | null;
  trace: Coordonnees[];
}): EtatNavigationGps | null {
  if (!gps || trace.length < 2) {
    return null;
  }

  const projection = projeterSurTrace(gps.position, trace, indexSegmentMinimum);

  if (!projection) {
    return null;
  }

  const precisionFiable =
    gps.precisionMetres === null || gps.precisionMetres <= PRECISION_MAX_METRES;
  const directionUtilisateur = obtenirDirectionUtilisateur(gps, positionPrecedente);
  const deplacementSuffisant = positionPrecedente
    ? calculerDistanceMetres(positionPrecedente, gps.position) >= DEPLACEMENT_MIN_METRES
    : Boolean(gps.directionDegres);
  const ecartDirection =
    directionUtilisateur === null
      ? null
      : calculerEcartAngulaire(directionUtilisateur, projection.bearingSegment);
  const mauvaisSens =
    precisionFiable &&
    deplacementSuffisant &&
    projection.distanceMetres <= SEUIL_SNAP_METRES &&
    ecartDirection !== null &&
    ecartDirection >= SEUIL_MAUVAIS_SENS_DEGRES;
  const snapActif =
    precisionFiable &&
    projection.distanceMetres <= SEUIL_SNAP_METRES &&
    !mauvaisSens;

  return {
    bearingNavigation: projection.bearingSegment,
    distanceTraceMetres: projection.distanceMetres,
    horsTrace: precisionFiable && projection.distanceMetres >= SEUIL_HORS_TRACE_METRES,
    indexSegment: projection.indexSegment,
    mauvaisSens,
    pointProjete: projection.point,
    positionAffichee: snapActif ? projection.point : gps.position,
    snapActif,
  };
}

export function calculerTraceRestante(
  trace: Coordonnees[],
  analyse: EtatNavigationGps | null,
): Coordonnees[] {
  if (!analyse?.snapActif || trace.length < 2) {
    return trace;
  }

  const pointsRestants = trace.slice(analyse.indexSegment + 1);
  const traceRestante = [analyse.pointProjete, ...pointsRestants];

  return traceRestante.length >= 2 ? traceRestante : trace.slice(-2);
}

export function calculerDistanceMetres(a: Coordonnees, b: Coordonnees) {
  const latitudeA = convertirDegresEnRadians(a.latitude);
  const latitudeB = convertirDegresEnRadians(b.latitude);
  const deltaLatitude = convertirDegresEnRadians(b.latitude - a.latitude);
  const deltaLongitude = convertirDegresEnRadians(b.longitude - a.longitude);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * RAYON_TERRE_METRES * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function projeterSurTrace(
  position: Coordonnees,
  trace: Coordonnees[],
  indexSegmentMinimum: number,
): ProjectionTrace | null {
  let meilleureProjection: ProjectionTrace | null = null;
  const indexDepart = Math.max(0, Math.min(indexSegmentMinimum, trace.length - 2));

  for (let index = indexDepart; index < trace.length - 1; index += 1) {
    const depart = trace[index];
    const arrivee = trace[index + 1];
    const projection = projeterSurSegment(position, depart, arrivee, index);

    if (
      !meilleureProjection ||
      projection.distanceMetres < meilleureProjection.distanceMetres
    ) {
      meilleureProjection = projection;
    }
  }

  return meilleureProjection;
}

function projeterSurSegment(
  position: Coordonnees,
  depart: Coordonnees,
  arrivee: Coordonnees,
  indexSegment: number,
): ProjectionTrace {
  const origine = convertirEnPlanMetres(position, position);
  const a = convertirEnPlanMetres(depart, position);
  const b = convertirEnPlanMetres(arrivee, position);
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const longueurCarree = abX * abX + abY * abY;
  const t =
    longueurCarree === 0
      ? 0
      : borner(((origine.x - a.x) * abX + (origine.y - a.y) * abY) / longueurCarree);
  const pointPlan = {
    x: a.x + abX * t,
    y: a.y + abY * t,
  };
  const point = convertirDepuisPlanMetres(pointPlan, position);

  return {
    bearingSegment: calculerBearing(depart, arrivee),
    distanceMetres: calculerDistanceMetres(position, point),
    indexSegment,
    point,
  };
}

function obtenirDirectionUtilisateur(
  gps: DonneesGpsNavigation,
  positionPrecedente: Coordonnees | null,
) {
  if (typeof gps.directionDegres === 'number' && gps.directionDegres >= 0) {
    return gps.directionDegres;
  }

  if (
    positionPrecedente &&
    calculerDistanceMetres(positionPrecedente, gps.position) >= DEPLACEMENT_MIN_METRES
  ) {
    return calculerBearing(positionPrecedente, gps.position);
  }

  return null;
}

function calculerEcartAngulaire(a: number, b: number) {
  const difference = Math.abs(((a - b + 540) % 360) - 180);
  return difference;
}

function convertirEnPlanMetres(point: Coordonnees, origine: Coordonnees) {
  const latitudeReference = convertirDegresEnRadians(origine.latitude);

  return {
    x:
      convertirDegresEnRadians(point.longitude - origine.longitude) *
      RAYON_TERRE_METRES *
      Math.cos(latitudeReference),
    y: convertirDegresEnRadians(point.latitude - origine.latitude) * RAYON_TERRE_METRES,
  };
}

function convertirDepuisPlanMetres(
  point: { x: number; y: number },
  origine: Coordonnees,
): Coordonnees {
  const latitudeReference = convertirDegresEnRadians(origine.latitude);

  return {
    longitude:
      origine.longitude +
      convertirRadiansEnDegres(point.x / (RAYON_TERRE_METRES * Math.cos(latitudeReference))),
    latitude: origine.latitude + convertirRadiansEnDegres(point.y / RAYON_TERRE_METRES),
  };
}

function borner(valeur: number) {
  return Math.max(0, Math.min(1, valeur));
}

function convertirDegresEnRadians(valeur: number) {
  return (valeur * Math.PI) / 180;
}

function convertirRadiansEnDegres(valeur: number) {
  return (valeur * 180) / Math.PI;
}
