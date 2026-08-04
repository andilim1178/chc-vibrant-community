# PlaceRate React Conversion & Responsive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `PlaceRate.html` into a fully responsive Vite + React (TypeScript) SPA dynamically powered by `placerate-template.json`.

**Architecture:** A Vite + React + TypeScript web application with modular UI components, dynamic scoring utility using `placerate-template.json`, LocalStorage synchronization via `PlaceRateContext`, and responsive Tailwind CSS / CSS Modules styling.

**Tech Stack:** React 18+, TypeScript, Vite, Tailwind CSS / Vanilla CSS, HTML5 Canvas, Lucide Icons.

---

## File Structure

```
d:/Projects/chc/VibrantCommunityWebApp/
├── placerate-template.json                  # Source of truth template metadata
├── package.json                             # Dependencies & Vite setup
├── vite.config.ts                           # Vite configuration
├── tsconfig.json                            # TypeScript configuration
├── index.html                               # HTML entry point
└── src/
    ├── main.tsx                             # React entry point
    ├── index.css                            # Core CSS variables, typography, & global styles
    ├── types/
    │   └── placerate.ts                     # TypeScript data interfaces
    ├── data/
    │   └── templateLoader.ts                # Loads & parses placerate-template.json
    ├── utils/
    │   ├── scoring.ts                       # Dynamic template-driven scoring
    │   └── exportReport.ts                  # PDF/Text report generator
    ├── context/
    │   └── PlaceRateContext.tsx             # Global React Context & storage
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx                   # Action buttons
    │   │   ├── Card.tsx                     # Responsive container cards
    │   │   └── Modal.tsx                    # Dialog overlay
    │   ├── layout/
    │   │   ├── HeaderNav.tsx                # Sticky top bar
    │   │   └── MobileNav.tsx                # Mobile bottom navigation
    │   ├── persona/
    │   │   └── PersonaSelector.tsx          # 3-card persona screen
    │   ├── setup/
    │   │   ├── ProjectSetup.tsx             # Project detail input form
    │   │   └── ProjectList.tsx              # Saved projects grid
    │   ├── assessment/
    │   │   ├── ElementGrid.tsx              # 18 elements grid view
    │   │   ├── AssessmentWizard.tsx         # Community wizard step flow
    │   │   └── ProAssessmentView.tsx        # Planner/Developer detailed questions
    │   ├── results/
    │   │   ├── VibrancyWheelCanvas.tsx      # HTML5 Canvas radial wheel
    │   │   ├── ScoreHero.tsx                # Score & tier summary
    │   │   ├── BenchmarkChart.tsx           # Comparative bar chart
    │   │   └── QuickWins.tsx                # Top 3 recommendations
    │   └── report/
    │       ├── ReportLanding.tsx            # Report choices & triggers
    │       ├── InlineReport.tsx             # Full printable report
    │       └── AIAdviceModal.tsx            # Claude AI recommendations modal
    └── App.tsx                              # Main layout & tab router
```

---

### Task 1: Project Initialization & Build Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`

- [ ] **Step 1: Create `package.json` with React, Vite, and TypeScript dependencies**

```json
{
  "name": "placerate-react",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.4.5",
    "vite": "^5.2.11"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>PlaceRate — Creating Vibrant Communities</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `src/index.css`**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0c0d10;
  --surface: #13151a;
  --surface2: #1a1c22;
  --surface3: #21232b;
  --teal: #1ce4b0;
  --teal-dim: rgba(28, 228, 176, 0.1);
  --teal-border: rgba(28, 228, 176, 0.28);
  --text: #eef0f7;
  --text-muted: #8b8fa8;
  --text-dim: #4a4d62;
  --border: rgba(255, 255, 255, 0.07);
  --border2: rgba(255, 255, 255, 0.12);
  --accent: #1ce4b0;
  --accent-text: #061a12;
  --radius: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --font-head: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --max: 1200px;
}
html, body {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
}
.shell {
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 20px 60px;
}
```

- [ ] **Step 6: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### Task 2: TypeScript Data Schemas & Template Data Loader

**Files:**
- Create: `src/types/placerate.ts`
- Create: `src/data/templateLoader.ts`

- [ ] **Step 1: Create `src/types/placerate.ts`**

