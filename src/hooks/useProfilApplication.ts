import { useCallback, useEffect, useState } from 'react';

import {
  recupererDonneesUtilisateur,
  recupererOuCreerProfil,
  recupererUtilisateurCourant,
} from '../services/ServiceProfil';
import type {
  ContactConfiance,
  HistoriqueAdresse,
  LieuFavori,
  NotificationUtilisateur,
  ProfilUtilisateur,
} from '../types/ProfilUtilisateur';

export function useProfilApplication() {
  const [profil, setProfil] = useState<ProfilUtilisateur | null>(null);
  const [contacts, setContacts] = useState<ContactConfiance[]>([]);
  const [favoris, setFavoris] = useState<LieuFavori[]>([]);
  const [historique, setHistorique] = useState<HistoriqueAdresse[]>([]);
  const [notifications, setNotifications] = useState<NotificationUtilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const rafraichir = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const utilisateur = await recupererUtilisateurCourant();
      const profilUtilisateur = await recupererOuCreerProfil(utilisateur);
      setProfil(profilUtilisateur);

      if (!profilUtilisateur) {
        setContacts([]);
        setFavoris([]);
        setHistorique([]);
        setNotifications([]);
        return;
      }

      const donnees = await recupererDonneesUtilisateur();
      setContacts(donnees.contacts);
      setFavoris(donnees.favoris);
      setHistorique(donnees.historique);
      setNotifications(donnees.notifications);
    } catch {
      setErreur('Profil indisponible pour le moment.');
      setContacts([]);
      setFavoris([]);
      setHistorique([]);
      setNotifications([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void rafraichir();
  }, [rafraichir]);

  return {
    chargement,
    contacts,
    erreur,
    favoris,
    historique,
    notifications,
    profil,
    rafraichir,
  };
}
