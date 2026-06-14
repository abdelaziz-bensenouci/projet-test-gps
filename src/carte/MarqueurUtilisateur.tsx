import { Image, View } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';

import marqueurUtilisateur from '../../assets/user-marker-idle.png';
import type { Coordonnees } from '../types/Coordonnees';
import { versLngLat } from '../utilitaires/coordonnees';
import { stylesCarte } from './stylesCarte';

type ProprietesMarqueurUtilisateur = {
  coordonnees: Coordonnees;
};

export function MarqueurUtilisateur({
  coordonnees,
}: ProprietesMarqueurUtilisateur) {
  return (
    <Marker id="position-utilisateur" lngLat={versLngLat(coordonnees)}>
      <View style={stylesCarte.ancreMarqueurUtilisateur}>
        <Image
          accessibilityIgnoresInvertColors
          source={marqueurUtilisateur}
          style={stylesCarte.imageMarqueurUtilisateur}
        />
      </View>
    </Marker>
  );
}
