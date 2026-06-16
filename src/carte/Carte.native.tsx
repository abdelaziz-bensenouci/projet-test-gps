import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';

import {
  CENTRE_CARTE_INITIAL,
  CENTRAGE_TRACE_ACTIF,
  OFFSET_VERTICAL_NAVIGATION_PLEIN_ECRAN,
  OFFSET_VERTICAL_NAVIGATION_REDUIT,
  PITCH_NAVIGATION_PLEIN_ECRAN,
  PITCH_NAVIGATION_REDUIT,
  obtenirStyleCarte,
  ZOOM_CARTE_INITIAL,
  ZOOM_NAVIGATION_PLEIN_ECRAN,
  ZOOM_NAVIGATION_REDUIT,
} from '../constantes/CarteConstantes';
import {
  calculerBearing,
  estCoordonneesValides,
  versLngLat,
} from '../utilitaires/coordonnees';
import { creerGeoJsonItineraire } from '../utilitaires/geojson';
import {
  analyserNavigationGps,
  calculerDistanceMetres,
  calculerTraceRestante,
} from '../navigationGps/navigationGpsAvancee';
import { adapterTraceSurAxesRoutiers } from './centrageTrace/adapterTraceSurAxesRoutiers';
import { MarqueurCarte } from './MarqueurCarte';
import { MarqueurSignalement } from './MarqueurSignalement';
import { MarqueurUtilisateur } from './MarqueurUtilisateur';
import { stylesCarte } from './stylesCarte';
import type { ProprietesCarte } from './typesCarte';
import type { Coordonnees } from '../types/Coordonnees';

