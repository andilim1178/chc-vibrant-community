import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, PersonaConfig } from '../types/placerate';
import { templateData } from '../data/templateLoader';
import { scoreElement } from '../utils/scoring';

interface PlaceRateContextType {
  template: typeof templateData;
  persona: string | null;
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

// Read the saved persona synchronously so the gate in App.tsx doesn't flash
// the selector on every reload while the load effect catches up.
const readSavedPersona = (): string | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved).persona ?? null;
  } catch {
    return null;
  }
};

export const PlaceRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<string | null>(readSavedPersona);
  const [activeTab, setActiveTab] = useState<string>('projects');
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
