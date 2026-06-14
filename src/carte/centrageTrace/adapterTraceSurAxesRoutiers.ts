import { chargerAxesRoutiers } from './chargerAxesRoutiers';
import {
  calculerBearing,
  calculerDistanceMetres,
} from './geometrieCentrage';
import * as constantes from './constantesAdaptationTrace';
import {
  calculerEcartBearingCompatible,
  convertirDepuisPointPlan,
  convertirEnPointPlan,
  normaliserNomVoie,
  projeterPointSurSegmentCompatible,
} from './outilsCentrageTrace';
import { densifierTrace, lisserTrace } from './traitementTraceCentrage';
import type { Coordonnees } from '../../types/Coordonnees';
import type { SegmentAxeRoutier } from './typesCentrageTrace';

type SegmentIndexe = SegmentAxeRoutier & {
  identifiantSegment: string;
  bearing: number;
};

type CandidatProjection = {
  point: Coordonnees;
  distanceMetres: number;
  score: number;
  segment: SegmentIndexe;
};

type CorrespondanceTrace = {
  original: Coordonnees;
  recentre: Coordonnees;
  distanceMetres: number | null;
  score: number | null;
  segment: SegmentIndexe | null;
  fallback: boolean;
  ignorerAffichage?: boolean;
};

type SuiteCorrespondances = {
  debut: number;
  fin: number;
  identifiantAxe: string;
  nomNormalise: string;
  longueur: number;
  distanceMoyenne: number;
};

type LiaisonSegments = {
  distanceMetres: number;
  sortieA: Coordonnees;
  entreeB: Coordonnees;
  jonction: Coordonnees;
};

export async function adapterTraceSurAxesRoutiers(
  pointsOsrm: Coordonnees[],
): Promise<Coordonnees[]> {
  if (pointsOsrm.length < 2) {
    return pointsOsrm;
  }

  try {
    const segments = (await chargerAxesRoutiers())
      .filter(segmentValide)
      .map(indexerSegment);

    if (segments.length === 0) {
      return pointsOsrm;
    }

    const traceDensifiee = densifierTrace(pointsOsrm);
    const correspondances = calculerCorrespondances(traceDensifiee, segments);
    corrigerSuitesInstables(correspondances, segments);

    const traceAvecJonctions = construireTraceAvecJonctions(correspondances);
    const traceLissee = lisserTrace(traceAvecJonctions);

    return traceLissee.length >= 2 ? traceLissee : pointsOsrm;
  } catch {
    return pointsOsrm;
  }
}

function indexerSegment(
  segment: SegmentAxeRoutier,
  index: number,
): SegmentIndexe {
  return {
    ...segment,
    identifiantSegment: `${segment.identifiantAxe}:${index}`,
    bearing: calculerBearing(segment.debut, segment.fin),
  };
}

function segmentValide(segment: SegmentAxeRoutier): boolean {
  return calculerDistanceMetres(segment.debut, segment.fin) >= 0.5;
}

function calculerCorrespondances(
  trace: Coordonnees[],
  segments: SegmentIndexe[],
): CorrespondanceTrace[] {
  const correspondances: CorrespondanceTrace[] = [];
  let precedent: CandidatProjection | null = null;

  trace.forEach((point, index) => {
    const meilleur = trouverCandidats(trace, point, index, precedent, segments).at(0);

    if (!meilleur) {
      correspondances.push({
        original: point,
        recentre: point,
        distanceMetres: null,
        score: null,
        segment: null,
        fallback: true,
      });
      precedent = null;
      return;
    }

    correspondances.push({
      original: point,
      recentre: meilleur.point,
      distanceMetres: meilleur.distanceMetres,
      score: meilleur.score,
      segment: meilleur.segment,
      fallback: false,
    });
    precedent = meilleur;
  });

  return correspondances;
}

