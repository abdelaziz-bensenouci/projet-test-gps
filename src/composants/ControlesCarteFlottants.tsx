import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ModeCarte } from '../types/ModeCarte';

type ProprietesControlesCarteFlottants = {
  modeCarte: ModeCarte;
  recherchePossible: boolean;
  chargement: boolean;
  basculerModeCarte: () => void;
  rechercherItineraire: () => void;
};

export function ControlesCarteFlottants({
  modeCarte,
  recherchePossible,
  chargement,
  basculerModeCarte,
  rechercherItineraire,
}: ProprietesControlesCarteFlottants) {
  const actionInactive = !recherchePossible || chargement;

  return (
    <View style={styles.conteneur}>
      <Pressable onPress={basculerModeCarte} style={styles.bouton}>
        <Text style={styles.textePrincipal}>
          {modeCarte === 'clair' ? 'Nuit' : 'Jour'}
        </Text>
        <Text style={styles.texteSecondaire}>Carte</Text>
      </Pressable>
      <View style={styles.separateur} />
      <Pressable
        disabled={actionInactive}
        onPress={rechercherItineraire}
        style={[styles.bouton, actionInactive && styles.boutonInactif]}
      >
        <Text style={styles.textePrincipal}>Go</Text>
        <Text style={styles.texteSecondaire}>Trajet</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    position: 'absolute',
    right: 16,
    top: 54,
    width: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
  },
  bouton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  boutonInactif: {
    opacity: 0.42,
  },
  separateur: {
    backgroundColor: 'rgba(15,23,42,0.08)',
    height: 1,
    marginHorizontal: 12,
  },
  textePrincipal: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  texteSecondaire: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
