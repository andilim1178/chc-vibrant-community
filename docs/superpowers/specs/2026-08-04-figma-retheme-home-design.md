# PlaceRate — Figma retheme + home screen (spec 1 of 3)

Date: 2026-08-04
Branch: `feature/vibrant-colour`
Status: proposed

## Context

The Figma file `PLACE-RATE` (node `0-1`) replaces PlaceRate's dark charcoal / single-teal-accent
theme with a light cream canvas, dark ink, a navy action bar, and a set of per-element identity
colours. This spec covers the retheme and the home screen only.

Colour values were read from three screenshots supplied by the user, not from the Figma file
itself — `WebFetch` against the Figma URL returns HTTP 403 and no Figma MCP server is registered
in the session. **Hex values are therefore approximate (sampled by eye) and should be reconciled
against Figma before this is considered final.** Everything else in this spec is exact.

### Why this is spec 1 of 3

The Figma mockups are largely of an assessment flow that **does not exist in the codebase**.
`PlaceRateContext` exposes `wizardStep`, `updateProjectAnswers`, `updateProjectNotes`,
`selectProject` and `deleteProject`, and none of them have a consumer outside the context file.
`App.tsx` is three static tabs. Delivering the full mockup set therefore means a retheme, a new
feature, and the invention of five undesigned screens. That was split:

1. **This spec** — retheme + home screen. Fully specified by the supplied screenshots.
2. **Assessment wizard** — element intro + question screens. Separate brainstorm; has real
   behavioural questions (last-question behaviour, score commit, "TBC" semantics, back-nav).
3. **Remaining screens** — setup, results, persona, menu. Needs designs or an explicit
   instruction to invent them.

## Decisions taken

| # | Decision | Rationale |
|---|---|---|
| D1 | Element colour is stored as a hex on the template element | The user asked for colour "assigned to the template", and `personas[].color` already stores raw hex in the same file. One source of truth; phase 2 reuses it by setting `--el` on a panel instead of a row. |
| D2 | Light theme **replaces** the dark theme; no dual-mode | The design is the new truth. Dual-mode was not requested and doubles the token surface. |
| D3 | Only the 9 **hard** elements get colour | Three Figma names (Community, Recreation, Cultural) map to *soft* elements, so the design's taxonomy has diverged from the template's. Colouring only hard elements avoids silently rewriting the assessment taxonomy. |
| D4 | `sustainable` takes Community orange `#E8940E` | It has no Figma colour. Of the three unused Figma hues, royal blue would read as Education's sky blue and magenta as Infrastructure's pink. Orange is the only non-colliding choice, and it is still a real value from the design. |
| D5 | Row label ink is chosen by max contrast, not fixed white | The mockup uses white on all rows; five of the nine fall between 1.5:1 and 2.9:1, which is unreadable. A luminance rule fixes it without altering the designer's hues. |
| D6 | The tab bar stays, restyled; the hamburger is not built | The tab bar is the app's only navigation. There is no mockup for what the hamburger opens. |
| D7 | Element rows are inert in phase 1 | They are the wizard's entry point and the wizard is phase 2. A row that looks tappable but dead-ends is worse than one that does not invite the tap. |

### Open questions for the designer

- Confirm the sampled hex values against the Figma source.
- Confirm `Commercial → economy` ("Economy & employment") and `Residential → housing`
  ("Housing diversity"). Both are inferred from name similarity, not stated.
- `sustainable` has no colour in the design (D4 is a stand-in).
- Figma's Community / Recreation / Cultural correspond to *soft* elements
  (`people`, `play`, `arts`). Is the taxonomy changing?

## Palette

### Element colours (added to `placerate-template.json`)

Ink column is the computed result of D5. All nine clear WCAG AA (4.5:1).

| Element id | Name | Figma source | Hex | vs white | vs ink | Label ink |
|---|---|---|---|---|---|---|
| `publicrealm` | Public realm | Public realm | `#7A1420` | 10.78 | 1.31 | white |
| `transport` | Transport | Transport | `#CE2626` | 5.34 | 2.64 | white |
| `retail` | Retail & food | Retail | `#F2CE55` | 1.53 | 9.21 | ink |
| `education` | Education | Education | `#7CC5F8` | 1.88 | 7.51 | ink |
| `health` | Health & wellbeing | Health | `#0F5436` | 8.97 | 1.57 | white |
| `sustainable` | Sustainable | *(none — D4)* | `#E8940E` | 2.42 | 5.82 | ink |
| `housing` | Housing diversity | Residential ⚠ | `#7B4FC6` | 5.56 | 2.53 | white |
| `economy` | Economy & employment | Commercial ⚠ | `#79AC5F` | 2.67 | 5.28 | ink |
| `infrastructure` | Infrastructure | Infrastructure | `#EE8ABC` | 2.33 | 6.03 | ink |

The nine **soft** elements (`vision`, `people`, `safety`, `events`, `nature`, `arts`, `play`,
`governance`, `aging`) get no `color` key and fall back to `--el-default`.

### Neutrals (`:root` in `src/index.css`)

