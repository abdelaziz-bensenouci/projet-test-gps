import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
import { adapterTraceSurAxesRoutiers } from './centrageTrace/adapterTraceSurAxesRoutiers';
import type { ProprietesCarte } from './typesCarte';
import type { Coordonnees } from '../types/Coordonnees';

export function Carte({
  depart,
  destination,
  itineraire,
  modeCarte,
  positionUtilisateur,
}: ProprietesCarte) {
  const conteneurRef = useRef<HTMLDivElement | null>(null);
  const carteRef = useRef<maplibregl.Map | null>(null);
  const marqueursRef = useRef<maplibregl.Marker[]>([]);
  const [traceAffiche, setTraceAffiche] = useState<Coordonnees[]>([]);
  const styleCarte = useMemo(() => obtenirStyleCarte(modeCarte), [modeCarte]);

  useEffect(() => {
    if (!conteneurRef.current || carteRef.current) {
      return;
    }

    carteRef.current = new maplibregl.Map({
      container: conteneurRef.current,
      style: styleCarte,
      center: versLngLat(positionUtilisateur ?? CENTRE_CARTE_INITIAL),
      zoom: ZOOM_CARTE_INITIAL,
    });

    return () => {
      carteRef.current?.remove();
      carteRef.current = null;
    };
  }, [positionUtilisateur]);

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
    const carte = carteRef.current;

    if (carte) {
      carte.setStyle(styleCarte);
    }
  }, [styleCarte]);

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
          coordinates: traceAffiche.map(versLngLat),
        },
      };

      if (!carte.getSource('itineraire')) {
        carte.addSource('itineraire', { type: 'geojson', data: donnees });
        carte.addLayer({
          id: 'halo-itineraire',
          type: 'line',
          source: 'itineraire',
          paint: {
            'line-blur': 10,
            'line-color': '#22d3ee',
            'line-opacity': 0.33,
            'line-width': 48,
          },
        });
        carte.addLayer({
          id: 'trace-itineraire',
          type: 'line',
          source: 'itineraire',
          paint: { 'line-color': '#22d3ee', 'line-width': 22 },
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
  }, [traceAffiche, styleCarte]);

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
