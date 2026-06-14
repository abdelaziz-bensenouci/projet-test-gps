import { useMemo, useState } from 'react';

import { geocoderAdresse } from '../geocodage/ServiceGeocodage';
import { calculerItinerairePieton } from '../itineraire/ServiceItineraire';
import type { AdresseGeocodee } from '../types/AdresseGeocodee';
import type { EtatChargement } from '../types/EtatChargement';
import type { Itineraire } from '../types/Itineraire';

type RechercheItineraire = {
  departTexte: string;
  destinationTexte: string;
  depart: AdresseGeocodee | null;
  destination: AdresseGeocodee | null;
  itineraire: Itineraire | null;
  etatRecherche: EtatChargement;
  messageRecherche: string | null;
  recherchePossible: boolean;
  definirDepartTexte: (valeur: string) => void;
  definirDestinationTexte: (valeur: string) => void;
  rechercherItineraire: () => Promise<void>;
};

export function useRechercheItineraire(): RechercheItineraire {
  const [departTexte, definirDepartTexte] = useState('');
  const [destinationTexte, definirDestinationTexte] = useState('');
  const [depart, setDepart] = useState<AdresseGeocodee | null>(null);
  const [destination, setDestination] = useState<AdresseGeocodee | null>(null);
  const [itineraire, setItineraire] = useState<Itineraire | null>(null);
  const [etatRecherche, setEtatRecherche] = useState<EtatChargement>('repos');
  const [messageRecherche, setMessageRecherche] = useState<string | null>(null);

  const recherchePossible = useMemo(
    () => departTexte.trim().length > 0 && destinationTexte.trim().length > 0,
    [departTexte, destinationTexte],
  );

  async function rechercherItineraire() {
    if (!recherchePossible) {
      return;
    }

    setEtatRecherche('chargement');
    setMessageRecherche(null);
    setItineraire(null);

    try {
      const [departTrouve, destinationTrouvee] = await Promise.all([
        geocoderAdresse(departTexte),
        geocoderAdresse(destinationTexte),
      ]);

      if (!departTrouve || !destinationTrouvee) {
        setEtatRecherche('erreur');
        setMessageRecherche('Adresse introuvable.');
        return;
      }

      const route = await calculerItinerairePieton(
        departTrouve.coordonnees,
        destinationTrouvee.coordonnees,
      );

      if (!route) {
        setEtatRecherche('erreur');
        setMessageRecherche('Itineraire OSRM introuvable.');
        return;
      }

      setDepart(departTrouve);
      setDestination(destinationTrouvee);
      setItineraire(route);
      setEtatRecherche('termine');
    } catch {
      setEtatRecherche('erreur');
      setMessageRecherche('Recherche impossible.');
    }
  }

  return {
    departTexte,
    destinationTexte,
    depart,
    destination,
    itineraire,
    etatRecherche,
    messageRecherche,
    recherchePossible,
    definirDepartTexte,
    definirDestinationTexte,
    rechercherItineraire,
  };
}
