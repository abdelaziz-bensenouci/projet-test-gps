import { useCallback, useEffect, useState } from 'react';

import {
  ajouterContactConfiance,
  ajouterLieuFavori,
  connecterUtilisateur,
  deconnecterUtilisateur,
  inscrireUtilisateur,
  marquerNotificationLue,
  masquerNotification,
  recupererDonneesUtilisateur,
  recupererOuCreerProfil,
  recupererUtilisateurCourant,
  rechercherProfilParIdentifiantWalkZen,
  supprimerContactConfiance,
  supprimerHistoriqueAdresse,
  supprimerLieuFavori,
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
  const [actionEnCours, setActionEnCours] = useState(false);
  const [messageAction, setMessageAction] = useState<string | null>(null);

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
    actionEnCours,
    ajouterContact: action(async (nom: string, identifiantWalkZen: string) => {
      const profilTrouve = await rechercherProfilParIdentifiantWalkZen(identifiantWalkZen);
      if (!profilTrouve) throw new Error('Contact introuvable.');
      await ajouterContactConfiance({
        identifiantWalkZen: profilTrouve.identifiantWalkZen,
        nom: nom || profilTrouve.nomComplet || profilTrouve.identifiantWalkZen,
        utilisateurContactId: profilTrouve.id,
      });
      setMessageAction('Contact ajouté.');
    }),
    ajouterFavori: action(
      async (
        libelle: string,
        adresse: string,
        type: 'depart' | 'destination',
      ) => {
        await ajouterLieuFavori({ adresse, libelle, type });
        setMessageAction('Favori ajouté.');
      },
    ),
    chargement,
    contacts,
    connecter: action(async (email: string, motDePasse: string) => {
      const utilisateur = await connecterUtilisateur(email, motDePasse);
      await recupererOuCreerProfil(utilisateur);
      setMessageAction('Connexion réussie.');
    }),
    deconnecter: action(async () => {
      await deconnecterUtilisateur();
      setProfil(null);
      setContacts([]);
      setFavoris([]);
      setHistorique([]);
      setNotifications([]);
      setMessageAction('Déconnecté.');
    }),
    erreur,
    favoris,
    historique,
    inscrire: action(async (nom: string, email: string, motDePasse: string) => {
      await inscrireUtilisateur(nom, email, motDePasse);
      setMessageAction('Compte créé.');
    }),
    marquerNotificationLue: action(async (id: string) => {
      await marquerNotificationLue(id);
      setNotifications((items) =>
        items.map((item) => (item.id === id ? { ...item, lue: true } : item)),
      );
    }),
    masquerNotification: action(async (id: string) => {
      await masquerNotification(id);
      setNotifications((items) => items.filter((item) => item.id !== id));
    }),
    messageAction,
    notifications,
    profil,
    rafraichir,
    supprimerContact: action(async (id: string) => {
      await supprimerContactConfiance(id);
      setMessageAction('Contact supprimé.');
    }),
    supprimerFavori: action(async (id: string) => {
      await supprimerLieuFavori(id);
      setMessageAction('Favori supprimé.');
    }),
    supprimerHistorique: action(async (id: string) => {
      await supprimerHistoriqueAdresse(id);
      setMessageAction('Adresse retirée de l’historique.');
    }),
  };

  function action<Args extends unknown[]>(
    operation: (...args: Args) => Promise<void>,
  ) {
    return async (...args: Args) => {
      setActionEnCours(true);
      setMessageAction(null);
      try {
        await operation(...args);
        await rafraichir();
      } catch (erreurAction) {
        setMessageAction(
          erreurAction instanceof Error
            ? erreurAction.message
            : 'Action impossible pour le moment.',
        );
      } finally {
        setActionEnCours(false);
      }
    };
  }
}
