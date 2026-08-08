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
import { completionFor } from './utils/questionUtils';
import { pickInk } from './utils/contrast';

const ELEMENT_SETS = [
  { type: 'hard' as const, label: 'Hard Elements' },
  { type: 'soft' as const, label: 'Soft Elements' },
];

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
  const [pendingScroll, setPendingScroll] = useState<'hard' | 'soft' | null>(null);

  const totalScore = activeProject ? calculateProjectScore(activeProject) : 0;

  // Close overlays when tab changes
  useEffect(() => {
    setShowWizard(false);
    setShowElementInfo(false);
  }, [activeTab]);

  // Jumping in from the overview scrolls to that set. This has to run as an
  // effect rather than inline with the click: the section only exists once the
  // elements tab has committed to the DOM.
  useEffect(() => {
    if (activeTab !== 'elements' || !pendingScroll) return;
    document.getElementById(`elements-${pendingScroll}`)?.scrollIntoView({ block: 'start' });
    setPendingScroll(null);
  }, [activeTab, pendingScroll]);

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
              // Keeps the colour strip on the set you came from, and asks the
              // effect above to scroll to that section once it exists.
              setElementType(t);
              setPendingScroll(t);
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

              <div className="home-caption">
                {activeProject
                  ? 'To begin assessment, select an element'
                  : 'Create a project before starting an assessment'}
              </div>

              {ELEMENT_SETS.map(set => {
                const setElements = template.elements.filter(e => e.type === set.type);
                const setPercent = completionFor(setElements, activeProject?.answers).percent;

                return (
                  <section key={set.type} id={`elements-${set.type}`} className="el-group">
                    <div className="el-group-head">
                      <h2>{set.label}</h2>
                      <span className="el-group-pct">{setPercent}% Complete</span>
                    </div>

                    {setElements.map(e => {
                      const hex = e.color || 'var(--el-default)';
                      const onEl = pickInk(hex === 'var(--el-default)' ? '#767482' : hex);
                      const elPercent = completionFor([e], activeProject?.answers).percent;
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
                          {activeProject && elPercent > 0 && (
                            <span className="el-score">{elPercent}%</span>
                          )}
                        </div>
                      );
                    })}
                  </section>
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
