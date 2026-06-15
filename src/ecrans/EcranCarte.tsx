import { useEffect, useRef, useState } from 'react';
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
import { analyserNavigationGps } from '../navigationGps/navigationGpsAvancee';
import type { Coordonnees } from '../types/Coordonnees';
import type { ModeCarte } from '../types/ModeCarte';

const COOLDOWN_RECALCUL_NAVIGATION_MS = 12000;

export function EcranCarte() {
  const modeCarte: ModeCarte = 'clair';
  const [cleRecentrage, setCleRecentrage] = useState(0);
  const [panneauTrajetOuvert, setPanneauTrajetOuvert] = useState(false);
  const [navigationPleinEcran, setNavigationPleinEcran] = useState(false);
  const [pleinEcranModifieParUtilisateur, setPleinEcranModifieParUtilisateur] =
    useState(false);
  const [suiviCameraActif, setSuiviCameraActif] = useState(true);
  const positionPrecedenteRef = useRef<Coordonnees | null>(null);
  const dernierRecalculNavigationRef = useRef(0);
  const {
    directionUtilisateur,
    positionUtilisateur,
    precisionUtilisateur,
  } = usePositionUtilisateur();
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
    setSuiviCameraActif(true);
    setCleRecentrage((cleActuelle) => cleActuelle + 1);
  };
  const desactiverSuiviCamera = () => {
    setSuiviCameraActif(false);
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
    setSuiviCameraActif(true);
  };

  useEffect(() => {
    if (recherche.itineraire) {
      setPanneauTrajetOuvert(false);
      setSuiviCameraActif(true);
      if (!pleinEcranModifieParUtilisateur) {
        setNavigationPleinEcran(true);
      }
    }
  }, [pleinEcranModifieParUtilisateur, recherche.itineraire]);

  useEffect(() => {
    const positionPrecedente = positionPrecedenteRef.current;
    positionPrecedenteRef.current = positionUtilisateur;

    if (!recherche.itineraire || !positionUtilisateur) {
      return;
    }

    const analyse = analyserNavigationGps({
      gps: {
        directionDegres: directionUtilisateur,
        position: positionUtilisateur,
        precisionMetres: precisionUtilisateur,
      },
      positionPrecedente,
      trace: recherche.itineraire.coordonnees,
    });

    if (!analyse || (!analyse.horsTrace && !analyse.mauvaisSens)) {
      return;
    }

    const maintenant = Date.now();

    if (
      maintenant - dernierRecalculNavigationRef.current <
      COOLDOWN_RECALCUL_NAVIGATION_MS
    ) {
      return;
    }

    dernierRecalculNavigationRef.current = maintenant;
    setPleinEcranModifieParUtilisateur(false);
    void recherche.rechercherItineraireDepuisPosition(positionUtilisateur);
  }, [
    directionUtilisateur,
    positionUtilisateur,
    precisionUtilisateur,
    recherche,
    recherche.itineraire,
  ]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.conteneurCarte}>
        <Carte
          cleRecentrage={cleRecentrage}
          depart={recherche.depart}
          destination={recherche.destination}
          directionUtilisateur={directionUtilisateur}
          itineraire={recherche.itineraire}
          modeCarte={modeCarte}
          navigationPleinEcran={navigationPleinEcran}
          onInteractionUtilisateurCarte={desactiverSuiviCamera}
          positionUtilisateur={positionUtilisateur}
          precisionUtilisateur={precisionUtilisateur}
          suiviCameraActif={suiviCameraActif}
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
                    definirDepartTexte={recherche.definirDepartTexte}
                    definirDestinationTexte={recherche.definirDestinationTexte}
                    departTexte={recherche.departTexte}
                    destinationTexte={recherche.destinationTexte}
                    etatRecherche={recherche.etatRecherche}
                    fermer={fermerPanneauTrajet}
                    integre
                    messageRecherche={recherche.messageRecherche}
                    positionDisponible={Boolean(positionUtilisateur)}
                    positionUtilisateur={positionUtilisateur}
                    rechercherItineraire={rechercherDepuisPanneauTrajet}
                    selectionnerDepart={recherche.selectionnerDepart}
                    selectionnerDestination={recherche.selectionnerDestination}
                    viderDepart={recherche.viderDepart}
                    viderDestination={recherche.viderDestination}
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
    overflow: 'hidden',
    width: '100%',
  },
  conteneurCarte: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
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
