import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { NiveauDangerSignalement, Signalement } from '../types/Signalement';

const CATEGORIES: Array<{
  libelle: string;
  niveau: NiveauDangerSignalement;
  icone: keyof typeof Feather.glyphMap;
}> = [
  { libelle: 'Rue mal éclairée', niveau: 'modere', icone: 'moon' },
  { libelle: 'Harcèlement', niveau: 'eleve', icone: 'alert-triangle' },
  { libelle: 'Travaux', niveau: 'faible', icone: 'tool' },
  { libelle: 'Zone à éviter', niveau: 'eleve', icone: 'slash' },
];

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
  signaler: (
    niveau: NiveauDangerSignalement,
    libelle: string,
    details?: string,
  ) => void;
}) {
  const [categorie, setCategorie] = useState(CATEGORIES[0]);
  const [details, setDetails] = useState('');

  return (
    <View style={styles.panneau}>
      <Entete fermer={fermer} titre="Signaler un danger" />
      <Text style={styles.description}>
        Choisissez une catégorie WalkZen. Le signalement sera placé sur votre position GPS.
      </Text>
      <View style={styles.grille}>
        {CATEGORIES.map((item) => {
          const actif = item.libelle === categorie.libelle;
          return (
            <Pressable
              accessibilityRole="button"
              key={item.libelle}
              onPress={() => setCategorie(item)}
              style={[styles.categorie, actif && styles.categorieActive]}
            >
              <Feather color={actif ? '#FFFFFF' : '#EF4444'} name={item.icone} size={18} />
              <Text style={[styles.texteCategorie, actif && styles.texteActif]}>
                {item.libelle}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        multiline
        onChangeText={setDetails}
        placeholder="Description optionnelle"
        placeholderTextColor="#657783"
        style={styles.descriptionInput}
        value={details}
      />
      <Pressable
        accessibilityRole="button"
        disabled={creationEnCours}
        onPress={() => signaler(categorie.niveau, categorie.libelle, details)}
        style={[styles.boutonPrincipal, creationEnCours && styles.inactif]}
      >
        <Text style={styles.texteBouton}>
          {creationEnCours ? 'Envoi...' : 'Envoyer le signalement'}
        </Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Text style={styles.sectionTitre}>Signalements autour de vous</Text>
      {signalements.slice(0, 4).map((signalement) => (
        <View key={signalement.id} style={styles.ligne}>
          <View style={styles.ligneTexte}>
            <Text style={styles.ligneTitre}>{signalement.libelle}</Text>
            <Text style={styles.ligneDetail}>
              {signalement.niveauDanger} • {signalement.validations} validation(s)
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => confirmerSignalement(signalement)}
            style={styles.boutonSecondaire}
          >
            <Text style={styles.texteSecondaire}>Valider</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function Entete({ fermer, titre }: { fermer: () => void; titre: string }) {
  return (
    <View style={styles.entete}>
      <Text style={styles.titre}>{titre}</Text>
      <Pressable accessibilityRole="button" onPress={fermer} style={styles.fermer}>
        <Feather color="#FFFFFF" name="x" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  boutonPrincipal: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 22,
    minHeight: 44,
    justifyContent: 'center',
  },
  boutonSecondaire: {
    backgroundColor: 'rgba(22,166,201,0.14)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categorie: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '48%',
    gap: 6,
    minHeight: 70,
    justifyContent: 'center',
    padding: 9,
  },
  categorieActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  description: {
    color: '#657783',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  descriptionInput: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 18,
    borderWidth: 1,
    color: '#1F2D38',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    minHeight: 78,
    padding: 12,
    textAlignVertical: 'top',
  },
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: '#ff5a4f',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inactif: {
    opacity: 0.56,
  },
  ligne: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 11,
  },
  ligneDetail: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
  },
  ligneTexte: {
    flex: 1,
  },
  ligneTitre: {
    color: '#1F2D38',
    fontSize: 14,
    fontWeight: '900',
  },
  message: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
  },
  panneau: {
    backgroundColor: 'rgba(247,249,250,0.98)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 10,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  sectionTitre: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  texteActif: {
    color: '#FFFFFF',
  },
  texteBouton: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  texteCategorie: {
    color: '#1F2D38',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  texteSecondaire: {
    color: '#16a6c9',
    fontSize: 12,
    fontWeight: '900',
  },
  titre: {
    color: '#1F2D38',
    fontSize: 17,
    fontWeight: '900',
  },
});
