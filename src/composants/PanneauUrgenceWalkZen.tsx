import { Feather } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Entete } from './PanneauSignalementWalkZen';
import type { AlerteSos } from '../services/ServiceSos';

export function PanneauUrgenceWalkZen({
  alerteActive,
  annulerSos,
  chargement,
  confirmationVisible,
  demanderSos,
  envoyerSos,
  fermer,
  fermerConfirmation,
  message,
}: {
  alerteActive: AlerteSos | null;
  annulerSos: () => void;
  chargement: boolean;
  confirmationVisible: boolean;
  demanderSos: () => void;
  envoyerSos: () => void;
  fermer: () => void;
  fermerConfirmation: () => void;
  message: string | null;
}) {
  return (
    <View style={styles.panneau}>
      <Entete fermer={fermer} titre="Urgence" />
      <View style={styles.sosCarte}>
        <View style={[styles.sosIcone, alerteActive && styles.sosActif]}>
          <Text style={styles.sosTexte}>SOS</Text>
        </View>
        <View style={styles.sosCopie}>
          <Text style={styles.titre}>Alerte SOS WalkZen</Text>
          <Text style={styles.detail}>
            {alerteActive
              ? 'Alerte active envoyée à vos contacts.'
              : 'Prévenez vos contacts de confiance avec votre position GPS.'}
          </Text>
        </View>
      </View>
      {confirmationVisible ? (
        <View style={styles.confirmation}>
          <Text style={styles.detail}>Confirmer l’envoi de votre position à vos contacts ?</Text>
          <View style={styles.actions}>
            <Bouton libelle="Annuler" onPress={fermerConfirmation} secondaire />
            <Bouton disabled={chargement} libelle="Envoyer SOS" onPress={envoyerSos} />
          </View>
        </View>
      ) : (
        <Bouton
          disabled={chargement}
          libelle={alerteActive ? 'Annuler le SOS' : 'Déclencher SOS'}
          onPress={alerteActive ? annulerSos : demanderSos}
        />
      )}
      <NumeroUrgence libelle="Police" numero="17" />
      <NumeroUrgence libelle="Pompiers" numero="18" />
      <NumeroUrgence libelle="Urgence européenne" numero="112" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

function NumeroUrgence({ libelle, numero }: { libelle: string; numero: string }) {
  return (
    <View style={styles.numero}>
      <View style={styles.numeroTexte}>
        <Text style={styles.titre}>{libelle}</Text>
        <Text style={styles.detail}>Numéro d’urgence</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => void Linking.openURL(`tel:${numero}`)}
        style={styles.appel}
      >
        <Feather color="#FFFFFF" name="phone-call" size={16} />
        <Text style={styles.appelTexte}>{numero}</Text>
      </Pressable>
    </View>
  );
}

function Bouton({
  disabled,
  libelle,
  onPress,
  secondaire,
}: {
  disabled?: boolean;
  libelle: string;
  onPress: () => void;
  secondaire?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.bouton, secondaire && styles.boutonSecondaire, disabled && styles.inactif]}
    >
      <Text style={[styles.boutonTexte, secondaire && styles.boutonTexteSecondaire]}>
        {libelle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  appel: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 19,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  appelTexte: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  bouton: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 22,
    minHeight: 44,
    justifyContent: 'center',
  },
  boutonSecondaire: { backgroundColor: '#EAF1F4', borderColor: '#C8D8E0', borderWidth: 1 },
  boutonTexte: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  boutonTexteSecondaire: { color: '#1F2D38' },
  confirmation: { gap: 8 },
  detail: { color: '#657783', fontSize: 12, fontWeight: '800', lineHeight: 17 },
  inactif: { opacity: 0.56 },
  message: { color: '#657783', fontSize: 12, fontWeight: '800' },
  numero: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 11,
  },
  numeroTexte: { flex: 1 },
  panneau: {
    backgroundColor: 'rgba(247,249,250,0.98)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 10,
    padding: 14,
  },
  sosActif: { backgroundColor: '#ff5a4f' },
  sosCarte: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  sosCopie: { flex: 1 },
  sosIcone: {
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  sosTexte: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  titre: { color: '#1F2D38', fontSize: 15, fontWeight: '900' },
});
