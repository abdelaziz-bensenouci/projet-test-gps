import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/service-worker.js');
}
