import { useCallback, useEffect, useRef } from 'react';
import { DiceEngine } from '@/features/ludo-engine';
import { AIEngine } from '@/features/ai';
import { feedback } from '@/services';
import { TIMINGS } from '@/constants';
import {
  ANIMATION_SPEED_FACTOR,
  useMatchStore,
  useSettingsStore,
} from '@/store';

/**
 * useGameController — the application-layer orchestrator.
 *
 * It is the ONLY place that turns pure engine transitions into a playable
 * experience: dice/move timing, the AI taking its turn, auto-handover after a
 * dead roll, input-locking during animations and haptic feedback. Components
 * call the returned intent handlers and otherwise stay free of game flow.
 */
export function useGameController() {
  const beginRoll = useMatchStore((s) => s.beginRoll);
  const resolveRoll = useMatchStore((s) => s.resolveRoll);
  const selectToken = useMatchStore((s) => s.selectToken);
  const endTurn = useMatchStore((s) => s.endTurn);
  const setInputLocked = useMatchStore((s) => s.setInputLocked);
  const inputLocked = useMatchStore((s) => s.inputLocked);

  const phase = useMatchStore((s) => s.game?.phase ?? null);
  const version = useMatchStore((s) => s.game?.version ?? -1);
  const currentColor = useMatchStore((s) => s.game?.turn.currentColor ?? null);

  const haptics = useSettingsStore((s) => s.hapticsEnabled);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const factor = ANIMATION_SPEED_FACTOR[animationSpeed];

  const driverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCurrentAI = useCallback(() => {
    const game = useMatchStore.getState().game;
    if (!game) return false;
    return (
      game.players.find((p) => p.color === game.turn.currentColor)?.type === 'ai'
    );
  }, []);

  // --- Primitive actions (shared by human input & the AI driver) -----------
  const performRoll = useCallback(() => {
    const value = DiceEngine.roll();
    setInputLocked(true);
    feedback.diceRoll(haptics);
    beginRoll();
    rollTimer.current = setTimeout(() => {
      resolveRoll(value);
      setInputLocked(false);
    }, TIMINGS.ROLL_DURATION * factor);
  }, [beginRoll, resolveRoll, setInputLocked, haptics, factor]);

  const performMove = useCallback(
    (tokenId: string) => {
      setInputLocked(true);
      feedback.tokenMove(haptics);
      selectToken(tokenId);
      // The store updated synchronously — inspect the result for feedback.
      const after = useMatchStore.getState().game;
      if (after?.lastMove?.captured.length) feedback.capture(haptics);
      moveTimer.current = setTimeout(
        () => setInputLocked(false),
        TIMINGS.MOVE_DURATION * factor + 60,
      );
    },
    [selectToken, setInputLocked, haptics, factor],
  );

  // --- Public intent handlers (human input) --------------------------------
  const rollDice = useCallback(() => {
    const game = useMatchStore.getState().game;
    if (!game || game.phase !== 'awaiting-roll') return;
    if (useMatchStore.getState().inputLocked || isCurrentAI()) return;
    performRoll();
  }, [performRoll, isCurrentAI]);

  const handleTokenPress = useCallback(
    (tokenId: string) => {
      const game = useMatchStore.getState().game;
      if (!game || game.phase !== 'awaiting-move') return;
      if (useMatchStore.getState().inputLocked || isCurrentAI()) return;
      if (!game.movableTokenIds.includes(tokenId)) return;
      performMove(tokenId);
    },
    [performMove, isCurrentAI],
  );

  // --- Autonomous driver: AI turns, dead-roll handover, win feedback -------
  useEffect(() => {
    if (driverTimer.current) clearTimeout(driverTimer.current);
    if (phase === null) return;

    const ai = isCurrentAI();
    const think = TIMINGS.AI_THINK_DELAY * factor;

    if (phase === 'awaiting-roll' && ai && !inputLocked) {
      driverTimer.current = setTimeout(performRoll, think);
    } else if (phase === 'awaiting-move' && ai && !inputLocked) {
      driverTimer.current = setTimeout(() => {
        const game = useMatchStore.getState().game;
        const id = game ? AIEngine.chooseTokenId(game) : null;
        if (id) performMove(id);
      }, think);
    } else if (phase === 'turn-end') {
      driverTimer.current = setTimeout(endTurn, TIMINGS.TURN_HANDOVER_DELAY * factor);
    } else if (phase === 'finished') {
      feedback.win(haptics);
    }

    return () => {
      if (driverTimer.current) clearTimeout(driverTimer.current);
    };
    // version drives re-evaluation on every state transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, version, inputLocked, currentColor, factor]);

  // Clear any pending timers on unmount.
  useEffect(
    () => () => {
      [driverTimer, rollTimer, moveTimer].forEach((t) => {
        if (t.current) clearTimeout(t.current);
      });
    },
    [],
  );

  return { rollDice, handleTokenPress };
}
