import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

export function SectionProfilCarte({
  children,
  detail,
  icone,
  ouverte,
  titre,
  valeur,
  onPress,
}: {
  children: ReactNode;
  detail: string;
  icone: keyof typeof Feather.glyphMap;
  ouverte: boolean;
  titre: string;
  valeur: string;
  onPress: () => void;
}) {
  return (
    <View style={[stylesProfil.section, ouverte && stylesProfil.sectionOuverte]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={stylesProfil.enteteSection}
      >
        <View style={stylesProfil.iconeSection}>
          <Feather color="#16a6c9" name={icone} size={18} />
        </View>
        <View style={stylesProfil.texteSection}>
          <Text style={stylesProfil.titreSection}>{titre}</Text>
          <Text style={stylesProfil.detailSection}>{detail}</Text>
        </View>
        {valeur ? <Text style={stylesProfil.valeurSection}>{valeur}</Text> : null}
        <Feather
          color="#1F2D38"
          name={ouverte ? 'chevron-up' : 'chevron-down'}
          size={18}
        />
      </Pressable>
      {ouverte ? <View style={stylesProfil.corpsSection}>{children}</View> : null}
    </View>
  );
}

export function InfoCarteProfil({
  action,
  libelle,
  onAction,
  valeur,
}: {
  action?: string;
  libelle: string;
  onAction?: () => void;
  valeur: string;
}) {
  return (
    <View style={stylesProfil.infoCarte}>
      <View style={stylesProfil.infoEntete}>
        <Text style={stylesProfil.infoLibelle}>{libelle}</Text>
        {action && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction}>
            <Text style={stylesProfil.actionTexte}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={2} style={stylesProfil.infoValeur}>
        {valeur || 'Non renseigné'}
      </Text>
    </View>
  );
}

export function BoutonProfilAction({
  danger,
  disabled,
  libelle,
  onPress,
}: {
  danger?: boolean;
  disabled?: boolean;
  libelle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        stylesProfil.bouton,
        danger && stylesProfil.boutonDanger,
        disabled && stylesProfil.boutonInactif,
      ]}
    >
      <Text style={stylesProfil.boutonTexte}>{libelle}</Text>
    </Pressable>
  );
}

export const stylesProfil = StyleSheet.create({
  actionTexte: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarTexte: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  bouton: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  boutonDanger: {
    backgroundColor: '#EF4444',
  },
  boutonInactif: {
    opacity: 0.5,
  },
  boutonTexte: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  champ: {
    backgroundColor: '#F7F9FA',
    borderColor: '#D4E1E7',
    borderRadius: 16,
    borderWidth: 1,
    color: '#1F2D38',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    minHeight: 44,
    paddingHorizontal: 11,
  },
  champFlexible: {
    flex: 1,
    minWidth: 0,
  },
  contenu: {
    gap: 10,
    paddingBottom: 6,
  },
  corpsSection: {
    gap: 8,
    padding: 8,
    paddingTop: 0,
  },
  detailSection: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  entete: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  enteteSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  enteteTexte: {
    flex: 1,
    minWidth: 0,
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: '#ff5a4f',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  formulaire: {
    gap: 8,
  },
  iconeSection: {
    alignItems: 'center',
    backgroundColor: 'rgba(22,166,201,0.12)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoCarte: {
    backgroundColor: '#F7F9FA',
    borderColor: '#D4E1E7',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 11,
  },
  infoEntete: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  infoLibelle: {
    color: '#1F2D38',
    fontSize: 13,
    fontWeight: '900',
  },
  infoValeur: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  ligneBoutons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  message: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  messageErreur: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },
  panneau: {
    backgroundColor: 'rgba(247,249,250,0.98)',
    borderColor: '#C8D8E0',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 12,
    maxHeight: 560,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  section: {
    backgroundColor: '#EAF1F4',
    borderColor: '#C8D8E0',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionOuverte: {
    borderColor: '#16a6c9',
  },
  sousTitre: {
    color: '#657783',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  texteSection: {
    flex: 1,
    minWidth: 0,
  },
  titre: {
    color: '#1F2D38',
    fontSize: 18,
    fontWeight: '900',
  },
  titreSection: {
    color: '#1F2D38',
    fontSize: 15,
    fontWeight: '900',
  },
  valeurSection: {
    color: '#16a6c9',
    fontSize: 15,
    fontWeight: '900',
  },
});
