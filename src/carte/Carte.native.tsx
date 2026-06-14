import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';

import {
  CENTRE_CARTE_INITIAL,
  CENTRAGE_TRACE_ACTIF,
  OFFSET_VERTICAL_NAVIGATION,
  PITCH_NAVIGATION,
  obtenirStyleCarte,
  ZOOM_CARTE_INITIAL,
  ZOOM_NAVIGATION,
} from '../constantes/CarteConstantes';
import { calculerBearing, versLngLat } from '../utilitaires/coordonnees';
import { creerGeoJsonItineraire } from '../utilitaires/geojson';
import { adapterTraceSurAxesRoutiers } from './centrageTrace/adapterTraceSurAxesRoutiers';
import { MarqueurCarte } from './MarqueurCarte';
import { stylesCarte } from './stylesCarte';
import type { ProprietesCarte } from './typesCarte';
import type { Coordonnees } from '../types/Coordonnees';

export function Carte({
  depart,
  destination,
  itineraire,
  modeCarte,
  positionUtilisateur,
}: ProprietesCarte) {
  const cameraRef = useRef<CameraRef>(null);
  const [traceAffiche, setTraceAffiche] = useState<Coordonnees[]>([]);
  const styleCarte = useMemo(() => obtenirStyleCarte(modeCarte), [modeCarte]);
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
        pitch: PITCH_NAVIGATION,
        zoom: ZOOM_NAVIGATION,
        padding: {
          top: OFFSET_VERTICAL_NAVIGATION,
          right: 0,
          bottom: 0,
          left: 0,
        },
        duration: 600,
      });
    }
  }, [depart, itineraire, positionUtilisateur]);

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
            'line-blur': 4.8,
            'line-color': 'rgba(34,211,238,0.2)',
            'line-opacity': 0.46,
            'line-width': 22,
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
            'line-color': 'rgba(34,211,238,0.36)',
            'line-opacity': 0.62,
            'line-width': 14,
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
            'line-width': 7,
          }}
        />
      </GeoJSONSource>
      {depart ? (
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
