import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import type { ContactConfiance, LieuFavori, ProfilUtilisateur } from '../types/ProfilUtilisateur';
import type { NiveauDangerSignalement } from '../types/Signalement';

type ProprietesBase = {
  fermer: () => void;
};

export function PanneauSignalement({
  creationEnCours,
  fermer,
  message,
  signaler,
}: ProprietesBase & {
  creationEnCours: boolean;
  message: string | null;
  signaler: (niveau: NiveauDangerSignalement, libelle: string) => void;
}) {
  const options: Array<{
    libelle: string;
    niveau: NiveauDangerSignalement;
    icone: keyof typeof Feather.glyphMap;
  }> = [
    { libelle: 'Rue mal éclairée', niveau: 'modere', icone: 'moon' },
    { libelle: 'Zone à éviter', niveau: 'eleve', icone: 'alert-triangle' },
    { libelle: 'Travaux', niveau: 'faible', icone: 'tool' },
  ];

  return (
    <CartePanneau fermer={fermer} titre="Créer un signalement">
      <Text style={styles.description}>
        Le signalement sera créé à votre position GPS actuelle.
      </Text>
      {options.map((option) => (
        <Pressable
          accessibilityRole="button"
          disabled={creationEnCours}
          key={option.libelle}
          onPress={() => signaler(option.niveau, option.libelle)}
          style={[styles.ligneAction, creationEnCours && styles.desactive]}
        >
          <Feather color="#EF4444" name={option.icone} size={18} />
          <Text style={styles.texteAction}>{option.libelle}</Text>
          <Feather color="#657783" name="chevron-right" size={18} />
        </Pressable>
      ))}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </CartePanneau>
  );
}

export function PanneauProfil({
  contacts,
  favoris,
  fermer,
  profil,
}: ProprietesBase & {
  contacts: ContactConfiance[];
  favoris: LieuFavori[];
  profil: ProfilUtilisateur | null;
}) {
  return (
    <CartePanneau fermer={fermer} titre="Profil WalkZen">
      <View style={styles.resumeProfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>WZ</Text>
        </View>
        <View style={styles.resumeTexte}>
          <Text style={styles.nomProfil}>
            {profil?.nomComplet || profil?.email || 'Utilisateur invité'}
          </Text>
          <Text style={styles.description}>
            {profil?.identifiantWalkZen ?? 'Connectez-vous pour retrouver votre ID WalkZen.'}
          </Text>
        </View>
      </View>
      <TuileStat libelle="Contacts de confiance" valeur={contacts.length} />
      <TuileStat libelle="Lieux favoris" valeur={favoris.length} />
      {!profil ? (
        <Text style={styles.message}>
          Profil minimal branché. Le formulaire de connexion complet sera porté dans un lot suivant.
        </Text>
      ) : null}
    </CartePanneau>
  );
}

export function PanneauPartage({
  contacts,
  fermer,
}: ProprietesBase & {
  contacts: ContactConfiance[];
}) {
  return (
    <CartePanneau fermer={fermer} titre="Partage">
      <Text style={styles.description}>
        Contacts de confiance disponibles pour le futur partage live.
      </Text>
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <View key={contact.id} style={styles.ligneInfo}>
            <Text style={styles.texteAction}>{contact.nom || contact.identifiantWalkZen}</Text>
            <Text style={styles.detail}>{contact.identifiantWalkZen}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.message}>Aucun contact de confiance enregistré.</Text>
      )}
      <Text style={styles.message}>
        Le partage live WalkZen3 nécessite un branchement dédié et reste en panneau provisoire.
      </Text>
    </CartePanneau>
  );
}

export function PanneauUrgence({ fermer }: ProprietesBase) {
  return (
    <CartePanneau fermer={fermer} titre="Urgence">
      <View style={styles.ligneInfo}>
        <Text style={styles.texteAction}>Police</Text>
        <Text style={styles.numeroUrgence}>17</Text>
      </View>
      <View style={styles.ligneInfo}>
        <Text style={styles.texteAction}>Pompiers</Text>
        <Text style={styles.numeroUrgence}>18</Text>
      </View>
      <Text style={styles.message}>
        Le SOS Supabase complet sera branché après contacts/profil avancés.
      </Text>
    </CartePanneau>
  );
}

function CartePanneau({
  children,
  fermer,
  titre,
}: ProprietesBase & {
  children: ReactNode;
  titre: string;
}) {
  return (
    <View style={styles.carte}>
      <View style={styles.entete}>
        <Text style={styles.titre}>{titre}</Text>
        <Pressable accessibilityRole="button" onPress={fermer} style={styles.fermer}>
          <Feather color="#FFFFFF" name="x" size={18} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function TuileStat({ libelle, valeur }: { libelle: string; valeur: number }) {
  return (
    <View style={styles.ligneInfo}>
      <Text style={styles.texteAction}>{libelle}</Text>
      <Text style={styles.badge}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarTexte: {
    color: '#1F2D38',
    fontSize: 16,
    fontWeight: '900',
  },
  badge: {
    color: '#16a6c9',
    fontSize: 18,
    fontWeight: '900',
  },
  carte: {
    backgroundColor: 'rgba(247,249,250,0.98)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 10,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  description: {
    color: '#657783',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  desactive: {
    opacity: 0.55,
  },
  detail: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
  },
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: '#ff5a4f',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  ligneAction: {
    alignItems: 'center',
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  ligneInfo: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 16,
    borderWidth: 1,
    gap: 3,
    minHeight: 50,
    padding: 11,
  },
  message: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  nomProfil: {
    color: '#1F2D38',
    fontSize: 15,
    fontWeight: '900',
  },
  numeroUrgence: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '900',
  },
  resumeProfil: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  resumeTexte: {
    flex: 1,
  },
  texteAction: {
    color: '#1F2D38',
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  titre: {
    color: '#1F2D38',
    fontSize: 17,
    fontWeight: '900',
  },
});
