import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, PersonaConfig } from '../types/placerate';
import { templateData } from '../data/templateLoader';
import { scoreElement } from '../utils/scoring';

/**
 * Mock sign-in only. Nothing is authenticated against a server and no
 * password is ever held here — `signIn` records the method and, for the
 * email route, the address, purely so the UI can greet the user.
 */
export interface Account {
  method: 'google' | 'facebook' | 'email';
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface PlaceRateContextType {
  template: typeof templateData;
  /** Null until sign-in happens in *this* page load. Resets on reload. */
  account: Account | null;
  signIn: (account: Account) => void;
  signOut: () => void;
  updateAccount: (patch: Partial<Account>) => void;
  persona: string | null;
  setPersona: (p: string) => void;
  /** False until a persona has ever been picked on this device — true thereafter, even across sign-outs. */
  personaConfirmed: boolean;
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

interface SavedState {
  persona: string | null;
  projects: Project[];
  activeProjectId: string | null;
}

const EMPTY_STATE: SavedState = { persona: null, projects: [], activeProjectId: null };

// Read saved state synchronously, before first render. Hydrating in a mount
// effect instead would let the persistence effect below fire first with the
// empty initial state and clobber the user's saved projects.
const readSavedState = (): SavedState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return EMPTY_STATE;
    const parsed = JSON.parse(saved);
    return {
      persona: parsed.persona ?? null,
      projects: parsed.projects ?? [],
      activeProjectId: parsed.activeProjectId ?? null
    };
  } catch (e) {
    console.error('Failed to load state', e);
    return EMPTY_STATE;
  }
};

export const PlaceRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [saved] = useState(readSavedState);
  // Deliberately not persisted, so the login screen leads every page load.
  const [account, setAccount] = useState<Account | null>(null);
  const [persona, setPersonaState] = useState<string | null>(saved.persona);
  // Shown only the first time someone ever picks a persona on this device —
  // if one is already saved, skip straight past the gate. After that, persona
  // is changed from Settings, not this onboarding screen.
  const [personaConfirmed, setPersonaConfirmed] = useState(() => saved.persona !== null);
  const [activeTab, setActiveTab] = useState<string>('projects');
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>(saved.projects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(saved.activeProjectId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      persona,
      activeProjectId,
      projects
    }));
  }, [persona, activeProjectId, projects]);

  const setPersona = (p: string) => {
    setPersonaState(p);
    setPersonaConfirmed(true);
  };

  const signIn = (next: Account) => setAccount(next);

  // Signing out doesn't re-trigger the persona gate: if one's already saved,
  // the next sign-in should skip straight past it, same as any other return visit.
  const signOut = () => {
    setAccount(null);
  };

  const updateAccount = (patch: Partial<Account>) => {
    setAccount(prev => (prev ? { ...prev, ...patch } : prev));
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activePersonaConfig = persona ? templateData.personas[persona] || templateData.personas.developer : templateData.personas.developer;

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
      account,
      signIn,
      signOut,
      updateAccount,
      persona,
      setPersona,
      personaConfirmed,
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
