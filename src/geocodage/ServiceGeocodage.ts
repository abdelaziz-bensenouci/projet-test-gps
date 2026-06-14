import { URL_GEOCODAGE } from '../constantes/ServicesConstantes';
import { lireJson } from '../services/RequeteHttp';
import type { AdresseGeocodee } from '../types/AdresseGeocodee';

type ReponseNominatim = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
};

export async function geocoderAdresse(
  adresse: string,
): Promise<AdresseGeocodee | null> {
  const recherche = adresse.trim();

  if (recherche.length === 0) {
    return null;
  }

  const parametres = new URLSearchParams({
    q: recherche,
    format: 'jsonv2',
    limit: '1',
    addressdetails: '0',
    'accept-language': 'fr',
  });

  const resultats = await lireJson<ReponseNominatim[]>(
    `${URL_GEOCODAGE}?${parametres.toString()}`,
  );

  const premierResultat = resultats.at(0);

  if (!premierResultat) {
    return null;
  }

  return {
    libelle: premierResultat.display_name,
    coordonnees: {
      longitude: Number(premierResultat.lon),
      latitude: Number(premierResultat.lat),
    },
  };
}

type OptionsSuggestionsAdresse = {
  positionReference?: {
    longitude: number;
    latitude: number;
  } | null;
};

export async function rechercherSuggestionsAdresse(
  adresse: string,
  options: OptionsSuggestionsAdresse = {},
): Promise<AdresseGeocodee[]> {
  const recherche = adresse.trim();

  if (recherche.length < 5) {
    return [];
  }

  const parametres = new URLSearchParams({
    q: recherche,
    format: 'jsonv2',
    limit: '5',
    addressdetails: '1',
    'accept-language': 'fr',
  });

  if (options.positionReference) {
    const rayonDegres = 0.12;
    const { latitude, longitude } = options.positionReference;
    parametres.set(
      'viewbox',
      [
        longitude - rayonDegres,
        latitude + rayonDegres,
        longitude + rayonDegres,
        latitude - rayonDegres,
      ].join(','),
    );
    parametres.set('bounded', '0');
  }

  const resultats = await lireJson<ReponseNominatim[]>(
    `${URL_GEOCODAGE}?${parametres.toString()}`,
  );

  const suggestions = resultats
    .map(convertirResultatNominatim)
    .filter((suggestion): suggestion is AdresseGeocodee => Boolean(suggestion));

  const positionReference = options.positionReference;

  if (!positionReference) {
    return suggestions;
  }

  return [...suggestions].sort(
    (suggestionA, suggestionB) =>
      calculerDistanceApproximativeMetres(
        positionReference,
        suggestionA.coordonnees,
      ) -
      calculerDistanceApproximativeMetres(
        positionReference,
        suggestionB.coordonnees,
      ),
  );
}

function convertirResultatNominatim(
  resultat: ReponseNominatim,
): AdresseGeocodee | null {
  const latitude = Number(resultat.lat);
  const longitude = Number(resultat.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    libelle: resultat.display_name,
    coordonnees: {
      longitude,
      latitude,
    },
  };
}

function calculerDistanceApproximativeMetres(
  depart: NonNullable<OptionsSuggestionsAdresse['positionReference']>,
  arrivee: AdresseGeocodee['coordonnees'],
) {
  const metresParDegreLatitude = 111_320;
  const latitudeMoyenne =
    ((depart.latitude + arrivee.latitude) / 2) * (Math.PI / 180);
  const metresParDegreLongitude =
    metresParDegreLatitude * Math.cos(latitudeMoyenne);
  const deltaLatitude = (arrivee.latitude - depart.latitude) * metresParDegreLatitude;
  const deltaLongitude =
    (arrivee.longitude - depart.longitude) * metresParDegreLongitude;

  return Math.sqrt(deltaLatitude * deltaLatitude + deltaLongitude * deltaLongitude);
}
