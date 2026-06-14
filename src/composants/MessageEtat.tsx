import { StyleSheet, Text } from 'react-native';

type ProprietesMessageEtat = {
  message: string | null;
};

export function MessageEtat({ message }: ProprietesMessageEtat) {
  if (!message) {
    return null;
  }

  return <Text style={styles.message}>{message}</Text>;
}

const styles = StyleSheet.create({
  message: {
    color: '#b91c1c',
    fontSize: 13,
  },
});
