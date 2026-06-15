import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import type {
  ContactConfiance,
  HistoriqueAdresse,
  LieuFavori,
  NotificationUtilisateur,
  ProfilUtilisateur,
} from '../types/ProfilUtilisateur';

type SectionProfil = 'compte' | 'contacts' | 'favoris' | 'historique' | 'notifications' | 'reglages';

type ProprietesPanneauProfilWalkZen = {
  chargement: boolean;
  contacts: ContactConfiance[];
  erreur: string | null;
  favoris: LieuFavori[];
  fermer: () => void;
  historique: HistoriqueAdresse[];
  notifications: NotificationUtilisateur[];
  profil: ProfilUtilisateur | null;
};

export function PanneauProfilWalkZen({
  chargement,
  contacts,
  erreur,
  favoris,
  fermer,
  historique,
  notifications,
  profil,
}: ProprietesPanneauProfilWalkZen) {
  const [sectionOuverte, setSectionOuverte] = useState<SectionProfil>('compte');
  const connecte = Boolean(profil);

  const basculerSection = (section: SectionProfil) => {
    setSectionOuverte((actuelle) => (actuelle === section ? 'compte' : section));
  };

  return (
    <View style={styles.panneau}>
      <View style={styles.entete}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>WZ</Text>
        </View>
        <View style={styles.enteteTexte}>
          <Text numberOfLines={1} style={styles.titre}>
            {profil?.nomComplet || profil?.email || 'WalkZen'}
          </Text>
          <Text numberOfLines={1} style={styles.sousTitre}>
            {profil?.identifiantWalkZen ?? 'Vos trajets à pied, plus sereins'}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={fermer} style={styles.fermer}>
          <Feather color="#FFFFFF" name="x" size={18} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenu}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {chargement ? <Text style={styles.message}>Chargement du profil...</Text> : null}
        {erreur ? <Text style={styles.messageErreur}>{erreur}</Text> : null}

        <Section
          detail={connecte ? profil?.email || 'Compte WalkZen' : 'Connexion requise pour synchroniser vos données'}
          icone="user"
          ouverte={sectionOuverte === 'compte'}
          titre="Compte"
          valeur={connecte ? 'Connecté' : 'Invité'}
          onPress={() => basculerSection('compte')}
        >
          <InfoCarte libelle="Identifiant WalkZen" valeur={profil?.identifiantWalkZen ?? 'Non connecté'} />
          <InfoCarte libelle="Email" valeur={profil?.email ?? 'Aucune session active'} />
          {!connecte ? (
            <Text style={styles.message}>
              Le menu WalkZen3 est prêt. Le formulaire complet connexion/inscription sera branché dans le lot auth avancé.
            </Text>
          ) : null}
        </Section>

        <Section
          detail={contacts.length ? 'Contacts synchronisés Supabase' : 'Aucun contact enregistré'}
          icone="users"
          ouverte={sectionOuverte === 'contacts'}
          titre="Contacts de confiance"
          valeur={String(contacts.length)}
          onPress={() => basculerSection('contacts')}
        >
          {contacts.length ? (
            contacts.map((contact) => (
              <InfoCarte
                key={contact.id}
                libelle={contact.nom || 'Contact WalkZen'}
                valeur={contact.identifiantWalkZen || contact.email || contact.telephone || 'Contact'}
              />
            ))
          ) : (
            <Text style={styles.message}>Ajoutez vos contacts de confiance depuis votre profil WalkZen.</Text>
          )}
        </Section>

        <Section
          detail={favoris.length ? 'Lieux disponibles dans le panneau trajet' : 'Aucun favori enregistré'}
          icone="heart"
          ouverte={sectionOuverte === 'favoris'}
          titre="Lieux favoris"
          valeur={String(favoris.length)}
          onPress={() => basculerSection('favoris')}
        >
          {favoris.length ? (
            favoris.map((favori) => (
              <InfoCarte key={favori.id} libelle={favori.libelle} valeur={favori.adresse} />
            ))
          ) : (
            <Text style={styles.message}>Les favoris WalkZen3 remplaceront automatiquement les raccourcis statiques.</Text>
          )}
        </Section>

        <Section
          detail={historique.length ? 'Dernières adresses utilisées' : 'Historique vide'}
          icone="clock"
          ouverte={sectionOuverte === 'historique'}
          titre="Historique"
          valeur={String(historique.length)}
          onPress={() => basculerSection('historique')}
        >
          {historique.length ? (
            historique.map((item) => (
              <InfoCarte key={item.id} libelle={item.usage} valeur={item.libelle} />
            ))
          ) : (
            <Text style={styles.message}>Les recherches sélectionnées seront listées ici.</Text>
          )}
        </Section>

        <Section
          detail={notifications.length ? 'Notifications récentes' : 'Aucune notification'}
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
                libelle={notification.titre || 'Notification'}
                valeur={notification.corps}
              />
            ))
          ) : (
            <Text style={styles.message}>Aucune notification pour le moment.</Text>
          )}
        </Section>

        <Section
          detail="Notifications, affichage carte et préférences"
          icone="settings"
          ouverte={sectionOuverte === 'reglages'}
          titre="Réglages"
          valeur=""
          onPress={() => basculerSection('reglages')}
        >
          <InfoCarte libelle="Notifications" valeur="Signalements, SOS et partage live" />
          <InfoCarte libelle="Affichage carte" valeur="Contrôles et zoom automatique" />
          <Text style={styles.message}>
            Les interrupteurs WalkZen3 complets seront branchés avec les paramètres avancés.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  children,
  detail,
  icone,
  ouverte,
  titre,
  valeur,
  onPress,
}: {
  children: ReactNode;
  detail: string;
  icone: keyof typeof Feather.glyphMap;
  ouverte: boolean;
  titre: string;
  valeur: string;
  onPress: () => void;
}) {
  return (
    <View style={[styles.section, ouverte && styles.sectionOuverte]}>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.enteteSection}>
        <View style={styles.iconeSection}>
          <Feather color="#16a6c9" name={icone} size={18} />
        </View>
        <View style={styles.texteSection}>
          <Text style={styles.titreSection}>{titre}</Text>
          <Text style={styles.detailSection}>{detail}</Text>
        </View>
        {valeur ? <Text style={styles.valeurSection}>{valeur}</Text> : null}
        <Feather color="#1F2D38" name={ouverte ? 'chevron-up' : 'chevron-down'} size={18} />
      </Pressable>
      {ouverte ? <View style={styles.corpsSection}>{children}</View> : null}
    </View>
  );
}

