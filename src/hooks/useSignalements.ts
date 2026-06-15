import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  chargerSignalements,
  creerSignalement,
  ecouterSignalements,
} from '../services/ServiceSignalements';
import type { Coordonnees } from '../types/Coordonnees';
import type {
  CompteursSignalements,
  NiveauDangerSignalement,
  Signalement,
} from '../types/Signalement';

const COMPTEURS_VIDES: CompteursSignalements = {
  eleve: 0,
  modere: 0,
  faible: 0,
};

export function useSignalements(positionUtilisateur: Coordonnees | null) {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [chargement, setChargement] = useState(false);
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rafraichir = useCallback(async () => {
    setChargement(true);

    try {
      setSignalements(await chargerSignalements());
    } catch {
      setMessage('Signalements indisponibles.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void rafraichir();
    return ecouterSignalements(() => {
      void rafraichir();
    });
  }, [rafraichir]);

  const signalementsAutour = useMemo(
    () =>
      positionUtilisateur
        ? signalements
            .map((signalement) => ({
              signalement,
              distance: calculerDistanceMetres(
                positionUtilisateur,
                signalement.coordonnees,
              ),
            }))
            .filter(({ distance }) => distance <= 1200)
            .sort((a, b) => a.distance - b.distance)
            .map(({ signalement }) => signalement)
        : signalements,
    [positionUtilisateur, signalements],
  );

  const compteurs = useMemo(
    () =>
      signalementsAutour.reduce<CompteursSignalements>(
        (total, signalement) => ({
          ...total,
          [signalement.niveauDanger]: total[signalement.niveauDanger] + 1,
        }),
        { ...COMPTEURS_VIDES },
      ),
    [signalementsAutour],
  );

  const ajouterSignalement = useCallback(
    async (niveauDanger: NiveauDangerSignalement, libelle: string) => {
      if (!positionUtilisateur) {
        setMessage('Position GPS indisponible pour créer le signalement.');
        return;
      }

      setCreationEnCours(true);
      setMessage(null);

      try {
        const nouveau = await creerSignalement({
          coordonnees: positionUtilisateur,
          libelle,
          niveauDanger,
        });

        if (nouveau) {
          setSignalements((actuels) => [nouveau, ...actuels]);
          setMessage('Signalement envoyé.');
        }
      } catch {
        setMessage('Impossible de créer le signalement.');
      } finally {
        setCreationEnCours(false);
      }
    },
    [positionUtilisateur],
  );

  return {
    ajouterSignalement,
    chargement,
    compteurs,
    creationEnCours,
    message,
    signalements: signalementsAutour,
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
