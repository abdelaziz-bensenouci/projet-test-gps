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
import { calculerBearing, versLngLat } from '../utilitaires/coordonnees';
import { creerGeoJsonItineraire } from '../utilitaires/geojson';
import {
  analyserNavigationGps,
  calculerTraceRestante,
} from '../navigationGps/navigationGpsAvancee';
import { adapterTraceSurAxesRoutiers } from './centrageTrace/adapterTraceSurAxesRoutiers';
import { MarqueurCarte } from './MarqueurCarte';
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
  positionUtilisateur,
  precisionUtilisateur,
  suiviCameraActif,
}: ProprietesCarte) {
  const cameraRef = useRef<CameraRef>(null);
  const positionPrecedenteRef = useRef<Coordonnees | null>(null);
  const [traceAffiche, setTraceAffiche] = useState<Coordonnees[]>([]);
  const navigationActive = Boolean(itineraire);
  const styleCarte = useMemo(
    () => obtenirStyleCarte(modeCarte, navigationActive),
    [modeCarte, navigationActive],
  );
  const analyseNavigation = useMemo(() => {
    const positionPrecedente = positionPrecedenteRef.current;

    positionPrecedenteRef.current = positionUtilisateur;

    return analyserNavigationGps({
      gps: positionUtilisateur
        ? {
            directionDegres: directionUtilisateur,
            position: positionUtilisateur,
            precisionMetres: precisionUtilisateur,
          }
        : null,
      positionPrecedente,
      trace: traceAffiche,
    });
  }, [directionUtilisateur, positionUtilisateur, precisionUtilisateur, traceAffiche]);
  const positionUtilisateurAffichee =
    analyseNavigation?.positionAffichee ?? positionUtilisateur;
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

    async function preparerTraceAffiche() {
      if (!CENTRAGE_TRACE_ACTIF || pointsOsrm.length < 2) {
        setTraceAffiche(pointsOsrm);
        return;
      }

      try {
        const traceRecentree = await adapterTraceSurAxesRoutiers(pointsOsrm);

        if (actif) {
          setTraceAffiche(
            traceRecentree.length >= 2 ? traceRecentree : pointsOsrm,
          );
        }
      } catch {
        if (actif) {
          setTraceAffiche(pointsOsrm);
        }
      }
    }

    void preparerTraceAffiche();

    return () => {
      actif = false;
    };
  }, [itineraire]);

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
          center: versLngLat(positionUtilisateur ?? CENTRE_CARTE_INITIAL),
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
      {positionUtilisateurAffichee ? (
        <MarqueurUtilisateur coordonnees={positionUtilisateurAffichee} />
      ) : null}
      {depart && !estDepartPositionActuelle(depart.libelle) ? (
        <MarqueurCarte
          coordonnees={depart.coordonnees}
          identifiant="depart"
          type="depart"
        />
      ) : null}
      {destination ? (
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
