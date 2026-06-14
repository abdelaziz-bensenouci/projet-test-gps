import { URL_GEOCODAGE } from '../constantes/ServicesConstantes';
import { lireJson } from '../services/RequeteHttp';
import type { AdresseGeocodee } from '../types/AdresseGeocodee';

type ReponseNominatim = {
  display_name: string;
  lat: string;
  lon: string;
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
