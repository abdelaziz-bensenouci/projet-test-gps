import { useCallback, useEffect, useState } from 'react';

import {
  annulerAlerteSos,
  creerAlerteSos,
  envoyerNotificationsSos,
  recupererAlerteSosActive,
  type AlerteSos,
} from '../services/ServiceSos';
import type { Coordonnees } from '../types/Coordonnees';
import type { ContactConfiance, ProfilUtilisateur } from '../types/ProfilUtilisateur';

export function useSosApplication({
  contacts,
  positionUtilisateur,
  precisionUtilisateur,
  profil,
}: {
  contacts: ContactConfiance[];
  positionUtilisateur: Coordonnees | null;
  precisionUtilisateur: number | null;
  profil: ProfilUtilisateur | null;
}) {
  const [alerteActive, setAlerteActive] = useState<AlerteSos | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profil) return;

    let annule = false;
    recupererAlerteSosActive(profil.id)
      .then((alerte) => {
        if (!annule) setAlerteActive(alerte);
      })
      .catch(() => undefined);

    return () => {
      annule = true;
    };
  }, [profil]);

  const demanderSos = useCallback(() => {
    if (!profil) {
      setMessage('Connectez-vous pour envoyer un SOS.');
      return;
    }

    if (!contacts.some((contact) => contact.utilisateurContactId)) {
      setMessage('Ajoutez au moins un contact de confiance WalkZen.');
      return;
    }

    if (!positionUtilisateur) {
      setMessage('Position GPS indisponible.');
      return;
    }

    setConfirmationVisible(true);
  }, [contacts, positionUtilisateur, profil]);

  const envoyerSos = useCallback(async () => {
    if (!profil || !positionUtilisateur || chargement) return;

    setChargement(true);
    setMessage('Transmission de l’alerte SOS...');
    setConfirmationVisible(false);

    try {
      const alerte = await creerAlerteSos({
        coordonnees: positionUtilisateur,
        nomExpediteur: profil.nomComplet || profil.email || 'Utilisateur WalkZen',
        precision: precisionUtilisateur,
      });
      setAlerteActive(alerte);
      setMessage('SOS envoyé.');
      void envoyerNotificationsSos(alerte.id).catch(() => {
        setMessage('SOS enregistré, notification push indisponible.');
      });
    } catch {
      setMessage('Impossible d’envoyer le SOS.');
    } finally {
      setChargement(false);
    }
  }, [chargement, positionUtilisateur, precisionUtilisateur, profil]);

  const annulerSos = useCallback(async () => {
    if (!alerteActive || chargement) return;

    setChargement(true);
    try {
      await annulerAlerteSos(alerteActive.id);
      setAlerteActive(null);
      setMessage('Alerte SOS annulée.');
    } catch {
      setMessage('Impossible d’annuler le SOS.');
    } finally {
      setChargement(false);
    }
  }, [alerteActive, chargement]);

  return {
    alerteActive,
    annulerSos,
    chargement,
    confirmationVisible,
    demanderSos,
    envoyerSos,
    fermerConfirmation: () => setConfirmationVisible(false),
    message,
  };
}