```typescript
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
  metadata: {
    name: string;
    tagline: string;
    reference: string;
    version: string;
  };
  personas: Record<string, PersonaConfig>;
  elements: ElementConfig[];
  benchmarks?: Array<{ name: string; score: number }>;
}

export interface Project {
  id: string;
  name: string;
  addr: string;
  type: string;
  by: string;
  date: string;
  answers: Record<string, Record<number, any>>;
  scores: Record<string, number>;
  notes: Record<string, string>;
}
```

- [ ] **Step 2: Create `src/data/templateLoader.ts`**

```typescript
import rawTemplate from '../../placerate-template.json';
import { PlaceRateTemplate } from '../types/placerate';

export const templateData: PlaceRateTemplate = rawTemplate as PlaceRateTemplate;

export const DEFAULT_BENCHMARKS = [
  { name: 'Aura City Centre (QLD)', score: 84 },
  { name: 'Elara Town Centre (NSW)', score: 71 },
  { name: 'Standard Suburban DA', score: 48 },
  { name: 'Car-Dependent Strip', score: 29 }
];
```

---

### Task 3: Dynamic Template Scoring Utility

**Files:**
- Create: `src/utils/scoring.ts`

- [ ] **Step 1: Implement dynamic scoring calculation in `src/utils/scoring.ts`**

```typescript
import { ElementConfig, Project } from '../types/placerate';

export function scoreElement(element: ElementConfig, answers?: Record<number, any>): number {
  if (!answers) return 0;
  let total = 0;
  
  element.questions.forEach((q, idx) => {
    const ans = answers[idx];
    if (ans === undefined || ans === null) return;
    
    if (q.type === 'yesno') {
      if (typeof q.scoring === 'object') {
        total += q.scoring[ans] || 0;
      } else {
        if (ans === 'yes') total += 3;
        else if (ans === 'tbc') total += 1.5;
      }
    } else if (q.type === 'proximity') {
      if (q.options && typeof ans === 'number' && q.options[ans]) {
        const val = q.options[ans].value;
        total += typeof val === 'number' ? val : 0;
      }
    } else if (q.type === 'checklist') {
      if (Array.isArray(ans)) {
        if (q.scoring === 'count') {
          total += ans.length;
        } else {
          total += ans.length;
        }
      }
    }
  });

  return Math.min(total, element.maxPoints);
}

export function calculateProjectScore(project: Project): number {
  if (!project.scores) return 0;
  const scores = Object.values(project.scores);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0));
}
```

---

### Task 4: Global React Context & LocalStorage Persistence

**Files:**
- Create: `src/context/PlaceRateContext.tsx`

- [ ] **Step 1: Create `src/context/PlaceRateContext.tsx`**

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, PersonaConfig } from '../types/placerate';
import { templateData } from '../data/templateLoader';
import { scoreElement } from '../utils/scoring';

interface PlaceRateContextType {
  template: typeof templateData;
  persona: string;
  setPersona: (p: string) => void;
  activePersonaConfig: PersonaConfig;
  projects: Project[];
  activeProject: Project | null;
  activeTab: string;
  setActiveTab: (t: string) => void;
  wizardStep: number;
  setWizardStep: React.Dispatch<React.SetStateAction<number>>;
  createNewProject: (data: Partial<Project>) => void;
  updateProjectAnswers: (elementId: string, questionIdx: number, val: any) => void;
  updateProjectNotes: (elementId: string, notes: string) => void;
  selectProject: (id: string) => void;
  deleteProject: (id: string) => void;
}

const PlaceRateContext = createContext<PlaceRateContextType | undefined>(undefined);

const STORAGE_KEY = 'placerate_react_state_v1';

