import { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Carte } from '../carte/Carte';
import { PanneauRecherche } from '../composants/PanneauRecherche';
import { usePositionUtilisateur } from '../hooks/usePositionUtilisateur';
import { useRechercheItineraire } from '../hooks/useRechercheItineraire';
import type { ModeCarte } from '../types/ModeCarte';

export function EcranCarte() {
  const [modeCarte, setModeCarte] = useState<ModeCarte>('clair');
  const { positionUtilisateur } = usePositionUtilisateur();
  const recherche = useRechercheItineraire();
  const basculerModeCarte = () => {
    setModeCarte((modeActuel) =>
      modeActuel === 'clair' ? 'sombre' : 'clair',
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.zoneCarte}>
        <Carte
          depart={recherche.depart}
          destination={recherche.destination}
          itineraire={recherche.itineraire}
          modeCarte={modeCarte}
          positionUtilisateur={positionUtilisateur}
        />
      </View>
      <PanneauRecherche
        basculerModeCarte={basculerModeCarte}
        departTexte={recherche.departTexte}
        definirDepartTexte={recherche.definirDepartTexte}
        definirDestinationTexte={recherche.definirDestinationTexte}
        destinationTexte={recherche.destinationTexte}
        etatRecherche={recherche.etatRecherche}
        messageRecherche={recherche.messageRecherche}
        modeCarte={modeCarte}
        recherchePossible={recherche.recherchePossible}
        rechercherItineraire={recherche.rechercherItineraire}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  zoneCarte: {
    flex: 1,
  },
});
