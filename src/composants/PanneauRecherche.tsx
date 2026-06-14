import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChampAdresse } from './ChampAdresse';
import { MessageEtat } from './MessageEtat';
import type { EtatChargement } from '../types/EtatChargement';

type ProprietesPanneauRecherche = {
  departTexte: string;
  destinationTexte: string;
  etatRecherche: EtatChargement;
  messageRecherche: string | null;
  recherchePossible: boolean;
  definirDepartTexte: (valeur: string) => void;
  definirDestinationTexte: (valeur: string) => void;
  rechercherItineraire: () => void;
};

export function PanneauRecherche({
  departTexte,
  destinationTexte,
  etatRecherche,
  messageRecherche,
  recherchePossible,
  definirDepartTexte,
  definirDestinationTexte,
  rechercherItineraire,
}: ProprietesPanneauRecherche) {
  const chargement = etatRecherche === 'chargement';

  return (
    <View style={styles.panneau}>
      <ChampAdresse
        libelle="Depart"
        placeholder="Adresse de depart"
        surChangement={definirDepartTexte}
        valeur={departTexte}
      />
      <ChampAdresse
        libelle="Destination"
        placeholder="Adresse de destination"
        surChangement={definirDestinationTexte}
        valeur={destinationTexte}
      />
      <Pressable
        disabled={!recherchePossible || chargement}
        onPress={rechercherItineraire}
        style={[
          styles.bouton,
          (!recherchePossible || chargement) && styles.boutonInactif,
        ]}
      >
        <Text style={styles.texteBouton}>
          {chargement ? 'Calcul en cours' : 'Calculer'}
        </Text>
      </Pressable>
      <MessageEtat message={messageRecherche} />
    </View>
  );
}

const styles = StyleSheet.create({
  panneau: {
    backgroundColor: '#ffffff',
    gap: 12,
    padding: 16,
  },
  bouton: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  boutonInactif: {
    backgroundColor: '#9ca3af',
  },
  texteBouton: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
