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
          color="#13252b"
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
    color: '#ff5a4f',
    fontSize: 12,
    fontWeight: '900',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#16a6c9',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  avatarTexte: {
    color: '#FFFFFF',
    fontSize: 16,
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
    backgroundColor: '#ff5a4f',
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
    backgroundColor: '#f2f8fa',
    borderColor: '#d9e9ee',
    borderRadius: 18,
    borderWidth: 1,
    color: '#13252b',
    fontSize: 15,
    fontWeight: '800',
    minHeight: 48,
    paddingHorizontal: 12,
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
    gap: 10,
    padding: 8,
    paddingTop: 0,
  },
  detailSection: {
    color: '#647782',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  entete: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 2,
  },
  enteteSection: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  enteteTexte: {
    flex: 1,
    marginTop: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  fermer: {
    alignItems: 'center',
    backgroundColor: '#ff5a4f',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  formulaire: {
    gap: 10,
  },
  grilleStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    backgroundColor: '#f2f8fa',
    borderColor: '#d9e9ee',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  infoEntete: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  infoLibelle: {
    color: '#647782',
    fontSize: 12,
    fontWeight: '800',
  },
  infoValeur: {
    color: '#13252b',
    fontSize: 14,
    fontWeight: '900',
  },
  ligneBoutons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  message: {
    color: '#647782',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  messageErreur: {
    color: '#ff5a4f',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#16a6c9',
  },
  modeButtonText: {
    color: '#647782',
    fontSize: 13,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  modeSwitch: {
    backgroundColor: '#f2f8fa',
    borderColor: '#d9e9ee',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 48,
    padding: 4,
  },
  panneau: {
    backgroundColor: '#ffffff',
    borderColor: '#d9e9ee',
    borderRadius: 24,
    borderWidth: 1,
    elevation: 30,
    gap: 12,
    maxHeight: 560,
    paddingBottom: 14,
    paddingLeft: 8,
    paddingRight: 14,
    paddingTop: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
  section: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    overflow: 'hidden',
  },
  sectionOuverte: {
    borderColor: '#16a6c9',
    padding: 8,
  },
  sousTitre: {
    color: '#647782',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  texteSection: {
    flex: 1,
    minWidth: 0,
  },
  titre: {
    color: '#13252b',
    fontSize: 18,
    fontWeight: '900',
  },
  titreSection: {
    color: '#13252b',
    fontSize: 15,
    fontWeight: '900',
  },
  valeurSection: {
    color: '#16a6c9',
    fontSize: 15,
    fontWeight: '900',
  },
});
