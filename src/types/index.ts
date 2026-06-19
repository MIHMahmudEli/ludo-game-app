/**
 * Domain types shared across the whole application.
 *
 * These types are framework-agnostic on purpose: the game engine, the Zustand
 * stores and a future NestJS server all speak this same vocabulary.
 */

// ---------------------------------------------------------------------------
// Players & colors
// ---------------------------------------------------------------------------

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export const PLAYER_COLORS: readonly PlayerColor[] = [
  'red',
  'green',
  'yellow',
  'blue',
] as const;

export type PlayerType = 'human' | 'ai';

export interface Player {
  /** Stable identity, e.g. `red`. */
  readonly id: string;
  readonly color: PlayerColor;
  name: string;
  type: PlayerType;
  /** Seat order in the rotation (0..3). */
  order: number;
  /** `false` once the player has finished all four tokens. */
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

/**
 * - `base`   : sitting in the yard, needs a 6 to enter play.
 * - `active` : travelling along its colour's path (`position` is meaningful).
 * - `home`   : reached the centre, out of play and counts toward winning.
 */
export type TokenState = 'base' | 'active' | 'home';

export interface Token {
  /** e.g. `red-0`. */
  readonly id: string;
  readonly color: PlayerColor;
  /** 0..3 within its colour. */
  readonly index: number;
  state: TokenState;
  /**
   * Relative position along *this colour's own* path.
   * - `-1` when in base.
   * - `0..LAST_TRACK_POS` while on the shared ring.
   * - `LAST_TRACK_POS+1 .. HOME_POSITION` while in the home column.
   * - `HOME_POSITION` exactly when `state === 'home'`.
   */
  position: number;
}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceState {
  value: DiceValue | null;
  isRolling: boolean;
  /** Increments every physical roll so the UI can re-trigger animations. */
  rollId: number;
}

// ---------------------------------------------------------------------------
// Turn
// ---------------------------------------------------------------------------

export interface TurnState {
  currentColor: PlayerColor;
  /** Consecutive sixes in the current turn (3 forfeits the turn). */
  consecutiveSixes: number;
  /** Number of rolls performed in the current turn. */
  rollCount: number;
}

// ---------------------------------------------------------------------------
// Moves
// ---------------------------------------------------------------------------

export interface Move {
  readonly tokenId: string;
  readonly from: number;
  readonly to: number;
  readonly steps: number;
  /** The move takes the token out of the base. */
  readonly exitsBase: boolean;
  /** The move lands the token exactly on home. */
  readonly reachesHome: boolean;
}

export interface MoveResult {
  readonly move: Move;
  /** Opponent tokens sent back to base by this move. */
  readonly captured: readonly Token[];
  /** Whether the player earns another roll after this move. */
  readonly grantsExtraTurn: boolean;
}

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------

export type GameMode = 'local-multiplayer' | 'vs-ai';

/**
 * Explicit state-machine value the UI renders directly. The UI must never
 * *derive* the phase from other state. "No match in progress" is represented
 * by the store holding `null`, not by a phase.
 */
export type GamePhase =
  | 'awaiting-roll' // active player must roll the dice
  | 'rolling' // dice animation in flight
  | 'awaiting-move' // a movable token must be chosen
  | 'moving' // token movement animation in flight (controller-owned)
  | 'turn-end' // rolled but nothing to do; handing over
  | 'finished'; // a winner exists

export interface GameConfig {
  mode: GameMode;
  /** Colours seated for this match, in rotation order. */
  colors: PlayerColor[];
  /** Which seats are AI controlled (only relevant for `vs-ai`). */
  aiColors: PlayerColor[];
  names: Partial<Record<PlayerColor, string>>;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  players: Player[];
  tokens: Token[];
  dice: DiceState;
  turn: TurnState;
  /** Finishing order; first entry is 1st place. */
  winners: PlayerColor[];
  /** Token ids that are currently legal to move for the active player. */
  movableTokenIds: string[];
  lastMove: MoveResult | null;
  /** Monotonic version, useful for animation diffing & future net-sync. */
  version: number;
}

// ---------------------------------------------------------------------------
// Settings & multiplayer (future-facing)
// ---------------------------------------------------------------------------

export type ThemePreference = 'light' | 'dark' | 'system';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface SettingsState {
  theme: ThemePreference;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  animationSpeed: AnimationSpeed;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'in-room'
  | 'error';
