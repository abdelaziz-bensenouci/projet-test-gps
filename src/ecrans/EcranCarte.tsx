import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Carte } from '../carte/Carte';
import { BarreOnglets } from '../composants/BarreOnglets';
import { BanniereNavigation } from '../composants/BanniereNavigation';
import { BanniereSignalements } from '../composants/BanniereSignalements';
import { BoutonStopNavigation } from '../composants/BoutonStopNavigation';
import { BoutonsFlottantsNavigation } from '../composants/BoutonsFlottantsNavigation';
import {
  PanneauPartage,
  PanneauSignalement,
  PanneauUrgence,
} from '../composants/PanneauxApplicatifs';
import { PanneauProfilWalkZen } from '../composants/PanneauProfilWalkZen';
import { PanneauTrajet } from '../composants/PanneauTrajet';
import { useProfilApplication } from '../hooks/useProfilApplication';
import { usePositionUtilisateur } from '../hooks/usePositionUtilisateur';
import { useRechercheItineraire } from '../hooks/useRechercheItineraire';
import { useSignalements } from '../hooks/useSignalements';
import { analyserNavigationGps } from '../navigationGps/navigationGpsAvancee';
import type { Coordonnees } from '../types/Coordonnees';
import type { ModeCarte } from '../types/ModeCarte';

const COOLDOWN_RECALCUL_NAVIGATION_MS = 12000;
type PanneauApplicatif = 'signalement' | 'profil' | 'partage' | 'urgence' | null;

