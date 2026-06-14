import { useEffect, useMemo, useRef } from 'react';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef } from '@maplibre/maplibre-react-native';

import {
  CENTRE_CARTE_INITIAL,
  STYLE_CARTE,
  ZOOM_CARTE_INITIAL,
} from '../constantes/CarteConstantes';
import { creerBornes, versLngLat } from '../utilitaires/coordonnees';
import { creerGeoJsonItineraire } from '../utilitaires/geojson';
import { MarqueurCarte } from './MarqueurCarte';
import { stylesCarte } from './stylesCarte';
import type { ProprietesCarte } from './typesCarte';

export function Carte({
  depart,
  destination,
  itineraire,
  positionUtilisateur,
}: ProprietesCarte) {
  const cameraRef = useRef<CameraRef>(null);
  const geoJsonItineraire = useMemo(
    () => creerGeoJsonItineraire(itineraire),
    [itineraire],
  );

  useEffect(() => {
    const points = itineraire?.coordonnees ?? [];
    const bornes = creerBornes(points);

    if (bornes) {
      cameraRef.current?.fitBounds(bornes, {
        padding: { top: 80, right: 40, bottom: 80, left: 40 },
        duration: 600,
      });
    }
  }, [itineraire]);

  return (
    <Map attribution mapStyle={STYLE_CARTE} style={stylesCarte.carte}>
      <Camera
        initialViewState={{
          center: versLngLat(positionUtilisateur ?? CENTRE_CARTE_INITIAL),
          zoom: ZOOM_CARTE_INITIAL,
        }}
        ref={cameraRef}
      />
      <GeoJSONSource id="itineraire" data={geoJsonItineraire}>
        <Layer
          id="trace-itineraire"
          type="line"
          paint={{
            'line-color': '#2563eb',
            'line-width': 5,
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
