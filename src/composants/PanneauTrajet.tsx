import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChampAdresse } from './ChampAdresse';
import { MessageEtat } from './MessageEtat';
import type { EtatChargement } from '../types/EtatChargement';

const LIEUX_FAVORIS = ['Maison', 'Travail', 'Ecole'];

type ProprietesPanneauTrajet = {
  destinationTexte: string;
  etatRecherche: EtatChargement;
  messageRecherche: string | null;
  positionDisponible: boolean;
  fermer: () => void;
  definirDestinationTexte: (valeur: string) => void;
  rechercherItineraire: () => void;
};

export function PanneauTrajet({
  destinationTexte,
  etatRecherche,
  messageRecherche,
  positionDisponible,
  fermer,
  definirDestinationTexte,
  rechercherItineraire,
}: ProprietesPanneauTrajet) {
  const chargement = etatRecherche === 'chargement';
  const recherchePossible =
    positionDisponible && destinationTexte.trim().length > 0;

  return (
    <View style={styles.carte}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Nouveau trajet</Text>
        <Pressable
          accessibilityRole="button"
          onPress={fermer}
          style={styles.fermer}
        >
          <Feather color="#F3FCFF" name="x" size={18} />
        </Pressable>
      </View>
      <View style={styles.formulaire}>
        <View style={styles.departFixe}>
          <View style={styles.pastilleDepart}>
            <Feather color="#13b6d8" name="crosshair" size={18} />
          </View>
          <View style={styles.zoneDepartFixe}>
            <Text style={styles.libelleDepartFixe}>Depart</Text>
            <Text style={styles.texteDepartFixe}>Position actuelle</Text>
          </View>
        </View>
        <View style={styles.separateur} />
        <ChampAdresse
          libelle="Arrivee"
          placeholder="Saisir une adresse"
          surChangement={definirDestinationTexte}
          typeChamp="destination"
          valeur={destinationTexte}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Lieux favoris</Text>
        <View style={styles.favoris}>
          {LIEUX_FAVORIS.map((lieu) => (
            <View key={lieu} style={styles.favori}>
              <Text style={styles.texteFavori}>{lieu}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actionsSecondaires}>
        <View style={styles.actionSecondaire}>
          <Text style={styles.texteActionSecondaire}>Depart</Text>
        </View>
        <View style={styles.actionSecondaire}>
          <Text style={styles.texteActionSecondaire}>Arrivee</Text>
        </View>
      </View>
      <Pressable
        disabled={!recherchePossible || chargement}
        onPress={rechercherItineraire}
        style={[
          styles.boutonCalcul,
          (!recherchePossible || chargement) && styles.boutonCalculInactif,
        ]}
      >
        <Text style={styles.texteBoutonCalcul}>
          {chargement ? 'Calcul en cours' : 'Calculer le trajet'}
        </Text>
      </Pressable>
      <MessageEtat message={messageRecherche} />
    </View>
  );
}

const styles = StyleSheet.create({
  actionSecondaire: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(143,234,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  actionsSecondaires: {
    flexDirection: 'row',
    gap: 10,
  },
  boutonCalcul: {
    alignItems: 'center',
    backgroundColor: '#22D3EE',
    borderRadius: 22,
    justifyContent: 'center',
    minHeight: 46,
  },
  boutonCalculInactif: {
    opacity: 0.42,
  },
  carte: {
    backgroundColor: 'rgba(5,10,20,0.88)',
    borderColor: 'rgba(0,209,255,0.24)',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 20,
    gap: 10,
    padding: 14,
    shadowColor: '#00131f',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
  },
  departFixe: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
  },
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favori: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(143,234,255,0.16)',
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 54,
    padding: 9,
  },
  favoris: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  formulaire: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  libelleDepartFixe: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pastilleDepart: {
    alignItems: 'center',
    backgroundColor: 'rgba(22,166,201,0.1)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  section: {
    gap: 8,
  },
  sectionTitre: {
    color: 'rgba(143,234,255,0.72)',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  separateur: {
    backgroundColor: 'rgba(15,23,42,0.08)',
    height: 1,
    marginLeft: 44,
  },
  texteActionSecondaire: {
    color: '#F3FCFF',
    fontSize: 13,
    fontWeight: '900',
  },
  texteBoutonCalcul: {
    color: '#04242d',
    fontSize: 15,
    fontWeight: '900',
  },
  texteFavori: {
    color: '#F3FCFF',
    fontSize: 13,
    fontWeight: '800',
  },
  texteFermer: {
    color: '#F3FCFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  texteDepartFixe: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 28,
  },
  titre: {
    color: '#F3FCFF',
    fontSize: 18,
    fontWeight: '900',
  },
  zoneDepartFixe: {
    flex: 1,
    minWidth: 0,
  },
});
