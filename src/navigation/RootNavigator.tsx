import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';

import {
  GameScreen,
  HomeScreen,
  ModeSetupScreen,
  OnlineLobbyScreen,
  SettingsScreen,
} from '@/app';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator. Header is hidden because every screen renders its own themed
 * chrome; React Navigation's theme is still synced so native transitions and
 * backgrounds match light/dark mode.
 */
export function RootNavigator() {
  const { colorScheme } = useColorScheme();
  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ModeSetup" component={ModeSetupScreen} />
        <Stack.Screen name="Online" component={OnlineLobbyScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
