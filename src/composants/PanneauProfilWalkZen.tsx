import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  BoutonProfilAction as BoutonAction,
  InfoCarteProfil as InfoCarte,
  SectionProfilCarte as Section,
  stylesProfil as styles,
} from './PanneauProfilWalkZenElements';
import type {
  ContactConfiance,
  HistoriqueAdresse,
  LieuFavori,
  NotificationUtilisateur,
  ProfilUtilisateur,
} from '../types/ProfilUtilisateur';

type SectionProfil =
  | 'compte'
  | 'contacts'
  | 'favoris'
  | 'historique'
  | 'notifications'
  | 'reglages';

type ProprietesPanneauProfilWalkZen = {
  actionEnCours: boolean;
  ajouterContact: (nom: string, identifiantWalkZen: string) => Promise<void>;
  ajouterFavori: (
    libelle: string,
    adresse: string,
    type: 'depart' | 'destination',
  ) => Promise<void>;
  chargement: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  contacts: ContactConfiance[];
  deconnecter: () => Promise<void>;
  erreur: string | null;
  favoris: LieuFavori[];
  fermer: () => void;
  historique: HistoriqueAdresse[];
  inscrire: (nom: string, email: string, motDePasse: string) => Promise<void>;
  marquerNotificationLue: (id: string) => Promise<void>;
  masquerNotification: (id: string) => Promise<void>;
  messageAction: string | null;
  notifications: NotificationUtilisateur[];
  profil: ProfilUtilisateur | null;
  supprimerContact: (id: string) => Promise<void>;
  supprimerFavori: (id: string) => Promise<void>;
  supprimerHistorique: (id: string) => Promise<void>;
};

