import React, { useState, useEffect } from 'react';
import { PlaceRateProvider, usePlaceRate } from './context/PlaceRateContext';
import { HeaderNav } from './components/layout/HeaderNav';
import { ProjectsList } from './components/layout/ProjectsList';
import { ProjectOverview } from './components/layout/ProjectOverview';
import { AddressSearch } from './components/setup/AddressSearch';
import { ElementInfo } from './components/elements/ElementInfo';
import { ReportView } from './components/results/ReportView';
import { PersonaSelector } from './components/persona/PersonaSelector';
import { LoginScreen } from './components/auth/LoginScreen';
import { VibrancyWheelCanvas } from './components/results/VibrancyWheelCanvas';
import { QuestionWizard } from './components/questions/QuestionWizard';
import { calculateProjectScore } from './utils/scoring';
import { pickInk } from './utils/contrast';

const MainContent: React.FC = () => {
  const { account, personaConfirmed, activeTab, setActiveTab, activeProject, createNewProject, template } = usePlaceRate();
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [postcode, setPostcode] = useState('');
  const [type] = useState('Mixed Use');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showElementInfo, setShowElementInfo] = useState(false);
  const [infoElementId, setInfoElementId] = useState<string | null>(null);
  const [elementType, setElementType] = useState<'hard' | 'soft'>('hard');

  const totalScore = activeProject ? calculateProjectScore(activeProject) : 0;

  // Close overlays when tab changes
  useEffect(() => {
    setShowWizard(false);
    setShowElementInfo(false);
  }, [activeTab]);

  // Gates run in order: sign in, then choose a persona, then the app.
  // Both must stay below every hook call — an early return above them breaks
  // the Rules of Hooks when the flag flips.
  if (!account) {
    return <LoginScreen />;
  }

  if (!personaConfirmed) {
    return <PersonaSelector onClose={() => {}} />;
  }

  const handleOpenElementInfo = (elementId: string) => {
    if (!activeProject) {
      setActiveTab('setup');
      return;
    }
    setInfoElementId(elementId);
    setShowElementInfo(true);
  };

  const handleStartAssessment = () => {
    if (infoElementId) {
      setSelectedElementId(infoElementId);
      setShowWizard(true);
      setShowElementInfo(false);
    }
  };

  return (
    <div className="shell">
      <HeaderNav onOpenPersona={() => setShowPersonaModal(true)} />
      {showPersonaModal && <PersonaSelector onClose={() => setShowPersonaModal(false)} />}

      {/* Element colour strip — sits under the nav on every tab */}
      <div className="swatch-strip">
        {template.elements.filter(e => e.type === elementType).map(e => (
          <div key={e.id} style={{ backgroundColor: e.color || 'var(--el-default)' }} />
        ))}
      </div>

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

        {activeTab === 'home' && (
          <ProjectOverview
            onOpenElements={(t) => {
              setElementType(t);
              setActiveTab('elements');
            }}
          />
        )}

        {activeTab === 'elements' && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="home-card">
              <div className="home-head">
                <div className="home-head-title">
                  {activeProject?.name || 'No project selected'}
                </div>
                <button
                  className="home-head-button"
                  onClick={() => setShowPersonaModal(true)}
                  aria-label="Select persona"
                  style={{ fontFamily: 'Material Icons', fontSize: '24px' }}
                >
                  settings
                </button>
              </div>

              {/* Everything below is element content, so it runs in Poppins */}
              <div className="element-scope">

              {/* Element Type Toggle */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'center' }}>
                <button
                  onClick={() => setElementType('hard')}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: elementType === 'hard' ? 'var(--accent)' : 'var(--surface2)',
                    color: elementType === 'hard' ? 'var(--accent-text)' : 'var(--text)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  Hard Elements
                </button>
                <button
                  onClick={() => setElementType('soft')}
                  style={{
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: elementType === 'soft' ? 'var(--accent)' : 'var(--surface2)',
                    color: elementType === 'soft' ? 'var(--accent-text)' : 'var(--text)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  Soft Elements
                </button>
              </div>

              <div className="home-caption">
                {activeProject
                  ? `To begin assessment, select a ${elementType.toUpperCase()} ELEMENT`
                  : 'Create a project before starting an assessment'}
              </div>

              {template.elements
                .filter(e => e.type === elementType)
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
                      onClick={() => handleOpenElementInfo(e.id)}
                      onKeyDown={(evt) => evt.key === 'Enter' && handleOpenElementInfo(e.id)}
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

              </div>

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

        {activeTab === 'report' && <ReportView />}

        {showElementInfo && infoElementId && (
          <ElementInfo
            element={template.elements.find(e => e.id === infoElementId)!}
            onStartAssessment={handleStartAssessment}
            onClose={() => setShowElementInfo(false)}
          />
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
