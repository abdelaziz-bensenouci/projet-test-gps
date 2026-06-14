import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  CENTRE_CARTE_INITIAL,
  OFFSET_VERTICAL_NAVIGATION,
  PITCH_NAVIGATION,
  STYLE_CARTE,
  ZOOM_CARTE_INITIAL,
  ZOOM_NAVIGATION,
} from '../constantes/CarteConstantes';
import { calculerBearing, versLngLat } from '../utilitaires/coordonnees';
import type { ProprietesCarte } from './typesCarte';

export function Carte({
  depart,
  destination,
  itineraire,
  positionUtilisateur,
}: ProprietesCarte) {
  const conteneurRef = useRef<HTMLDivElement | null>(null);
  const carteRef = useRef<maplibregl.Map | null>(null);
  const marqueursRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!conteneurRef.current || carteRef.current) {
      return;
    }

    carteRef.current = new maplibregl.Map({
      container: conteneurRef.current,
      style: STYLE_CARTE,
      center: versLngLat(positionUtilisateur ?? CENTRE_CARTE_INITIAL),
      zoom: ZOOM_CARTE_INITIAL,
    });

    return () => {
      carteRef.current?.remove();
      carteRef.current = null;
    };
  }, [positionUtilisateur]);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte) {
      return;
    }

    const appliquerTrace = () => {
      const donnees: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: itineraire?.coordonnees.map(versLngLat) ?? [],
        },
      };

      if (!carte.getSource('itineraire')) {
        carte.addSource('itineraire', { type: 'geojson', data: donnees });
        carte.addLayer({
          id: 'halo-itineraire',
          type: 'line',
          source: 'itineraire',
          paint: {
            'line-blur': 6,
            'line-color': '#22d3ee',
            'line-opacity': 0.28,
            'line-width': 40,
          },
        });
        carte.addLayer({
          id: 'trace-itineraire',
          type: 'line',
          source: 'itineraire',
          paint: { 'line-color': '#22d3ee', 'line-width': 20 },
        });
        return;
      }

      const source = carte.getSource('itineraire') as maplibregl.GeoJSONSource;
      source.setData(donnees);
    };

    if (carte.isStyleLoaded()) {
      appliquerTrace();
    } else {
      carte.once('load', appliquerTrace);
    }
  }, [itineraire]);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte) {
      return;
    }

    marqueursRef.current.forEach((marqueur) => marqueur.remove());
    marqueursRef.current = [];

    if (depart) {
      marqueursRef.current.push(
        creerMarqueur(carte, depart.coordonnees, '#2563eb'),
      );
    }

    if (destination) {
      marqueursRef.current.push(
        creerMarqueur(carte, destination.coordonnees, '#dc2626'),
      );
    }
  }, [depart, destination]);

  useEffect(() => {
    const carte = carteRef.current;
    const points = itineraire?.coordonnees ?? [];
    const premierPoint = points.at(0);
    const deuxiemePoint = points.at(1);

    if (carte && premierPoint && deuxiemePoint) {
      carte.easeTo({
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

  return <div ref={conteneurRef} style={{ flex: 1 }} />;
}

function creerMarqueur(
  carte: maplibregl.Map,
  coordonnees: { longitude: number; latitude: number },
  couleur: string,
) {
  const element = document.createElement('div');
  element.style.width = '16px';
  element.style.height = '16px';
  element.style.borderRadius = '8px';
  element.style.border = '2px solid #ffffff';
  element.style.backgroundColor = couleur;

  return new maplibregl.Marker({ element })
    .setLngLat(versLngLat(coordonnees))
    .addTo(carte);
}