function trouverCandidats(
  trace: Coordonnees[],
  point: Coordonnees,
  index: number,
  precedent: CandidatProjection | null,
  segments: SegmentIndexe[],
): CandidatProjection[] {
  const bearingTrace = calculerBearingTrace(trace, index);
  const candidats: CandidatProjection[] = [];

  segments.forEach((segment) => {
    const projection = projeterPointSurSegmentCompatible(point, segment);

    if (projection.distanceMetres > constantes.DISTANCE_ACCEPTATION_MAX_METRES) {
      return;
    }

    const penaliteBearing =
      bearingTrace === null
        ? 0
        : calculerEcartBearingCompatible(bearingTrace, segment.bearing) *
          constantes.FACTEUR_PENALITE_BEARING;
    const penaliteContinuite = calculerPenaliteContinuite(
      projection.pointProjete,
      segment,
      precedent,
    );

    candidats.push({
      point: projection.pointProjete,
      distanceMetres: projection.distanceMetres,
      score: projection.distanceMetres + penaliteBearing + penaliteContinuite,
      segment,
    });
  });

  return candidats
    .sort((candidatA, candidatB) => candidatA.score - candidatB.score)
    .slice(0, constantes.LIMITE_CANDIDATS);
}

function calculerPenaliteContinuite(
  pointProjete: Coordonnees,
  segment: SegmentIndexe,
  precedent: CandidatProjection | null,
): number {
  if (!precedent) {
    return 0;
  }

  const penaliteChangement =
    segment.identifiantSegment === precedent.segment.identifiantSegment
      ? constantes.BONUS_MEME_SEGMENT
      : segment.identifiantAxe === precedent.segment.identifiantAxe
        ? constantes.BONUS_MEME_AXE
        : constantes.PENALITE_CHANGEMENT_SEGMENT;

  return (
    penaliteChangement +
    calculerDistanceMetres(pointProjete, precedent.point) *
      constantes.FACTEUR_PENALITE_SAUT
  );
}

function corrigerSuitesInstables(
  correspondances: CorrespondanceTrace[],
  segments: SegmentIndexe[],
): void {
  let suites = construireSuites(correspondances);

  for (let indexSuite = 1; indexSuite < suites.length - 1; indexSuite += 1) {
    const suite = suites[indexSuite];
    const suivante = suites[indexSuite + 1];

    if (
      suite.longueur <= constantes.POINTS_RUN_ISOLE_MAX &&
      suivante.longueur >= constantes.POINTS_RUN_SUIVANT_MIN &&
      suite.identifiantAxe !== suivante.identifiantAxe
    ) {
      marquerSuiteIgnoree(correspondances, suite);
    }
  }

  suites = construireSuites(correspondances);

  for (let indexSuite = 0; indexSuite < suites.length - 1; indexSuite += 1) {
    const suite = suites[indexSuite];
    const suivante = suites[indexSuite + 1];

    if (!suite.nomNormalise || suite.nomNormalise !== suivante.nomNormalise) {
      continue;
    }

    if (
      suite.identifiantAxe === suivante.identifiantAxe ||
      suivante.longueur < constantes.POINTS_RUN_SUIVANT_MIN
    ) {
      continue;
    }

    const suiteMauvaise =
      suite.distanceMoyenne >= constantes.DISTANCE_MOYENNE_RUN_MAUVAIS_METRES &&
      suite.distanceMoyenne >=
        suivante.distanceMoyenne + constantes.AMELIORATION_MEME_NOM_MIN_METRES;

    if (!suiteMauvaise) {
      continue;
    }

    for (let index = suite.debut; index <= suite.fin; index += 1) {
      if (reaffecterCorrespondance(correspondances[index], suivante.identifiantAxe, segments)) {
        correspondances[index].ignorerAffichage = true;
      }
    }
  }
}

function construireSuites(correspondances: CorrespondanceTrace[]): SuiteCorrespondances[] {
  const suites: SuiteCorrespondances[] = [];
  let debut = 0;

  while (debut < correspondances.length) {
    const premiere = correspondances[debut];
    const identifiantAxe = premiere.segment?.identifiantAxe ?? 'fallback';
    const nomNormalise = normaliserNomVoie(premiere.segment?.nom);
    let fin = debut;

    while (fin + 1 < correspondances.length) {
      const suivante = correspondances[fin + 1];

      if ((suivante.segment?.identifiantAxe ?? 'fallback') !== identifiantAxe) {
        break;
      }

      fin += 1;
    }

    suites.push({
      debut,
      fin,
      identifiantAxe,
      nomNormalise,
      longueur: fin - debut + 1,
      distanceMoyenne: calculerDistanceMoyenne(correspondances, debut, fin),
    });
    debut = fin + 1;
  }

  return suites;
}

