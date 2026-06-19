import type { PlayerColor, Token } from '@/types';
import { HOME_POSITION, TOKENS_PER_PLAYER } from '@/constants';
import { ringIndexForPosition } from '@/constants';
import { tokenId } from '@/utils';

/**
 * TokenEngine — token lifecycle & queries.
 *
 * Owns how a token is created and the predicates describing where it is. Holds
 * no movement maths (that is MovementEngine) and no capture logic.
 */
export const TokenEngine = {
  /** Four fresh tokens for a colour, all parked in the base. */
  createTokens(color: PlayerColor): Token[] {
    return Array.from({ length: TOKENS_PER_PLAYER }, (_, index) => ({
      id: tokenId(color, index),
      color,
      index,
      state: 'base' as const,
      position: -1,
    }));
  },

  isInBase: (t: Token): boolean => t.state === 'base',
  isActive: (t: Token): boolean => t.state === 'active',
  isHome: (t: Token): boolean => t.state === 'home',

  /** Global ring index of an active token, or `null` if off-ring/in-base. */
  ringIndex(token: Token): number | null {
    if (token.state !== 'active') return null;
    return ringIndexForPosition(token.color, token.position);
  },

  byColor(tokens: readonly Token[], color: PlayerColor): Token[] {
    return tokens.filter((t) => t.color === color);
  },

  byId(tokens: readonly Token[], id: string): Token | undefined {
    return tokens.find((t) => t.id === id);
  },

  /** A token is finished when it has reached the home position. */
  hasFinished: (t: Token): boolean =>
    t.state === 'home' && t.position === HOME_POSITION,
} as const;