export function PanneauProfilWalkZen({
  actionEnCours,
  ajouterContact,
  ajouterFavori,
  chargement,
  connecter,
  contacts,
  deconnecter,
  erreur,
  favoris,
  fermer,
  historique,
  inscrire,
  marquerNotificationLue,
  masquerNotification,
  messageAction,
  notifications,
  profil,
  supprimerContact,
  supprimerFavori,
  supprimerHistorique,
}: ProprietesPanneauProfilWalkZen) {
  const [sectionOuverte, setSectionOuverte] = useState<SectionProfil>('compte');
  const [nomAuth, setNomAuth] = useState('');
  const [emailAuth, setEmailAuth] = useState('');
  const [motDePasseAuth, setMotDePasseAuth] = useState('');
  const [nomContact, setNomContact] = useState('');
  const [idContact, setIdContact] = useState('');
  const [libelleFavori, setLibelleFavori] = useState('');
  const [adresseFavori, setAdresseFavori] = useState('');
  const connecte = Boolean(profil);

  const basculerSection = (section: SectionProfil) => {
    setSectionOuverte((actuelle) => (actuelle === section ? 'compte' : section));
  };

  return (
    <View style={styles.panneau}>
      <EnteteProfil fermer={fermer} profil={profil} />
      <ScrollView
        contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {chargement ? <Text style={styles.message}>Chargement du profil...</Text> : null}
        {erreur ? <Text style={styles.messageErreur}>{erreur}</Text> : null}
        {messageAction ? <Text style={styles.message}>{messageAction}</Text> : null}

        <Section
          detail={
            connecte
              ? profil?.email || 'Compte WalkZen'
              : 'Connexion requise pour synchroniser vos donnees'
          }
          icone="user"
          ouverte={sectionOuverte === 'compte'}
          titre="Compte"
          valeur={connecte ? 'Connecte' : 'Invite'}
          onPress={() => basculerSection('compte')}
        >
          <InfoCarte
            libelle="Identifiant WalkZen"
            valeur={profil?.identifiantWalkZen ?? 'Non connecte'}
          />
          <InfoCarte libelle="Email" valeur={profil?.email ?? 'Aucune session active'} />
          {!connecte ? (
            <FormulaireCompte
              actionEnCours={actionEnCours}
              connecter={connecter}
              email={emailAuth}
              inscrire={inscrire}
              motDePasse={motDePasseAuth}
              nom={nomAuth}
              setEmail={setEmailAuth}
              setMotDePasse={setMotDePasseAuth}
              setNom={setNomAuth}
            />
          ) : (
            <BoutonAction
              danger
              disabled={actionEnCours}
              libelle="Se deconnecter"
              onPress={() => void deconnecter()}
            />
          )}
        </Section>

        <Section
          detail={contacts.length ? 'Contacts synchronises Supabase' : 'Aucun contact enregistre'}
          icone="users"
          ouverte={sectionOuverte === 'contacts'}
          titre="Contacts de confiance"
          valeur={String(contacts.length)}
          onPress={() => basculerSection('contacts')}
        >
          <FormulaireContact
            actionEnCours={actionEnCours}
            ajouterContact={ajouterContact}
            idContact={idContact}
            nomContact={nomContact}
            setIdContact={setIdContact}
            setNomContact={setNomContact}
          />
          {contacts.length ? (
            contacts.map((contact) => (
              <InfoCarte
                key={contact.id}
                action="Supprimer"
                libelle={contact.nom || 'Contact WalkZen'}
                onAction={() => void supprimerContact(contact.id)}
                valeur={contact.identifiantWalkZen || contact.email || contact.telephone || 'Contact'}
              />
            ))
          ) : (
            <Text style={styles.message}>
              Ajoutez vos contacts de confiance depuis votre profil WalkZen.
            </Text>
          )}
        </Section>

        <Section
          detail={favoris.length ? 'Lieux disponibles dans le panneau trajet' : 'Aucun favori enregistre'}
          icone="heart"
          ouverte={sectionOuverte === 'favoris'}
          titre="Lieux favoris"
          valeur={String(favoris.length)}
          onPress={() => basculerSection('favoris')}
        >
          <FormulaireFavori
            actionEnCours={actionEnCours}
            adresse={adresseFavori}
            ajouterFavori={ajouterFavori}
            libelle={libelleFavori}
            setAdresse={setAdresseFavori}
            setLibelle={setLibelleFavori}
          />
          {favoris.length ? (
            favoris.map((favori) => (
              <InfoCarte
                key={favori.id}
                action="Supprimer"
                libelle={favori.libelle}
                onAction={() => void supprimerFavori(favori.id)}
                valeur={favori.adresse}
              />
            ))
          ) : (
            <Text style={styles.message}>
              Les favoris WalkZen3 remplacent automatiquement les raccourcis statiques.
            </Text>
          )}
        </Section>

        <Section
          detail={historique.length ? 'Dernieres adresses utilisees' : 'Historique vide'}
          icone="clock"
          ouverte={sectionOuverte === 'historique'}
          titre="Historique"
          valeur={String(historique.length)}
          onPress={() => basculerSection('historique')}
        >
          {historique.length ? (
            historique.map((item) => (
              <InfoCarte
                key={item.id}
                action="Supprimer"
                libelle={item.usage}
                onAction={() => void supprimerHistorique(item.id)}
                valeur={item.libelle}
              />
            ))
          ) : (
            <Text style={styles.message}>Les recherches selectionnees seront listees ici.</Text>
          )}
        </Section>

        <Section
          detail={notifications.length ? 'Notifications recentes' : 'Aucune notification'}
          icone="bell"
          ouverte={sectionOuverte === 'notifications'}
          titre="Notifications"
          valeur={String(notifications.filter((notification) => !notification.lue).length)}
          onPress={() => basculerSection('notifications')}
        >
          {notifications.length ? (
            notifications.map((notification) => (
              <InfoCarte
                key={notification.id}
                action={notification.lue ? 'Masquer' : 'Lire'}
                libelle={notification.titre || 'Notification'}
                onAction={() =>
                  void (notification.lue
                    ? masquerNotification(notification.id)
                    : marquerNotificationLue(notification.id))
                }
                valeur={notification.corps}
              />
            ))
          ) : (
            <Text style={styles.message}>Aucune notification pour le moment.</Text>
          )}
        </Section>

        <Section
          detail="Notifications, affichage carte et preferences"
          icone="settings"
          ouverte={sectionOuverte === 'reglages'}
          titre="Reglages"
          valeur=""
          onPress={() => basculerSection('reglages')}
        >
          <InfoCarte libelle="Notifications" valeur="Signalements, SOS et partage live" />
          <InfoCarte libelle="Affichage carte" valeur="Controles et zoom automatique" />
          <Text style={styles.message}>
            Les reglages avances seront branches avec les preferences WalkZen.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function EnteteProfil({
  fermer,
  profil,
}: {
  fermer: () => void;
  profil: ProfilUtilisateur | null;
}) {
  return (
    <View style={styles.entete}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexte}>WZ</Text>
      </View>
      <View style={styles.enteteTexte}>
        <Text numberOfLines={1} style={styles.titre}>
          {profil?.nomComplet || profil?.email || 'WalkZen'}
        </Text>
        <Text numberOfLines={1} style={styles.sousTitre}>
          {profil?.identifiantWalkZen ?? 'Vos trajets a pied, plus sereins'}
        </Text>
      </View>
      <Pressable accessibilityRole="button" onPress={fermer} style={styles.fermer}>
        <Text style={styles.boutonTexte}>X</Text>
      </Pressable>
    </View>
  );
}

function FormulaireCompte({
  actionEnCours,
  connecter,
  email,
  inscrire,
  motDePasse,
  nom,
  setEmail,
  setMotDePasse,
  setNom,
}: {
  actionEnCours: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  email: string;
  inscrire: (nom: string, email: string, motDePasse: string) => Promise<void>;
  motDePasse: string;
  nom: string;
  setEmail: (valeur: string) => void;
  setMotDePasse: (valeur: string) => void;
  setNom: (valeur: string) => void;
}) {
  return (
    <View style={styles.formulaire}>
      <TextInput
        autoCapitalize="words"
        onChangeText={setNom}
        placeholder="Nom complet"
        placeholderTextColor="#657783"
        style={styles.champ}
        value={nom}
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#657783"
        style={styles.champ}
        value={email}
      />
      <TextInput
        onChangeText={setMotDePasse}
        placeholder="Mot de passe"
        placeholderTextColor="#657783"
        secureTextEntry
        style={styles.champ}
        value={motDePasse}
      />
      <View style={styles.ligneBoutons}>
        <BoutonAction
          disabled={actionEnCours}
          libelle="Connexion"
          onPress={() => void connecter(email, motDePasse)}
        />
        <BoutonAction
          disabled={actionEnCours}
          libelle="Creer"
          onPress={() => void inscrire(nom, email, motDePasse)}
        />
      </View>
    </View>
  );
}

function FormulaireContact({
  actionEnCours,
  ajouterContact,
  idContact,
  nomContact,
  setIdContact,
  setNomContact,
}: {
  actionEnCours: boolean;
  ajouterContact: (nom: string, identifiantWalkZen: string) => Promise<void>;
  idContact: string;
  nomContact: string;
  setIdContact: (valeur: string) => void;
  setNomContact: (valeur: string) => void;
}) {
  return (
    <View style={styles.formulaire}>
      <TextInput
        onChangeText={setNomContact}
        placeholder="Nom du contact"
        placeholderTextColor="#657783"
        style={styles.champ}
        value={nomContact}
      />
      <View style={styles.ligneBoutons}>
        <TextInput
          autoCapitalize="characters"
          onChangeText={setIdContact}
          placeholder="ID WalkZen"
          placeholderTextColor="#657783"
          style={[styles.champ, styles.champFlexible]}
          value={idContact}
        />
        <BoutonAction
          disabled={actionEnCours || !idContact.trim()}
          libelle="Ajouter"
          onPress={() => void ajouterContact(nomContact, idContact)}
        />
      </View>
    </View>
  );
}

function FormulaireFavori({
  actionEnCours,
  adresse,
  ajouterFavori,
  libelle,
  setAdresse,
  setLibelle,
}: {
  actionEnCours: boolean;
  adresse: string;
  ajouterFavori: (
    libelle: string,
    adresse: string,
    type: 'depart' | 'destination',
  ) => Promise<void>;
  libelle: string;
  setAdresse: (valeur: string) => void;
  setLibelle: (valeur: string) => void;
}) {
  return (
    <View style={styles.formulaire}>
      <TextInput
        onChangeText={setLibelle}
        placeholder="Nom du lieu"
        placeholderTextColor="#657783"
        style={styles.champ}
        value={libelle}
      />
      <View style={styles.ligneBoutons}>
        <TextInput
          onChangeText={setAdresse}
          placeholder="Adresse"
          placeholderTextColor="#657783"
          style={[styles.champ, styles.champFlexible]}
          value={adresse}
        />
        <BoutonAction
          disabled={actionEnCours || !libelle.trim() || !adresse.trim()}
          libelle="Ajouter"
          onPress={() => void ajouterFavori(libelle, adresse, 'destination')}
        />
      </View>
    </View>
  );
}
