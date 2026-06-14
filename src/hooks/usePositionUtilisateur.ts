import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import type { Coordonnees } from '../types/Coordonnees';
import type { EtatChargement } from '../types/EtatChargement';

type PositionUtilisateur = {
  positionUtilisateur: Coordonnees | null;
  etatPosition: EtatChargement;
  messagePosition: string | null;
};

export function usePositionUtilisateur(): PositionUtilisateur {
  const [positionUtilisateur, setPositionUtilisateur] =
    useState<Coordonnees | null>(null);
  const [etatPosition, setEtatPosition] =
    useState<EtatChargement>('chargement');
  const [messagePosition, setMessagePosition] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

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

      if (actif) {
        setPositionUtilisateur({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
        setEtatPosition('termine');
      }
    }

    chargerPosition().catch(() => {
      if (actif) {
        setEtatPosition('erreur');
        setMessagePosition('Position GPS indisponible.');
      }
    });

    return () => {
      actif = false;
    };
  }, []);

  return { positionUtilisateur, etatPosition, messagePosition };
}
