import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

type ProprietesBoutonsFlottantsNavigation = {
  navigationPleinEcran: boolean;
  trajetActif: boolean;
  basculerPleinEcran: () => void;
  ouvrirPanneauTrajet: () => void;
  recentrerCarte: () => void;
};

export function BoutonsFlottantsNavigation({
  navigationPleinEcran,
  trajetActif,
  basculerPleinEcran,
  recentrerCarte,
}: ProprietesBoutonsFlottantsNavigation) {
  const [menuMasque, setMenuMasque] = useState(true);

  useEffect(() => {
    setMenuMasque(true);
  }, [trajetActif]);

  return (
    <View style={styles.colonne}>
      <View style={styles.menuFlottant}>
        <View
          pointerEvents={menuMasque ? 'none' : 'auto'}
          style={[styles.panneauMenu, menuMasque && styles.panneauMenuMasque]}
        >
          <GroupeBoutons>
            <BoutonFlottant
              icone={<Feather color="#16a6c9" name="volume-2" size={19} />}
              libelle="Voix"
              actif
            />
            <Separateur />
            <BoutonFlottant icone={<Badge3D />} libelle="Vue" />
            <Separateur />
            <BoutonFlottant
              icone={<Feather color="#13252b" name="moon" size={19} />}
              libelle="Theme"
            />
            <Separateur />
            <BoutonFlottant
              icone={<Feather color="#13252b" name="layers" size={19} />}
              libelle="Couches"
            />
          </GroupeBoutons>
        </View>
        <Pressable
          accessibilityLabel={
            menuMasque ? 'Afficher les options de carte' : 'Masquer les options de carte'
          }
          accessibilityRole="button"
          hitSlop={16}
          onPress={() => setMenuMasque((masque) => !masque)}
          style={[styles.poigneeSlot, menuMasque && styles.poigneeSlotFermee]}
        >
          <View style={styles.poignee}>
            <View style={styles.poigneeFond}>
              <View style={styles.poigneeBarre} />
            </View>
          </View>
        </Pressable>
      </View>
      {trajetActif ? (
        <BoutonRond
          icone={
            navigationPleinEcran ? (
              <Feather color="#13252b" name="minimize-2" size={19} />
            ) : (
              <Feather color="#13252b" name="maximize-2" size={19} />
            )
          }
          onPress={basculerPleinEcran}
        />
      ) : null}
      <BoutonRond
        icone={<Feather color="#0062CC" name="crosshair" size={22} />}
        onPress={recentrerCarte}
      />
    </View>
  );
}

function GroupeBoutons({ children }: { children: ReactNode }) {
  return <View style={styles.groupe}>{children}</View>;
}

function Separateur() {
  return <View style={styles.separateur} />;
}

function Badge3D() {
  return (
    <View style={styles.badge3D}>
      <Text style={styles.texteBadge3D}>3D</Text>
    </View>
  );
}

function BoutonFlottant({
  actif = false,
  icone,
  libelle,
  onPress,
}: {
  actif?: boolean;
  icone: ReactNode;
  libelle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.bouton, actif && styles.boutonActif]}
    >
      {icone}
      <Text style={styles.texteBouton}>{libelle}</Text>
    </Pressable>
  );
}

function BoutonRond({
  icone,
  onPress,
}: {
  icone: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.rond}>
      {icone}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    gap: 3,
    minHeight: 56,
    paddingHorizontal: 5,
    paddingVertical: 7,
    width: '100%',
  },
  boutonActif: {
    backgroundColor: 'rgba(34,211,238,0.14)',
  },
  badge3D: {
    alignItems: 'center',
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderColor: 'rgba(148,163,184,0.4)',
    borderRadius: 5,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    minWidth: 29,
  },
  colonne: {
    alignItems: 'center',
    gap: 10,
  },
  groupe: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderColor: 'rgba(255,255,255,0.52)',
    borderRadius: 27,
    borderWidth: 1,
    elevation: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    width: 52,
  },
  menuFlottant: {
    alignItems: 'center',
    height: 228,
    position: 'relative',
    width: 52,
  },
  panneauMenu: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 52,
  },
  panneauMenuMasque: {
    opacity: 0,
    transform: [{ translateX: 66 }],
  },
  poignee: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 14,
    elevation: 6,
    height: 66,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    width: 22,
  },
  poigneeBarre: {
    backgroundColor: '#0062CC',
    borderRadius: 999,
    height: 28,
    shadowColor: '#0062CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
    width: 4,
  },
  poigneeFond: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,98,204,0.16)',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 6,
  },
  poigneeSlot: {
    alignItems: 'center',
    height: 68,
    justifyContent: 'center',
    left: -14,
    position: 'absolute',
    top: 80,
    width: 24,
  },
  poigneeSlotFermee: {
    left: 'auto',
    right: -14,
  },
  rond: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 999,
    elevation: 8,
    height: 45,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    width: 45,
  },
  separateur: {
    backgroundColor: 'rgba(19,37,43,0.055)',
    height: 1,
    marginHorizontal: 10,
  },
  texteBadge3D: {
    color: '#13252b',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 13,
  },
  texteBouton: {
    color: '#13252b',
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 11,
    textAlign: 'center',
  },
});
