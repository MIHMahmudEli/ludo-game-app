/**
 * UI animation timings (milliseconds). Kept here so feel can be tuned in one
 * place and scaled by the user's animation-speed preference at runtime.
 */
export const TIMINGS = {
  /** Dice tumble animation length. */
  ROLL_DURATION: 700,
  /** Token glide from old cell to new cell. */
  MOVE_DURATION: 360,
  /** Pause showing a "rolled but no move" result before handing over. */
  TURN_HANDOVER_DELAY: 700,
  /** How long the AI "thinks" before acting (so moves are watchable). */
  AI_THINK_DELAY: 650,
} as const;
