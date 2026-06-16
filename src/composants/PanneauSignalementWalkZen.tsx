import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChevronRight, CircleAlert, LocateFixed, MapPin, X } from 'lucide-react-native';

import type { NiveauDangerSignalement, Signalement } from '../types/Signalement';

const COULEURS = {
  brand: '#16a6c9',
  danger: '#ff5a4f',
  ink: '#13252b',
  line: '#d9e9ee',
  muted: '#647782',
  panel: '#ffffff',
  panelSoft: '#f2f8fa',
};

const TYPES_SIGNALEMENT = [
  { libelle: 'Rue mal éclairée', niveau: 'modere' },
  { libelle: 'Harcèlement', niveau: 'eleve' },
  { libelle: 'Travaux', niveau: 'faible' },
  { libelle: 'Zone à éviter', niveau: 'eleve' },
] satisfies Array<{ libelle: string; niveau: NiveauDangerSignalement }>;

type ModeLocalisation = 'current' | 'nearby' | 'address';

export function PanneauSignalementWalkZen({
  creationEnCours,
  fermer,
  message,
  signalements,
  confirmerSignalement,
  signaler,
}: {
  creationEnCours: boolean;
  fermer: () => void;
  message: string | null;
  signalements: Signalement[];
  confirmerSignalement: (signalement: Signalement) => void;
  signaler: (niveau: NiveauDangerSignalement, libelle: string, details?: string) => void;
}) {
  const [modeLocalisation, setModeLocalisation] = useState<ModeLocalisation>('current');
  const [adresse, setAdresse] = useState('');
  const [distance, setDistance] = useState('200');

  return (
    <View style={styles.panneau}>
      <Entete fermer={fermer} titre="Signaler un danger" />
      <Text style={styles.description}>Choisissez un type de signalement.</Text>
      <View style={styles.locationBlock}>
        <Text style={styles.locationLabel}>Localisation</Text>
        <View style={styles.segmented}>
          {[
            { value: 'current' as const, label: 'Ma position', Icon: LocateFixed },
            { value: 'nearby' as const, label: 'À proximité', Icon: CircleAlert },
            { value: 'address' as const, label: 'Adresse', Icon: MapPin },
          ].map(({ value, label, Icon }) => {
            const actif = modeLocalisation === value;
            return (
              <Pressable
                accessibilityRole="button"
                key={value}
                onPress={() => setModeLocalisation(value)}
                style={[styles.segmentButton, actif && styles.segmentButtonActive]}
              >
                <Icon color={actif ? '#fff' : COULEURS.muted} size={15} />
                <Text style={[styles.segmentText, { color: actif ? '#fff' : COULEURS.ink }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {modeLocalisation === 'nearby' ? (
          <View style={styles.distanceRow}>
            <Text style={styles.distanceLabel}>Distance</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={setDistance}
              placeholder="200"
              placeholderTextColor={COULEURS.muted}
              style={styles.distanceInput}
              value={distance}
            />
            <Text style={styles.distanceUnit}>m</Text>
          </View>
        ) : null}
        {modeLocalisation === 'address' ? (
          <View style={styles.addressInputRow}>
            <TextInput
              onChangeText={setAdresse}
              placeholder="Adresse du danger"
              placeholderTextColor={COULEURS.muted}
              style={styles.addressInput}
              value={adresse}
            />
            {adresse.length > 0 ? (
              <Pressable
                accessibilityLabel="Effacer l'adresse du signalement"
                accessibilityRole="button"
                onPress={() => setAdresse('')}
                style={styles.clearButton}
              >
                <X color="#fff" size={15} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      {creationEnCours ? (
        <View style={styles.reportSubmittingBanner}>
          <ActivityIndicator color={COULEURS.brand} size="small" />
          <Text style={styles.reportSubmittingText}>Envoi du signalement...</Text>
        </View>
      ) : null}
      {TYPES_SIGNALEMENT.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: creationEnCours }}
          disabled={creationEnCours}
          key={item.libelle}
          onPress={() => signaler(item.niveau, item.libelle, adresse || undefined)}
          style={[styles.row, creationEnCours && styles.rowDisabled]}
        >
          <CircleAlert color={COULEURS.danger} size={18} />
          <Text style={styles.rowText}>{item.libelle}</Text>
          {creationEnCours ? (
            <ActivityIndicator color={COULEURS.brand} size="small" />
          ) : (
            <ChevronRight color={COULEURS.muted} size={17} />
          )}
        </Pressable>
      ))}
      {message ? <Text style={styles.description}>{message}</Text> : null}
      {signalements.slice(0, 4).map((signalement) => (
        <Pressable
          accessibilityRole="button"
          key={signalement.id}
          onPress={() => confirmerSignalement(signalement)}
          style={styles.row}
        >
          <CircleAlert color={COULEURS.brand} size={18} />
          <View style={styles.signalementTexte}>
            <Text style={styles.rowText}>{signalement.libelle}</Text>
            <Text style={styles.meta}>{signalement.niveauDanger} · {signalement.validations} validation(s)</Text>
          </View>
          <Text style={styles.valider}>Valider</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Entete({ fermer, titre }: { fermer: () => void; titre: string }) {
  return (
    <View style={styles.entete}>
      <Text style={styles.title}>{titre}</Text>
      <Pressable accessibilityRole="button" onPress={fermer} style={styles.fermer}>
        <X color="#FFFFFF" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addressInput: { color: COULEURS.ink, flex: 1, fontSize: 15, fontWeight: '800', minHeight: 44, minWidth: 0, padding: 0 },
  addressInputRow: { alignItems: 'center', backgroundColor: COULEURS.panelSoft, borderColor: COULEURS.line, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 12 },
  clearButton: { alignItems: 'center', backgroundColor: COULEURS.danger, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  description: { color: COULEURS.muted, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  distanceInput: { color: COULEURS.ink, fontSize: 16, fontWeight: '900', textAlign: 'right', width: 70 },
  distanceLabel: { color: COULEURS.muted, flex: 1, fontSize: 13, fontWeight: '800' },
  distanceRow: { alignItems: 'center', backgroundColor: COULEURS.panelSoft, borderColor: COULEURS.line, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 12 },
  distanceUnit: { color: COULEURS.muted, fontSize: 13, fontWeight: '900' },
  entete: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  fermer: { alignItems: 'center', backgroundColor: COULEURS.danger, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  locationBlock: { gap: 8 },
  locationLabel: { color: COULEURS.muted, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  meta: { color: COULEURS.muted, fontSize: 12, fontWeight: '700', lineHeight: 16 },
  panneau: { backgroundColor: COULEURS.panel, borderColor: COULEURS.line, borderRadius: 24, borderWidth: 1, elevation: 30, gap: 10, padding: 14 },
  reportSubmittingBanner: { alignItems: 'center', backgroundColor: COULEURS.panelSoft, borderColor: COULEURS.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 44, paddingHorizontal: 12 },
  reportSubmittingText: { color: COULEURS.ink, flex: 1, fontSize: 13, fontWeight: '900' },
  row: { alignItems: 'center', backgroundColor: COULEURS.panelSoft, borderRadius: 18, flexDirection: 'row', gap: 10, minHeight: 48, paddingHorizontal: 12 },
  rowDisabled: { opacity: 0.52 },
  rowText: { color: COULEURS.ink, flex: 1, fontWeight: '800' },
  segmented: { backgroundColor: COULEURS.panelSoft, borderColor: COULEURS.line, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 4, minHeight: 48, padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: 14, flex: 1, gap: 4, justifyContent: 'center', minHeight: 40, paddingHorizontal: 4 },
  segmentButtonActive: { backgroundColor: COULEURS.brand },
  segmentText: { fontSize: 10, fontWeight: '900', textAlign: 'center' },
  signalementTexte: { flex: 1 },
  title: { color: COULEURS.ink, fontSize: 17, fontWeight: '900' },
  valider: { color: COULEURS.brand, fontSize: 12, fontWeight: '900' },
});
