import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Navigation, PhoneCall, ShieldAlert } from 'lucide-react-native';

import type { AlerteSos } from '../services/ServiceSos';

const colors = {
  brand: '#16a6c9',
  danger: '#ff5a4f',
  ink: '#13252b',
  line: '#d9e9ee',
  muted: '#647782',
  panel: '#ffffff',
  panelSoft: '#f2f8fa',
};

type EmergencyPlace = {
  name: string;
  phone: string;
  address: string;
  center: { lat: number; lon: number } | null;
};

const nearestPoliceStation: EmergencyPlace = {
  name: 'Commissariat',
  phone: '17',
  address: 'Service de police le plus proche',
  center: null,
};

const nearestHospital: EmergencyPlace = {
  name: 'Hôpital',
  phone: '112',
  address: 'Service d’urgence le plus proche',
  center: null,
};

export function PanneauUrgenceWalkZen({
  alerteActive: _alerteActive,
  annulerSos: _annulerSos,
  chargement: _chargement,
  confirmationVisible: _confirmationVisible,
  demanderSos: _demanderSos,
  envoyerSos: _envoyerSos,
  fermer: _fermer,
  fermerConfirmation: _fermerConfirmation,
  message: _message,
}: {
  alerteActive: AlerteSos | null;
  annulerSos: () => void;
  chargement: boolean;
  confirmationVisible: boolean;
  demanderSos: () => void;
  envoyerSos: () => void;
  fermer: () => void;
  fermerConfirmation: () => void;
  message: string | null;
}) {
  return (
    <View style={[styles.panel, { backgroundColor: colors.panel, borderColor: colors.line }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <ShieldAlert size={21} color="#fff" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.ink }]}>Numéros d'urgence</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Contacts utiles autour de vous.
          </Text>
        </View>
      </View>

      <EmergencyRow label="Police" number="17" />
      <EmergencyRow label="Pompiers" number="18" />
      <EmergencyRow
        label={nearestPoliceStation.name}
        number={nearestPoliceStation.phone}
        detail={nearestPoliceStation.address}
        routeLabel="Itinéraire commissariat"
        canRoute={Boolean(nearestPoliceStation.center)}
        isRouting={false}
        onStartRoute={() => undefined}
      />
      <EmergencyRow
        label={nearestHospital.name}
        number={nearestHospital.phone}
        detail={nearestHospital.address}
        routeLabel="Itinéraire hôpital"
        canRoute={Boolean(nearestHospital.center)}
        isRouting={false}
        onStartRoute={() => undefined}
      />
    </View>
  );
}

function EmergencyRow({
  label,
  number,
  detail,
  routeLabel,
  canRoute,
  isRouting = false,
  onStartRoute,
}: {
  label: string;
  number: string;
  detail?: string;
  routeLabel?: string;
  canRoute?: boolean;
  isRouting?: boolean;
  onStartRoute?: () => void;
}) {
  const canCall = /^\+?[0-9][0-9 .-]*$/.test(number);
  const callNumber = () => {
    if (!canCall) return;
    void Linking.openURL(`tel:${number.replace(/[^+0-9]/g, '')}`);
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.panelSoft, borderColor: colors.line }]}>
      <View style={styles.rowTop}>
        <View style={styles.rowText}>
          <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
          {detail ? (
            <Text style={[styles.detail, { color: colors.muted }]} numberOfLines={2}>
              {detail}
            </Text>
          ) : null}
        </View>
        <Pressable
          style={[styles.callPill, !canCall ? styles.disabledButton : null]}
          accessibilityRole="button"
          accessibilityLabel={`Appeler ${label}`}
          disabled={!canCall}
          onPress={callNumber}
        >
          <PhoneCall size={16} color="#fff" />
          <Text style={styles.number}>{number}</Text>
        </Pressable>
      </View>

      {routeLabel ? (
        <Pressable
          style={[styles.inlineRouteButton, (!canRoute || isRouting) ? styles.disabledButton : null]}
          accessibilityRole="button"
          accessibilityLabel={routeLabel}
          accessibilityState={{ disabled: !canRoute || isRouting, busy: isRouting }}
          disabled={!canRoute || isRouting}
          onPress={onStartRoute}
        >
          <Navigation size={16} color="#fff" />
          <Text style={styles.routeButtonText}>{isRouting ? 'Calcul...' : routeLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  row: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    padding: 11,
    gap: 10,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
  },
  detail: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  callPill: {
    minWidth: 72,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.danger,
  },
  inlineRouteButton: {
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: colors.brand,
  },
  disabledButton: {
    opacity: 0.5,
  },
  number: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  routeButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
});
