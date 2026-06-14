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
      <Text style={styles.titre}>Nouveau trajet</Text>
      <View style={styles.formulaire}>
      <ChampAdresse
        libelle="Depart"
        placeholder="Adresse de depart"
        surChangement={definirDepartTexte}
        typeChamp="depart"
        valeur={departTexte}
      />
        <View style={styles.separateur} />
      <ChampAdresse
        libelle="Destination"
        placeholder="Adresse de destination"
        surChangement={definirDestinationTexte}
        typeChamp="destination"
        valeur={destinationTexte}
      />
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(255,255,255,0.74)',
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 16,
  },
  titre: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '900',
  },
  formulaire: {
    backgroundColor: 'rgba(248,250,252,0.86)',
    borderColor: 'rgba(203,213,225,0.78)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  separateur: {
    backgroundColor: 'rgba(15,23,42,0.08)',
    height: 1,
    marginLeft: 44,
  },
  bouton: {
    alignItems: 'center',
    backgroundColor: '#13b6d8',
    borderRadius: 22,
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
