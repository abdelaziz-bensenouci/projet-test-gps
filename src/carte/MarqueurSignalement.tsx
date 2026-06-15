import { Text, View } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';

import type { Signalement } from '../types/Signalement';
import { versLngLat } from '../utilitaires/coordonnees';
import { stylesCarte } from './stylesCarte';

type ProprietesMarqueurSignalement = {
  signalement: Signalement;
};

export function MarqueurSignalement({
  signalement,
}: ProprietesMarqueurSignalement) {
  return (
    <Marker id={`signalement-${signalement.id}`} lngLat={versLngLat(signalement.coordonnees)}>
      <View style={stylesCarte.marqueurSignalement}>
        <Text style={stylesCarte.texteMarqueurSignalement}>!</Text>
      </View>
    </Marker>
  );
}