function marquerSuiteIgnoree(
  correspondances: CorrespondanceTrace[],
  suite: SuiteCorrespondances,
): void {
  for (let index = suite.debut; index <= suite.fin; index += 1) {
    correspondances[index].ignorerAffichage = true;
  }
}

function reaffecterCorrespondance(
  correspondance: CorrespondanceTrace,
  identifiantAxe: string,
  segments: SegmentIndexe[],
): boolean {
  const meilleur = trouverMeilleureProjectionSurAxe(
    correspondance.original,
    identifiantAxe,
    segments,
  );

  if (!meilleur || meilleur.distanceMetres > constantes.DISTANCE_ACCEPTATION_MAX_METRES) {
    return false;
  }

  correspondance.recentre = meilleur.point;
  correspondance.distanceMetres = meilleur.distanceMetres;
  correspondance.score = meilleur.score;
  correspondance.segment = meilleur.segment;
  correspondance.fallback = false;
  return true;
}

function trouverMeilleureProjectionSurAxe(
  point: Coordonnees,
  identifiantAxe: string,
  segments: SegmentIndexe[],
): CandidatProjection | null {
  return segments
    .filter((segment) => segment.identifiantAxe === identifiantAxe)
    .map((segment) => {
      const projection = projeterPointSurSegmentCompatible(point, segment);
      return {
        point: projection.pointProjete,
        distanceMetres: projection.distanceMetres,
        score: projection.distanceMetres,
        segment,
      };
    })
    .sort((a, b) => a.distanceMetres - b.distanceMetres)
    .at(0) ?? null;
}

function construireTraceAvecJonctions(
  correspondances: CorrespondanceTrace[],
): Coordonnees[] {
  const trace: Coordonnees[] = [];

  correspondances.forEach((correspondance, index) => {
    if (correspondance.ignorerAffichage) {
      return;
    }

    if (trace.length === 0) {
      trace.push(correspondance.recentre);
      return;
    }

    const precedente = trouverCorrespondanceVisiblePrecedente(correspondances, index);

    if (precedente && doitForcerJonction(precedente, correspondance)) {
      const liaison = trouverMeilleureLiaison(
        precedente.segment,
        correspondance.segment,
      );

      if (liaison) {
        ajouterPointSiUtile(trace, liaison.sortieA, constantes.DISTANCE_INSERTION_FORCEE_MIN_METRES);
        ajouterPointSiUtile(trace, liaison.jonction, constantes.DISTANCE_INSERTION_FORCEE_MIN_METRES);
        ajouterPointSiUtile(trace, liaison.entreeB, constantes.DISTANCE_INSERTION_FORCEE_MIN_METRES);
      }
    }

    ajouterPointSiUtile(trace, correspondance.recentre);
  });

  return trace;
}

function trouverCorrespondanceVisiblePrecedente(
  correspondances: CorrespondanceTrace[],
  index: number,
): CorrespondanceTrace | null {
  for (let precedent = index - 1; precedent >= 0; precedent -= 1) {
    const correspondance = correspondances[precedent];
    if (!correspondance.ignorerAffichage && correspondance.segment) {
      return correspondance;
    }
  }

  return null;
}

function doitForcerJonction(
  precedente: CorrespondanceTrace,
  courante: CorrespondanceTrace,
): boolean {
  return Boolean(
    precedente.segment &&
      courante.segment &&
      precedente.segment.identifiantSegment !== courante.segment.identifiantSegment &&
      precedente.segment.identifiantAxe !== courante.segment.identifiantAxe,
  );
}

function trouverMeilleureLiaison(
  segmentA: SegmentIndexe | null,
  segmentB: SegmentIndexe | null,
): LiaisonSegments | null {
  if (!segmentA || !segmentB) {
    return null;
  }

  return (
    trouverIntersectionLignes(segmentA, segmentB) ??
    trouverLiaisonEndpoints(segmentA, segmentB)
  );
}

