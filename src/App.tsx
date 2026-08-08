import React, { useState, useEffect } from 'react';
import { PlaceRateProvider, usePlaceRate } from './context/PlaceRateContext';
import { HeaderNav } from './components/layout/HeaderNav';
import { ProjectsList } from './components/layout/ProjectsList';
import { ElementSetPanel, ELEMENT_SETS } from './components/layout/ElementSetPanel';
import { SetupForm } from './components/setup/SetupForm';
import { ElementInfo } from './components/elements/ElementInfo';
import { ElementList } from './components/elements/ElementList';
import { ReportView } from './components/results/ReportView';
import { PersonaSelector } from './components/persona/PersonaSelector';
import { LoginScreen } from './components/auth/LoginScreen';
import { SettingsPage } from './components/settings/SettingsPage';
import { QuestionWizard } from './components/questions/QuestionWizard';
import { completionFor } from './utils/questionUtils';

const MainContent: React.FC = () => {
  const { account, personaConfirmed, activeTab, setActiveTab, activeProject, template } = usePlaceRate();
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showElementInfo, setShowElementInfo] = useState(false);
  const [infoElementId, setInfoElementId] = useState<string | null>(null);
  const [openListType, setOpenListType] = useState<'hard' | 'soft' | null>(null);

  const overallPercent = activeProject ? completionFor(template.elements, activeProject.answers).percent : 0;

  // Close overlays when tab changes
  useEffect(() => {
    setShowWizard(false);
    setShowElementInfo(false);
    setOpenListType(null);
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
      <HeaderNav />
      {showPersonaModal && <PersonaSelector onClose={() => setShowPersonaModal(false)} />}

      {/* Element colour strip — sits under the nav on every tab */}
      <div className="swatch-strip">
        {template.elements.map(e => (
          <div key={e.id} style={{ backgroundColor: e.color || 'var(--el-default)' }} />
        ))}
      </div>

      <main>
        {activeTab === 'setup' && <SetupForm />}

        {activeTab === 'projects' && <ProjectsList />}

        {activeTab === 'elements' && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="home-card">
              <div className="home-head">
                <button
                  className="home-head-button"
                  onClick={() => setActiveTab('projects')}
                  aria-label="Back to projects"
                  style={{ fontFamily: 'Material Icons', fontSize: '24px' }}
                >
                  home
                </button>
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

              {activeProject ? (
                <>
                  <h1 className="overview-title">{activeProject.name}</h1>
                  {activeProject.addr && <p className="overview-addr">{activeProject.addr}</p>}

                  <div className="overview-badge-row">
                    <span className={`overview-badge ${overallPercent === 100 ? 'is-complete' : ''}`}>
                      {overallPercent === 100 ? 'Completed' : 'In progress'}
                    </span>
                  </div>

                  <div
                    className="overview-bar"
                    role="progressbar"
                    aria-valuenow={overallPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Overall completion"
                  >
                    <div className="overview-bar-fill" style={{ width: `${overallPercent}%` }} />
                  </div>
                  <p className="overview-bar-label">{overallPercent}% Complete</p>
                </>
              ) : (
                <div className="home-caption">Create a project before starting an assessment</div>
              )}

              <ElementSetPanel type="hard" elements={template.elements} answers={activeProject?.answers} onOpenList={setOpenListType} />
              <ElementSetPanel type="soft" elements={template.elements} answers={activeProject?.answers} onOpenList={setOpenListType} />

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

        {activeTab === 'report' && <ReportView />}

        {activeTab === 'settings' && (
          <SettingsPage onOpenPersona={() => setShowPersonaModal(true)} />
        )}

        {openListType && (
          <ElementList
            label={ELEMENT_SETS.find(s => s.type === openListType)!.label}
            elements={template.elements.filter(e => e.type === openListType)}
            answers={activeProject?.answers}
            onOpenElement={handleOpenElementInfo}
            onClose={() => setOpenListType(null)}
          />
        )}

        {showElementInfo && infoElementId && (
          <ElementInfo
            element={template.elements.find(e => e.id === infoElementId)!}
            answers={activeProject?.answers}
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
