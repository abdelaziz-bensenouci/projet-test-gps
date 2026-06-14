import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ONGLETS = ['Trajet', 'Signaler', 'Partage', 'Urgence'] as const;
const COULEUR_TEXTE = '#647782';
const TAILLE_ICONE = 21;

type ProprietesBarreOnglets = {
  ouvrirPanneauTrajet: () => void;
};

export function BarreOnglets({ ouvrirPanneauTrajet }: ProprietesBarreOnglets) {
  return (
    <View style={styles.barre}>
      <View pointerEvents="none" style={styles.degradeBleu} />
      <View pointerEvents="none" style={styles.degradeBlanc} />
      <View style={styles.contenuBarre}>
        <Onglet libelle="Trajet" onPress={ouvrirPanneauTrajet} />
        <Onglet libelle="Signaler" />
        <Pressable accessibilityRole="button" style={styles.sos}>
          <Text style={styles.texteSos}>SOS</Text>
        </Pressable>
        {ONGLETS.slice(2).map((onglet) => (
          <Onglet key={onglet} libelle={onglet} />
        ))}
      </View>
    </View>
  );
}

function Onglet({
  libelle,
  onPress,
}: {
  libelle: (typeof ONGLETS)[number];
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.onglet}>
      {libelle === 'Trajet' ? (
        <Feather color={COULEUR_TEXTE} name="navigation" size={TAILLE_ICONE} />
      ) : null}
      {libelle === 'Signaler' ? (
        <Feather color={COULEUR_TEXTE} name="map-pin" size={TAILLE_ICONE} />
      ) : null}
      {libelle === 'Partage' ? (
        <Feather color={COULEUR_TEXTE} name="share-2" size={TAILLE_ICONE} />
      ) : null}
      {libelle === 'Urgence' ? (
        <Feather color={COULEUR_TEXTE} name="bell" size={TAILLE_ICONE} />
      ) : null}
      <Text style={styles.texteOnglet}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barre: {
    alignItems: 'center',
    backgroundColor: '#F3FAFC',
    borderColor: 'rgba(137,190,207,0.22)',
    borderRadius: 32,
    borderWidth: 1,
    elevation: 12,
    minHeight: 68,
    overflow: 'hidden',
    paddingHorizontal: 4,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.16,
    shadowRadius: 34,
  },
  contenuBarre: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  degradeBlanc: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderBottomLeftRadius: 120,
    borderTopLeftRadius: 120,
    bottom: -16,
    left: '48%',
    position: 'absolute',
    right: -20,
    top: -12,
  },
  degradeBleu: {
    backgroundColor: 'rgba(216,244,252,0.72)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  onglet: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    justifyContent: 'center',
    minHeight: 54,
    borderColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
  },
  sos: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    marginHorizontal: 0,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 12,
    width: 64,
  },
  texteOnglet: {
    color: COULEUR_TEXTE,
    fontSize: 11,
    fontWeight: '800',
  },
  texteSos: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