function InfoCarte({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <View style={styles.infoCarte}>
      <Text style={styles.infoLibelle}>{libelle}</Text>
      <Text numberOfLines={2} style={styles.infoValeur}>
        {valeur || 'Non renseigné'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarTexte: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  contenu: {
    gap: 10,
    paddingBottom: 6,
  },
  corpsSection: {
    gap: 8,
    padding: 8,
    paddingTop: 0,
  },
  detailSection: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  enteteSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  enteteTexte: {
    flex: 1,
    minWidth: 0,
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: '#ff5a4f',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  iconeSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(22,166,201,0.12)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoCarte: {
    backgroundColor: '#F7F9FA',
    borderColor: '#D4E1E7',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 11,
  },
  infoLibelle: {
    color: '#1F2D38',
    fontSize: 13,
    fontWeight: '900',
  },
  infoValeur: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  message: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  messageErreur: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },
  panneau: {
    backgroundColor: 'rgba(247,249,250,0.98)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 12,
    maxHeight: 560,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  section: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionOuverte: {
    borderColor: '#16a6c9',
  },
  sousTitre: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  texteSection: {
    flex: 1,
    minWidth: 0,
  },
  titre: {
    color: '#1F2D38',
    fontSize: 18,
    fontWeight: '900',
  },
  titreSection: {
    color: '#1F2D38',
    fontSize: 15,
    fontWeight: '900',
  },
  valeurSection: {
    color: '#16a6c9',
    fontSize: 15,
    fontWeight: '900',
  },
});
