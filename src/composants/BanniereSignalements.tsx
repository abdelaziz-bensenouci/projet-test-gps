import { Pressable, StyleSheet, Text, View } from 'react-native';

const SIGNALEMENTS = [
  { libelle: 'eleve', couleur: '#EF4444' },
  { libelle: 'modere', couleur: '#F59E0B' },
  { libelle: 'faible', couleur: '#22C55E' },
] as const;

type ProprietesBanniereSignalements = {
  destinationTexte: string;
  ouvrirPanneauTrajet: () => void;
};

export function BanniereSignalements({
  destinationTexte,
  ouvrirPanneauTrajet,
}: ProprietesBanniereSignalements) {
  return (
    <View style={styles.banniere}>
      <View style={styles.ligne}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>WZ</Text>
        </View>
        <View style={styles.texte}>
          <Text style={styles.titre}>AUTOUR DE VOUS</Text>
          <Text style={styles.compteur}>0 signalement</Text>
        </View>
      </View>
      <View style={styles.badges}>
        {SIGNALEMENTS.map((signalement) => (
          <View key={signalement.libelle} style={styles.badge}>
            <View
              style={[
                styles.pastille,
                { backgroundColor: signalement.couleur },
              ]}
            />
            <Text style={styles.badgeTexte}>0 {signalement.libelle}</Text>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={ouvrirPanneauTrajet}
        style={styles.champDestination}
      >
        <Text style={styles.champDestinationLibelle}>Destination</Text>
        <Text style={styles.champDestinationTexte} numberOfLines={1}>
          {destinationTexte.trim() || 'Saisir une destination'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(143,234,255,0.24)',
    borderRadius: 29,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarTexte: {
    color: '#F3FCFF',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 23,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderColor: 'rgba(143,234,255,0.16)',
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: 5,
    justifyContent: 'center',
    minHeight: 28,
    minWidth: 84,
    paddingLeft: 7,
    paddingRight: 10,
  },
  badgeTexte: {
    color: '#F3FCFF',
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  banniere: {
    backgroundColor: 'rgba(5,10,20,0.72)',
    borderColor: 'rgba(0,209,255,0.24)',
    borderRadius: 26,
    borderWidth: 1,
    gap: 10,
    minHeight: 116,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#00131f',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  compteur: {
    color: '#F3FCFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
    textAlign: 'left',
  },
  champDestination: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(143,234,255,0.18)',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: '100%',
  },
  champDestinationLibelle: {
    color: 'rgba(143,234,255,0.72)',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  champDestinationTexte: {
    color: '#F3FCFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: 1,
  },
  ligne: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
  },
  pastille: {
    borderColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    width: 20,
  },
  texte: {
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  titre: {
    color: 'rgba(143,234,255,0.72)',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
    textAlign: 'left',
  },
});
