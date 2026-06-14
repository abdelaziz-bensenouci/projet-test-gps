import { URL_ITINERAIRE_OSRM } from '../constantes/ServicesConstantes';
import { lireJson } from '../services/RequeteHttp';
import type { Coordonnees } from '../types/Coordonnees';
import type { Itineraire } from '../types/Itineraire';

type ReponseOsrm = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: Array<[number, number]>;
    };
  }>;
};

export async function calculerItinerairePieton(
  depart: Coordonnees,
  arrivee: Coordonnees,
): Promise<Itineraire | null> {
  const points = `${depart.longitude},${depart.latitude};${arrivee.longitude},${arrivee.latitude}`;
  const parametres = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    alternatives: 'false',
    steps: 'false',
  });

  const reponse = await lireJson<ReponseOsrm>(
    `${URL_ITINERAIRE_OSRM}/${points}?${parametres.toString()}`,
  );

  const route = reponse.routes?.at(0);

  if (!route) {
    return null;
  }

  return {
    coordonnees: route.geometry.coordinates.map(([longitude, latitude]) => ({
      longitude,
      latitude,
    })),
    distanceMetres: route.distance,
    dureeSecondes: route.duration,
  };
}
