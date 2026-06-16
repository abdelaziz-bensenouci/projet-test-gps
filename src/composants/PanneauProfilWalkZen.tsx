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
  | 'aucune' | 'auth' | 'compte' | 'contacts' | 'stats'
  | 'favoris' | 'historique' | 'reglages' | 'apropos';

type Props = {
  actionEnCours: boolean;
  ajouterContact: (nom: string, identifiantWalkZen: string) => Promise<void>;
  ajouterFavori: (libelle: string, adresse: string, type: 'depart' | 'destination') => Promise<void>;
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
  messageAction,
  notifications,
  profil,
  supprimerContact,
  supprimerFavori,
  supprimerHistorique,
}: Props) {
  const [sectionOuverte, setSectionOuverte] = useState<SectionProfil>(
    profil ? 'compte' : 'aucune',
  );
  const [nomAuth, setNomAuth] = useState('');
  const [emailAuth, setEmailAuth] = useState('');
  const [motDePasseAuth, setMotDePasseAuth] = useState('');
  const [nomContact, setNomContact] = useState('');
  const [idContact, setIdContact] = useState('');
  const [libelleFavori, setLibelleFavori] = useState('');
  const [adresseFavori, setAdresseFavori] = useState('');
  const connecte = Boolean(profil);
  const basculerSection = (section: SectionProfil) =>
    setSectionOuverte((actuelle) => (actuelle === section ? 'aucune' : section));

  return (
    <View style={styles.panneau}>
      <EnteteProfil fermer={fermer} profil={profil} />
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {chargement ? <Text style={styles.message}>Chargement du profil...</Text> : null}
        {erreur ? <Text style={styles.messageErreur}>{erreur}</Text> : null}
        {messageAction ? <Text style={styles.message}>{messageAction}</Text> : null}

        {!connecte ? (
          <Section detail="Connexion ou création de compte WalkZen" icone="log-in" ouverte={sectionOuverte === 'auth'} titre="Se connecter" valeur="" onPress={() => basculerSection('auth')}>
            <FormulaireCompte actionEnCours={actionEnCours} connecter={connecter} email={emailAuth} inscrire={inscrire} motDePasse={motDePasseAuth} nom={nomAuth} setEmail={setEmailAuth} setMotDePasse={setMotDePasseAuth} setNom={setNomAuth} />
          </Section>
        ) : (
          <Section detail="Email, mot de passe et suppression du compte" icone="user" ouverte={sectionOuverte === 'compte'} titre="Compte" valeur="" onPress={() => basculerSection('compte')}>
            <InfoCarte libelle="Adresse mail" valeur={profil?.email ?? 'Non connecté'} />
            <InfoCarte libelle="Changer le mot de passe" valeur="Nouveau mot de passe" />
            <InfoCarte libelle="Supprimer le compte" valeur="Cette action est définitive." />
          </Section>
        )}

        {connecte ? (
          <>
            <Section detail={contacts.length ? `${contacts.length} contact${contacts.length > 1 ? 's' : ''} enregistré${contacts.length > 1 ? 's' : ''}` : 'Aucun contact enregistré'} icone="users" ouverte={sectionOuverte === 'contacts'} titre="Contacts d'urgence" valeur="" onPress={() => basculerSection('contacts')}>
              <FormulaireContact actionEnCours={actionEnCours} ajouterContact={ajouterContact} idContact={idContact} nomContact={nomContact} setIdContact={setIdContact} setNomContact={setNomContact} />
              {contacts.length ? contacts.map((contact) => (
                <InfoCarte key={contact.id} action="Supprimer" libelle={capitaliser(contact.nom || 'Contact WalkZen')} onAction={() => void supprimerContact(contact.id)} valeur={contact.identifiantWalkZen || 'ID WalkZen manquant'} />
              )) : <Text style={styles.message}>Aucun contact enregistré.</Text>}
            </Section>
            <Section detail="Trajets, pas, signalements et validations" icone="bar-chart-2" ouverte={sectionOuverte === 'stats'} titre="Statistiques" valeur="" onPress={() => basculerSection('stats')}>
              <View style={styles.grilleStats}>
                <InfoCarte libelle="Trajets" valeur="0" />
                <InfoCarte libelle="Zones évitées" valeur="0" />
                <InfoCarte libelle="Validations" valeur="0" />
                <InfoCarte libelle="Signalements" valeur={String(signalementsCrees(notifications))} />
                <InfoCarte libelle="Pas" valeur="0" />
              </View>
              <BoutonAction disabled={actionEnCours} libelle="Réinitialiser les statistiques" onPress={() => undefined} />
            </Section>
            <Section detail={favoris.length ? `${favoris.length} lieu${favoris.length > 1 ? 'x' : ''} favori${favoris.length > 1 ? 's' : ''}` : 'Aucun favori enregistré'} icone="star" ouverte={sectionOuverte === 'favoris'} titre="Favoris" valeur="" onPress={() => basculerSection('favoris')}>
              <FormulaireFavori actionEnCours={actionEnCours} adresse={adresseFavori} ajouterFavori={ajouterFavori} libelle={libelleFavori} setAdresse={setAdresseFavori} setLibelle={setLibelleFavori} />
              {favoris.length ? favoris.map((favori) => (
                <InfoCarte key={favori.id} action="Supprimer" libelle={capitaliser(favori.libelle)} onAction={() => void supprimerFavori(favori.id)} valeur={favori.adresse} />
              )) : <Text style={styles.message}>Aucun favori enregistré.</Text>}
            </Section>
          </>
        ) : null}

        <Section detail={historique.length ? `${historique.length} recherche${historique.length > 1 ? 's' : ''} enregistrée${historique.length > 1 ? 's' : ''}` : 'Aucune recherche enregistrée'} icone="clock" ouverte={sectionOuverte === 'historique'} titre="Historique" valeur="" onPress={() => basculerSection('historique')}>
          {historique.length ? historique.map((item) => (
            <InfoCarte key={item.id} action="Supprimer" libelle={item.usage} onAction={() => void supprimerHistorique(item.id)} valeur={item.libelle} />
          )) : <Text style={styles.message}>Aucune recherche enregistrée.</Text>}
        </Section>

        <Section detail="Langue, notifications, affichage carte et zoom automatique" icone="settings" ouverte={sectionOuverte === 'reglages'} titre="Réglages" valeur="" onPress={() => basculerSection('reglages')}>
          <ReglagesWalkZen />
        </Section>
        <Section detail="Version, build et informations" icone="info" ouverte={sectionOuverte === 'apropos'} titre="À propos" valeur="" onPress={() => basculerSection('apropos')}>
          <InfoCarte libelle="Version" valeur="0.1.0" />
          <InfoCarte libelle="Build" valeur="1" />
          <Text style={styles.message}>L'app aide à choisir des trajets piétons plus sereins avec carte, signalements et guidage.</Text>
        </Section>
        {connecte ? <BoutonAction danger disabled={actionEnCours} libelle="Se déconnecter" onPress={() => void deconnecter()} /> : null}
      </ScrollView>
    </View>
  );
}

