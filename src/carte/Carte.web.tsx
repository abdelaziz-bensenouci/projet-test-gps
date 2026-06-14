import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import marqueurUtilisateur from '../../assets/user-marker-idle.png';
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
  cleRecentrage,
  depart,
  destination,
  itineraire,
  modeCarte,
  positionUtilisateur,
}: ProprietesCarte) {
  const conteneurRef = useRef<HTMLDivElement | null>(null);
  const carteRef = useRef<maplibregl.Map | null>(null);
  const marqueursRef = useRef<maplibregl.Marker[]>([]);
  const marqueurUtilisateurRef = useRef<maplibregl.Marker | null>(null);
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
      const donnees: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: 'FeatureCollection',
        features: traceAffiche.length >= 2
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: traceAffiche.map(versLngLat),
                },
              },
            ]
          : [],
      };

      if (!carte.getSource('itineraire')) {
        carte.addSource('itineraire', { type: 'geojson', data: donnees });
      } else {
        const source = carte.getSource('itineraire') as maplibregl.GeoJSONSource;
        source.setData(donnees);
      }

      ajouterCouchesTrace(carte);
    };

    if (carte.isStyleLoaded()) {
      appliquerTrace();
    } else {
      carte.once('styledata', appliquerTrace);
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

    if (!carte || !positionUtilisateur) {
      marqueurUtilisateurRef.current?.remove();
      marqueurUtilisateurRef.current = null;
      return;
    }

    if (!marqueurUtilisateurRef.current) {
      marqueurUtilisateurRef.current = new maplibregl.Marker({
        anchor: 'center',
        element: creerMarqueurUtilisateur(),
      })
        .setLngLat(versLngLat(positionUtilisateur))
        .addTo(carte);
      return;
    }

    marqueurUtilisateurRef.current.setLngLat(versLngLat(positionUtilisateur));
  }, [positionUtilisateur]);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte || !positionUtilisateur || cleRecentrage === 0) {
      return;
    }

    carte.easeTo({
      center: versLngLat(positionUtilisateur),
      duration: 500,
      pitch: itineraire ? PITCH_NAVIGATION : carte.getPitch(),
      zoom: itineraire ? ZOOM_NAVIGATION : Math.max(carte.getZoom(), 16),
    });
  }, [cleRecentrage, itineraire, positionUtilisateur]);

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

function creerMarqueurUtilisateur() {
  const element = document.createElement('div');
  const conteneur = document.createElement('div');
  const image = document.createElement('img');
  const source = obtenirUrlMarqueurUtilisateur();

  element.style.position = 'relative';
  element.style.width = '42px';
  element.style.height = '42px';
  element.style.pointerEvents = 'none';
  element.style.zIndex = '140';

  conteneur.style.position = 'relative';
  conteneur.style.width = '66px';
  conteneur.style.height = '66px';
  conteneur.style.display = 'flex';
  conteneur.style.alignItems = 'center';
  conteneur.style.justifyContent = 'center';
  conteneur.style.filter = 'drop-shadow(0 0 18px rgba(30,144,255,0.62))';

  image.src = source;
  image.alt = '';
  image.style.width = '66px';
  image.style.height = '66px';
  image.style.objectFit = 'contain';
  image.style.pointerEvents = 'none';

  conteneur.appendChild(image);
  element.appendChild(conteneur);

  return element;
}

function obtenirUrlMarqueurUtilisateur() {
  const source = marqueurUtilisateur as string | { uri?: string };

  if (typeof source === 'string') {
    return source;
  }

  return source.uri ?? '';
}

function ajouterCouchesTrace(carte: maplibregl.Map) {
  if (!carte.getLayer('halo-exterieur-itineraire')) {
    carte.addLayer({
      id: 'halo-exterieur-itineraire',
      type: 'line',
      source: 'itineraire',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-blur': 4.8,
        'line-color': 'rgba(34,211,238,0.2)',
        'line-opacity': 0.46,
        'line-width': 22,
      },
    });
  }

  if (!carte.getLayer('halo-interieur-itineraire')) {
    carte.addLayer({
      id: 'halo-interieur-itineraire',
      type: 'line',
      source: 'itineraire',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-blur': 1.6,
        'line-color': 'rgba(34,211,238,0.36)',
        'line-opacity': 0.62,
        'line-width': 14,
      },
    });
  }

  if (!carte.getLayer('trace-itineraire')) {
    carte.addLayer({
      id: 'trace-itineraire',
      type: 'line',
      source: 'itineraire',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#22D3EE',
        'line-opacity': 0.99,
        'line-width': 7,
      },
    });
  }
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
