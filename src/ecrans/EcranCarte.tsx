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
  const [pleinEcranModifieParUtilisateur, setPleinEcranModifieParUtilisateur] =
    useState(false);
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
    setPleinEcranModifieParUtilisateur(false);
    void recherche.rechercherItineraireDepuisPosition(positionUtilisateur);
  };
  const recentrerCarte = () => {
    setCleRecentrage((cleActuelle) => cleActuelle + 1);
  };
  const basculerPleinEcran = () => {
    setPleinEcranModifieParUtilisateur(true);
    setNavigationPleinEcran((pleinEcran) => !pleinEcran);
  };
  const arreterNavigation = () => {
    recherche.arreterItineraire();
    setNavigationPleinEcran(false);
    setPleinEcranModifieParUtilisateur(false);
    setPanneauTrajetOuvert(false);
  };

  useEffect(() => {
    if (recherche.itineraire) {
      setPanneauTrajetOuvert(false);
      if (!pleinEcranModifieParUtilisateur) {
        setNavigationPleinEcran(true);
      }
    }
  }, [pleinEcranModifieParUtilisateur, recherche.itineraire]);

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
              panneauTrajet={
                panneauTrajetOuvert ? (
                  <PanneauTrajet
                    definirDestinationTexte={recherche.definirDestinationTexte}
                    destinationTexte={recherche.destinationTexte}
                    etatRecherche={recherche.etatRecherche}
                    fermer={fermerPanneauTrajet}
                    integre
                    messageRecherche={recherche.messageRecherche}
                    positionDisponible={Boolean(positionUtilisateur)}
                    rechercherItineraire={rechercherDepuisPanneauTrajet}
                  />
                ) : null
              }
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
    elevation: 1000,
    left: 14,
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 1000,
  },
  boutonsDroite: {
    bottom: 92,
    elevation: 1100,
    position: 'absolute',
    right: 14,
    zIndex: 1100,
  },
  barreOnglets: {
    bottom: 12,
    left: 8,
    position: 'absolute',
    right: 8,
    zIndex: 24,
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
});
