import { View } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';

import type { Coordonnees } from '../types/Coordonnees';
import { versLngLat } from '../utilitaires/coordonnees';
import { stylesCarte } from './stylesCarte';

type ProprietesMarqueurCarte = {
  identifiant: string;
  coordonnees: Coordonnees;
  type: 'depart' | 'arrivee';
};

export function MarqueurCarte({
  identifiant,
  coordonnees,
  type,
}: ProprietesMarqueurCarte) {
  return (
    <Marker id={identifiant} lngLat={versLngLat(coordonnees)}>
      <View
        style={
          type === 'depart'
            ? stylesCarte.marqueurDepart
            : stylesCarte.marqueurArrivee
        }
      />
    </Marker>
  );
}
