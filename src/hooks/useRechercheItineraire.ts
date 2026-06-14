import { useMemo, useState } from 'react';

import { geocoderAdresse } from '../geocodage/ServiceGeocodage';
import { calculerItinerairePieton } from '../itineraire/ServiceItineraire';
import type { AdresseGeocodee } from '../types/AdresseGeocodee';
import type { Coordonnees } from '../types/Coordonnees';
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
  viderDepart: () => void;
  viderDestination: () => void;
  selectionnerDepart: (adresse: AdresseGeocodee) => void;
  selectionnerDestination: (adresse: AdresseGeocodee) => void;
  rechercherItineraire: () => Promise<void>;
  rechercherItineraireDepuisPosition: (
    positionDepart: Coordonnees | null,
  ) => Promise<void>;
  arreterItineraire: () => void;
};

export function useRechercheItineraire(): RechercheItineraire {
  const [departTexte, setDepartTexte] = useState('Position actuelle');
  const [destinationTexte, definirDestinationTexte] = useState('');
  const [depart, setDepart] = useState<AdresseGeocodee | null>(null);
  const [destination, setDestination] = useState<AdresseGeocodee | null>(null);
  const [departSelectionne, setDepartSelectionne] =
    useState<AdresseGeocodee | null>(null);
  const [destinationSelectionnee, setDestinationSelectionnee] =
    useState<AdresseGeocodee | null>(null);
  const [itineraire, setItineraire] = useState<Itineraire | null>(null);
  const [etatRecherche, setEtatRecherche] = useState<EtatChargement>('repos');
  const [messageRecherche, setMessageRecherche] = useState<string | null>(null);

  const recherchePossible = useMemo(
    () => departTexte.trim().length > 0 && destinationTexte.trim().length > 0,
    [departTexte, destinationTexte],
  );

  function definirDepartTexte(valeur: string) {
    setDepartTexte(valeur);

    if (departSelectionne?.libelle !== valeur) {
      setDepartSelectionne(null);
    }
  }

  function definirTexteDestination(valeur: string) {
    definirDestinationTexte(valeur);

    if (destinationSelectionnee?.libelle !== valeur) {
      setDestinationSelectionnee(null);
    }
  }

  function selectionnerDepart(adresse: AdresseGeocodee) {
    setDepartSelectionne(adresse);
    setDepartTexte(adresse.libelle);
  }

  function selectionnerDestination(adresse: AdresseGeocodee) {
    setDestinationSelectionnee(adresse);
    definirDestinationTexte(adresse.libelle);
  }

  function viderDepart() {
    setDepartTexte('');
    setDepartSelectionne(null);
    setDepart(null);
  }

  function viderDestination() {
    definirDestinationTexte('');
    setDestinationSelectionnee(null);
    setDestination(null);
  }

  async function rechercherItineraire() {
    if (!recherchePossible) {
      return;
    }

    setEtatRecherche('chargement');
    setMessageRecherche(null);
    setItineraire(null);

    try {
      const [departTrouve, destinationTrouvee] = await Promise.all([
        departSelectionne ?? geocoderAdresse(departTexte),
        destinationSelectionnee ?? geocoderAdresse(destinationTexte),
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

  async function rechercherItineraireDepuisPosition(
    positionDepart: Coordonnees | null,
  ) {
    if (
      (!positionDepart && !departSelectionne) ||
      destinationTexte.trim().length === 0
    ) {
      return;
    }

    setEtatRecherche('chargement');
    setMessageRecherche(null);
    setItineraire(null);

    try {
      const departTrouve =
        departSelectionne ??
        (positionDepart
          ? {
              libelle: 'Position actuelle',
              coordonnees: positionDepart,
            }
          : null);
      const destinationTrouvee =
        destinationSelectionnee ?? (await geocoderAdresse(destinationTexte));

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

  function arreterItineraire() {
    setDepart(null);
    setDestination(null);
    setItineraire(null);
    setEtatRecherche('repos');
    setMessageRecherche(null);
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
    definirDestinationTexte: definirTexteDestination,
    viderDepart,
    viderDestination,
    selectionnerDepart,
    selectionnerDestination,
    rechercherItineraire,
    rechercherItineraireDepuisPosition,
    arreterItineraire,
  };
}