function trouverIntersectionLignes(
  segmentA: SegmentIndexe,
  segmentB: SegmentIndexe,
): LiaisonSegments | null {
  if (
    calculerEcartBearingCompatible(segmentA.bearing, segmentB.bearing) <
    constantes.ANGLE_LIAISON_ENDPOINT_MIN
  ) {
    return null;
  }

  const latitudeReference =
    (segmentA.debut.latitude +
      segmentA.fin.latitude +
      segmentB.debut.latitude +
      segmentB.fin.latitude) /
    4;
  const a1 = convertirEnPointPlan(segmentA.debut, latitudeReference);
  const a2 = convertirEnPointPlan(segmentA.fin, latitudeReference);
  const b1 = convertirEnPointPlan(segmentB.debut, latitudeReference);
  const b2 = convertirEnPointPlan(segmentB.fin, latitudeReference);
  const r = { x: a2.x - a1.x, y: a2.y - a1.y };
  const s = { x: b2.x - b1.x, y: b2.y - b1.y };
  const determinant = r.x * s.y - r.y * s.x;

  if (Math.abs(determinant) < 0.000001) {
    return null;
  }

  const difference = { x: b1.x - a1.x, y: b1.y - a1.y };
  const t = (difference.x * s.y - difference.y * s.x) / determinant;
  const u = (difference.x * r.y - difference.y * r.x) / determinant;

  if (
    t < -constantes.MARGE_PARAMETRE_INTERSECTION ||
    t > 1 + constantes.MARGE_PARAMETRE_INTERSECTION ||
    u < -constantes.MARGE_PARAMETRE_INTERSECTION ||
    u > 1 + constantes.MARGE_PARAMETRE_INTERSECTION
  ) {
    return null;
  }

  const jonction = convertirDepuisPointPlan(
    { x: a1.x + t * r.x, y: a1.y + t * r.y },
    latitudeReference,
  );
  const distance = Math.max(
    projeterPointSurSegmentCompatible(jonction, segmentA).distanceMetres,
    projeterPointSurSegmentCompatible(jonction, segmentB).distanceMetres,
  );

  return distance <= constantes.DISTANCE_INTERSECTION_MAX_METRES
    ? { distanceMetres: distance, sortieA: jonction, entreeB: jonction, jonction }
    : null;
}

function trouverLiaisonEndpoints(
  segmentA: SegmentIndexe,
  segmentB: SegmentIndexe,
): LiaisonSegments | null {
  const pointsA = [segmentA.debut, segmentA.fin];
  const pointsB = [segmentB.debut, segmentB.fin];
  let meilleure: LiaisonSegments | null = null;

  for (const pointA of pointsA) {
    for (const pointB of pointsB) {
      const distanceMetres = calculerDistanceMetres(pointA, pointB);
      const jonction = {
        longitude: (pointA.longitude + pointB.longitude) / 2,
        latitude: (pointA.latitude + pointB.latitude) / 2,
      };

      if (!meilleure || distanceMetres < meilleure.distanceMetres) {
        meilleure = { distanceMetres, sortieA: pointA, entreeB: pointB, jonction };
      }
    }
  }

  return meilleure && meilleure.distanceMetres <= constantes.DISTANCE_ENDPOINT_MAX_METRES
    ? meilleure
    : null;
}

function calculerBearingTrace(trace: Coordonnees[], index: number): number | null {
  const precedent = trace[Math.max(0, index - 1)];
  const courant = trace[index];
  const suivant = trace[Math.min(trace.length - 1, index + 1)];

  if (precedent && calculerDistanceMetres(precedent, courant) > 1) {
    return calculerBearing(precedent, courant);
  }

  return suivant && calculerDistanceMetres(courant, suivant) > 1
    ? calculerBearing(courant, suivant)
    : null;
}

function calculerDistanceMoyenne(
  correspondances: CorrespondanceTrace[],
  debut: number,
  fin: number,
): number {
  const distances = correspondances
    .slice(debut, fin + 1)
    .map((correspondance) => correspondance.distanceMetres)
    .filter((distance): distance is number => typeof distance === 'number');

  return distances.length > 0
    ? distances.reduce((total, distance) => total + distance, 0) / distances.length
    : Number.POSITIVE_INFINITY;
}

function ajouterPointSiUtile(
  points: Coordonnees[],
  point: Coordonnees,
  distanceMin = constantes.DISTANCE_INSERTION_MIN_METRES,
): void {
  const dernier = points.at(-1);
  if (!dernier || calculerDistanceMetres(dernier, point) >= distanceMin) {
    points.push(point);
  }
}