export function EcranCarte() {
  const modeCarte: ModeCarte = 'clair';
  const [cleRecentrage, setCleRecentrage] = useState(0);
  const [panneauTrajetOuvert, setPanneauTrajetOuvert] = useState(false);
  const [navigationPleinEcran, setNavigationPleinEcran] = useState(false);
  const [pleinEcranModifieParUtilisateur, setPleinEcranModifieParUtilisateur] =
    useState(false);
  const [recalculNavigationEnCours, setRecalculNavigationEnCours] =
    useState(false);
  const [suiviCameraActif, setSuiviCameraActif] = useState(true);
  const [traceItinerairePrete, setTraceItinerairePrete] = useState(false);
  const [panneauApplicatif, setPanneauApplicatif] =
    useState<PanneauApplicatif>(null);
  const positionPrecedenteRef = useRef<Coordonnees | null>(null);
  const dernierRecalculNavigationRef = useRef(0);
  const {
    directionUtilisateur,
    positionUtilisateur,
    precisionUtilisateur,
  } = usePositionUtilisateur();
  const recherche = useRechercheItineraire();
  const profilApplication = useProfilApplication();
  const signalements = useSignalements(positionUtilisateur);
  const itinerairePrecedentRef = useRef(recherche.itineraire);
  const itinerairePretAffichage = Boolean(
    recherche.itineraire && traceItinerairePrete,
  );
  const trajetActif = itinerairePretAffichage;
  const calculItineraireEnCours =
    recherche.etatRecherche === 'chargement' ||
    Boolean(recherche.itineraire && !traceItinerairePrete);
  const messageChargementItineraire = recalculNavigationEnCours
    ? "Recalcul d'itinéraire en cours"
    : 'Calcul en cours de votre itinéraire';
  const ouvrirPanneauTrajet = () => {
    setPanneauApplicatif(null);
    setPanneauTrajetOuvert(true);
  };
  const fermerPanneauTrajet = () => {
    setPanneauTrajetOuvert(false);
  };
  const ouvrirPanneauApplicatif = (panneau: Exclude<PanneauApplicatif, null>) => {
    setPanneauTrajetOuvert(false);
    setPanneauApplicatif(panneau);
  };
  const fermerPanneauApplicatif = () => {
    setPanneauApplicatif(null);
  };
  const rechercherDepuisPanneauTrajet = () => {
    setTraceItinerairePrete(false);
    setSuiviCameraActif(true);
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
    setTraceItinerairePrete(false);
    setNavigationPleinEcran(false);
    setPleinEcranModifieParUtilisateur(false);
    setPanneauTrajetOuvert(false);
    setPanneauApplicatif(null);
    setRecalculNavigationEnCours(false);
    setSuiviCameraActif(true);
  };

  useEffect(() => {
    const itinerairePrecedent = itinerairePrecedentRef.current;
    itinerairePrecedentRef.current = recherche.itineraire;

    if (itinerairePretAffichage) {
      setPanneauTrajetOuvert(false);
      if (!itinerairePrecedent) {
        setSuiviCameraActif(true);
      }
      if (!pleinEcranModifieParUtilisateur) {
        setNavigationPleinEcran(true);
      }
    }
  }, [itinerairePretAffichage, pleinEcranModifieParUtilisateur, recherche.itineraire]);

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
    setRecalculNavigationEnCours(true);
    void recherche.rechercherItineraireDepuisPosition(positionUtilisateur);
  }, [
    directionUtilisateur,
    positionUtilisateur,
    precisionUtilisateur,
    recherche,
    recherche.itineraire,
  ]);

  useEffect(() => {
    if (recalculNavigationEnCours && recherche.etatRecherche !== 'chargement') {
      setRecalculNavigationEnCours(false);
    }
  }, [recalculNavigationEnCours, recherche.etatRecherche]);

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
          onTraceItinerairePrete={setTraceItinerairePrete}
          positionUtilisateur={positionUtilisateur}
          precisionUtilisateur={precisionUtilisateur}
          signalements={signalements.signalements}
          suiviCameraActif={suiviCameraActif}
        />
        <View style={styles.banniereFlottante}>
          {itinerairePretAffichage && recherche.itineraire ? (
            <BanniereNavigation itineraire={recherche.itineraire} />
          ) : (
            <BanniereSignalements
              compteurs={signalements.compteurs}
              destinationTexte={recherche.destinationTexte}
              ouvrirProfil={() => ouvrirPanneauApplicatif('profil')}
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
                    lieuxFavoris={profilApplication.favoris}
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
        {panneauApplicatif ? (
          <View style={styles.panneauApplicatif}>
            {panneauApplicatif === 'signalement' ? (
              <PanneauSignalement
                creationEnCours={signalements.creationEnCours}
                fermer={fermerPanneauApplicatif}
                message={signalements.message}
                signaler={signalements.ajouterSignalement}
              />
            ) : null}
            {panneauApplicatif === 'profil' ? (
              <PanneauProfilWalkZen
                chargement={profilApplication.chargement}
                contacts={profilApplication.contacts}
                erreur={profilApplication.erreur}
                favoris={profilApplication.favoris}
                fermer={fermerPanneauApplicatif}
                historique={profilApplication.historique}
                notifications={profilApplication.notifications}
                profil={profilApplication.profil}
              />
            ) : null}
            {panneauApplicatif === 'partage' ? (
              <PanneauPartage
                contacts={profilApplication.contacts}
                fermer={fermerPanneauApplicatif}
              />
            ) : null}
            {panneauApplicatif === 'urgence' ? (
              <PanneauUrgence fermer={fermerPanneauApplicatif} />
            ) : null}
          </View>
        ) : null}
        <View style={styles.boutonsDroite}>
          <BoutonsFlottantsNavigation
            basculerPleinEcran={basculerPleinEcran}
            navigationPleinEcran={navigationPleinEcran}
            ouvrirPanneauTrajet={ouvrirPanneauTrajet}
            recentrerCarte={recentrerCarte}
            trajetActif={trajetActif}
          />
        </View>
        {calculItineraireEnCours ? (
          <View style={styles.messageChargement}>
            <Text style={styles.texteMessageChargement}>
              {messageChargementItineraire}
            </Text>
          </View>
        ) : null}
        {!navigationPleinEcran ? (
          <View style={styles.barreOnglets}>
            <BarreOnglets
              activerSos={() => ouvrirPanneauApplicatif('urgence')}
              ouvrirPanneauPartage={() => ouvrirPanneauApplicatif('partage')}
              ouvrirPanneauSignalement={() =>
                ouvrirPanneauApplicatif('signalement')
              }
              ouvrirPanneauTrajet={ouvrirPanneauTrajet}
              ouvrirPanneauUrgence={() => ouvrirPanneauApplicatif('urgence')}
            />
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
  panneauApplicatif: {
    elevation: 1150,
    left: 14,
    position: 'absolute',
    right: 14,
    top: 154,
    zIndex: 1150,
  },
  messageChargement: {
    alignItems: 'center',
    backgroundColor: 'rgba(5,10,20,0.78)',
    borderColor: 'rgba(143,234,255,0.26)',
    borderRadius: 999,
    borderWidth: 1,
    elevation: 1200,
    left: 28,
    minHeight: 36,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 28,
    top: 140,
    zIndex: 1200,
  },
  texteMessageChargement: {
    color: '#F3FCFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    paddingVertical: 8,
    textAlign: 'center',
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
