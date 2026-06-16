import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Entete } from './PanneauSignalementWalkZen';
import type { PartageLive } from '../services/ServicePartageLive';
import type { ContactConfiance } from '../types/ProfilUtilisateur';

export function PanneauPartageWalkZen({
  arreterPartage,
  chargement,
  contactSelectionneId,
  contacts,
  demarrerPartage,
  fermer,
  message,
  partageActif,
  selectionnerContact,
}: {
  arreterPartage: () => void;
  chargement: boolean;
  contactSelectionneId: string;
  contacts: ContactConfiance[];
  demarrerPartage: () => void;
  fermer: () => void;
  message: string | null;
  partageActif: PartageLive | null;
  selectionnerContact: (id: string) => void;
}) {
  return (
    <View style={styles.panneau}>
      <Entete fermer={fermer} titre="Partager ma position" />
      <Text style={styles.description}>
        Choisissez un contact de confiance pour lui envoyer un suivi en direct de 30 minutes.
      </Text>
      {contacts.length ? (
        <View style={styles.contacts}>
          {contacts.map((contact) => {
            const actif = contact.id === contactSelectionneId;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: actif }}
                key={contact.id}
                onPress={() => selectionnerContact(contact.id)}
                style={[styles.contact, actif && styles.contactActif]}
              >
                {contact.avatarUrl ? (
                  <Image source={{ uri: contact.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarTexte}>
                      {(contact.nom || contact.identifiantWalkZen || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.contactNom}>{contact.nom || contact.identifiantWalkZen}</Text>
                {actif ? <View style={styles.badgeSelection} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={styles.message}>Ajoutez d’abord un contact de confiance dans le profil.</Text>
      )}
      <Pressable
        accessibilityRole="button"
        disabled={chargement}
        onPress={partageActif ? arreterPartage : demarrerPartage}
        style={[styles.bouton, partageActif && styles.boutonStop, chargement && styles.inactif]}
      >
        <Text style={styles.boutonTexte}>
          {partageActif ? 'Arrêter le partage' : 'Partager 30 min'}
        </Text>
      </Pressable>
      {partageActif ? (
        <Text style={styles.message}>
          Partage actif jusqu’à {new Date(partageActif.expireLe).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
        </Text>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 29,
    height: 58,
    justifyContent: 'center',
    marginBottom: 8,
    width: 58,
  },
  avatarImage: {
    borderRadius: 29,
    height: 58,
    marginBottom: 8,
    width: 58,
  },
  avatarTexte: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  badgeSelection: {
    backgroundColor: '#22C55E',
    borderColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 16,
  },
  bouton: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 22,
    minHeight: 44,
    justifyContent: 'center',
  },
  boutonStop: { backgroundColor: '#ff5a4f' },
  boutonTexte: { color: '#FFFFFF', fontWeight: '900' },
  contact: {
    alignItems: 'center',
    backgroundColor: '#f2f8fa',
    borderColor: '#d9e9ee',
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 124,
    padding: 10,
    position: 'relative',
    width: 96,
  },
  contactActif: { borderColor: '#16a6c9' },
  contactNom: { color: '#13252b', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  contacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  description: { color: '#647782', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  inactif: { opacity: 0.52 },
  message: { color: '#647782', fontSize: 12, fontWeight: '700', lineHeight: 16 },
  panneau: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e9ee',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 10,
    padding: 14,
  },
});
