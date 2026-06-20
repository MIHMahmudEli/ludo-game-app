import { useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import type { GameConfig } from '@/types';
import { SEAT_ORDER } from '@/constants';
import { useMatchStore, useMultiplayerStore, type PlayerCount } from '@/store';
import type { RootScreenProps } from '@/navigation';

type LobbyView = 'choose' | 'created' | 'joining';

/** Online lobby: create a room (get a 4-digit code) or join by code. */
export function OnlineLobbyScreen({ navigation }: RootScreenProps<'Online'>) {
  const [view, setView] = useState<LobbyView>('choose');
  const [count, setCount] = useState<PlayerCount>(4);
  const [codeInput, setCodeInput] = useState('');

  const roomCode = useMultiplayerStore((s) => s.roomCode);
  const createRoom = useMultiplayerStore((s) => s.createRoom);
  const joinRoom = useMultiplayerStore((s) => s.joinRoom);
  const leaveRoom = useMultiplayerStore((s) => s.leaveRoom);
  const newGame = useMatchStore((s) => s.newGame);

  const back = () => {
    if (view === 'choose') {
      navigation.goBack();
    } else {
      leaveRoom();
      setView('choose');
    }
  };

  const onCreate = () => {
    createRoom(count);
    setView('created');
  };

  const onShare = () => {
    if (roomCode) {
      void Share.share({
        message: `Join my Ludo game! Room code: ${roomCode}`,
      });
    }
  };

  // Until the realtime server is live, starting a room launches a local match
  // so the flow is playable end-to-end.
  const startMatch = () => {
    const colors = SEAT_ORDER.slice(0, count);
    const config: GameConfig = {
      mode: 'local-multiplayer',
      colors: [...colors],
      aiColors: [],
      names: Object.fromEntries(colors.map((c, i) => [c, `Player ${i + 1}`])),
    };
    newGame(config);
    navigation.navigate('Game');
  };

  return (
    <Screen className="px-6">
      <View className="flex-row items-center py-4">
        <Pressable onPress={back} hitSlop={12}>
          <Text className="text-2xl text-slate-700 dark:text-slate-200">‹</Text>
        </Pressable>
        <Text className="ml-3 text-2xl font-extrabold text-slate-900 dark:text-white">
          Play Online
        </Text>
      </View>

      <View className="mb-4 rounded-xl bg-amber-100 dark:bg-amber-500/15 px-4 py-3">
        <Text className="text-xs font-medium text-amber-800 dark:text-amber-300">
          Beta: live cross-device sync is coming soon. Rooms currently start a
          local match so you can try the flow.
        </Text>
      </View>

      {view === 'choose' && (
        <Card className="gap-5">
          <View>
            <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              PLAYERS
            </Text>
            <View className="flex-row gap-3">
              {([2, 3, 4] as const).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setCount(n)}
                  className={`flex-1 items-center rounded-2xl py-4 ${
                    count === n ? 'bg-brand' : 'bg-slate-200 dark:bg-surface-dark'
                  }`}
                >
                  <Text
                    className={`text-xl font-extrabold ${
                      count === n ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Button label="Create Room" size="lg" onPress={onCreate} />

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <Text className="text-xs font-semibold text-slate-400">OR</Text>
            <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </View>

          <Button
            label="Join Room"
            variant="secondary"
            size="lg"
            onPress={() => setView('joining')}
          />
        </Card>
      )}

      {view === 'created' && (
        <Card className="items-center gap-4">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            SHARE THIS ROOM CODE
          </Text>
          <Text className="text-6xl font-extrabold tracking-[12px] text-brand">
            {roomCode}
          </Text>
          <Text className="text-center text-xs text-slate-500 dark:text-slate-400">
            Friends can join by entering this code. Waiting for {count} players…
          </Text>
          <View className="mt-2 w-full gap-3">
            <Button label="Invite Friends" variant="secondary" onPress={onShare} />
            <Button label="Start Game" size="lg" onPress={startMatch} />
          </View>
        </Card>
      )}

      {view === 'joining' && (
        <Card className="gap-4">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            ENTER ROOM CODE
          </Text>
          <TextInput
            value={codeInput}
            onChangeText={(t) => setCodeInput(t.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            placeholder="0000"
            placeholderTextColor="#94A3B8"
            maxLength={4}
            className="rounded-2xl bg-slate-100 dark:bg-surface-dark px-4 py-4 text-center text-4xl font-extrabold tracking-[12px] text-slate-900 dark:text-white"
          />
          <Button
            label="Join"
            size="lg"
            disabled={codeInput.length !== 4}
            onPress={() => {
              joinRoom(codeInput);
              startMatch();
            }}
          />
        </Card>
      )}
    </Screen>
  );
}
