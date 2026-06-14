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
  ouvrirPanneauTrajet,
  recentrerCarte,
}: ProprietesBoutonsFlottantsNavigation) {
  return (
    <View style={styles.colonne}>
      <GroupeBoutons>
        <BoutonFlottant libelle="Itineraire" onPress={ouvrirPanneauTrajet} />
        <BoutonFlottant libelle="Voix" />
      </GroupeBoutons>
      <GroupeBoutons>
        <BoutonFlottant libelle="3D" sousLibelle="Vue" />
        <BoutonFlottant libelle="Theme" />
        <BoutonFlottant libelle="Couches" />
      </GroupeBoutons>
      {trajetActif ? (
        <BoutonRond
          libelle={navigationPleinEcran ? 'Reduire' : 'Agrandir'}
          onPress={basculerPleinEcran}
        />
      ) : null}
      <BoutonRond libelle="GPS" onPress={recentrerCarte} />
    </View>
  );
}

function GroupeBoutons({ children }: { children: ReactNode }) {
  return <View style={styles.groupe}>{children}</View>;
}

function BoutonFlottant({
  libelle,
  sousLibelle,
  onPress,
}: {
  libelle: string;
  sousLibelle?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.bouton}>
      <Text style={styles.texteBouton}>{libelle}</Text>
      {sousLibelle ? <Text style={styles.sousTexte}>{sousLibelle}</Text> : null}
    </Pressable>
  );
}

function BoutonRond({
  libelle,
  onPress,
}: {
  libelle: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.rond}>
      <Text style={styles.texteRond}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  colonne: {
    alignItems: 'center',
    gap: 10,
  },
  groupe: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(226,232,240,0.85)',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    width: 58,
  },
  rond: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: '#F59E0B',
    borderRadius: 24,
    borderWidth: 2,
    elevation: 12,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    width: 48,
  },
  sousTexte: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
  texteBouton: {
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  texteRond: {
    color: '#0f172a',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
});
