import React, { useState, useEffect } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const HeaderNav: React.FC = () => {
  const { activeTab, setActiveTab, activePersonaConfig, account } = usePlaceRate();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'settings', label: 'Settings' }
  ];

  const fullName = [account?.firstName, account?.lastName].filter(Boolean).join(' ');

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
        {/* Account details are display-only here — persona can only be changed from Settings. */}
        <div className="persona-chip">
          <span style={{ fontFamily: 'Material Icons' }}>{activePersonaConfig.icon}</span>
          <span>{fullName ? `${fullName} · ${activePersonaConfig.label}` : activePersonaConfig.label}</span>
        </div>
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
