# PlaceRate React & Responsive Redesign - Design Specification

**Date:** 2026-08-04  
**Project:** PlaceRate (Vibrant Community Web App)  
**Goal:** Convert `PlaceRate.html` into a production-grade, highly responsive Vite + React (TypeScript) application driven dynamically by `placerate-template.json`.

---

## 1. Overview & Vision
`PlaceRate` is an urban planning and community vibrancy assessment platform based on Dean Landy's book *Creating Vibrant Communities*. 

The converted web application will:
1. Be powered dynamically by `placerate-template.json` (defining metadata, personas, elements, questions, and scoring rules without hardcoded values).
2. Offer 100% web responsiveness across mobile smartphones, tablets, and desktop displays.
3. Feature a modern dark design system (obsidian tones `#0c0d10`, emerald/teal accents `#1ce4b0`, glassmorphism, responsive grids, micro-interactions).
4. Provide customized workflows for 3 target personas: **Developer** (Architects/Planners), **Council** (DA Assessors/Strategists), and **Community** (Residents/Local Advocates).

---

## 2. Dynamic Template Architecture (`placerate-template.json`)

### 2.1 TypeScript Interfaces (`src/types/template.ts`)
```typescript
export interface TemplateMetadata {
  name: string;
  tagline: string;
  reference: string;
  version: string;
}

export interface PersonaConfig {
  label: string;
  description: string;
  icon: string;
  color: string;
  setupHeading: string;
  showStages: boolean;
  showNotes: boolean;
  plainLanguage: boolean;
}

export interface QuestionOption {
  title: string;
  value: number | string;
}

export interface QuestionConfig {
  index: number;
  q: string;
  communityQ?: string;
  communityWhy?: string;
  type: 'yesno' | 'proximity' | 'checklist';
  options?: QuestionOption[];
  scoring?: Record<string, number> | 'count' | string;
}

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
}

export interface PlaceRateTemplate {
  metadata: TemplateMetadata;
  personas: Record<string, PersonaConfig>;
  elements: ElementConfig[];
  benchmarks?: Array<{ name: string; score: number }>;
}
```

---

## 3. Component Architecture & UI Layout

```
src/
├── types/
│   ├── template.ts           # JSON template TypeScript schemas
│   └── placerate.ts          # Project state & runtime schemas
├── context/
│   └── PlaceRateContext.tsx  # Global state provider (projects, active persona, answers, scores)
├── components/
│   ├── layout/
│   │   ├── HeaderNav.tsx     # Desktop sticky navbar with active project & persona status
│   │   └── MobileNav.tsx     # Mobile bottom action bar & drawer
│   ├── persona/
│   │   └── PersonaSelector.tsx # 3-card persona selector modal / hero screen
│   ├── setup/
│   │   ├── ProjectSetup.tsx  # Dynamic setup form driven by active persona
│   │   └── ProjectList.tsx   # Saved project cards with load/delete/clone actions
│   ├── assessment/
│   │   ├── ElementGrid.tsx   # 18 Hard & Soft elements responsive grid
│   │   ├── AssessmentWizard.tsx # Community step-by-step wizard
│   │   └── ProAssessmentView.tsx # Planner/Developer detailed element question view
│   ├── results/
│   │   ├── VibrancyWheel.tsx # HTML5 Canvas dynamic radial wheel chart
│   │   ├── ScoreHero.tsx     # Vibrancy score badge, rating tier & plain language verdict
│   │   ├── BenchmarkChart.tsx # Comparative horizontal bar chart
│   │   └── QuickWins.tsx     # Top 3 high-yield improvement recommendations
│   ├── report/
│   │   ├── ReportLanding.tsx # Executive summary options & AI advice triggers
│   │   ├── InlineReport.tsx  # Full printable assessment report
│   │   └── AIAdviceModal.tsx # Claude AI executive summary & actionable recommendations modal
│   └── ui/                   # Reusable UI primitives (Button, Card, Badge, Modal, Input)
├── utils/
│   ├── scoring.ts            # Dynamic scoring logic driven by template rules
│   └── exportReport.ts       # Text / PDF summary export generator
└── App.tsx                   # Main layout container & tab manager
```

---

## 4. Web Responsiveness & Aesthetics

| Screen Size | Navigation | Assessment Layout | Results & Reports |
|---|---|---|---|
| **Mobile (`<640px`)** | Bottom fixed nav bar (`HeaderNav` simplifies to logo) | Single-column cards; step wizard occupies 100% width with large touch buttons | Stacked hero card, scrollable benchmark rows, vertical breakdown cards |
| **Tablet (`640px - 1024px`)** | Top header + collapsible side drawer for project picker | 2-column element grid (`Hard` vs `Soft` elements) | Side-by-side score badge + radial wheel canvas |
| **Desktop (`>1024px`)** | Sticky header with full tabs and project pill | Split-screen navigation (Left: 18 element status list; Right: Active question form) | Full dashboard layout with inline radial canvas, quick wins, & printable report |

---

## 5. Verification Plan

### Automated Verification
* Execute Vite TypeScript type checking (`tsc --noEmit`).
* Execute Vite build (`npm run build`) to ensure zero bundling errors.

### Manual Verification
* Test responsive viewports on desktop browser (Mobile portrait, Tablet, Desktop widescreen).
* Verify template loading from `placerate-template.json`.
* Test dynamic persona switching (Developer, Council, Community).
* Test complete assessment workflow (answering questions, dynamic scoring, radial wheel rendering, AI advice modal, report generation).

---
