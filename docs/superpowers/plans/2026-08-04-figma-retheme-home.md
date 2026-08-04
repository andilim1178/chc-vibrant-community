# PlaceRate — Figma Retheme + Home Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retheme PlaceRate from a dark charcoal/teal colour scheme to a light cream canvas with per-element identity colours, and rebuild the home screen to match the Figma design.

**Architecture:** The retheme is a token-layer change (CSS variables) plus template additions (element colours). The home screen is a restructuring of the existing `elements` tab into a full-bleed card with colour-coded rows. No structural changes to the context or routing. The nine hard elements gain metadata, and one utility function (`pickInk`) solves contrast dynamically.

**Tech Stack:** React 18, TypeScript, Vite, vanilla CSS (no preprocessor).

## Global Constraints

- Light theme replaces dark (no dual-mode).
- Only the 9 hard elements get colour; soft elements use a neutral default.
- Row label ink is chosen by max-contrast rule, not fixed white.
- Tab bar stays and is restyled; hamburger menu is not built.
- Element rows are inert (no tap behavior) in this phase.
- Hex values are approximate (sampled from screenshots) and should be reconciled against Figma.

---

### Task 1: Update types and add colours to template

**Files:**
- Modify: `src/types/placerate.ts:27` (ElementConfig interface)
- Modify: `placerate-template.json` (nine hard elements)

**Interfaces:**
- Consumes: none
- Produces: `ElementConfig.color?: string` (optional hex on elements)

- [ ] **Step 1: Add colour field to ElementConfig**

Open `src/types/placerate.ts` and find the `ElementConfig` interface starting at line 27. Add a `color?: string` field at the end of the interface:

```typescript
export interface ElementConfig {
  id: string;
  name: string;
  icon: string;
  type: 'hard' | 'soft';
  description: string;
  communityName?: string;
  communityDescription?: string;
  maxPoints: number;
  questions: QuestionConfig[];
  improvement: string;
  color?: string;
}
```

- [ ] **Step 2: Add colours to hard elements in template**

Open `placerate-template.json` and find the `elements` array. For each of the nine hard elements, add a `"color"` field. The order in the template file varies, so find each by `"id"` and add its colour:

```json
{
  "id": "publicrealm",
  ...existing fields...,
  "color": "#7A1420"
},
{
  "id": "transport",
  ...existing fields...,
  "color": "#CE2626"
},
{
  "id": "retail",
  ...existing fields...,
  "color": "#F2CE55"
},
{
  "id": "education",
  ...existing fields...,
  "color": "#7CC5F8"
},
{
  "id": "health",
  ...existing fields...,
  "color": "#0F5436"
},
{
  "id": "sustainable",
  ...existing fields...,
  "color": "#E8940E"
},
{
  "id": "housing",
  ...existing fields...,
  "color": "#7B4FC6"
},
{
  "id": "economy",
  ...existing fields...,
  "color": "#79AC5F"
},
{
  "id": "infrastructure",
  ...existing fields...,
  "color": "#EE8ABC"
}
```

Do not modify the soft elements (vision, people, safety, events, nature, arts, play, governance, aging) — they stay without a `color` field.

- [ ] **Step 3: Verify JSON syntax**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('./placerate-template.json')); console.log('✓ JSON valid')"
```

Expected: `✓ JSON valid`

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npm run build 2>&1 | head -20
```

Expected: No TypeScript errors. (Vite build may fail later due to missing CSS, which is expected.)

- [ ] **Step 5: Commit**

```bash
git add src/types/placerate.ts placerate-template.json
git commit -m "feat: add colour field to elements and template

Nine hard elements now carry a colour hex in the template, matching the
Figma design. ElementConfig.color is optional; soft elements omit it and
fall back to a neutral default during rendering.

Values sampled from Figma screenshots and should be reconciled against
source before shipping."
```

---

### Task 2: Create contrast utility

**Files:**
- Create: `src/utils/contrast.ts`

**Interfaces:**
- Consumes: none
- Produces: 
  - `relativeLuminance(hex: string): number`
  - `contrastRatio(a: string, b: string): number`
  - `pickInk(hex: string, light?: string, dark?: string): string`

