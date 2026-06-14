import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ReactNode } from 'react';

const SIGNALEMENTS = [
  { libelle: 'eleve', couleur: '#EF4444' },
  { libelle: 'modere', couleur: '#F59E0B' },
  { libelle: 'faible', couleur: '#22C55E' },
] as const;

type ProprietesBanniereSignalements = {
  destinationTexte: string;
  panneauTrajet?: ReactNode;
  ouvrirPanneauTrajet: () => void;
};

export function BanniereSignalements({
  destinationTexte,
  panneauTrajet,
  ouvrirPanneauTrajet,
}: ProprietesBanniereSignalements) {
  const animationPanneau = useRef(new Animated.Value(panneauTrajet ? 1 : 0))
    .current;
  const [contenuPanneau, setContenuPanneau] = useState<ReactNode | null>(
    panneauTrajet ?? null,
  );
  const panneauVisible = Boolean(contenuPanneau);

  useEffect(() => {
    if (panneauTrajet) {
      setContenuPanneau(panneauTrajet);
      Animated.timing(animationPanneau, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(animationPanneau, {
      duration: 140,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setContenuPanneau(null);
      }
    });
  }, [animationPanneau, panneauTrajet]);

  return (
    <View style={styles.banniere}>
      <View pointerEvents="none" style={styles.degradeBleu} />
      <View pointerEvents="none" style={styles.degradeBleuAccent} />
      <View pointerEvents="none" style={styles.degradeBlanc} />
      <View pointerEvents="none" style={styles.degradeBlancBas} />
      <View style={styles.contenuBanniere}>
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
        <View style={styles.zoneDestination}>
          {panneauVisible ? (
            <Animated.View
              style={[
                styles.transitionPanneau,
                {
                  opacity: animationPanneau,
                  transform: [
                    {
                      scale: animationPanneau.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.985, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {contenuPanneau}
            </Animated.View>
          ) : (
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
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 29,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarTexte: {
    color: '#1F2D38',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 23,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#E6EEF2',
    borderColor: '#C8D8E0',
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
    color: '#1F2D38',
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
    backgroundColor: '#D7F3FC',
    borderColor: '#C8D8E0',
    borderRadius: 26,
    borderWidth: 1,
    minHeight: 116,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 1000,
  },
  contenuBanniere: {
    gap: 10,
    position: 'relative',
    zIndex: 1,
  },
  compteur: {
    color: '#1F2D38',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
    textAlign: 'left',
  },
  champDestination: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: '100%',
  },
  champDestinationLibelle: {
    color: '#16a6c9',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  champDestinationTexte: {
    color: '#1F2D38',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: 1,
  },
  degradeBlanc: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderBottomLeftRadius: 220,
    borderTopLeftRadius: 220,
    bottom: -34,
    left: '58%',
    position: 'absolute',
    right: -52,
    top: -28,
  },
  degradeBlancBas: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    bottom: -44,
    height: '42%',
    left: -18,
    position: 'absolute',
    right: -18,
  },
  degradeBleu: {
    backgroundColor: 'rgba(201,239,250,0.98)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  degradeBleuAccent: {
    backgroundColor: 'rgba(148,222,244,0.36)',
    borderRadius: 220,
    bottom: '12%',
    left: -48,
    position: 'absolute',
    right: '18%',
    top: '18%',
  },
  ligne: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
  },
  pastille: {
    borderColor: '#FFFFFF',
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
    color: '#16a6c9',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
    textAlign: 'left',
  },
  transitionPanneau: {
    width: '100%',
  },
  zoneDestination: {
    marginTop: 8,
  },
});
