import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Carte } from '../carte/Carte';
import { BarreOnglets } from '../composants/BarreOnglets';
import { BanniereNavigation } from '../composants/BanniereNavigation';
import { BanniereSignalements } from '../composants/BanniereSignalements';
import { BoutonStopNavigation } from '../composants/BoutonStopNavigation';
import { BoutonsFlottantsNavigation } from '../composants/BoutonsFlottantsNavigation';
import { PanneauTrajet } from '../composants/PanneauTrajet';
import { usePositionUtilisateur } from '../hooks/usePositionUtilisateur';
import { useRechercheItineraire } from '../hooks/useRechercheItineraire';
import type { ModeCarte } from '../types/ModeCarte';

export function EcranCarte() {
  const modeCarte: ModeCarte = 'clair';
  const [cleRecentrage, setCleRecentrage] = useState(0);
  const [panneauTrajetOuvert, setPanneauTrajetOuvert] = useState(false);
  const [navigationPleinEcran, setNavigationPleinEcran] = useState(false);
  const { positionUtilisateur } = usePositionUtilisateur();
  const recherche = useRechercheItineraire();
  const trajetActif = Boolean(recherche.itineraire);
  const ouvrirPanneauTrajet = () => {
    setPanneauTrajetOuvert(true);
  };
  const fermerPanneauTrajet = () => {
    setPanneauTrajetOuvert(false);
  };
  const rechercherDepuisPanneauTrajet = () => {
    void recherche.rechercherItineraireDepuisPosition(positionUtilisateur);
  };
  const recentrerCarte = () => {
    setCleRecentrage((cleActuelle) => cleActuelle + 1);
  };
  const basculerPleinEcran = () => {
    setNavigationPleinEcran((pleinEcran) => !pleinEcran);
  };
  const arreterNavigation = () => {
    recherche.arreterItineraire();
    setNavigationPleinEcran(false);
    setPanneauTrajetOuvert(false);
  };

  useEffect(() => {
    if (recherche.itineraire) {
      setPanneauTrajetOuvert(false);
      setNavigationPleinEcran(true);
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
        <View style={styles.boutonsDroite}>
          <BoutonsFlottantsNavigation
            basculerPleinEcran={basculerPleinEcran}
            navigationPleinEcran={navigationPleinEcran}
            ouvrirPanneauTrajet={ouvrirPanneauTrajet}
            recentrerCarte={recentrerCarte}
            trajetActif={trajetActif}
          />
        </View>
        {!navigationPleinEcran ? (
          <View style={styles.barreOnglets}>
            <BarreOnglets ouvrirPanneauTrajet={ouvrirPanneauTrajet} />
          </View>
        ) : null}
        {trajetActif ? (
          <View
            style={[
              styles.stopNavigation,
              !navigationPleinEcran && styles.stopNavigationAvecBarre,
            ]}
          >
            <BoutonStopNavigation arreterNavigation={arreterNavigation} />
          </View>
        ) : null}
        {panneauTrajetOuvert ? (
          <View style={styles.superpositionPanneau}>
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
    top: 12,
    zIndex: 20,
  },
  boutonsDroite: {
    bottom: 92,
    position: 'absolute',
    right: 14,
    zIndex: 22,
  },
  barreOnglets: {
    bottom: 12,
    left: 8,
    position: 'absolute',
    right: 8,
    zIndex: 24,
  },
  panneauTrajetFlottant: {
    left: 14,
    position: 'absolute',
    right: 14,
    top: 96,
  },
  stopNavigation: {
    alignItems: 'center',
    bottom: 20,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 26,
  },
  stopNavigationAvecBarre: {
    bottom: 118,
  },
  superpositionPanneau: {
    backgroundColor: 'rgba(2,6,12,0.32)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
});