| Token | Value | Note |
|---|---|---|
| `--bg` | `#F4F4F4` | page grey, outside the card |
| `--surface` | `#F5ECDC` | canvas cream — the card |
| `--surface2` | `#EFE4D2` | insets, chips |
| `--surface3` | `#E7D9C3` | pressed / active |
| `--text` | `#2B2A38` | ink; 12.01 on cream |
| `--text-muted` | `#6A6878` | 4.64 on cream — AA |
| `--text-dim` | `#767482` | 3.90 on cream — AA for large text only. Raised from `#9A98A6`, which measured 2.42 and failed. |
| `--border` | `rgba(43,42,56,0.10)` | ink-alpha, was white-alpha |
| `--border2` | `rgba(43,42,56,0.18)` | |
| `--navy` | `#3B3A50` | footer action bar |
| `--on-navy` | `#F5ECDC` | 9.39 on navy |
| `--on-colour` | `#FFFFFF` | row label, dark hues |
| `--on-colour-ink` | `#2B2A38` | row label, light hues |
| `--el-default` | `#767482` | soft elements / missing colour |
| `--accent` | `var(--navy)` | repointed; the new design has no single accent hue |
| `--accent-text` | `var(--on-navy)` | repointed |

Unchanged: `--radius`, `--radius-lg`, `--radius-xl`, `--font-head`, `--font-body`, `--max`.
Deleted: `--teal`, `--teal-dim`, `--teal-border` (after their consumers are fixed, below).

## Changes by file

### `placerate-template.json`
Add `"color": "<hex>"` to the nine hard elements per the table above. No other edits.

### `src/types/placerate.ts`
`ElementConfig` gains `color?: string`. Optional, because soft elements deliberately omit it.

### `src/utils/contrast.ts` (new)
```ts
export function relativeLuminance(hex: string): number
export function contrastRatio(a: string, b: string): number
export function pickInk(hex: string, light = '#FFFFFF', dark = '#2B2A38'): string
```
`pickInk` returns whichever of `light`/`dark` has the higher ratio against `hex`. Pure, no
React, no DOM. Standard WCAG 2.x relative-luminance formula (sRGB linearisation, then
`0.2126R + 0.7152G + 0.0722B`).

### `src/index.css`
Rewrite `:root` per the neutrals table. Restyle `.top-bar`, `.tabs`, `.tab`, `.persona-chip`,
`.proj-pill` for the light surface — structure and class names unchanged, only colour. Add
classes for the home screen: `.swatch-strip`, `.home-card`, `.home-head`, `.home-caption`,
`.el-row`, `.el-score`, `.action-bar`. `.el-row` reads `--el` and `--on-el` from an inline
style set by the component.

### `src/App.tsx` — `elements` tab
Rebuilt to match screenshot 1:

- **Swatch strip** — thin row of the nine hard colours.
- **Card** (`--surface`, `--radius-lg`) containing:
  - **Header** — project name uppercase (`activeProject?.name`, falling back to
    `"No project selected"`), and a gear button opening the existing `PersonaSelector`.
    No hamburger (D6).
  - **Caption** — "To begin assessment, select a HARD ELEMENT".
  - **Nine rows** — full-bleed, `background: var(--el)`, uppercase label in `var(--on-el)`,
    both set inline from `el.color` and `pickInk(el.color)`. Inert (D7).
  - **Score badge** — right of each row, outside it. Rendered **only when
    `activeProject?.scores?.[el.id] !== undefined`**, which is why the mockup shows `0%`
    on two rows and nothing on the rest. Value:
    `el.maxPoints > 0 ? Math.round((scores[el.id] / el.maxPoints) * 100) : 0`. The guard
    mirrors the one already in `VibrancyWheelCanvas` and avoids `NaN%`.
- **Action bar** — navy, full width, "Start new assessment", sets the active tab to `setup`.

The `setup` and `results` tabs are not restructured; they inherit the new tokens through the
`var()`s they already use.

### `src/components/results/VibrancyWheelCanvas.tsx`
Three hardcoded values break on cream and must change:

- `fillStyle` `'#1ce4b0' : '#38bdf8'` (hard/soft binary) → `el.color ?? '#767482'`, so the
  wheel shows true element colour and soft elements read as one neutral family.
- hub `'#0c0d10'` → the computed value of `--surface`.
- Canvas cannot resolve CSS variables. Resolve `--surface` and `--el-default` once per render
  via `getComputedStyle(document.documentElement).getPropertyValue(...)`, trimmed. Do not
  duplicate the hexes in TypeScript — reading the computed style is what stops the canvas
  drifting from the stylesheet.

### `src/components/persona/PersonaSelector.tsx`
- Scrim `rgba(0,0,0,0.8)` → `rgba(43,42,56,0.55)`; a near-opaque black scrim is wrong over a
  light theme.
- Selected-persona border `var(--teal)` → that persona's own `p.color`. The values
  (`#ba7517`, `#185fa5`, `#1d9e75`) are already in the template and currently unused.

### `src/components/layout/HeaderNav.tsx`
No structural change. Restyled entirely through `src/index.css`.

## Out of scope

- The assessment wizard (spec 2).
- The hamburger menu / drawer.
- Restructuring the setup, results or persona screens beyond token compliance.
- `PlaceRate.html` — the legacy single-file build is not retheme.
- Dark mode.
- Adding a test runner.

## Verification

There is no test runner in `package.json`, and adding one is a separate decision. Verification is:

1. `npm run build` (`tsc && vite build`) passes clean — this is the type gate for the
   `ElementConfig.color` addition.
2. `pickInk` asserted against all nine known values (the "Label ink" column above) and
   `contrastRatio` against the published ratios, to two decimal places.
3. Dev server run, home screen screenshotted and compared against screenshot 1.
4. Confirm no `#1ce4b0`, `#38bdf8`, `#0c0d10` or `--teal` reference survives:
   `grep -rn "1ce4b0\|38bdf8\|0c0d10\|--teal" src/`

## Next step

`/sc:brainstorm` the assessment wizard (spec 2) once this lands.
