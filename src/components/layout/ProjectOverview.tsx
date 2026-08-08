import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';
import { completionFor } from '../../utils/questionUtils';

interface ProjectOverviewProps {
  /** Jump into the element list with the given set already selected. */
  onOpenElements: (type: 'hard' | 'soft') => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ onOpenElements }) => {
  const { activeProject, template, setActiveTab } = usePlaceRate();

  if (!activeProject) {
    return (
      <div className="overview" style={{ textAlign: 'center', paddingTop: 48 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          No project selected yet.
        </p>
        <button className="overview-empty-cta" onClick={() => setActiveTab('projects')}>
          Go to projects
        </button>
      </div>
    );
  }

  const hardElements = template.elements.filter(e => e.type === 'hard');
  const softElements = template.elements.filter(e => e.type === 'soft');

  const overall = completionFor(template.elements, activeProject.answers);
  const hard = completionFor(hardElements, activeProject.answers);
  const soft = completionFor(softElements, activeProject.answers);

  const isComplete = overall.percent === 100;

  const renderSection = (
    label: string,
    type: 'hard' | 'soft',
    elements: typeof hardElements,
    percent: number
  ) => (
    <section className="overview-section">
      <div className="overview-section-head">
        <h2>{label}</h2>
        <span className="overview-section-pct">{percent}% Complete</span>
      </div>
      <div
        className="overview-swatches"
        role="button"
        tabIndex={0}
        aria-label={`Open ${label.toLowerCase()}`}
        onClick={() => onOpenElements(type)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenElements(type);
          }
        }}
      >
        {elements.map(e => (
          <div
            key={e.id}
            title={e.name}
            style={{ backgroundColor: e.color || 'var(--el-default)' }}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="overview">
      <h1 className="overview-title">{activeProject.name}</h1>
      {activeProject.addr && <p className="overview-addr">{activeProject.addr}</p>}

      <div className="overview-badge-row">
        <span className={`overview-badge ${isComplete ? 'is-complete' : ''}`}>
          {isComplete ? 'Completed' : 'In progress'}
        </span>
      </div>

      <div
        className="overview-bar"
        role="progressbar"
        aria-valuenow={overall.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Overall completion"
      >
        <div className="overview-bar-fill" style={{ width: `${overall.percent}%` }} />
      </div>
      <p className="overview-bar-label">{overall.percent}% Complete</p>

      {renderSection('Hard Elements', 'hard', hardElements, hard.percent)}
      {renderSection('Soft Elements', 'soft', softElements, soft.percent)}
    </div>
  );
};
