// Gesture Handler must be imported before anything else in the entry file.
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App).
// It ensures the environment is set up for both Expo Go and native builds.
registerRootComponent(App);
