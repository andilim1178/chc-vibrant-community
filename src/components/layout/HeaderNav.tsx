import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const HeaderNav: React.FC<{ onOpenPersona: () => void }> = ({ onOpenPersona }) => {
  const { activeTab, setActiveTab, activeProject, activePersonaConfig } = usePlaceRate();

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'setup', label: 'Setup' },
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
          <span style={{ fontFamily: 'Material Icons' }}>{activePersonaConfig.icon}</span>
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