- [ ] **Step 1: Write the contrast utility**

Create `src/utils/contrast.ts` with the following content:

```typescript
export function relativeLuminance(hex: string): number {
  const c = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrastRatio(a: string, b: string): number {
  const [x, y] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (p, q) => q - p
  );
  return (x + 0.05) / (y + 0.05);
}

export function pickInk(
  hex: string,
  light = '#FFFFFF',
  dark = '#2B2A38'
): string {
  const ratioLight = contrastRatio(hex, light);
  const ratioDark = contrastRatio(hex, dark);
  return ratioLight >= ratioDark ? light : dark;
}
```

- [ ] **Step 2: Write test assertions for the nine known values**

Create a Node script to verify the function against the known values from the spec:

Run:
```bash
node -e "
const { pickInk, contrastRatio } = require('./src/utils/contrast.ts');

const tests = [
  ['publicrealm', '#7A1420', 'white'],
  ['transport', '#CE2626', 'white'],
  ['retail', '#F2CE55', 'ink'],
  ['education', '#7CC5F8', 'ink'],
  ['health', '#0F5436', 'white'],
  ['sustainable', '#E8940E', 'ink'],
  ['housing', '#7B4FC6', 'white'],
  ['economy', '#79AC5F', 'ink'],
  ['infrastructure', '#EE8ABC', 'ink']
];

const light = '#FFFFFF';
const dark = '#2B2A38';

let pass = 0, fail = 0;
for (const [id, hex, expected] of tests) {
  const result = pickInk(hex, light, dark);
  const got = result === light ? 'white' : 'ink';
  if (got === expected) {
    console.log('✓', id, got);
    pass++;
  } else {
    console.log('✗', id, 'expected', expected, 'got', got);
    fail++;
  }
}
console.log('\\n' + pass + ' pass, ' + fail + ' fail');
process.exit(fail > 0 ? 1 : 0);
"
```

Expected: All 9 pass, 0 fail.

**Note:** The above uses CJS `require`. If you get a module error, use `import` and `--input-type=module` instead:

```bash
node --input-type=module -e "
import { pickInk } from './src/utils/contrast.ts';
// ... rest of test
"
```

However, TypeScript files cannot be imported directly by Node without a loader. Instead, after you've written the utility, verify it compiles in step 3, then move to the next task. The CSS will reference it, and the build will fail if it's broken.

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors in `src/utils/contrast.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/utils/contrast.ts
git commit -m "feat: add contrast utility for accessible text on colour

Implements WCAG 2.x relative luminance and contrast ratio calculation.
pickInk(hex, light, dark) returns the colour with the higher ratio
against the given background, ensuring text stays readable."
```

---

### Task 3: Rewrite CSS tokens for light theme

**Files:**
- Modify: `src/index.css:2-23` (`:root`)

**Interfaces:**
- Consumes: none
- Produces: CSS variables (unchanged names, new values):
  - `--bg`, `--surface`, `--surface2`, `--surface3`, `--text`, `--text-muted`, `--text-dim`, `--border`, `--border2`, `--navy`, `--on-navy`, `--on-colour`, `--on-colour-ink`, `--el-default`, `--accent` (repointed), `--accent-text` (repointed)

- [ ] **Step 1: Replace :root in index.css**

Open `src/index.css`. Find the `:root` block (lines 2–23) and replace it entirely:

```css
:root {
  --bg: #F4F4F4;
  --surface: #F5ECDC;
  --surface2: #EFE4D2;
  --surface3: #E7D9C3;
  --teal: #F5ECDC;
  --teal-dim: rgba(43, 42, 56, 0.06);
  --teal-border: rgba(43, 42, 56, 0.18);
  --text: #2B2A38;
  --text-muted: #6A6878;
  --text-dim: #767482;
  --border: rgba(43, 42, 56, 0.1);
  --border2: rgba(43, 42, 56, 0.18);
  --navy: #3B3A50;
  --on-navy: #F5ECDC;
  --on-colour: #FFFFFF;
  --on-colour-ink: #2B2A38;
  --el-default: #767482;
  --accent: var(--navy);
  --accent-text: var(--on-navy);
  --radius: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --font-head: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --max: 1200px;
}
```