export const PlaceRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<string>('developer');
  const [activeTab, setActiveTab] = useState<string>('setup');
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.persona) setPersona(parsed.persona);
        if (parsed.activeProjectId) setActiveProjectId(parsed.activeProjectId);
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      persona,
      activeProjectId,
      projects
    }));
  }, [persona, activeProjectId, projects]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activePersonaConfig = templateData.personas[persona] || templateData.personas.developer;

  const createNewProject = (data: Partial<Project>) => {
    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name: data.name || 'Untitled Project',
      addr: data.addr || '',
      type: data.type || 'Mixed Use',
      by: data.by || '',
      date: new Date().toISOString().split('T')[0],
      answers: {},
      scores: {},
      notes: {}
    };
    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setActiveTab('elements');
  };

  const updateProjectAnswers = (elementId: string, questionIdx: number, val: any) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;
      const elementAnswers = { ...(p.answers[elementId] || {}), [questionIdx]: val };
      const newAnswers = { ...p.answers, [elementId]: elementAnswers };
      const elConfig = templateData.elements.find(e => e.id === elementId);
      const newScores = { ...p.scores };
      if (elConfig) {
        newScores[elementId] = scoreElement(elConfig, elementAnswers);
      }
      return { ...p, answers: newAnswers, scores: newScores };
    }));
  };

  const updateProjectNotes = (elementId: string, notes: string) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;
      return { ...p, notes: { ...p.notes, [elementId]: notes } };
    }));
  };

  return (
    <PlaceRateContext.Provider value={{
      template: templateData,
      persona,
      setPersona,
      activePersonaConfig,
      projects,
      activeProject,
      activeTab,
      setActiveTab,
      wizardStep,
      setWizardStep,
      createNewProject,
      updateProjectAnswers,
      updateProjectNotes,
      selectProject: setActiveProjectId,
      deleteProject: (id) => setProjects(prev => prev.filter(p => p.id !== id))
    }}>
      {children}
    </PlaceRateContext.Provider>
  );
};

export const usePlaceRate = () => {
  const ctx = useContext(PlaceRateContext);
  if (!ctx) throw new Error('usePlaceRate must be used within PlaceRateProvider');
  return ctx;
};
```

---

### Task 5: UI Components & Navigation Bar

**Files:**
- Create: `src/components/layout/HeaderNav.tsx`
- Create: `src/components/layout/MobileNav.tsx`
- Create: `src/components/persona/PersonaSelector.tsx`

- [ ] **Step 1: Create `src/components/layout/HeaderNav.tsx`**

```tsx
import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const HeaderNav: React.FC<{ onOpenPersona: () => void }> = ({ onOpenPersona }) => {
  const { activeTab, setActiveTab, activeProject, activePersonaConfig } = usePlaceRate();

  const tabs = [
    { id: 'setup', label: 'Setup' },
    { id: 'projects', label: 'Projects' },
    { id: 'elements', label: 'Elements' },
    { id: 'results', label: 'Results' },
    { id: 'report', label: 'Report' }
  ];

  return (
    <header className="top-bar">
      <div className="logo-group">
        <div className="logo-text">PlaceRate</div>
        <div className="logo-tag">Vibrant Communities</div>
      </div>
      <div className="top-right">
        <button className="persona-chip" onClick={onOpenPersona}>
          <span>{activePersonaConfig.icon}</span>
          <span>{activePersonaConfig.label}</span>
        </button>
        {activeProject && (
          <div className="proj-pill">
            <span className="dot" />
            <span>{activeProject.name}</span>
          </div>
        )}
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  );
};
```

---

### Task 6: Radial Canvas Wheel Component

**Files:**
- Create: `src/components/results/VibrancyWheelCanvas.tsx`

- [ ] **Step 1: Create `src/components/results/VibrancyWheelCanvas.tsx` using Canvas 2D context**

```tsx
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

      ctx.fillStyle = el.type === 'hard' ? '#1ce4b0' : '#38bdf8';
      ctx.globalAlpha = sc ? 0.9 : 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, inner * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#0c0d10';
    ctx.fill();
  }, [template, activeProject, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};
```

---

### Task 7: Main App Assembly & Verification

**Files:**
- Create: `src/App.tsx`

- [ ] **Step 1: Assemble App tab router in `src/App.tsx`**

```tsx
import React, { useState } from 'react';
import { PlaceRateProvider, usePlaceRate } from './context/PlaceRateContext';
import { HeaderNav } from './components/layout/HeaderNav';
import { PersonaSelector } from './components/persona/PersonaSelector';

const MainContent: React.FC = () => {
  const { activeTab } = usePlaceRate();
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  return (
    <div className="shell">
      <HeaderNav onOpenPersona={() => setShowPersonaModal(true)} />
      {showPersonaModal && <PersonaSelector onClose={() => setShowPersonaModal(false)} />}
      <main>
        {activeTab === 'setup' && <div>Setup Component</div>}
        {activeTab === 'projects' && <div>Projects Component</div>}
        {activeTab === 'elements' && <div>Elements Component</div>}
        {activeTab === 'results' && <div>Results Component</div>}
        {activeTab === 'report' && <div>Report Component</div>}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <PlaceRateProvider>
      <MainContent />
    </PlaceRateProvider>
  );
}
```

- [ ] **Step 2: Run build verification to ensure clean TypeScript setup**

Run: `npm run build`
Expected: Success with 0 errors.

---
