import { StyleSheet, Text, TextInput, View } from 'react-native';

type ProprietesChampAdresse = {
  libelle: string;
  valeur: string;
  placeholder: string;
  surChangement: (valeur: string) => void;
};

export function ChampAdresse({
  libelle,
  valeur,
  placeholder,
  surChangement,
}: ProprietesChampAdresse) {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.libelle}>{libelle}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={surChangement}
        placeholder={placeholder}
        style={styles.champ}
        value={valeur}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    gap: 6,
  },
  libelle: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '600',
  },
  champ: {
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