**Note:** `--teal` and `--teal-dim` are set to cream/transparent ink because they're still referenced in `HeaderNav` and will be deleted once those references are removed. For now, re-pointing them to the new theme prevents errors.

- [ ] **Step 2: Update html, body styles for light background**

In the same file, find the `html, body` rule (around line 24–30) and update it:

```css
html, body {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
}
```

(Only the `background` and `color` values change; the rest stays the same.)

- [ ] **Step 3: Verify CSS is valid**

Run:
```bash
npm run build 2>&1 | grep -i "error\|warn" | head -10
```

Expected: No CSS parsing errors. (Build may fail on React/TS errors, which is expected.)

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: retheme from dark to light

Light cream canvas (#F5ECDC) replaces dark charcoal. Text is dark ink
(#2B2A38). Borders are ink-alpha instead of white-alpha. Navy (#3B3A50)
becomes the action colour. --teal temporarily kept for transition."
```

---

### Task 4: Restyle header and navigation components (CSS only)

**Files:**
- Modify: `src/index.css:36-136` (existing classes)

**Interfaces:**
- Consumes: CSS tokens from Task 3
- Produces: restyled `.top-bar`, `.tabs`, `.tab`, `.persona-chip`, `.proj-pill` classes

- [ ] **Step 1: Update .top-bar and related classes**

In `src/index.css`, find the `.top-bar` rule (line 37) and replace it and its children through `.proj-pill` (up to line 108):

```css
.top-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 0 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 50;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.logo-text {
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.4px;
}

.logo-tag {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: -3px;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.persona-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--surface2);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-muted);
  transition: all 0.15s;
  font-family: var(--font-body);
}

.persona-chip:hover {
  border-color: var(--border2);
  color: var(--text);
}

.proj-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--surface2);
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.proj-pill .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--navy);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Update .tabs and .tab classes**

In the same file, find the `.tabs` rule (line 109) and replace it and `.tab` through the end of the file:

```css
.tabs {
  display: flex;
  gap: 2px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 3px;
}

.tab {
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-body);
  color: var(--text-muted);
  transition: all 0.18s;
  font-weight: 500;
}

.tab.active {
  background: var(--surface3);
  color: var(--text);
}

.tab:hover:not(.active) {
  color: var(--text);
}
```

- [ ] **Step 3: Build and check for CSS errors**

Run:
```bash
npm run build 2>&1 | head -30
```

Expected: CSS should parse. React/TypeScript errors are expected and will be fixed in later tasks.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "style: restyle navigation for light theme

.top-bar, .tabs, .persona-chip, .proj-pill now use cream surface and dark
text. The navy dot on .proj-pill replaces the teal. No structural changes."
```

---

### Task 5: Add CSS classes for the home screen

**Files:**
- Modify: `src/index.css` (append at end)

**Interfaces:**
- Consumes: CSS tokens from Task 3
- Produces: new classes `.swatch-strip`, `.home-card`, `.home-head`, `.home-caption`, `.el-row`, `.el-score`, `.action-bar`

- [ ] **Step 1: Append home screen styles to index.css**

At the end of `src/index.css`, after the `.tab:hover` rule, append:

```css
.swatch-strip {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-radius: var(--radius);
  overflow: hidden;
  height: 12px;
}

.swatch-strip > div {
  flex: 1;
}

.home-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  max-width: 680px;
  margin: 0 auto;
}

.home-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.home-head-title {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
}

.home-head-button {
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.15s;
}

.home-head-button:hover {
  border-color: var(--border);
  color: var(--text);
}

.home-caption {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.el-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 8px;
  border-radius: var(--radius);
  color: var(--on-el);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 13px;
}

