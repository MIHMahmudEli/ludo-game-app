/// <reference types="jest" />
import type { DiceValue, GameConfig, GameState, Token } from '@/types';
import {
  ENTRY_INDEX,
  HOME_POSITION,
  MAIN_TRACK_LENGTH,
  SAFE_RING_INDICES,
} from '@/constants';
import { seededRng } from '@/utils';
import { AIEngine } from '@/features/ai';
import {
  CaptureEngine,
  DiceEngine,
  GameEngine,
  MovementEngine,
  RuleEngine,
  WinConditionEngine,
  createGame,
} from '@/features/ludo-engine';

const baseConfig: GameConfig = {
  mode: 'local-multiplayer',
  colors: ['red', 'green', 'yellow', 'blue'],
  aiColors: [],
  names: {},
};

function tok(partial: Partial<Token> & Pick<Token, 'id' | 'color'>): Token {
  return { index: 0, state: 'active', position: 0, ...partial };
}

/** Position that maps a colour to a given global ring index. */
function posForRingIndex(color: 'red' | 'green' | 'yellow' | 'blue', ringIndex: number) {
  return (ringIndex - ENTRY_INDEX[color] + MAIN_TRACK_LENGTH) % MAIN_TRACK_LENGTH;
}

describe('createGame', () => {
  it('builds the right players and tokens', () => {
    const g = createGame(baseConfig);
    expect(g.players).toHaveLength(4);
    expect(g.tokens).toHaveLength(16);
    expect(g.tokens.every((t) => t.state === 'base')).toBe(true);
    expect(g.phase).toBe('awaiting-roll');
    expect(g.turn.currentColor).toBe('red');
  });

  it('marks AI seats in vs-ai mode', () => {
    const g = createGame({
      ...baseConfig,
      mode: 'vs-ai',
      colors: ['red', 'green'],
      aiColors: ['green'],
    });
    expect(g.players.find((p) => p.color === 'red')?.type).toBe('human');
    expect(g.players.find((p) => p.color === 'green')?.type).toBe('ai');
  });
});

