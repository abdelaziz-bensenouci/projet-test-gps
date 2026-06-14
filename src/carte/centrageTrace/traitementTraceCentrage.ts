import * as constantes from './constantesAdaptationTrace';
import {
  calculerDistanceMetres,
} from './geometrieCentrage';
import {
  calculerAngleTrace,
  interpolerBezier,
  interpolerPoint,
} from './outilsCentrageTrace';
import type { Coordonnees } from '../../types/Coordonnees';

export function lisserTrace(points: Coordonnees[]): Coordonnees[] {
  if (points.length < 3) {
    return points;
  }

  const resultat: Coordonnees[] = [points[0]];

  for (let index = 1; index < points.length - 1; index += 1) {
    const precedent = points[index - 1];
    const courant = points[index];
    const suivant = points[index + 1];
    const angle = calculerAngleTrace(precedent, courant, suivant);

    if (angle < constantes.ANGLE_LISSAGE_MIN || angle > constantes.ANGLE_LISSAGE_MAX) {
      resultat.push(courant);
      continue;
    }

    const distanceAvant = calculerDistanceMetres(precedent, courant);
    const distanceApres = calculerDistanceMetres(courant, suivant);
    const coupe = Math.min(constantes.COUPE_LISSAGE_MAX_METRES, distanceAvant * 0.28, distanceApres * 0.28);

    if (coupe < constantes.DISTANCE_INSERTION_MIN_METRES) {
      resultat.push(courant);
      continue;
    }

    const entree = interpolerPoint(courant, precedent, coupe / distanceAvant);
    const sortie = interpolerPoint(courant, suivant, coupe / distanceApres);

    resultat.push(entree);
    for (let etape = 1; etape <= constantes.ETAPES_LISSAGE; etape += 1) {
      resultat.push(interpolerBezier(entree, courant, sortie, etape / (constantes.ETAPES_LISSAGE + 1)));
    }
    resultat.push(sortie);
  }

  resultat.push(points[points.length - 1]);
  return resultat;
}

export function densifierTrace(points: Coordonnees[]): Coordonnees[] {
  const resultat: Coordonnees[] = [points[0]];

  for (let index = 0; index < points.length - 1; index += 1) {
    const depart = points[index];
    const arrivee = points[index + 1];
    const etapes = Math.max(
      1,
      Math.ceil(calculerDistanceMetres(depart, arrivee) / constantes.DISTANCE_DENSIFICATION_MAX_METRES),
    );

    for (let etape = 1; etape <= etapes; etape += 1) {
      resultat.push(interpolerPoint(depart, arrivee, etape / etapes));
    }
  }

  return resultat;
}
