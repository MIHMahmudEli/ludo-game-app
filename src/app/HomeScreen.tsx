import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Screen } from '@/components/ui';
import { PLAYER_HEX } from '@/constants';
import { PLAYER_COLORS } from '@/types';
import type { RootScreenProps } from '@/navigation';

/** Landing screen with branding and primary navigation. */
export function HomeScreen({ navigation }: RootScreenProps<'Home'>) {
  return (
    <Screen>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <View className="flex-row gap-2">
            {PLAYER_COLORS.map((c) => (
              <View
                key={c}
                style={{ backgroundColor: PLAYER_HEX[c] }}
                className="h-5 w-5 rounded-full"
              />
            ))}
          </View>
          <Text className="mt-4 text-6xl font-extrabold text-white">Ludo</Text>
          <Text className="mt-2 text-base font-medium text-white/80">
            Roll. Race. Reign.
          </Text>

          <View className="mt-12 w-full max-w-xs gap-3">
            <Button
              label="Play"
              size="lg"
              onPress={() => navigation.navigate('GameSetup')}
            />
            <Button
              label="Settings"
              variant="ghost"
              size="lg"
              className="border-white/50"
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </View>
      </LinearGradient>
    </Screen>
  );
}
