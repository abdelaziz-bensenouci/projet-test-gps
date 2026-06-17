import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import marqueurUtilisateur from '../../assets/user-marker-idle.png';
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
import {
  analyserNavigationGps,
  calculerTraceRestante,
} from '../navigationGps/navigationGpsAvancee';
import { adapterTraceSurAxesRoutiers } from './centrageTrace/adapterTraceSurAxesRoutiers';
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
  const conteneurRef = useRef<HTMLDivElement | null>(null);
  const carteRef = useRef<maplibregl.Map | null>(null);
  const marqueursRef = useRef<maplibregl.Marker[]>([]);
  const marqueurUtilisateurRef = useRef<maplibregl.Marker | null>(null);
  const [cartePrete, setCartePrete] = useState(false);
  const [traceAffiche, setTraceAffiche] = useState<Coordonnees[]>([]);
  const positionPrecedenteRef = useRef<Coordonnees | null>(null);
  const dernierIndexSegmentRef = useRef(0);
  const navigationActive = Boolean(itineraire && traceAffiche.length >= 2);
  const styleCarte = useMemo(
    () => obtenirStyleCarte(modeCarte, navigationActive),
    [modeCarte, navigationActive],
  );
  const styleAppliqueRef = useRef(styleCarte);
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
  const coordonneesMarqueurUtilisateur = positionUtilisateurValide;
  const bearingNavigation = analyseNavigation?.bearingNavigation;
  const traceAfficheeRestante = useMemo(
    () => calculerTraceRestante(traceAffiche, analyseNavigation),
    [analyseNavigation, traceAffiche],
  );

  useEffect(() => {
    if (!conteneurRef.current || carteRef.current) {
      return;
    }

    carteRef.current = new maplibregl.Map({
      attributionControl: false,
      container: conteneurRef.current,
      style: styleCarte,
      center: versLngLat(positionUtilisateurValide ?? CENTRE_CARTE_INITIAL),
      zoom: ZOOM_CARTE_INITIAL,
    });
    setCartePrete(true);

    return () => {
      carteRef.current?.remove();
      carteRef.current = null;
    };
  }, []);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte) {
      return;
    }

    const interactionUtilisateur = () => {
      onInteractionUtilisateurCarte();
    };

    carte.on('dragstart', interactionUtilisateur);
    carte.on('mousedown', interactionUtilisateur);
    carte.on('pitchstart', interactionUtilisateur);
    carte.on('rotatestart', interactionUtilisateur);
    carte.on('touchstart', interactionUtilisateur);

    return () => {
      carte.off('dragstart', interactionUtilisateur);
      carte.off('mousedown', interactionUtilisateur);
      carte.off('pitchstart', interactionUtilisateur);
      carte.off('rotatestart', interactionUtilisateur);
      carte.off('touchstart', interactionUtilisateur);
    };
  }, [onInteractionUtilisateurCarte]);

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
    const carte = carteRef.current;

    if (carte && styleAppliqueRef.current !== styleCarte) {
      styleAppliqueRef.current = styleCarte;
      carte.setStyle(styleCarte);
    }
  }, [styleCarte]);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte) {
      return;
    }

    let actif = true;
    const appliquerTrace = () => {
      if (!actif || !carte.isStyleLoaded()) {
        return;
      }

      const donnees: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
        type: 'FeatureCollection',
        features: traceAfficheeRestante.length >= 2
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: traceAfficheeRestante.map(versLngLat),
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
    }

    carte.on('load', appliquerTrace);
    carte.on('styledata', appliquerTrace);
    carte.on('idle', appliquerTrace);

    return () => {
      actif = false;
      carte.off('load', appliquerTrace);
      carte.off('styledata', appliquerTrace);
      carte.off('idle', appliquerTrace);
    };
  }, [traceAfficheeRestante, styleCarte]);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte) {
      return;
    }

    marqueursRef.current.forEach((marqueur) => marqueur.remove());
    marqueursRef.current = [];

    const tracePrete = Boolean(itineraire && traceAfficheeRestante.length >= 2);

    signalements.forEach((signalement) => {
      marqueursRef.current.push(
        creerMarqueurSignalement(carte, signalement.coordonnees, signalement.libelle),
      );
    });

    if (tracePrete && depart && !estDepartPositionActuelle(depart.libelle)) {
      marqueursRef.current.push(
        creerMarqueur(carte, depart.coordonnees, '#2563eb'),
      );
    }

    if (tracePrete && destination) {
      marqueursRef.current.push(
        creerMarqueurArrivee(carte, destination.coordonnees, destination.libelle),
      );
    }
  }, [depart, destination, itineraire, signalements, traceAfficheeRestante]);

  useEffect(() => {
    const carte = carteRef.current;

    if (
      !carte ||
      !cartePrete ||
      !estCoordonneesValides(coordonneesMarqueurUtilisateur)
    ) {
      return;
    }

    const lngLatMarqueurUtilisateur = versLngLat(coordonneesMarqueurUtilisateur);

    if (!marqueurUtilisateurRef.current) {
      marqueurUtilisateurRef.current = new maplibregl.Marker({
        anchor: 'center',
        element: creerMarqueurUtilisateur(),
      })
        .setLngLat(lngLatMarqueurUtilisateur)
        .addTo(carte);
      return;
    }

    marqueurUtilisateurRef.current.setLngLat(lngLatMarqueurUtilisateur);
  }, [
    cartePrete,
    coordonneesMarqueurUtilisateur?.latitude,
    coordonneesMarqueurUtilisateur?.longitude,
  ]);

  useEffect(() => {
    const carte = carteRef.current;

    if (!carte || !positionUtilisateurAffichee || cleRecentrage === 0) {
      return;
    }

    carte.easeTo({
      bearing: itineraire ? bearingNavigation ?? carte.getBearing() : carte.getBearing(),
      center: versLngLat(positionUtilisateurAffichee),
      duration: 500,
      pitch: itineraire
        ? obtenirPitchNavigation(navigationPleinEcran)
        : carte.getPitch(),
      zoom: itineraire
        ? obtenirZoomNavigation(navigationPleinEcran)
        : Math.max(carte.getZoom(), 16),
    });
  }, [
    bearingNavigation,
    cleRecentrage,
    itineraire,
    navigationPleinEcran,
    positionUtilisateurAffichee,
  ]);

  useEffect(() => {
    const carte = carteRef.current;
    const points = itineraire?.coordonnees ?? [];
    const premierPoint = points.at(0);
    const deuxiemePoint = points.at(1);

    if (carte && premierPoint && deuxiemePoint && suiviCameraActif) {
      carte.easeTo({
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
    const carte = carteRef.current;

    if (!carte || itineraire || !positionUtilisateurAffichee || !suiviCameraActif) {
      return;
    }

    carte.easeTo({
      center: versLngLat(positionUtilisateurAffichee),
      duration: 500,
      zoom: Math.max(carte.getZoom(), 16),
    });
  }, [itineraire, positionUtilisateurAffichee, suiviCameraActif]);

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
        'line-blur': 3.2,
        'line-color': 'rgba(34,211,238,0.32)',
        'line-opacity': 0.32,
        'line-width': 20,
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
        'line-color': 'rgba(34,211,238,0.58)',
        'line-opacity': 0.58,
        'line-width': 13,
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
        'line-width': 11,
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

function creerMarqueurSignalement(
  carte: maplibregl.Map,
  coordonnees: { longitude: number; latitude: number },
  libelle: string,
) {
  const element = document.createElement('div');
  element.title = libelle;
  element.textContent = '!';
  element.style.width = '28px';
  element.style.height = '28px';
  element.style.borderRadius = '14px';
  element.style.border = '3px solid #ffffff';
  element.style.backgroundColor = '#EF4444';
  element.style.color = '#ffffff';
  element.style.fontWeight = '900';
  element.style.fontSize = '15px';
  element.style.lineHeight = '22px';
  element.style.textAlign = 'center';
  element.style.boxShadow = '0 5px 10px rgba(239,68,68,0.32)';

  return new maplibregl.Marker({ element })
    .setLngLat(versLngLat(coordonnees))
    .addTo(carte);
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

function creerMarqueurArrivee(
  carte: maplibregl.Map,
  coordonnees: { longitude: number; latitude: number },
  libelle: string,
) {
  const racine = document.createElement('div');
  const marqueur = document.createElement('div');
  const hampe = document.createElement('div');
  const drapeau = document.createElement('div');
  const etiquette = document.createElement('div');

  racine.title = libelle;
  racine.style.width = '78px';
  racine.style.height = '78px';
  racine.style.pointerEvents = 'auto';
  racine.style.zIndex = '96';

  marqueur.style.position = 'relative';
  marqueur.style.width = '78px';
  marqueur.style.height = '78px';
  marqueur.style.filter = 'drop-shadow(0 12px 18px rgba(0,0,0,0.34))';

  hampe.style.position = 'absolute';
  hampe.style.left = '21px';
  hampe.style.top = '8px';
  hampe.style.width = '4px';
  hampe.style.height = '54px';
  hampe.style.borderRadius = '999px';
  hampe.style.background = 'linear-gradient(180deg, #f8fafc, #94a3b8)';
  hampe.style.boxShadow = '0 0 0 2px rgba(7,24,39,0.72)';

  drapeau.style.position = 'absolute';
  drapeau.style.left = '25px';
  drapeau.style.top = '8px';
  drapeau.style.width = '36px';
  drapeau.style.height = '25px';
  drapeau.style.borderRadius = '3px 6px 6px 3px';
  drapeau.style.border = '2px solid rgba(7,24,39,0.9)';
  drapeau.style.backgroundColor = '#ffffff';
  drapeau.style.backgroundImage = [
    'linear-gradient(45deg, #111827 25%, transparent 25%)',
    'linear-gradient(-45deg, #111827 25%, transparent 25%)',
    'linear-gradient(45deg, transparent 75%, #111827 75%)',
    'linear-gradient(-45deg, transparent 75%, #111827 75%)',
  ].join(', ');
  drapeau.style.backgroundSize = '14px 14px';
  drapeau.style.backgroundPosition = '0 0, 0 7px, 7px -7px, -7px 0';
  drapeau.style.boxShadow =
    '0 0 0 3px rgba(255,255,255,0.72), 0 0 0 8px rgba(23,212,255,0.22)';

  etiquette.textContent = 'Arrivée';
  etiquette.style.position = 'absolute';
  etiquette.style.left = '2px';
  etiquette.style.top = '54px';
  etiquette.style.padding = '3px 8px';
  etiquette.style.borderRadius = '999px';
  etiquette.style.background = 'rgba(7,24,39,0.95)';
  etiquette.style.color = '#ffffff';
  etiquette.style.border = '1px solid rgba(255,255,255,0.55)';
  etiquette.style.font = '850 11px/14px system-ui, sans-serif';
  etiquette.style.whiteSpace = 'nowrap';

  marqueur.append(hampe, drapeau, etiquette);
  racine.appendChild(marqueur);

  return new maplibregl.Marker({ anchor: 'bottom', element: racine })
    .setLngLat(versLngLat(coordonnees))
    .addTo(carte);
}

function estDepartPositionActuelle(libelle: string) {
  return libelle.trim().toLowerCase() === 'position actuelle';
}
