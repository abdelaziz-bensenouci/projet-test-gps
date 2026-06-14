import { Pressable, StyleSheet, Text, View } from 'react-native';

const ONGLETS = ['Trajet', 'Signaler', 'Partage', 'Urgence'] as const;

type ProprietesBarreOnglets = {
  ouvrirPanneauTrajet: () => void;
};

export function BarreOnglets({ ouvrirPanneauTrajet }: ProprietesBarreOnglets) {
  return (
    <View style={styles.barre}>
      <Onglet libelle="Trajet" onPress={ouvrirPanneauTrajet} />
      <Onglet libelle="Signaler" />
      <Pressable accessibilityRole="button" style={styles.sos}>
        <Text style={styles.texteSos}>SOS</Text>
      </Pressable>
      {ONGLETS.slice(2).map((onglet) => (
        <Onglet key={onglet} libelle={onglet} />
      ))}
    </View>
  );
}

function Onglet({
  libelle,
  onPress,
}: {
  libelle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.onglet}>
      <Text style={styles.icone}>V</Text>
      <Text style={styles.texteOnglet}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barre: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(226,232,240,0.9)',
    borderRadius: 28,
    borderWidth: 1,
    elevation: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 64,
    paddingHorizontal: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
  },
  icone: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  onglet: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 50,
  },
  sos: {
    alignItems: 'center',
    backgroundColor: '#E11D2E',
    borderColor: '#ffffff',
    borderRadius: 30,
    borderWidth: 4,
    height: 60,
    justifyContent: 'center',
    marginHorizontal: 6,
    shadowColor: '#E11D2E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    width: 60,
  },
  texteOnglet: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
  },
  texteSos: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
