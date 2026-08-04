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
