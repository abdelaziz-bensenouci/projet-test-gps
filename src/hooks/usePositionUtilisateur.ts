import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import type { Coordonnees } from '../types/Coordonnees';
import type { EtatChargement } from '../types/EtatChargement';

type PositionUtilisateur = {
  positionUtilisateur: Coordonnees | null;
  directionUtilisateur: number | null;
  etatPosition: EtatChargement;
  messagePosition: string | null;
  precisionUtilisateur: number | null;
};

export function usePositionUtilisateur(): PositionUtilisateur {
  const [positionUtilisateur, setPositionUtilisateur] =
    useState<Coordonnees | null>(null);
  const [directionUtilisateur, setDirectionUtilisateur] = useState<number | null>(null);
  const [etatPosition, setEtatPosition] =
    useState<EtatChargement>('chargement');
  const [messagePosition, setMessagePosition] = useState<string | null>(null);
  const [precisionUtilisateur, setPrecisionUtilisateur] = useState<number | null>(null);

  useEffect(() => {
    let actif = true;
    let abonnement: Location.LocationSubscription | null = null;
    let dernierePosition: Coordonnees | null = null;

    async function chargerPosition() {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        if (actif) {
          setEtatPosition('erreur');
          setMessagePosition('Autorisation GPS refusee.');
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      mettreAJourPosition(position);

      abonnement = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0,
          timeInterval: 500,
        },
        mettreAJourPosition,
      );
    }

    function mettreAJourPosition(position: Location.LocationObject) {
      if (!actif) {
        return;
      }

      const prochainePosition = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      };
      const distance = dernierePosition
        ? calculerDistanceMetres(dernierePosition, prochainePosition)
        : null;
      dernierePosition = prochainePosition;

      console.info('[WalkZen GPS]', {
        accuracy: position.coords.accuracy ?? null,
        distanceDepuisDerniere: distance,
        latitude: prochainePosition.latitude,
        longitude: prochainePosition.longitude,
        timestamp: position.timestamp,
      });

      setPositionUtilisateur(prochainePosition);
      setDirectionUtilisateur(
        typeof position.coords.heading === 'number' && position.coords.heading >= 0
          ? position.coords.heading
          : null,
      );
      setPrecisionUtilisateur(position.coords.accuracy ?? null);
      setEtatPosition('termine');
    }

    chargerPosition().catch(() => {
      if (actif) {
        setEtatPosition('erreur');
        setMessagePosition('Position GPS indisponible.');
      }
    });

    return () => {
      actif = false;
      abonnement?.remove();
    };
  }, []);

  return {
    positionUtilisateur,
    directionUtilisateur,
    etatPosition,
    messagePosition,
    precisionUtilisateur,
  };
}

function calculerDistanceMetres(a: Coordonnees, b: Coordonnees) {
  const rayonTerre = 6371000;
  const versRadians = (valeur: number) => (valeur * Math.PI) / 180;
  const deltaLatitude = versRadians(b.latitude - a.latitude);
  const deltaLongitude = versRadians(b.longitude - a.longitude);
  const latitudeA = versRadians(a.latitude);
  const latitudeB = versRadians(b.latitude);
  const formule =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(deltaLongitude / 2) ** 2;

  return rayonTerre * 2 * Math.atan2(Math.sqrt(formule), Math.sqrt(1 - formule));
}
