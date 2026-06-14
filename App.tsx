import { StatusBar } from 'expo-status-bar';

import { EcranCarte } from './src/ecrans/EcranCarte';

export default function App() {
  return (
    <>
      <EcranCarte />
      <StatusBar style="dark" />
    </>
  );
}
