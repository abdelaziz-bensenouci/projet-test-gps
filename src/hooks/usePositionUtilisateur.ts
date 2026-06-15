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

    async function chargerPosition() {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        if (actif) {
          setEtatPosition('erreur');
          setMessagePosition('Autorisation GPS refusee.');
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({});

      mettreAJourPosition(position);

      abonnement = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2,
          timeInterval: 1000,
        },
        mettreAJourPosition,
      );
    }

    function mettreAJourPosition(position: Location.LocationObject) {
      if (!actif) {
        return;
      }

      setPositionUtilisateur({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      });
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
