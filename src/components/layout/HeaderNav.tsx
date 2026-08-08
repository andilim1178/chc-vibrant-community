import React, { useState, useEffect } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const HeaderNav: React.FC<{ onOpenPersona: () => void }> = ({ onOpenPersona }) => {
  const { activeTab, setActiveTab, activeProject, activePersonaConfig } = usePlaceRate();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'home', label: 'Home' },
    { id: 'setup', label: 'Setup' },
    { id: 'elements', label: 'Elements' },
    { id: 'results', label: 'Results' },
    { id: 'report', label: 'Report' }
  ];

  // Never leave the menu open behind a tab change.
  useEffect(() => {
    setMenuOpen(false);
  }, [activeTab]);

  return (
    <header className={`top-bar ${menuOpen ? 'menu-open' : ''}`}>
      <div className="logo-group">
        <div className="logo-text">PlaceRate</div>
        <div className="logo-tag">Vibrant Communities</div>
      </div>

      {/* Phone-only: the tab row does not fit, so it collapses in here */}
      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        style={{ fontFamily: 'Material Icons' }}
      >
        {menuOpen ? 'close' : 'menu'}
      </button>

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
