import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Carte } from '../carte/Carte';
import { PanneauRecherche } from '../composants/PanneauRecherche';
import { usePositionUtilisateur } from '../hooks/usePositionUtilisateur';
import { useRechercheItineraire } from '../hooks/useRechercheItineraire';

export function EcranCarte() {
  const { positionUtilisateur } = usePositionUtilisateur();
  const recherche = useRechercheItineraire();

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.zoneCarte}>
        <Carte
          depart={recherche.depart}
          destination={recherche.destination}
          itineraire={recherche.itineraire}
          positionUtilisateur={positionUtilisateur}
        />
      </View>
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
