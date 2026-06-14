import { useEffect, useRef, useState } from 'react';

import { rechercherSuggestionsAdresse } from '../geocodage/ServiceGeocodage';
import type { AdresseGeocodee } from '../types/AdresseGeocodee';
import type { Coordonnees } from '../types/Coordonnees';

type OptionsSuggestionsAdresse = {
  actif: boolean;
  positionUtilisateur: Coordonnees | null;
};

export function useSuggestionsAdresse(
  texte: string,
  { actif, positionUtilisateur }: OptionsSuggestionsAdresse,
) {
  const [suggestions, setSuggestions] = useState<AdresseGeocodee[]>([]);
  const [chargement, setChargement] = useState(false);
  const [rechercheTerminee, setRechercheTerminee] = useState(false);
  const requeteCourante = useRef(0);

  useEffect(() => {
    const recherche = texte.trim();
    requeteCourante.current += 1;
    const identifiantRequete = requeteCourante.current;

    if (!actif || recherche.length < 5) {
      setSuggestions([]);
      setChargement(false);
      setRechercheTerminee(false);
      return;
    }

    setChargement(true);
    setRechercheTerminee(false);

    const delai = setTimeout(() => {
      void rechercherSuggestionsAdresse(recherche, {
        positionReference: positionUtilisateur,
      })
        .then((resultats) => {
          if (requeteCourante.current !== identifiantRequete) {
            return;
          }

          setSuggestions(resultats);
          setRechercheTerminee(true);
        })
        .catch(() => {
          if (requeteCourante.current !== identifiantRequete) {
            return;
          }

          setSuggestions([]);
          setRechercheTerminee(true);
        })
        .finally(() => {
          if (requeteCourante.current === identifiantRequete) {
            setChargement(false);
          }
        });
    }, 400);

    return () => {
      clearTimeout(delai);
    };
  }, [actif, positionUtilisateur, texte]);

  return {
    aucunResultat:
      actif && texte.trim().length >= 5 && rechercheTerminee && suggestions.length === 0,
    chargement,
    suggestions,
  };
}
