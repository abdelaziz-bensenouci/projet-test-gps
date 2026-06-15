import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        Choisissez un contact de confiance WalkZen pour lui envoyer un suivi live.
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
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexte}>
                    {(contact.nom || contact.identifiantWalkZen || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
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
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarTexte: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
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
  boutonStop: { backgroundColor: '#EF4444' },
  boutonTexte: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  contact: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 22,
    borderWidth: 2,
    gap: 8,
    minHeight: 120,
    padding: 10,
    position: 'relative',
    width: 96,
  },
  contactActif: { borderColor: '#16a6c9' },
  contactNom: { color: '#1F2D38', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  contacts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  description: { color: '#657783', fontSize: 13, fontWeight: '800', lineHeight: 18 },
  inactif: { opacity: 0.56 },
  message: { color: '#657783', fontSize: 12, fontWeight: '800', lineHeight: 17 },
  panneau: {
    backgroundColor: 'rgba(247,249,250,0.98)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 10,
    padding: 14,
  },
});
