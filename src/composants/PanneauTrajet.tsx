import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChampAdresse } from './ChampAdresse';
import { MessageEtat } from './MessageEtat';
import type { EtatChargement } from '../types/EtatChargement';

const LIEUX_FAVORIS = ['Palestro', 'Pose', 'Hoche'];

type ProprietesPanneauTrajet = {
  destinationTexte: string;
  etatRecherche: EtatChargement;
  messageRecherche: string | null;
  positionDisponible: boolean;
  integre?: boolean;
  fermer: () => void;
  definirDestinationTexte: (valeur: string) => void;
  rechercherItineraire: () => void;
};

export function PanneauTrajet({
  destinationTexte,
  etatRecherche,
  messageRecherche,
  positionDisponible,
  integre = false,
  fermer,
  definirDestinationTexte,
  rechercherItineraire,
}: ProprietesPanneauTrajet) {
  const chargement = etatRecherche === 'chargement';
  const recherchePossible =
    positionDisponible && destinationTexte.trim().length > 0;
  const afficherRecherche =
    destinationTexte.trim().length > 0 || Boolean(messageRecherche);

  return (
    <View style={[styles.carte, integre && styles.carteIntegree]}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Nouveau trajet</Text>
        <Pressable
          accessibilityLabel="Fermer le panneau trajet"
          accessibilityRole="button"
          onPress={fermer}
          style={styles.fermer}
        >
          <Feather color="#FFFFFF" name="x" size={18} />
        </Pressable>
      </View>
      <View style={styles.formulaire}>
        <View style={styles.departFixe}>
          <View style={styles.pastilleDepart}>
            <Feather color="#16a6c9" name="crosshair" size={16} />
          </View>
          <View style={styles.zoneDepartFixe}>
            <Text style={styles.libelleDepartFixe}>DÉPART</Text>
            <Text style={styles.texteDepartFixe}>Position actuelle</Text>
          </View>
        </View>
        <View style={styles.separateur} />
        <ChampAdresse
          libelle="ARRIVÉE"
          placeholder="Saisir une adresse"
          surChangement={definirDestinationTexte}
          typeChamp="destination"
          valeur={destinationTexte}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitre}>LIEUX FAVORIS</Text>
        <View style={styles.favoris}>
          {LIEUX_FAVORIS.map((lieu) => (
            <View key={lieu} style={styles.favori}>
              <Text numberOfLines={1} style={styles.texteFavori}>
                {lieu}
              </Text>
              <View style={styles.actionsFavori}>
                <Pressable accessibilityRole="button" style={styles.actionFavori}>
                  <Text style={styles.texteActionFavori}>Départ</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={styles.actionFavori}>
                  <Text style={styles.texteActionFavori}>Arrivée</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
      {afficherRecherche ? (
        <>
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
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionFavori: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 16,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  actionsFavori: {
    flexDirection: 'row',
    gap: 8,
  },
  boutonCalcul: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
  },
  boutonCalculInactif: {
    opacity: 0.42,
  },
  carte: {
    backgroundColor: 'rgba(247,249,250,0.96)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 20,
    gap: 10,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
  },
  carteIntegree: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    padding: 0,
    shadowOpacity: 0,
  },
  departFixe: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 46,
  },
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favori: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    gap: 7,
    minHeight: 54,
    padding: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  favoris: {
    gap: 8,
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: '#ff5a4f',
    borderRadius: 17,
    elevation: 8,
    height: 34,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    width: 34,
  },
  formulaire: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  libelleDepartFixe: {
    color: '#657783',
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
    color: '#657783',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  separateur: {
    backgroundColor: 'rgba(15,23,42,0.08)',
    height: 1,
    marginLeft: 44,
  },
  texteBoutonCalcul: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  texteFavori: {
    color: '#1F2D38',
    fontSize: 13,
    fontWeight: '900',
  },
  texteDepartFixe: {
    color: '#1F2D38',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
  },
  texteActionFavori: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  titre: {
    color: '#1F2D38',
    fontSize: 17,
    fontWeight: '900',
  },
  zoneDepartFixe: {
    flex: 1,
    minWidth: 0,
  },
});