export function Carte({
  cleRecentrage,
  depart,
  destination,
  directionUtilisateur,
  itineraire,
  modeCarte,
  navigationPleinEcran,
  onInteractionUtilisateurCarte,
  onTraceItinerairePrete,
  positionUtilisateur,
  precisionUtilisateur,
  signalements,
  suiviCameraActif,
}: ProprietesCarte) {
  const cameraRef = useRef<CameraRef>(null);
  const positionPrecedenteRef = useRef<Coordonnees | null>(null);
  const dernierePositionMarqueurRef = useRef<Coordonnees | null>(null);
  const dernierePositionGpsMarqueurRef = useRef<Coordonnees | null>(null);
  const dernierIndexSegmentRef = useRef(0);
  const [traceAffiche, setTraceAffiche] = useState<Coordonnees[]>([]);
  const navigationActive = Boolean(itineraire && traceAffiche.length >= 2);
  const styleCarte = useMemo(
    () => obtenirStyleCarte(modeCarte, navigationActive),
    [modeCarte, navigationActive],
  );
  const positionUtilisateurValide = estCoordonneesValides(positionUtilisateur)
    ? positionUtilisateur
    : null;
  const analyseNavigation = useMemo(() => {
    if (!navigationActive) {
      return null;
    }

    const positionPrecedente = positionPrecedenteRef.current;

    return analyserNavigationGps({
      gps: positionUtilisateurValide
        ? {
            directionDegres: directionUtilisateur,
            position: positionUtilisateurValide,
            precisionMetres: precisionUtilisateur,
          }
        : null,
      indexSegmentMinimum: Math.max(0, dernierIndexSegmentRef.current - 1),
      positionPrecedente,
      trace: traceAffiche,
    });
  }, [
    directionUtilisateur,
    navigationActive,
    positionUtilisateurValide,
    precisionUtilisateur,
    traceAffiche,
  ]);
  const positionSnappeeValide = estCoordonneesValides(
    analyseNavigation?.positionAffichee,
  )
    ? analyseNavigation.positionAffichee
    : null;
  const positionUtilisateurAffichee =
    navigationActive
      ? positionSnappeeValide ?? positionUtilisateurValide
      : positionUtilisateurValide;
  const coordonneesMarqueurUtilisateur = choisirCoordonneesMarqueurUtilisateur({
    dernierePositionGps: dernierePositionGpsMarqueurRef.current,
    dernierePositionMarqueur: dernierePositionMarqueurRef.current,
    navigationActive,
    positionGps: positionUtilisateurValide,
    positionSnappee: positionSnappeeValide,
    snapActif: Boolean(analyseNavigation?.snapActif),
  });
  const bearingNavigation = analyseNavigation?.bearingNavigation;
  const traceAfficheeRestante = useMemo(
    () => calculerTraceRestante(traceAffiche, analyseNavigation),
    [analyseNavigation, traceAffiche],
  );
  const geoJsonItineraire = useMemo(
    () => creerGeoJsonItineraire(itineraire, traceAfficheeRestante),
    [itineraire, traceAfficheeRestante],
  );

  useEffect(() => {
    let actif = true;
    const pointsOsrm = itineraire?.coordonnees ?? [];
    dernierIndexSegmentRef.current = 0;
    positionPrecedenteRef.current = null;
    setTraceAffiche([]);
    onTraceItinerairePrete(false);

    async function preparerTraceAffiche() {
      if (!CENTRAGE_TRACE_ACTIF || pointsOsrm.length < 2) {
        if (actif) {
          setTraceAffiche(pointsOsrm);
          onTraceItinerairePrete(pointsOsrm.length >= 2);
        }
        return;
      }

      try {
        const traceRecentree = await adapterTraceSurAxesRoutiers(pointsOsrm);

        if (actif) {
          const traceFinale =
            traceRecentree.length >= 2 ? traceRecentree : pointsOsrm;
          setTraceAffiche(traceFinale);
          onTraceItinerairePrete(traceFinale.length >= 2);
        }
      } catch {
        if (actif) {
          setTraceAffiche(pointsOsrm);
          onTraceItinerairePrete(pointsOsrm.length >= 2);
        }
      }
    }

    void preparerTraceAffiche();

    return () => {
      actif = false;
    };
  }, [itineraire, onTraceItinerairePrete]);

  useEffect(() => {
    if (!navigationActive) {
      dernierIndexSegmentRef.current = 0;
      positionPrecedenteRef.current = positionUtilisateurValide;
      return;
    }

    positionPrecedenteRef.current = positionUtilisateurValide;

    if (analyseNavigation?.snapActif) {
      dernierIndexSegmentRef.current = Math.max(
        dernierIndexSegmentRef.current,
        analyseNavigation.indexSegment,
      );
    }
  }, [analyseNavigation, navigationActive, positionUtilisateurValide]);

  useEffect(() => {
    if (!coordonneesMarqueurUtilisateur) {
      return;
    }

    dernierePositionGpsMarqueurRef.current = positionUtilisateurValide;
    dernierePositionMarqueurRef.current = coordonneesMarqueurUtilisateur;
  }, [
    coordonneesMarqueurUtilisateur,
    coordonneesMarqueurUtilisateur?.latitude,
    coordonneesMarqueurUtilisateur?.longitude,
    positionUtilisateurValide,
  ]);

  useEffect(() => {
    const points = itineraire?.coordonnees ?? [];
    const premierPoint = points.at(0);
    const deuxiemePoint = points.at(1);

    if (premierPoint && deuxiemePoint && suiviCameraActif) {
      cameraRef.current?.easeTo({
        center: versLngLat(positionUtilisateurAffichee ?? depart?.coordonnees ?? premierPoint),
        bearing: bearingNavigation ?? calculerBearing(premierPoint, deuxiemePoint),
        pitch: obtenirPitchNavigation(navigationPleinEcran),
        zoom: obtenirZoomNavigation(navigationPleinEcran),
        padding: {
          top: obtenirOffsetVerticalNavigation(navigationPleinEcran),
          right: 0,
          bottom: 0,
          left: 0,
        },
        duration: 760,
      });
    }
  }, [
    bearingNavigation,
    depart,
    itineraire,
    navigationPleinEcran,
    positionUtilisateurAffichee,
    suiviCameraActif,
  ]);

  useEffect(() => {
    if (!positionUtilisateurAffichee || cleRecentrage === 0) {
      return;
    }

    cameraRef.current?.easeTo({
      bearing: itineraire ? bearingNavigation ?? 0 : 0,
      center: versLngLat(positionUtilisateurAffichee),
      duration: 500,
      pitch: itineraire ? obtenirPitchNavigation(navigationPleinEcran) : 0,
      zoom: itineraire ? obtenirZoomNavigation(navigationPleinEcran) : 16,
    });
  }, [
    bearingNavigation,
    cleRecentrage,
    itineraire,
    navigationPleinEcran,
    positionUtilisateurAffichee,
  ]);

  useEffect(() => {
    if (itineraire || !positionUtilisateurAffichee || !suiviCameraActif) {
      return;
    }

    cameraRef.current?.easeTo({
      center: versLngLat(positionUtilisateurAffichee),
      duration: 500,
      zoom: 16,
    });
  }, [itineraire, positionUtilisateurAffichee, suiviCameraActif]);

  return (
    <Map
      attribution={false}
      mapStyle={styleCarte}
      onTouchStart={onInteractionUtilisateurCarte}
      style={stylesCarte.carte}
    >
      <Camera
        initialViewState={{
          center: versLngLat(positionUtilisateurValide ?? CENTRE_CARTE_INITIAL),
          zoom: ZOOM_CARTE_INITIAL,
        }}
        ref={cameraRef}
      />
      <GeoJSONSource id="itineraire" data={geoJsonItineraire}>
        <Layer
          id="halo-exterieur-itineraire"
          type="line"
          layout={{
            'line-cap': 'round',
            'line-join': 'round',
          }}
          paint={{
            'line-blur': 3.2,
            'line-color': 'rgba(34,211,238,0.32)',
            'line-opacity': 0.32,
            'line-width': 20,
          }}
        />
        <Layer
          id="halo-interieur-itineraire"
          type="line"
          layout={{
            'line-cap': 'round',
            'line-join': 'round',
          }}
          paint={{
            'line-blur': 1.6,
            'line-color': 'rgba(34,211,238,0.58)',
            'line-opacity': 0.58,
            'line-width': 13,
          }}
        />
        <Layer
          id="trace-itineraire"
          type="line"
          layout={{
            'line-cap': 'round',
            'line-join': 'round',
          }}
          paint={{
            'line-color': '#22D3EE',
            'line-opacity': 0.99,
            'line-width': 11,
          }}
        />
      </GeoJSONSource>
      {coordonneesMarqueurUtilisateur ? (
        <MarqueurUtilisateur
          key={`position-utilisateur-${coordonneesMarqueurUtilisateur.longitude}-${coordonneesMarqueurUtilisateur.latitude}`}
          coordonnees={coordonneesMarqueurUtilisateur}
        />
      ) : null}
      {signalements.map((signalement) => (
        <MarqueurSignalement key={signalement.id} signalement={signalement} />
      ))}
      {itineraire && traceAfficheeRestante.length >= 2 &&
      depart && !estDepartPositionActuelle(depart.libelle) ? (
        <MarqueurCarte
          coordonnees={depart.coordonnees}
          identifiant="depart"
          type="depart"
        />
      ) : null}
      {itineraire && traceAfficheeRestante.length >= 2 && destination ? (
        <MarqueurCarte
          coordonnees={destination.coordonnees}
          identifiant="arrivee"
          type="arrivee"
        />
      ) : null}
    </Map>
  );
}

