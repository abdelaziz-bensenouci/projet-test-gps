import { StyleSheet } from 'react-native';

export const stylesCarte = StyleSheet.create({
  carte: {
    flex: 1,
  },
  marqueurDepart: {
    backgroundColor: '#13b6d8',
    borderColor: '#ffffff',
    borderRadius: 11,
    borderWidth: 3,
    height: 22,
    shadowColor: '#13b6d8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    width: 22,
  },
  marqueurArrivee: {
    backgroundColor: '#22c55e',
    borderColor: '#ffffff',
    borderRadius: 11,
    borderWidth: 3,
    height: 22,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    width: 22,
  },
});
