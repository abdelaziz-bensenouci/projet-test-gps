import { useEffect, useMemo, useRef } from 'react';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';

import {
  CENTRE_CARTE_INITIAL,
  OFFSET_VERTICAL_NAVIGATION,
  PITCH_NAVIGATION,
  obtenirStyleCarte,
  ZOOM_CARTE_INITIAL,
  ZOOM_NAVIGATION,
} from '../constantes/CarteConstantes';
import { calculerBearing, versLngLat } from '../utilitaires/coordonnees';
import { creerGeoJsonItineraire } from '../utilitaires/geojson';
import { MarqueurCarte } from './MarqueurCarte';
import { stylesCarte } from './stylesCarte';
import type { ProprietesCarte } from './typesCarte';

export function Carte({
  depart,
  destination,
  itineraire,
  modeCarte,
  positionUtilisateur,
}: ProprietesCarte) {
  const cameraRef = useRef<CameraRef>(null);
  const styleCarte = useMemo(() => obtenirStyleCarte(modeCarte), [modeCarte]);
  const geoJsonItineraire = useMemo(
    () => creerGeoJsonItineraire(itineraire),
    [itineraire],
  );

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
          id="halo-itineraire"
          type="line"
          paint={{
            'line-blur': 10,
            'line-color': '#22d3ee',
            'line-opacity': 0.33,
            'line-width': 48,
          }}
        />
        <Layer
          id="trace-itineraire"
          type="line"
          paint={{
            'line-color': '#22d3ee',
            'line-width': 22,
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