function estDepartPositionActuelle(libelle: string) {
  return libelle.trim().toLowerCase() === 'position actuelle';
}

function choisirCoordonneesMarqueurUtilisateur({
  dernierePositionGps,
  dernierePositionMarqueur,
  navigationActive,
  positionGps,
  positionSnappee,
  snapActif,
}: {
  dernierePositionGps: Coordonnees | null;
  dernierePositionMarqueur: Coordonnees | null;
  navigationActive: boolean;
  positionGps: Coordonnees | null;
  positionSnappee: Coordonnees | null;
  snapActif: boolean;
}) {
  if (!navigationActive) {
    return positionGps;
  }

  if (!positionGps) {
    return null;
  }

  if (!snapActif || !positionSnappee) {
    return positionGps;
  }

  const gpsABouge =
    !dernierePositionGps ||
    calculerDistanceMetres(dernierePositionGps, positionGps) > 0.1;
  const snapABouge =
    !dernierePositionMarqueur ||
    calculerDistanceMetres(dernierePositionMarqueur, positionSnappee) > 0.1;

  return gpsABouge && !snapABouge ? positionGps : positionSnappee;
}

function obtenirPitchNavigation(pleinEcran: boolean) {
  return pleinEcran ? PITCH_NAVIGATION_PLEIN_ECRAN : PITCH_NAVIGATION_REDUIT;
}

function obtenirZoomNavigation(pleinEcran: boolean) {
  return pleinEcran ? ZOOM_NAVIGATION_PLEIN_ECRAN : ZOOM_NAVIGATION_REDUIT;
}

function obtenirOffsetVerticalNavigation(pleinEcran: boolean) {
  return pleinEcran
    ? OFFSET_VERTICAL_NAVIGATION_PLEIN_ECRAN
    : OFFSET_VERTICAL_NAVIGATION_REDUIT;
}