function EnteteProfil({ fermer, profil }: { fermer: () => void; profil: ProfilUtilisateur | null }) {
  return (
    <View style={styles.entete}>
      <View style={styles.avatar}><Text style={styles.avatarTexte}>WZ</Text></View>
      <View style={styles.enteteTexte}>
        <Text numberOfLines={1} style={styles.titre}>{profil?.nomComplet || profil?.email || 'WalkZen'}</Text>
        <Text numberOfLines={1} style={styles.sousTitre}>{profil?.identifiantWalkZen ?? 'Vos trajets à pied, plus sereins'}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={fermer} style={styles.fermer}><Text style={styles.boutonTexte}>X</Text></Pressable>
    </View>
  );
}

function ReglagesWalkZen() {
  return (
    <View style={styles.formulaire}>
      <InfoCarte libelle="Langue" valeur="Français" />
      <View style={styles.ligneBoutons}><LigneReglage libelle="Français" actif /><LigneReglage libelle="Anglais" /></View>
      <LigneReglage libelle="Notifications" valeur="Signalements autour de vous, alertes communautaires et infos non critiques" actif />
      <LigneReglage libelle="Alertes SOS de mes contacts de confiance" valeur="Recevoir les alertes SOS de vos contacts de confiance, même lorsque l’application est fermée." />
      <LigneReglage libelle="Instructions à l’écran" valeur="Indications textuelles pendant un trajet" actif />
      <InfoCarte libelle="Affichage des contrôles carte" valeur="Boutons flottants situés à droite de la carte" />
      <LigneReglage libelle="Bouton 2D / 3D" valeur="Afficher ou masquer le bouton permettant de basculer entre le mode 2D et le mode 3D." actif />
      <LigneReglage libelle="Feuille de route" actif />
      <LigneReglage libelle="Navigation vocale" actif />
      <LigneReglage libelle="Vue satellite" />
      <LigneReglage libelle="Carte vectorielle" valeur="Utiliser la carte claire vectorielle MapTiler au lieu du raster OSM." />
      <InfoCarte libelle="Zoom automatique" valeur="Niveau actuel : 16" />
      <View style={styles.ligneBoutons}><BoutonAction libelle="-" onPress={() => undefined} /><InfoCarte libelle="niveau de zoom GPS" valeur="16" /><BoutonAction libelle="+" onPress={() => undefined} /></View>
      <BoutonAction libelle="Réinitialiser le zoom" onPress={() => undefined} />
    </View>
  );
}

