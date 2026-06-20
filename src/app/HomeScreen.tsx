import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/ui';
import { PLAYER_HEX } from '@/constants';
import { PLAYER_COLORS } from '@/types';
import type { RootScreenProps } from '@/navigation';

interface MenuOption {
  label: string;
  sub: string;
  icon: string;
  onPress: () => void;
}

function MenuButton({ label, sub, icon, onPress }: MenuOption) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center gap-4 rounded-2xl bg-white/95 px-5 py-4 active:opacity-80"
    >
      <Text className="text-3xl">{icon}</Text>
      <View className="flex-1">
        <Text className="text-lg font-extrabold text-slate-900">{label}</Text>
        <Text className="text-xs font-medium text-slate-500">{sub}</Text>
      </View>
      <Text className="text-xl text-slate-300">›</Text>
    </Pressable>
  );
}

/** Landing screen: Online, Computer, and Pass & Play. */
export function HomeScreen({ navigation }: RootScreenProps<'Home'>) {
  return (
    <Screen>
      <LinearGradient colors={['#6366F1', '#8B5CF6', '#EC4899']} style={{ flex: 1 }}>
        <View className="flex-1 px-7 pt-12">
          <View className="items-center">
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
            <Text className="mt-1 text-base font-medium text-white/80">
              Roll. Race. Reign.
            </Text>
          </View>

          <View className="mt-12 gap-3">
            <MenuButton
              icon="🌐"
              label="Play Online"
              sub="Create or join a room with a 4-digit code"
              onPress={() => navigation.navigate('Online')}
            />
            <MenuButton
              icon="🤖"
              label="Play vs Computer"
              sub="Offline match against AI · 2, 3 or 4 players"
              onPress={() => navigation.navigate('ModeSetup', { mode: 'vs-ai' })}
            />
            <MenuButton
              icon="👥"
              label="Pass & Play"
              sub="Offline with friends on one device · 2, 3 or 4"
              onPress={() =>
                navigation.navigate('ModeSetup', { mode: 'local-multiplayer' })
              }
            />
          </View>

          <View className="mt-auto items-center pb-6">
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              className="flex-row items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 active:opacity-80"
            >
              <Text className="text-base">⚙️</Text>
              <Text className="font-semibold text-white">Settings</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Screen>
  );
}
