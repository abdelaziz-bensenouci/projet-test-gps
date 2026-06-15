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
  itineraire,
  modeCarte,
  navigationPleinEcran,
  positionUtilisateur,
}: ProprietesCarte) {
  const cameraRef = useRef<CameraRef>(null);
  const [traceAffiche, setTraceAffiche] = useState<Coordonnees[]>([]);
  const navigationActive = Boolean(itineraire);
  const styleCarte = useMemo(
    () => obtenirStyleCarte(modeCarte, navigationActive),
    [modeCarte, navigationActive],
  );
  const geoJsonItineraire = useMemo(
    () => creerGeoJsonItineraire(itineraire, traceAffiche),
    [itineraire, traceAffiche],
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

    if (premierPoint && deuxiemePoint) {
      cameraRef.current?.easeTo({
        center: versLngLat(positionUtilisateur ?? depart?.coordonnees ?? premierPoint),
        bearing: calculerBearing(premierPoint, deuxiemePoint),
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
  }, [depart, itineraire, navigationPleinEcran, positionUtilisateur]);

  useEffect(() => {
    if (!positionUtilisateur || cleRecentrage === 0) {
      return;
    }

    cameraRef.current?.easeTo({
      center: versLngLat(positionUtilisateur),
      duration: 500,
      pitch: itineraire ? obtenirPitchNavigation(navigationPleinEcran) : 0,
      zoom: itineraire ? obtenirZoomNavigation(navigationPleinEcran) : 16,
    });
  }, [cleRecentrage, itineraire, navigationPleinEcran, positionUtilisateur]);

  return (
    <Map attribution mapStyle={styleCarte} style={stylesCarte.carte}>
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
      {positionUtilisateur ? (
        <MarqueurUtilisateur coordonnees={positionUtilisateur} />
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
