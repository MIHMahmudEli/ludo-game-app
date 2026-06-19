# Ludo — Architecture

A production-oriented Ludo game built on **Expo SDK 56, React Native 0.85, React 19,
TypeScript (strict), NativeWind v4, Zustand, React Query, React Navigation,
Reanimated v4 and react-native-svg.**

The design goal is a clean, layered, feature-isolated codebase that can grow into
online multiplayer, tournaments, chat, achievements and leaderboards **without
rewriting the core**.

---

## 1. Layered architecture (Clean Architecture + SOLID)

```
UI (components/, app/)            presentation only — zero rules
        │ selectors ▲   │ intents ▼
Application (store/, hooks/)      orchestration: timing, AI, haptics, persistence
        │ GameState ▲   │ pure reducers ▼
Domain (features/ludo-engine/)    PURE rules — no React / RN / Zustand / IO
```

- **Domain layer is pure.** Every engine method is `(GameState, input) => GameState`.
  No imports from React, React Native, Zustand, timers or storage. This is the
  single most important decision — it makes the rules unit-testable in isolation
  and **reusable verbatim on a NestJS server** for authoritative online play.
- **Application layer owns side effects.** The Zustand `matchStore` delegates to the
  engine; `useGameController` is the only place that schedules animations, drives
  the AI, locks input and fires haptics.
- **UI layer is dumb.** Components read state through narrow selector hooks and emit
  intents. No component computes a rule or a phase.

**SOLID mapping**

| Principle | Where |
|---|---|
| Single Responsibility | each engine module owns exactly one concern (`DiceEngine`, `CaptureEngine`, …) |
| Open/Closed | new features (online, achievements) added as new modules/stores, engine untouched |
| Liskov | `Rng` abstraction — `Math.random`, seeded PRNG, or server RNG interchangeably |
| Interface Segregation | per-concern selector hooks (`useDice`, `useTurn`, `useToken`) |
| Dependency Inversion | UI depends on selector/intent abstractions, not on the store/engine internals |

---

## 2. Data model (`src/types`)

- `Token { id, color, index, state: 'base'|'active'|'home', position }` where
  `position` is a **colour-relative path index `0..56`**, fully decoupled from
  screen pixels. The 15×15 grid projection lives only in `constants/board.ts`.
- `Player { id, color, name, type:'human'|'ai', order, isActive }`
- `GameState { mode, phase, players[], tokens[], dice, turn, winners[], movableTokenIds[], lastMove, version }`
- `phase: 'awaiting-roll'|'rolling'|'awaiting-move'|'moving'|'turn-end'|'finished'` —
  an explicit state machine the UI renders directly.

`version` is a monotonic counter — it drives animation diffing today and
state-sync/reconciliation for online play tomorrow.

---

## 3. Game Engine modules (`src/features/ludo-engine`)

| Module | Responsibility |
|---|---|
| `DiceEngine` | RNG-injectable dice rolls |
| `TokenEngine` | token creation & positional queries |
| `MovementEngine` | single-token move maths (exact-count home, overshoot rejection) |
| `CaptureEngine` | capture detection + safe-cell immunity |
| `RuleEngine` | legal-move generation, extra-turn rule, three-sixes penalty |
| `TurnEngine` | turn rotation, skipping finished players (2–4 players) |
| `WinConditionEngine` | per-colour completion, finishing order, game over |
| `GameEngine` | facade: composes the above into pure `GameState` transitions |
| `factory.createGame` | builds a fresh state from a `GameConfig` |

**Rules covered:** 4-player standard rules • 2/3/4 players • human vs human •
human vs AI • dice rolling • token movement • turn management • safe zones
(start + star cells) • home columns • exact-count win • multi-token selection •
extra turn on a six / capture / reaching home • three-consecutive-sixes forfeit •
capture-to-base.

---

## 4. State management (`src/store`)

- **`matchStore`** — the single authoritative live `GameState` + `inputLocked`. One
  store because a capture mutates tokens **and** turn **and** dice atomically;
  splitting that across stores would cause torn/desynced renders.
- **`settingsStore`** — theme, animation speed, sound, haptics (persisted via
  AsyncStorage).
- **`multiplayerStore`** — connection/room stub for the online phase.
- **`selectors.ts`** — the "separate stores" ergonomics requested (players, tokens,
  dice, turn…) as narrow selector hooks. Because the engine preserves object
  identity for untouched tokens, `useToken(id)` re-renders **only** when that token
  moves.

---

## 5. Navigation (`src/navigation`)

Typed native-stack: `Home → GameSetup → Game`, plus `Settings`. The param list is a
single typed map; Leaderboard/Achievements/online-lobby slot in here as new typed
routes.

---

## 6. Performance

- Static **SVG board** memoised on `(size, scheme)` — never re-renders while tokens move.
- Tokens are **independently subscribed + memoised**; movement is a **Reanimated UI-thread
  glide**, so the React tree does not animate per frame.
- Stable token-id list keeps the board container from re-rendering.
- `useShallow` selectors prevent array-identity churn.

---

## 7. Scalability decisions (future-proofing)

1. **Server-authoritative online play for free.** The pure engine runs unchanged in a
   NestJS gateway. Client predicts with the engine; server validates with the *same*
   engine; WebSockets ship intents + `GameState` (`version`-keyed). Contracts already
   stubbed in `features/multiplayer`.
2. **Anti-cheat by construction** — clients never author rules, the server does.
3. **Deterministic RNG seam** (`utils/random`) enables replays, fair audited rolls and
   reproducible tests.
4. **React Query pre-wired** for matchmaking/profiles/leaderboards.
5. **Feature isolation** — `leaderboard`, `achievements`, `multiplayer` are independent
   modules with their own contracts; adding them touches no gameplay code.

> Note on folder mapping: the requested gameplay feature concerns (`ludo-board`,
> `dice`, `player`, `token`, `turn-system`) are implemented as **pure engine modules**
> in `features/ludo-engine` (logic) + presentational components in `components/game`
> (view). This keeps a single source of truth for each rule instead of splitting one
> rule across a logic folder and a UI folder.

---

## Project structure

```
src/
├── app/            screens (Home, GameSetup, Game, Settings)
├── navigation/     typed native-stack
├── components/
│   ├── ui/         Button, Card, Screen
│   ├── game/       Board, BoardBackground, TokenView, Dice, DiceTray, panels, modal
│   └── shared/     ColorDot
├── features/
│   ├── ludo-engine/  DiceEngine…WinConditionEngine, GameEngine, factory
│   ├── ai/           heuristic AIEngine (pure)
│   ├── multiplayer/  online contracts (scaffold)
│   ├── leaderboard/  data shapes (scaffold)
│   └── achievements/ definitions + evaluators (scaffold)
├── store/          matchStore, settingsStore, multiplayerStore, selectors
├── services/       storage (AsyncStorage), queryClient, feedback (haptics)
├── hooks/          useGameController, useResponsiveBoard
├── utils/          random (Rng/seeded), id, array
├── constants/      board geometry, game rules, colors, timing
├── theme/          color-scheme bridge for SVG + design tokens
└── types/          shared domain types
```

## Run

```bash
npm install
npm run android   # or: npm run ios / npm run web
```
