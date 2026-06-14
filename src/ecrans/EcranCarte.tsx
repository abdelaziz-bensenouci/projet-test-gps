import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Carte } from '../carte/Carte';
import { BanniereNavigation } from '../composants/BanniereNavigation';
import { BanniereSignalements } from '../composants/BanniereSignalements';
import { PanneauTrajet } from '../composants/PanneauTrajet';
import { usePositionUtilisateur } from '../hooks/usePositionUtilisateur';
import { useRechercheItineraire } from '../hooks/useRechercheItineraire';
import type { ModeCarte } from '../types/ModeCarte';

export function EcranCarte() {
  const modeCarte: ModeCarte = 'clair';
  const cleRecentrage = 0;
  const [panneauTrajetOuvert, setPanneauTrajetOuvert] = useState(false);
  const { positionUtilisateur } = usePositionUtilisateur();
  const recherche = useRechercheItineraire();
  const ouvrirPanneauTrajet = () => {
    setPanneauTrajetOuvert(true);
  };
  const fermerPanneauTrajet = () => {
    setPanneauTrajetOuvert(false);
  };
  const rechercherDepuisPanneauTrajet = () => {
    void recherche.rechercherItineraireDepuisPosition(positionUtilisateur);
  };

  useEffect(() => {
    if (recherche.itineraire) {
      setPanneauTrajetOuvert(false);
    }
  }, [recherche.itineraire]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.conteneurCarte}>
        <Carte
          cleRecentrage={cleRecentrage}
          depart={recherche.depart}
          destination={recherche.destination}
          itineraire={recherche.itineraire}
          modeCarte={modeCarte}
          positionUtilisateur={positionUtilisateur}
        />
        <View style={styles.banniereFlottante}>
          {recherche.itineraire ? (
            <BanniereNavigation itineraire={recherche.itineraire} />
          ) : (
            <BanniereSignalements
              destinationTexte={recherche.destinationTexte}
              ouvrirPanneauTrajet={ouvrirPanneauTrajet}
            />
          )}
        </View>
        {panneauTrajetOuvert ? (
          <View style={styles.panneauTrajetFlottant}>
            <PanneauTrajet
              definirDestinationTexte={recherche.definirDestinationTexte}
              destinationTexte={recherche.destinationTexte}
              etatRecherche={recherche.etatRecherche}
              fermer={fermerPanneauTrajet}
              messageRecherche={recherche.messageRecherche}
              positionDisponible={Boolean(positionUtilisateur)}
              rechercherItineraire={rechercherDepuisPanneauTrajet}
            />
          </View>
        ) : null}
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
  banniereFlottante: {
    left: 14,
    position: 'absolute',
    right: 14,
    top: 48,
  },
  panneauTrajetFlottant: {
    left: 14,
    position: 'absolute',
    right: 14,
    top: 240,
  },
});
