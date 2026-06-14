import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Carte } from '../carte/Carte';
import { ControlesCarteFlottants } from '../composants/ControlesCarteFlottants';
import { PanneauRecherche } from '../composants/PanneauRecherche';
import { usePositionUtilisateur } from '../hooks/usePositionUtilisateur';
import { useRechercheItineraire } from '../hooks/useRechercheItineraire';
import type { ModeCarte } from '../types/ModeCarte';

export function EcranCarte() {
  const [modeCarte, setModeCarte] = useState<ModeCarte>('clair');
  const { positionUtilisateur } = usePositionUtilisateur();
  const recherche = useRechercheItineraire();
  const chargement = recherche.etatRecherche === 'chargement';
  const basculerModeCarte = () => {
    setModeCarte((modeActuel) =>
      modeActuel === 'clair' ? 'sombre' : 'clair',
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.conteneurCarte}>
        <Carte
          depart={recherche.depart}
          destination={recherche.destination}
          itineraire={recherche.itineraire}
          modeCarte={modeCarte}
          positionUtilisateur={positionUtilisateur}
        />
        <ControlesCarteFlottants
          basculerModeCarte={basculerModeCarte}
          chargement={chargement}
          modeCarte={modeCarte}
          recherchePossible={recherche.recherchePossible}
          rechercherItineraire={recherche.rechercherItineraire}
        />
        <View style={styles.panneauFlottant}>
          <PanneauRecherche
            departTexte={recherche.departTexte}
            definirDepartTexte={recherche.definirDepartTexte}
            definirDestinationTexte={recherche.definirDestinationTexte}
            destinationTexte={recherche.destinationTexte}
            etatRecherche={recherche.etatRecherche}
            messageRecherche={recherche.messageRecherche}
            recherchePossible={recherche.recherchePossible}
            rechercherItineraire={recherche.rechercherItineraire}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0f172a',
    flex: 1,
  },
  conteneurCarte: {
    flex: 1,
  },
  panneauFlottant: {
    bottom: 18,
    left: 14,
    position: 'absolute',
    right: 14,
  },
});
