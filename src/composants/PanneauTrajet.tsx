import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChampAdresse } from './ChampAdresse';
import { MessageEtat } from './MessageEtat';
import { useSuggestionsAdresse } from '../hooks/useSuggestionsAdresse';
import type { AdresseGeocodee } from '../types/AdresseGeocodee';
import type { Coordonnees } from '../types/Coordonnees';
import type { EtatChargement } from '../types/EtatChargement';

const LIEUX_FAVORIS = ['Palestro', 'Pose', 'Hoche'];

type ProprietesPanneauTrajet = {
  departTexte: string;
  destinationTexte: string;
  etatRecherche: EtatChargement;
  messageRecherche: string | null;
  positionDisponible: boolean;
  positionUtilisateur: Coordonnees | null;
  integre?: boolean;
  fermer: () => void;
  definirDepartTexte: (valeur: string) => void;
  definirDestinationTexte: (valeur: string) => void;
  viderDepart: () => void;
  viderDestination: () => void;
  selectionnerDepart: (adresse: AdresseGeocodee) => void;
  selectionnerDestination: (adresse: AdresseGeocodee) => void;
  rechercherItineraire: () => void;
};

export function PanneauTrajet({
  departTexte,
  destinationTexte,
  etatRecherche,
  messageRecherche,
  positionDisponible,
  positionUtilisateur,
  integre = false,
  fermer,
  definirDepartTexte,
  definirDestinationTexte,
  viderDepart,
  viderDestination,
  selectionnerDepart,
  selectionnerDestination,
  rechercherItineraire,
}: ProprietesPanneauTrajet) {
  const [champActif, setChampActif] = useState<'depart' | 'destination' | null>(
    null,
  );
  const suggestionsDepart = useSuggestionsAdresse(departTexte, {
    actif: champActif === 'depart' && departTexte !== 'Position actuelle',
    positionUtilisateur,
  });
  const suggestionsDestination = useSuggestionsAdresse(destinationTexte, {
    actif: champActif === 'destination',
    positionUtilisateur,
  });
  const chargement = etatRecherche === 'chargement';
  const recherchePossible =
    (positionDisponible || departTexte !== 'Position actuelle') &&
    departTexte.trim().length > 0 &&
    destinationTexte.trim().length > 0;
  const afficherRecherche =
    destinationTexte.trim().length > 0 || Boolean(messageRecherche);

  const choisirDepart = (adresse: AdresseGeocodee) => {
    selectionnerDepart(adresse);
    setChampActif(null);
  };
  const choisirDestination = (adresse: AdresseGeocodee) => {
    selectionnerDestination(adresse);
    setChampActif(null);
  };
  const viderChampDepart = () => {
    viderDepart();
    setChampActif(null);
  };
  const viderChampDestination = () => {
    viderDestination();
    setChampActif(null);
  };

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
        <ChampAdresse
          libelle="DÉPART"
          placeholder="Position actuelle"
          surChangement={definirDepartTexte}
          surFocus={() => setChampActif('depart')}
          surVider={viderChampDepart}
          typeChamp="depart"
          valeur={departTexte}
        />
        {champActif === 'depart' ? (
          <ListeSuggestions
            aucunResultat={suggestionsDepart.aucunResultat}
            chargement={suggestionsDepart.chargement}
            choisirSuggestion={choisirDepart}
            suggestions={suggestionsDepart.suggestions}
          />
        ) : null}

        <View style={styles.separateur} />

        <ChampAdresse
          libelle="ARRIVÉE"
          placeholder="Saisir une adresse"
          surChangement={definirDestinationTexte}
          surFocus={() => setChampActif('destination')}
          surVider={viderChampDestination}
          typeChamp="destination"
          valeur={destinationTexte}
        />
        {champActif === 'destination' ? (
          <ListeSuggestions
            aucunResultat={suggestionsDestination.aucunResultat}
            chargement={suggestionsDestination.chargement}
            choisirSuggestion={choisirDestination}
            suggestions={suggestionsDestination.suggestions}
          />
        ) : null}
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

function ListeSuggestions({
  aucunResultat,
  chargement,
  choisirSuggestion,
  suggestions,
}: {
  aucunResultat: boolean;
  chargement: boolean;
  choisirSuggestion: (adresse: AdresseGeocodee) => void;
  suggestions: AdresseGeocodee[];
}) {
  if (chargement) {
    return <Text style={styles.messageSuggestion}>Recherche...</Text>;
  }

  if (aucunResultat) {
    return <Text style={styles.messageSuggestion}>Aucune suggestion.</Text>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.suggestions}>
      {suggestions.map((suggestion) => (
        <Pressable
          accessibilityRole="button"
          key={`${suggestion.libelle}-${suggestion.coordonnees.latitude}`}
          onPress={() => choisirSuggestion(suggestion)}
          style={styles.suggestion}
        >
          <Feather color="#16a6c9" name="map-pin" size={14} />
          <Text numberOfLines={2} style={styles.texteSuggestion}>
            {suggestion.libelle}
          </Text>
        </Pressable>
      ))}
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
  messageSuggestion: {
    color: '#657783',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 44,
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
  suggestion: {
    alignItems: 'center',
    backgroundColor: '#F7F9FA',
    borderColor: '#C8D8E0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  suggestions: {
    gap: 6,
    marginLeft: 44,
  },
  texteActionFavori: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
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
  texteSuggestion: {
    color: '#1F2D38',
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  titre: {
    color: '#1F2D38',
    fontSize: 17,
    fontWeight: '900',
  },
});
