import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type ProprietesChampAdresse = {
  libelle: string;
  valeur: string;
  placeholder: string;
  typeChamp: 'depart' | 'destination';
  surChangement: (valeur: string) => void;
  surVider?: () => void;
  surFocus?: () => void;
};

export function ChampAdresse({
  libelle,
  valeur,
  placeholder,
  typeChamp,
  surChangement,
  surVider,
  surFocus,
}: ProprietesChampAdresse) {
  const afficherVider = valeur.trim().length > 0 && Boolean(surVider);

  return (
    <View style={styles.conteneur}>
      <View
        style={[
          styles.pastille,
          typeChamp === 'destination' && styles.pastilleDestination,
        ]}
      >
        <Feather
          color={typeChamp === 'destination' ? '#22c55e' : '#16a6c9'}
          name="map-pin"
          size={16}
        />
      </View>
      <View style={styles.zoneTexte}>
        <Text style={styles.libelle}>{libelle}</Text>
        <View style={styles.ligneChamp}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={surChangement}
            onFocus={surFocus}
            placeholder={placeholder}
            placeholderTextColor="#657783"
            style={styles.champ}
            value={valeur}
          />
          {afficherVider ? (
            <Pressable
              accessibilityLabel={`Vider le champ ${libelle.toLowerCase()}`}
              accessibilityRole="button"
              hitSlop={10}
              onPress={surVider}
              style={styles.boutonVider}
            >
              <Feather color="#EF4444" name="x" size={15} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 46,
  },
  pastille: {
    alignItems: 'center',
    backgroundColor: 'rgba(22,166,201,0.1)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pastilleDestination: {
    backgroundColor: 'rgba(34,197,94,0.14)',
  },
  zoneTexte: {
    flex: 1,
    minWidth: 0,
  },
  libelle: {
    color: '#657783',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  champ: {
    color: '#1F2D38',
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    minHeight: 28,
    padding: 0,
  },
  boutonVider: {
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  ligneChamp: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 28,
  },
});
