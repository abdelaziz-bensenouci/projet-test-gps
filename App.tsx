import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { EcranCarte } from './src/ecrans/EcranCarte';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      html, body, #root {
        height: 100%;
        min-height: 100%;
        margin: 0;
        overflow: hidden;
        overscroll-behavior: none;
        touch-action: none;
        width: 100%;
      }

      body {
        position: fixed;
        inset: 0;
      }

      #root {
        position: fixed;
        inset: 0;
      }

      @supports (height: 100dvh) {
        html, body, #root {
          height: 100dvh;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <View style={styles.racine}>
      <EcranCarte />
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  racine: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
});
