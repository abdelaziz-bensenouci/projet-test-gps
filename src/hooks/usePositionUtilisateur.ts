import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
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

const INTERVALLE_POLL_GPS_NAVIGATION_WEB_MS = 700;

const OPTIONS_GPS_WEB: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 10000,
};

export function usePositionUtilisateur(navigationActive = false): PositionUtilisateur {
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
    let surveillanceWebId: number | null = null;
    let pollNavigationWebId: ReturnType<typeof setInterval> | null = null;
    let pollNavigationWebEnCours = false;

    async function chargerPosition() {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        if (actif) {
          setEtatPosition('erreur');
          setMessagePosition('Autorisation GPS refusee.');
        }
        return;
      }

      if (
        Platform.OS === 'web' &&
        typeof navigator !== 'undefined' &&
        navigator.geolocation
      ) {
        surveillanceWebId = navigator.geolocation.watchPosition(
          mettreAJourPositionWeb,
          () => undefined,
          OPTIONS_GPS_WEB,
        );

        if (navigationActive) {
          pollNavigationWebId = setInterval(() => {
            if (!actif || pollNavigationWebEnCours) {
              return;
            }

            pollNavigationWebEnCours = true;
            navigator.geolocation.getCurrentPosition(
              (position) => {
                pollNavigationWebEnCours = false;
                mettreAJourPositionWeb(position);
              },
              () => {
                pollNavigationWebEnCours = false;
              },
              OPTIONS_GPS_WEB,
            );
          }, INTERVALLE_POLL_GPS_NAVIGATION_WEB_MS);
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      mettreAJourPosition(position);

      abonnement = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 2,
          timeInterval: 700,
        },
        mettreAJourPosition,
      );
    }

    function mettreAJourPosition(position: Location.LocationObject) {
      if (!actif) {
        return;
      }

      appliquerPosition({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      }, position.coords.heading, position.coords.accuracy ?? null);
    }

    function mettreAJourPositionWeb(position: GeolocationPosition) {
      if (!actif) {
        return;
      }

      appliquerPosition({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      }, position.coords.heading, position.coords.accuracy);
    }

    function appliquerPosition(
      prochainePosition: Coordonnees,
      direction: number | null,
      precision: number | null,
    ) {
      setPositionUtilisateur(prochainePosition);
      setDirectionUtilisateur(
        typeof direction === 'number' && direction >= 0
          ? direction
          : null,
      );
      setPrecisionUtilisateur(precision);
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
      if (
        surveillanceWebId !== null &&
        typeof navigator !== 'undefined' &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(surveillanceWebId);
      }
      if (pollNavigationWebId !== null) {
        clearInterval(pollNavigationWebId);
      }
      abonnement?.remove();
    };
  }, [navigationActive]);

  return {
    positionUtilisateur,
    directionUtilisateur,
    etatPosition,
    messagePosition,
    precisionUtilisateur,
  };
}
