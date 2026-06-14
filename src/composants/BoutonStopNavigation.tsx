import { Pressable, StyleSheet, Text } from 'react-native';

type ProprietesBoutonStopNavigation = {
  arreterNavigation: () => void;
};

export function BoutonStopNavigation({
  arreterNavigation,
}: ProprietesBoutonStopNavigation) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={arreterNavigation}
      style={styles.bouton}
    >
      <Text style={styles.texte}>STOP</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    alignItems: 'center',
    backgroundColor: '#FF4D45',
    borderRadius: 23,
    elevation: 16,
    height: 46,
    justifyContent: 'center',
    minWidth: 108,
    paddingHorizontal: 24,
    shadowColor: '#FF4D45',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  texte: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
