import type {
  AxeRoutier,
  SegmentAxeRoutier,
} from './typesCentrageTrace';
import type { Coordonnees } from '../../types/Coordonnees';

const URL_AXES_ROUTIERS =
  '/data/WalkZen_Road_Centerlines_Marseille.geojson';

let cacheSegments: SegmentAxeRoutier[] | null = null;
let requeteEnCours: Promise<SegmentAxeRoutier[]> | null = null;

type ProprietesAxeGeoJson = {
  osm_id?: unknown;
  name?: unknown;
  highway?: unknown;
};

type FeatureAxeGeoJson = {
  type?: unknown;
  properties?: ProprietesAxeGeoJson | null;
  geometry?: {
    type?: unknown;
    coordinates?: unknown;
  } | null;
};

type CollectionAxesGeoJson = {
  type?: unknown;
  features?: unknown;
};

export async function chargerAxesRoutiers(): Promise<SegmentAxeRoutier[]> {
  if (cacheSegments) {
    return cacheSegments;
  }

  if (requeteEnCours) {
    return requeteEnCours;
  }

  requeteEnCours = chargerSegmentsDepuisGeoJson();
  cacheSegments = await requeteEnCours;
  requeteEnCours = null;

  return cacheSegments;
}

async function chargerSegmentsDepuisGeoJson(): Promise<SegmentAxeRoutier[]> {
  try {
    const reponse = await fetch(URL_AXES_ROUTIERS);

    if (!reponse.ok) {
      return [];
    }

    const collection = (await reponse.json()) as CollectionAxesGeoJson;
    return transformerCollectionEnSegments(collection);
  } catch {
    return [];
  }
}

function transformerCollectionEnSegments(
  collection: CollectionAxesGeoJson,
): SegmentAxeRoutier[] {
  if (
    collection.type !== 'FeatureCollection' ||
    !Array.isArray(collection.features)
  ) {
    return [];
  }

  return collection.features.flatMap((feature, index) =>
    transformerFeatureEnAxes(feature as FeatureAxeGeoJson, index).flatMap(
      transformerAxeEnSegments,
    ),
  );
}

function transformerFeatureEnAxes(
  feature: FeatureAxeGeoJson,
  index: number,
): AxeRoutier[] {
  const geometry = feature.geometry;
  const lignes = extraireLignesCoordonnees(geometry?.type, geometry?.coordinates);

  return lignes
    .map((coordonnees, ligneIndex) => ({
      identifiant: creerIdentifiantAxe(feature.properties, index, ligneIndex),
      nom: lireTexte(feature.properties?.name),
      typeVoie: lireTexte(feature.properties?.highway),
      coordonnees,
    }))
    .filter((axe) => axe.coordonnees.length >= 2);
}

function extraireLignesCoordonnees(
  type: unknown,
  coordinates: unknown,
): Coordonnees[][] {
  if (type === 'LineString') {
    const ligne = transformerLigneCoordonnees(coordinates);
    return ligne.length >= 2 ? [ligne] : [];
  }

  if (type === 'MultiLineString' && Array.isArray(coordinates)) {
    return coordinates
      .map(transformerLigneCoordonnees)
      .filter((ligne) => ligne.length >= 2);
  }

  return [];
}

function transformerLigneCoordonnees(coordinates: unknown): Coordonnees[] {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  return coordinates
    .map(transformerPosition)
    .filter((coordonnees): coordonnees is Coordonnees => coordonnees !== null);
}

function transformerPosition(position: unknown): Coordonnees | null {
  if (!Array.isArray(position)) {
    return null;
  }

  const [longitude, latitude] = position;

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    return null;
  }

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  return { longitude, latitude };
}

function transformerAxeEnSegments(axe: AxeRoutier): SegmentAxeRoutier[] {
  return axe.coordonnees.slice(0, -1).map((debut, index) => ({
    identifiantAxe: axe.identifiant,
    nom: axe.nom,
    typeVoie: axe.typeVoie,
    debut,
    fin: axe.coordonnees[index + 1],
  }));
}

function creerIdentifiantAxe(
  proprietes: ProprietesAxeGeoJson | null | undefined,
  _index: number,
  _ligneIndex: number,
): string {
  const osmId = lireTexte(proprietes?.osm_id);
  const nom = lireTexte(proprietes?.name);
  return osmId ?? nom ?? 'unknown';
}

function lireTexte(valeur: unknown): string | null {
  return typeof valeur === 'string' && valeur.length > 0 ? valeur : null;
}