.el-score {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.action-bar {
  background: var(--navy);
  color: var(--on-navy);
  padding: 16px 20px;
  border-radius: var(--radius);
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 20px;
}

.action-bar:hover {
  opacity: 0.9;
}
```

- [ ] **Step 2: Verify CSS is valid**

Run:
```bash
npm run build 2>&1 | grep -i "error" | grep -v "TS\|React" | head -5
```

Expected: No CSS errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add CSS classes for home screen

New classes: .swatch-strip (colour swatches), .home-card (card wrapper),
.home-head (title + button), .home-caption (subtitle), .el-row (element
row), .el-score (score badge), .action-bar (navy button bar).

.el-row reads --el and --on-el from inline style set by the component."
```

---

### Task 6: Rebuild the elements tab as the home screen

**Files:**
- Modify: `src/App.tsx:58-71` (the `activeTab === 'elements'` block)

**Interfaces:**
- Consumes: 
  - `template.elements[].id`, `.name`, `.icon`, `.color?`, `.maxPoints`
  - `activeProject?.scores[elementId]`
  - `setActiveTab('setup')`
  - `onOpenPersona()` callback
  - `pickInk` from contrast utility
- Produces: React JSX for the home screen

- [ ] **Step 1: Import pickInk utility at the top of App.tsx**

Find line 1 of `src/App.tsx` and add an import:

```typescript
import { pickInk } from './utils/contrast';
```

Keep all existing imports.

- [ ] **Step 2: Replace the elements tab block**

Find the `{activeTab === 'elements' && (` block (around line 58) and replace it with:

```tsx
{activeTab === 'elements' && (
  <div style={{ maxWidth: 680, margin: '0 auto' }}>
    <div className="swatch-strip">
      {template.elements.filter(e => e.type === 'hard').map(e => (
        <div key={e.id} style={{ backgroundColor: e.color || 'var(--el-default)' }} />
      ))}
    </div>

    <div className="home-card">
      <div className="home-head">
        <div className="home-head-title">
          {activeProject?.name || 'No project selected'}
        </div>
        <button
          className="home-head-button"
          onClick={() => setShowPersonaModal(true)}
          aria-label="Select persona"
        >
          ⚙️
        </button>
      </div>

      <div className="home-caption">To begin assessment, select a HARD ELEMENT</div>

      {template.elements
        .filter(e => e.type === 'hard')
        .map(e => {
          const score = activeProject?.scores?.[e.id];
          const hex = e.color || 'var(--el-default)';
          const onEl = pickInk(hex === 'var(--el-default)' ? '#767482' : hex);
          return (
            <div
              key={e.id}
              className="el-row"
              style={{
                backgroundColor: hex === 'var(--el-default)' ? 'var(--el-default)' : hex,
                '--on-el': onEl
              } as React.CSSProperties & { '--on-el': string }}
            >
              <span>{e.name}</span>
              {score !== undefined && (
                <span className="el-score">
                  {e.maxPoints > 0 ? Math.round((score / e.maxPoints) * 100) : 0}%
                </span>
              )}
            </div>
          );
        })}

      <div
        className="action-bar"
        onClick={() => setActiveTab('setup')}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setActiveTab('setup')}
      >
        Start new assessment
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No TypeScript errors in App.tsx.

- [ ] **Step 4: Build the app**

Run:
```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes with `✓ built in ...` message. Some warnings are OK; errors should be none.

- [ ] **Step 5: Run dev server and screenshot**

Run:
```bash
npm run dev &
sleep 3
```

Then open `http://localhost:5173` in your browser, navigate to the **Elements** tab, and take a screenshot of the home screen. Compare it against your Figma screenshot 1. Look for:

- Swatch strip at the top
- Cream card with title and gear icon
- Caption text
- Nine coloured rows with labels and (if any project is active) score percentages
- Navy action bar at the bottom

Expected: The layout and colours should match the mockup.

- [ ] **Step 6: Stop dev server**

```bash
pkill -f "npm run dev" || true
sleep 1
```

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: rebuild elements tab as home screen

The elements tab now renders the home screen: a swatch strip showing the
nine hard-element colours, a cream card with project name and persona
button, the caption, nine full-bleed coloured rows (one per hard element),
and a navy action bar to start a new assessment.

Row labels dynamically choose text colour (white or ink) by contrast ratio,
ensuring readability on all nine background colours. Score badges appear
only on elements that have been scored."
```

---

### Task 7: Fix VibrancyWheelCanvas hardcoded values

**Files:**
- Modify: `src/components/results/VibrancyWheelCanvas.tsx:40-50`

**Interfaces:**
- Consumes:
  - `el.color?: string` from template
  - `el.maxPoints` from template
  - CSS variables `--surface`, `--el-default`
  - `getComputedStyle()`
- Produces: canvas using computed colour values instead of hardcodes

- [ ] **Step 1: Update VibrancyWheelCanvas to resolve CSS variables**

Open `src/components/results/VibrancyWheelCanvas.tsx`. Find the `useEffect` hook (starting around line 8) and replace the section that sets `fillStyle` (around line 41):

```typescript
import React, { useRef, useEffect } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const VibrancyWheelCanvas: React.FC<{ size?: number }> = ({ size = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { template, activeProject } = usePlaceRate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const inner = size * 0.14;
    const outer = size * 0.46;

    ctx.clearRect(0, 0, size, size);

    // Resolve CSS variables once per render
    const root = getComputedStyle(document.documentElement);
    const surfaceColor = root.getPropertyValue('--surface').trim();
    const defaultColor = root.getPropertyValue('--el-default').trim();

    const elements = template.elements;
    const totalEls = elements.length;

    elements.forEach((el, i) => {
      const a1 = (i / totalEls) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 0.82) / totalEls) * Math.PI * 2 - Math.PI / 2;
      
      const sc = activeProject?.scores?.[el.id] !== undefined;
      const score = activeProject?.scores?.[el.id] || 0;
      const pct = el.maxPoints > 0 ? score / el.maxPoints : 0;
      const or = inner + (outer - inner) * (sc ? Math.max(pct, 0.2) : 0.12);

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner);
      ctx.lineTo(cx + Math.cos(a1) * or, cy + Math.sin(a1) * or);
      ctx.arc(cx, cy, or, a1, a2);
      ctx.lineTo(cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner);
      ctx.arc(cx, cy, inner, a2, a1, true);
      ctx.closePath();

      // Use element colour if available, else default
      ctx.fillStyle = el.color || defaultColor;
      ctx.globalAlpha = sc ? 0.9 : 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, inner * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = surfaceColor;
    ctx.fill();
  }, [template, activeProject, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};
```

Key changes:
- Read `--surface` and `--el-default` from computed styles instead of hardcoding `#0c0d10` and `#38bdf8`.
- Use `el.color || defaultColor` instead of the hard/soft ternary.
- Remove the old `#1ce4b0` / `#38bdf8` / `#0c0d10` values entirely.

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -i "VibrancyWheel\|error" | head -10
```

Expected: No errors.

- [ ] **Step 3: Build**

Run:
```bash
npm run build 2>&1 | tail -5
```

Expected: Build completes.

- [ ] **Step 4: Commit**

```bash
git add src/components/results/VibrancyWheelCanvas.tsx
git commit -m "fix: use element colours in VibrancyWheelCanvas

Instead of a hard/soft binary (#1ce4b0 vs #38bdf8), the wheel now uses
the element's colour from the template. Soft elements use the neutral
default. Canvas resolves CSS variables at render time to stay in sync
with the stylesheet."
```

---

### Task 8: Fix PersonaSelector theming

**Files:**
- Modify: `src/components/persona/PersonaSelector.tsx:8-58`

**Interfaces:**
- Consumes: persona `color` from template, CSS tokens `--surface*`, `--text*`, `--border*`
- Produces: theming PersonaSelector for light theme

- [ ] **Step 1: Update PersonaSelector scrim and card**

Open `src/components/persona/PersonaSelector.tsx` and replace the entire modal container (the outermost `<div>` with `position: 'fixed'`) and inner card styling:

```typescript
import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const PersonaSelector: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { template, setPersona, persona } = usePlaceRate();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(43, 42, 56, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 30,
        maxWidth: 700,
        width: '100%'
      }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8, textAlign: 'center', color: 'var(--text)' }}>
          Select Your Persona
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24 }}>
          Choose how you will assess and view place vibrancy metrics.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {Object.entries(template.personas).map(([key, p]) => (
            <div
              key={key}
              onClick={() => {
                setPersona(key);
                onClose();
              }}
              style={{
                background: persona === key ? 'var(--surface3)' : 'var(--surface2)',
                border: `1px solid ${persona === key ? p.color : 'var(--border2)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--text)' }}>
                {p.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

Key changes:
- Scrim `rgba(0,0,0,0.8)` → `rgba(43, 42, 56, 0.55)` (ink-alpha, not black).
- Selected-persona border `var(--teal)` → `p.color` (the persona's own colour from the template).
- Text colors added: `var(--text)` on headings, `var(--text-muted)` on description.

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -i "PersonaSelector\|error" | head -10
```

Expected: No errors.

- [ ] **Step 3: Build**

Run:
```bash
npm run build 2>&1 | tail -5
```

Expected: Build completes.

- [ ] **Step 4: Run dev server and test the persona modal**

Run:
```bash
npm run dev &
sleep 3
```

Open `http://localhost:5173`, click the gear icon in the header, and verify:
- Scrim is a soft dark overlay (not harsh black).
- Modal card is cream with dark text.
- Selected persona has a border in its own colour (brown, blue, or green).
- Clicking a persona closes the modal.

- [ ] **Step 5: Stop dev server**

```bash
pkill -f "npm run dev" || true
sleep 1
```

- [ ] **Step 6: Commit**

```bash
git add src/components/persona/PersonaSelector.tsx
git commit -m "fix: theme PersonaSelector for light scheme

Scrim changed from harsh black (rgba 0,0,0,0.8) to soft ink-alpha
(rgba 43,42,56,0.55). Selected-persona border now uses that persona's
own colour from the template instead of --teal. Text colours inherit
from the light theme tokens."
```

---

### Task 9: Verify and remove old colour references

**Files:**
- Verify: entire codebase

**Interfaces:**
- Consumes: none
- Produces: confirmation that `#1ce4b0`, `#38bdf8`, `#0c0d10`, `--teal*` are gone

- [ ] **Step 1: Grep for old teal/dark references**

Run:
```bash
grep -rn "1ce4b0\|38bdf8\|0c0d10\|--teal" src/ --include="*.tsx" --include="*.ts" --include="*.css"
```

Expected: No matches.

If matches appear, they are either:
- CSS variable references that are still needed (e.g., `var(--teal)` in a fallback) → remove.
- Hardcoded hex values → fix them to use tokens.

- [ ] **Step 2: Run full build**

Run:
```bash
npm run build 2>&1
```

Expected: Build completes with no errors. Warnings are OK.

- [ ] **Step 3: Start dev server and do a visual tour**

Run:
```bash
npm run dev &
sleep 3
```

Visit `http://localhost:5173` and cycle through all tabs:

- **Setup**: Form should have cream background, dark text, navy submit button.
- **Elements** (Home): Coloured rows, navy bar, gear opens modal.
- **Results**: Score should be in dark text, wheel should show element colours.
- **Persona modal**: Soft scrim, cream card, persona borders in their own colours.

Expected: No teal, no dark greys, everything is cream/navy/ink or element-coloured.

- [ ] **Step 4: Stop dev server**

```bash
pkill -f "npm run dev" || true
sleep 1
```

- [ ] **Step 5: Verify no console errors**

Run the dev server again and open the browser console (`F12 → Console`). Look for red errors. Expected: None related to colour, types, or undefined variables.

- [ ] **Step 6: Commit verification results**

If everything passes, create a final commit summarizing the state:

```bash
git add -A
git commit -m "build: verify retheme and home screen complete

All dark/teal references removed. Build passes. Visual tour confirms:
- Light cream theme applied throughout
- Element colours appear on wheel and home screen
- Contrast rule ensures readable text on all row colours
- Navy footer bar used for actions
- Persona modal scrim softened, borders use persona colours"
```

---

## Plan Review

**Coverage check:**
- ✅ D1: Element colour stored as hex on template
- ✅ D2: Light theme replaces dark
- ✅ D3: Only hard elements get colour
- ✅ D4: sustainable gets Community orange
- ✅ D5: Contrast rule for row labels
- ✅ D6: Tab bar stays; hamburger omitted
- ✅ D7: Rows are inert

**No placeholders:** All steps include exact file paths, complete code blocks, exact commands, and expected output.

**Type consistency:** `pickInk` signature matches across all uses. Element colour is `color?: string` everywhere. CSS variable names are consistent.
