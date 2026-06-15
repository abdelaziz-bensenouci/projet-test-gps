import { useCallback, useEffect, useState } from 'react';

import {
  arreterPartageLive,
  creerPartageLive,
  mettreAJourPositionPartage,
  type PartageLive,
} from '../services/ServicePartageLive';
import type { Coordonnees } from '../types/Coordonnees';
import type { ContactConfiance, ProfilUtilisateur } from '../types/ProfilUtilisateur';

const INTERVALLE_PARTAGE_MS = 5000;

export function usePartageLive({
  contacts,
  destination,
  positionUtilisateur,
  profil,
}: {
  contacts: ContactConfiance[];
  destination: string;
  positionUtilisateur: Coordonnees | null;
  profil: ProfilUtilisateur | null;
}) {
  const [partageActif, setPartageActif] = useState<PartageLive | null>(null);
  const [contactSelectionneId, setContactSelectionneId] = useState('');
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!partageActif || !positionUtilisateur) return undefined;

    const timer = setInterval(() => {
      void mettreAJourPositionPartage(partageActif.id, positionUtilisateur)
        .then((partage) => {
          if (partage) setPartageActif(partage);
        })
        .catch(() => setMessage('Position partagée conservée, mise à jour indisponible.'));
    }, INTERVALLE_PARTAGE_MS);

    return () => clearInterval(timer);
  }, [partageActif, positionUtilisateur]);

  const demarrerPartage = useCallback(async () => {
    const contact = contacts.find((item) => item.id === contactSelectionneId);

    if (!profil) {
      setMessage('Connectez-vous pour partager votre position.');
      return;
    }

    if (!contact?.utilisateurContactId) {
      setMessage('Choisissez un contact WalkZen valide.');
      return;
    }

    if (!positionUtilisateur) {
      setMessage('Position GPS indisponible.');
      return;
    }

    setChargement(true);
    try {
      const partage = await creerPartageLive({
        coordonnees: positionUtilisateur,
        destination,
        observateurId: contact.utilisateurContactId,
      });
      setPartageActif(partage);
      setMessage(`Position partagée avec ${contact.nom || contact.identifiantWalkZen}.`);
    } catch {
      setMessage('Impossible de démarrer le partage live.');
    } finally {
      setChargement(false);
    }
  }, [contactSelectionneId, contacts, destination, positionUtilisateur, profil]);

  const arreterPartage = useCallback(async () => {
    if (!partageActif) return;

    setChargement(true);
    try {
      await arreterPartageLive(partageActif.id);
      setPartageActif(null);
      setMessage('Partage live arrêté.');
    } catch {
      setMessage('Partage arrêté localement, synchronisation indisponible.');
      setPartageActif(null);
    } finally {
      setChargement(false);
    }
  }, [partageActif]);

  return {
    arreterPartage,
    chargement,
    contactSelectionneId,
    demarrerPartage,
    message,
    partageActif,
    selectionnerContact: setContactSelectionneId,
  };
}
