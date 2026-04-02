# CLAUDE.md — Microbele

## Project Overview

**Microbele** is a Wordle-style daily clinical microbiology puzzle game targeting ASCP SM exam candidates. Players identify a mystery organism by requesting progressively more specific clues (Gram stain → morphology → O₂ requirement → screening tests → clinical clue → identification). One puzzle per calendar day, seeded deterministically so every user sees the same organism.

**Architecture**: Single-file HTML (`microbele.html`) — no build step, no backend, no npm. All game logic, styles, and the organism database live in one file. State is persisted to `localStorage` (`mb_done`). The file is intended to be served statically (GitHub Pages or similar).

---

## File Structure

```
microbele.html      ← entire app lives here
CLAUDE.md           ← this file
```

Key sections inside `microbele.html` (in order):

| Section | Lines (approx) | Notes |
|---|---|---|
| CSS | `<style>` block | CSS vars, animations, layout |
| `ORGANISMS` array | ~184–589 | 101 organism objects |
| `EASY_NAMES` | ~591–597 | First 14 puzzles use these organisms |
| `HINTS` array | ~600–607 | 6 hint types with key/label/icon |
| Utility functions | ~609–633 | `ds`, `pn`, `fs`, `fl`, `seededShuffle`, `getOrg` |
| State + storage | ~641–675 | `state` object, `loadDone`/`saveDone` |
| `render()` | ~678 | Master render; manages view-transition animation |
| `renderHow/Archive/Game` | ~686–832 | View-specific HTML builders |
| `doGuess / doSkip` | ~860–913 | Game actions |
| `setGameDate` | ~915 | Navigate to a specific archive date |
| `bindEvents` | ~922 | Event wiring per view |
| `renderAC` | ~992 | Autocomplete dropdown (stable container, event delegation) |
| `init` | ~1000 | Bootstrap |

---

## State Shape

```js
{
  view: "game" | "how" | "archive",
  gameDate: "YYYY-MM-DD",   // active puzzle date
  hints: 1–6,               // how many hints are currently revealed
  guesses: string[],        // organism names the player has guessed (wrong + correct)
  input: string,            // current text in the organism input
  over: boolean,            // game finished (win or lose)
  won: boolean,
  showAC: boolean,          // autocomplete dropdown visible?
  acI: -1 | 0–7,           // keyboard-highlighted AC index
  animIdx: null | 0–5,      // hint card index currently animating in
  done: { [dateStr]: { score: 1–6, won: boolean } },
}
```

`prevView` is a module-level variable (not in `state`) used to gate the `.entering` animation on the `.view` element so it only fires on view transitions, not on every in-game `render()` call.

---

## Organism Object Schema

```js
{
  id: number,
  name: string,         // full scientific name — used as the answer key
  g: string,            // Gram stain
  m: string,            // Morphology
  o: string,            // O₂ requirement
  s: string,            // Screening tests
  c: string,            // Clinical clue
  d: string,            // Definitive identification (hint 6, the "giveaway")
}
```

Keys `g m o s c d` map directly to `HINTS[i].key`.

---

## Puzzle Scheduling

- `ARCHIVE_START = "2026-03-18"` — day 0, Puzzle #1
- Days 0–13 use `EASY_NAMES` in order (well-known organisms)
- Days 14+ use a deterministic `seededShuffle` of the remaining organisms (seed `7919`)
- Puzzle number = days elapsed since ARCHIVE_START + 1

To add more organisms: append to `ORGANISMS` — they will be included in the shuffled pool after the easy names.

---

## Rendering Pattern

`render()` replaces `#main-content.innerHTML` with the output of the appropriate `renderHow/Archive/Game()` function and then calls `bindEvents()`. This is intentional — the app is simple enough that full DOM replacement is acceptable.

**Animation rules**:
- The `.view` fade-in (`animation: fi`) is gated on the `.entering` class, which is added only when `prevView !== state.view`. This prevents page flash on every guess.
- Hint card reveal animation (`animation: hr` via `.animating` class) is cleaned up via `animationend` (+ 700 ms fallback). There is no second `render()` call for this.

---

## Autocomplete

`renderAC()` manages a `#autocomplete` div that lives inside `.input-wrap`. Key design decisions:

- **Stable container**: the `#autocomplete` div is created once (if it doesn't exist) and its `innerHTML` is rebuilt on each call. `outerHTML` replacement is never used.
- **Event delegation**: a single `click` listener on the container handles all item clicks. This is robust against inner DOM changes.
- **Blur prevention**: `mousedown` on the container calls `e.preventDefault()` so the input never loses focus when the user clicks a suggestion.
- **Hover**: `mouseenter`/`mouseleave` on individual items update CSS classes only — they do not trigger `renderAC()`.

---

## Lose Conditions

The game ends (`state.over = true`, saved to localStorage) in three scenarios:

1. Player guesses correctly → win
2. Player makes 6 wrong guesses via `doGuess()` → lose
3. Player skips until all 6 hints are revealed (`state.hints >= 6`) without a correct guess → lose (triggered in `doSkip()`)

---

## Adding / Editing Organisms

1. Add a new entry to the `ORGANISMS` array with a unique `id`.
2. Fill in all six keys: `g m o s c d`.
3. Optionally add the `name` to `EASY_NAMES` to schedule it as an early puzzle.
4. No other changes needed — the shuffle pool updates automatically.

---

## Known Limitations / Future Work

- No server component — all state is local. Players cannot compare streaks across devices.
- The organism database is hardcoded. A future version could load from an external JSON.
- Mobile touch: the AC dropdown relies on standard mouse events. Touch behavior is untested on all platforms.
- SharePoint collaboration architecture (live DB backend) is designed but not yet implemented.

---

## Dev Workflow

Open `microbele.html` directly in a browser — no server required. For GitHub Pages: push to the repo root, enable Pages from the main branch. No build step.

To test a specific puzzle date, temporarily override `today` in the console:

```js
state.gameDate = "2026-03-18"; setGameDate("2026-03-18"); render();
```
