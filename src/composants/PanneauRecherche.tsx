import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChampAdresse } from './ChampAdresse';
import { MessageEtat } from './MessageEtat';
import type { EtatChargement } from '../types/EtatChargement';
import type { ModeCarte } from '../types/ModeCarte';

type ProprietesPanneauRecherche = {
  departTexte: string;
  destinationTexte: string;
  etatRecherche: EtatChargement;
  messageRecherche: string | null;
  modeCarte: ModeCarte;
  recherchePossible: boolean;
  basculerModeCarte: () => void;
  definirDepartTexte: (valeur: string) => void;
  definirDestinationTexte: (valeur: string) => void;
  rechercherItineraire: () => void;
};

export function PanneauRecherche({
  departTexte,
  destinationTexte,
  etatRecherche,
  messageRecherche,
  modeCarte,
  recherchePossible,
  basculerModeCarte,
  definirDepartTexte,
  definirDestinationTexte,
  rechercherItineraire,
}: ProprietesPanneauRecherche) {
  const chargement = etatRecherche === 'chargement';

  return (
    <View style={styles.panneau}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Itineraire</Text>
        <Pressable onPress={basculerModeCarte} style={styles.boutonMode}>
          <Text style={styles.texteMode}>
            {modeCarte === 'clair' ? 'Sombre' : 'Clair'}
          </Text>
        </Pressable>
      </View>
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
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titre: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  boutonMode: {
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  texteMode: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
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
