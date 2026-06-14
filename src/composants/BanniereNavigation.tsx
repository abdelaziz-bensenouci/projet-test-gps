import { StyleSheet, Text, View } from 'react-native';

import type { Itineraire } from '../types/Itineraire';

type ProprietesBanniereNavigation = {
  itineraire: Itineraire;
};

export function BanniereNavigation({ itineraire }: ProprietesBanniereNavigation) {
  return (
    <View style={styles.banniere}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexte}>WZ</Text>
      </View>
      <View style={styles.contenuPrincipal}>
        <View style={styles.direction}>
          <Text style={styles.directionTexte}>↑</Text>
        </View>
        <View style={styles.instructions}>
          <Text style={styles.distanceInstruction}>
            {formaterDistance(itineraire.distanceMetres)}
          </Text>
          <Text style={styles.texteInstruction} numberOfLines={2}>
            Continuez tout droit
          </Text>
        </View>
      </View>
      <View style={styles.metriques}>
        <MetriqueNavigation valeur={formaterDuree(itineraire.dureeSecondes)} />
        <MetriqueNavigation valeur={formaterDistance(itineraire.distanceMetres)} />
        <MetriqueNavigation valeur="1 etape" />
        <MetriqueNavigation valeur={formaterHeureArrivee(itineraire.dureeSecondes)} />
      </View>
    </View>
  );
}

function MetriqueNavigation({ valeur }: { valeur: string }) {
  return (
    <View style={styles.metrique}>
      <Text style={styles.texteMetrique} numberOfLines={1}>
        {valeur}
      </Text>
    </View>
  );
}

function formaterDistance(distanceMetres: number) {
  if (distanceMetres >= 1000) {
    return `${(distanceMetres / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMetres)} m`;
}

function formaterDuree(dureeSecondes: number) {
  return `${Math.max(1, Math.round(dureeSecondes / 60))} min`;
}

function formaterHeureArrivee(dureeSecondes: number) {
  const arrivee = new Date(Date.now() + dureeSecondes * 1000);
  const heures = arrivee.getHours().toString().padStart(2, '0');
  const minutes = arrivee.getMinutes().toString().padStart(2, '0');

  return `${heures}:${minutes}`;
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(143,234,255,0.24)',
    borderRadius: 29,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarTexte: {
    color: '#F3FCFF',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 23,
  },
  banniere: {
    alignItems: 'center',
    backgroundColor: 'rgba(5,10,20,0.78)',
    borderColor: 'rgba(0,209,255,0.24)',
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 116,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
    shadowColor: '#00131f',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  contenuPrincipal: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  direction: {
    alignItems: 'center',
    backgroundColor: '#22D3EE',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    width: 42,
  },
  directionTexte: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  distanceInstruction: {
    color: '#8FEAFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 19,
  },
  instructions: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 58,
    minWidth: 0,
  },
  metrique: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.065)',
    borderColor: 'rgba(143,234,255,0.16)',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 19,
    paddingHorizontal: 4,
    width: '100%',
  },
  metriques: {
    alignItems: 'stretch',
    flexShrink: 0,
    gap: 4,
    width: 62,
  },
  texteInstruction: {
    color: '#F3FCFF',
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  texteMetrique: {
    color: '#F3FCFF',
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
});