function LigneReglage({ actif, libelle, valeur }: { actif?: boolean; libelle: string; valeur?: string }) {
  return (
    <View style={styles.infoCarte}>
      <View style={styles.infoEntete}>
        <View style={styles.enteteTexte}>
          <Text style={styles.infoValeur}>{libelle}</Text>
          {valeur ? <Text style={styles.infoLibelle}>{valeur}</Text> : null}
        </View>
        <View
          style={{
            alignItems: actif ? 'flex-end' : 'flex-start',
            backgroundColor: actif ? '#16a6c9' : 'rgba(148,163,184,0.45)',
            borderRadius: 13,
            height: 26,
            justifyContent: 'center',
            paddingHorizontal: 3,
            width: 46,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              height: 20,
              width: 20,
            }}
          />
        </View>
      </View>
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
  const [modeAuth, setModeAuth] = useState<'connexion' | 'inscription'>('connexion');
  const inscription = modeAuth === 'inscription';
  return (
    <View style={styles.formulaire}>
      <View style={styles.modeSwitch}>
        <Pressable accessibilityRole="button" onPress={() => setModeAuth('connexion')} style={[styles.modeButton, !inscription && styles.modeButtonActive]}><Text style={[styles.modeButtonText, !inscription && styles.modeButtonTextActive]}>Connexion</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setModeAuth('inscription')} style={[styles.modeButton, inscription && styles.modeButtonActive]}><Text style={[styles.modeButtonText, inscription && styles.modeButtonTextActive]}>Inscription</Text></Pressable>
      </View>
      {inscription ? <TextInput autoCapitalize="words" onChangeText={setNom} placeholder="Nom complet" placeholderTextColor="#647782" style={styles.champ} value={nom} /> : null}
      <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" placeholderTextColor="#647782" style={styles.champ} value={email} />
      <TextInput onChangeText={setMotDePasse} placeholder="Mot de passe" placeholderTextColor="#647782" secureTextEntry style={styles.champ} value={motDePasse} />
      <BoutonAction disabled={actionEnCours} libelle={inscription ? 'Créer le compte' : 'Se connecter'} onPress={() => void (inscription ? inscrire(nom, email, motDePasse) : connecter(email, motDePasse))} />
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
      <TextInput onChangeText={setNomContact} placeholder="Nom du contact" placeholderTextColor="#647782" style={styles.champ} value={nomContact} />
      <View style={styles.ligneBoutons}>
        <TextInput autoCapitalize="characters" onChangeText={setIdContact} placeholder="ID WalkZen" placeholderTextColor="#647782" style={[styles.champ, styles.champFlexible]} value={idContact} />
        <BoutonAction disabled={actionEnCours || !idContact.trim()} libelle="Ajouter" onPress={() => void ajouterContact(nomContact, idContact)} />
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
  ajouterFavori: (libelle: string, adresse: string, type: 'depart' | 'destination') => Promise<void>;
  libelle: string;
  setAdresse: (valeur: string) => void;
  setLibelle: (valeur: string) => void;
}) {
  return (
    <View style={styles.formulaire}>
      <TextInput onChangeText={setLibelle} placeholder="Nom du lieu" placeholderTextColor="#647782" style={styles.champ} value={libelle} />
      <View style={styles.ligneBoutons}>
        <TextInput onChangeText={setAdresse} placeholder="Adresse" placeholderTextColor="#647782" style={[styles.champ, styles.champFlexible]} value={adresse} />
        <BoutonAction disabled={actionEnCours || !libelle.trim() || !adresse.trim()} libelle="Ajouter" onPress={() => void ajouterFavori(libelle, adresse, 'destination')} />
      </View>
    </View>
  );
}

function capitaliser(valeur: string) {
  return valeur ? valeur.charAt(0).toUpperCase() + valeur.slice(1) : valeur;
}

function signalementsCrees(notifications: NotificationUtilisateur[]) {
  return notifications.filter((notification) => notification.type === 'report').length;
}
