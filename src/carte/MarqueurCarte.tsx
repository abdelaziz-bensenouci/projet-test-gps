import { Text, View } from 'react-native';
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
      {type === 'depart' ? (
        <View style={stylesCarte.marqueurDepart} />
      ) : (
        <View style={stylesCarte.marqueurArriveeRacine}>
          <View style={stylesCarte.marqueurArriveeContenu}>
            <View style={stylesCarte.hampeArrivee} />
            <View style={stylesCarte.drapeauArrivee}>
              <View style={stylesCarte.ligneDrapeauArrivee}>
                <View style={stylesCarte.carreDrapeauFonce} />
                <View style={stylesCarte.carreDrapeauClair} />
                <View style={stylesCarte.carreDrapeauFonce} />
              </View>
              <View style={stylesCarte.ligneDrapeauArrivee}>
                <View style={stylesCarte.carreDrapeauClair} />
                <View style={stylesCarte.carreDrapeauFonce} />
                <View style={stylesCarte.carreDrapeauClair} />
              </View>
            </View>
            <Text style={stylesCarte.etiquetteArrivee}>Arrivée</Text>
          </View>
        </View>
      )}
    </Marker>
  );
}
