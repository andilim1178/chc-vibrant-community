import React, { useState } from 'react';
import { PlaceRateProvider, usePlaceRate } from './context/PlaceRateContext';
import { HeaderNav } from './components/layout/HeaderNav';
import { ProjectsList } from './components/layout/ProjectsList';
import { AddressSearch } from './components/setup/AddressSearch';
import { PersonaSelector } from './components/persona/PersonaSelector';
import { VibrancyWheelCanvas } from './components/results/VibrancyWheelCanvas';
import { QuestionWizard } from './components/questions/QuestionWizard';
import { calculateProjectScore } from './utils/scoring';
import { pickInk } from './utils/contrast';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, activeProject, createNewProject, template } = usePlaceRate();
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [postcode, setPostcode] = useState('');
  const [type] = useState('Mixed Use');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const totalScore = activeProject ? calculateProjectScore(activeProject) : 0;

  const handleOpenWizard = (elementId: string) => {
    if (!activeProject) {
      setActiveTab('setup');
      return;
    }
    setSelectedElementId(elementId);
    setShowWizard(true);
  };

  return (
    <div className="shell">
      <HeaderNav onOpenPersona={() => setShowPersonaModal(true)} />
      {showPersonaModal && <PersonaSelector onClose={() => setShowPersonaModal(false)} />}
      
      <main>
        {activeTab === 'setup' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 500, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, marginBottom: 16 }}>Project Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); createNewProject({ name, addr, postcode, type }); }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>PROJECT NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Town Centre Revitalisation"
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>LOCATION / ADDRESS</label>
                <AddressSearch
                  value={addr}
                  onChange={(address: string, postcode_val?: string) => {
                    setAddr(address);
                    if (postcode_val) setPostcode(postcode_val);
                  }}
                  placeholder="e.g. 123 Main St, Sydney"
                />
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Project →
              </button>
            </form>
          </div>
        )}

        {activeTab === 'projects' && <ProjectsList />}

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

              <div className="home-caption">
                {activeProject
                  ? 'To begin assessment, select a HARD ELEMENT'
                  : 'Create a project before starting an assessment'}
              </div>

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
                      role="button"
                      tabIndex={0}
                      aria-disabled={!activeProject}
                      onClick={() => handleOpenWizard(e.id)}
                      onKeyDown={(evt) => evt.key === 'Enter' && handleOpenWizard(e.id)}
                      style={{
                        backgroundColor: hex === 'var(--el-default)' ? 'var(--el-default)' : hex,
                        '--on-el': onEl,
                        cursor: 'pointer',
                        opacity: activeProject ? 1 : 0.5
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

        {activeTab === 'results' && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, marginBottom: 16 }}>Vibrancy Score</h2>
            <div style={{ fontSize: 72, fontFamily: 'var(--font-head)', color: 'var(--navy)', fontWeight: 700 }}>
              {totalScore} <span style={{ fontSize: 20, color: 'var(--text-dim)' }}>/ 100</span>
            </div>
            <div style={{ marginTop: 24 }}>
              <VibrancyWheelCanvas size={180} />
            </div>
          </div>
        )}

        {showWizard && (
          <QuestionWizard
            initialElementId={selectedElementId || undefined}
            onClose={() => setShowWizard(false)}
          />
        )}
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