describe('DiceEngine', () => {
  it('always returns 1..6', () => {
    const rng = seededRng(1);
    for (let i = 0; i < 500; i += 1) {
      const v = DiceEngine.roll(rng);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });
});

describe('MovementEngine', () => {
  it('keeps base tokens stuck without a six', () => {
    const t = tok({ id: 'red-0', color: 'red', state: 'base', position: -1 });
    expect(MovementEngine.destination(t, 3)).toBeNull();
    expect(MovementEngine.destination(t, 6)).toBe(0);
  });

  it('rejects overshooting home but allows the exact landing', () => {
    const t = tok({ id: 'red-0', color: 'red', position: HOME_POSITION - 2 });
    expect(MovementEngine.destination(t, 3)).toBeNull(); // overshoot
    const exact = MovementEngine.buildMove(t, 2)!;
    expect(exact.reachesHome).toBe(true);
    expect(exact.to).toBe(HOME_POSITION);
  });
});

describe('CaptureEngine', () => {
  it('captures an opponent on a non-safe cell', () => {
    const ring = 5; // not in SAFE_RING_INDICES
    expect(SAFE_RING_INDICES).not.toContain(ring);
    const red = tok({ id: 'red-0', color: 'red', position: posForRingIndex('red', ring) });
    const green = tok({
      id: 'green-0',
      color: 'green',
      position: posForRingIndex('green', ring),
    });
    const captured = CaptureEngine.capturesFor([red, green], red);
    expect(captured.map((t) => t.id)).toEqual(['green-0']);
  });

  it('does not capture on a safe cell', () => {
    const ring = SAFE_RING_INDICES[1]!; // a star cell
    const red = tok({ id: 'red-0', color: 'red', position: posForRingIndex('red', ring) });
    const green = tok({
      id: 'green-0',
      color: 'green',
      position: posForRingIndex('green', ring),
    });
    expect(CaptureEngine.capturesFor([red, green], red)).toHaveLength(0);
  });
});

describe('RuleEngine — three sixes', () => {
  it('forfeits on the third consecutive six', () => {
    expect(RuleEngine.isThirdSix(3)).toBe(true);
    expect(
      RuleEngine.grantsExtraTurn({
        diceValue: 6,
        capturedCount: 0,
        reachedHome: false,
        consecutiveSixes: 3,
      }),
    ).toBe(false);
  });
});

describe('GameEngine integration', () => {
  function awaitingMoveState(overrides: Partial<GameState>, value: DiceValue): GameState {
    const g = createGame({ ...baseConfig, colors: ['red', 'green'] });
    return {
      ...g,
      phase: 'awaiting-move',
      dice: { value, isRolling: false, rollId: 1 },
      ...overrides,
    };
  }

  it('captures via a real move and grants an extra turn', () => {
    const ring = 5;
    const red = tok({ id: 'red-0', color: 'red', position: posForRingIndex('red', ring) - 3 });
    const green = tok({
      id: 'green-0',
      color: 'green',
      position: posForRingIndex('green', ring),
    });
    const g = awaitingMoveState(
      { tokens: [red, green], movableTokenIds: ['red-0'] },
      3,
    );
    const next = GameEngine.applyMoveByToken(g, 'red-0');
    expect(next.tokens.find((t) => t.id === 'green-0')?.state).toBe('base');
    expect(next.lastMove?.captured).toHaveLength(1);
    expect(next.lastMove?.grantsExtraTurn).toBe(true);
    expect(next.turn.currentColor).toBe('red'); // keeps the turn
  });

  it('passes the turn after a non-rewarding move', () => {
    const red = tok({ id: 'red-0', color: 'red', position: 10 });
    const g = awaitingMoveState({ tokens: [red], movableTokenIds: ['red-0'] }, 3);
    const next = GameEngine.applyMoveByToken(g, 'red-0');
    expect(next.turn.currentColor).toBe('green');
    expect(next.phase).toBe('awaiting-roll');
  });

  it('declares a winner when the last token reaches home', () => {
    const tokens: Token[] = [
      tok({ id: 'red-0', color: 'red', index: 0, state: 'home', position: HOME_POSITION }),
      tok({ id: 'red-1', color: 'red', index: 1, state: 'home', position: HOME_POSITION }),
      tok({ id: 'red-2', color: 'red', index: 2, state: 'home', position: HOME_POSITION }),
      tok({ id: 'red-3', color: 'red', index: 3, position: HOME_POSITION - 2 }),
    ];
    const g = awaitingMoveState({ tokens, movableTokenIds: ['red-3'] }, 2);
    const next = GameEngine.applyMoveByToken(g, 'red-3');
    expect(WinConditionEngine.isColorFinished(next.tokens, 'red')).toBe(true);
    expect(next.winners).toContain('red');
    expect(next.phase).toBe('finished');
  });

  it('hands over when a roll produces no legal move', () => {
    const g = createGame({ ...baseConfig, colors: ['red', 'green'] });
    const rolling = { ...g, phase: 'rolling' as const };
    const next = GameEngine.resolveRoll(rolling, 3); // all in base, 3 → nothing
    expect(next.movableTokenIds).toHaveLength(0);
    expect(next.phase).toBe('turn-end');
  });
});

describe('Full game simulation (smoke test)', () => {
  it('plays a 2-player AI match to completion without errors', () => {
    const rng = seededRng(12345);
    let state = createGame({
      mode: 'vs-ai',
      colors: ['red', 'green'],
      aiColors: ['red', 'green'],
      names: {},
    });

    let guard = 0;
    while (state.phase !== 'finished' && guard < 20000) {
      guard += 1;
      switch (state.phase) {
        case 'awaiting-roll':
          state = GameEngine.beginRoll(state);
          break;
        case 'rolling':
          state = GameEngine.resolveRoll(state, DiceEngine.roll(rng));
          break;
        case 'awaiting-move': {
          const id = AIEngine.chooseTokenId(state);
          state = id ? GameEngine.applyMoveByToken(state, id) : GameEngine.endTurn(state);
          break;
        }
        case 'turn-end':
          state = GameEngine.endTurn(state);
          break;
        default:
          break;
      }
    }

    expect(state.phase).toBe('finished');
    expect(state.winners.length).toBeGreaterThanOrEqual(1);
  });
});
