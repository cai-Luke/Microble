# MicrobeLE — Claude Code Conversion Spec

## What This Is
MicrobeLE is a Wordle-style daily puzzle game for clinical microbiology (ASCP SM exam scope). Players identify a mystery organism through 6 progressively specific hints. The source artifact is a React JSX component (`microbele.jsx`) that needs conversion to a standalone static HTML file for GitHub Pages deployment.

## Task
Convert `microbele.jsx` to a **single self-contained HTML file** named `microbele.html`. No build step, no dependencies beyond CDN-loaded fonts, no framework. Pure vanilla HTML/CSS/JS.

## Architecture Constraints
- **Single file**: All HTML, CSS, and JS in one `.html` file
- **No build step**: Must work by opening the file directly or serving from GitHub Pages
- **No React**: Convert all React hooks and JSX to vanilla DOM manipulation
- **No npm/node**: Zero dependencies beyond Google Fonts CDN
- **File name**: `microbele.html` (not `index.html` — the repo may already have an index)
- **Static hosting**: GitHub Pages compatible

## Storage Migration
The artifact uses a custom `window.storage` API. Replace ALL calls with `localStorage`:

```javascript
// BEFORE (artifact storage API)
await window.storage.get("mb_done")
await window.storage.set("mb_done", JSON.stringify(data))

// AFTER (localStorage)
JSON.parse(localStorage.getItem("mb_done") || "{}")
localStorage.setItem("mb_done", JSON.stringify(data))
```

Remove all `async/await` around storage operations since localStorage is synchronous.

## Data
The organism database (101 entries) is embedded directly in the JSX as the `ORGANISMS` const array. Keep it embedded in the HTML file — do not externalize to a separate JSON file. Each organism has these hint fields used in this exact order:

| Hint # | Key | Label | Content |
|--------|-----|-------|---------|
| 1 | `g` | Gram Stain | Broad category (Positive, Negative, Acid-fast, etc.) |
| 2 | `m` | Morphology | Stripped of pathognomonic adjectives |
| 3 | `o` | O₂ Requirement | Oxygen relationship |
| 4 | `s` | Screening Tests | Broad biochemicals only (catalase, oxidase, hemolysis, lactose) |
| 5 | `c` | Clinical Clue | Disease associations — narrows without naming the organism |
| 6 | `d` | Identification | Definitive test + specific media + pathognomonic trivia (THE GIVEAWAY) |

## Game Logic (preserve exactly)
- **Daily puzzle**: Deterministic organism selection based on date
  - First 14 days (starting 2026-03-18): curated easy organisms from `EASY_NAMES` array
  - Day 15+: seeded shuffle of remaining organisms (seed=7919)
- **6 guesses max**: Each wrong guess or skip reveals the next hint
- **Autocomplete**: Filter organism list as user types; keyboard nav (arrow keys + enter)
- **Win/lose state**: Persisted per date in localStorage
- **Share**: Generates emoji block string copied to clipboard
- **Archive**: Browse all past puzzles; completed games show score

## Visual Design (preserve exactly)
- **Dark theme**: Background `#0c0e13`, surface `#14171f`
- **Fonts**: Newsreader (serif, display) + JetBrains Mono (monospace, UI) via Google Fonts
- **Accent colors**: Violet `#9b6dff`, safranin red `#e8576e`, green `#4ade80`
- **Gradient header**: "MicrobeLE" with violet-to-red gradient text
- **Hint cards**: Stacked vertically, unrevealed at 35% opacity, reveal animation
- **Giveaway hint (hint 6)**: Serif font, larger size, highlighted border on game over

## Conversion Notes
- JSX uses inline styles — convert to `<style>` block where sensible
- Preserve animation keyframes (hintReveal, winPulse, fadeIn)
- Autocomplete dropdown needs `mousedown` (not `click`) to fire before input `blur`
- Mobile: ensure adequate touch targets (min 44px) on autocomplete items
- Hover effects should gracefully degrade on touch devices

## What NOT to Change
- Organism data content
- Hint ordering and pacing
- Game mechanics (6 guesses, 6 hints, scoring)
- Visual design
- Easy-first archive curation
- Share text format

## Deployment
After conversion, the game will be at `microbele.html` in the repo root. Enable GitHub Pages on `main` branch.
