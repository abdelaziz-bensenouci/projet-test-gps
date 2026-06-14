import { StyleSheet, Text, TextInput, View } from 'react-native';

type ProprietesChampAdresse = {
  libelle: string;
  valeur: string;
  placeholder: string;
  typeChamp: 'depart' | 'destination';
  surChangement: (valeur: string) => void;
};

export function ChampAdresse({
  libelle,
  valeur,
  placeholder,
  typeChamp,
  surChangement,
}: ProprietesChampAdresse) {
  return (
    <View style={styles.conteneur}>
      <View
        style={[
          styles.pastille,
          typeChamp === 'destination' && styles.pastilleDestination,
        ]}
      />
      <View style={styles.zoneTexte}>
        <Text style={styles.libelle}>{libelle}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={surChangement}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={styles.champ}
          value={valeur}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
  },
  pastille: {
    backgroundColor: '#13b6d8',
    borderRadius: 17,
    height: 34,
    width: 34,
  },
  pastilleDestination: {
    backgroundColor: '#22c55e',
  },
  zoneTexte: {
    flex: 1,
    minWidth: 0,
  },
  libelle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  champ: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '900',
    minHeight: 28,
    padding: 0,
  },
});
