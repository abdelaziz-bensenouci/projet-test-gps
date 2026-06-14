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
    backgroundColor: '#FF4D3D',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    borderWidth: 1,
    elevation: 12,
    height: 50,
    justifyContent: 'center',
    minWidth: 112,
    paddingHorizontal: 24,
    shadowColor: '#FF4D3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 24,
  },
  texte: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
