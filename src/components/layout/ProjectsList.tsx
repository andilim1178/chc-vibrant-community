import React from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';

export const ProjectsList: React.FC = () => {
  const { projects, template, selectProject, setActiveTab, deleteProject } = usePlaceRate();

  const getProjectStatus = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { percentage: 0, isComplete: false };

    const answeredElements = Object.keys(project.scores || {}).filter(
      elementId => (project.scores?.[elementId] ?? 0) > 0
    ).length;

    const hardElements = template.elements.filter(e => e.type === 'hard').length;
    const percentage = hardElements > 0 ? Math.round((answeredElements / hardElements) * 100) : 0;
    const isComplete = percentage === 100;

    return { percentage, isComplete, answeredElements, hardElements };
  };

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
    setActiveTab('elements');
  };

  return (
    <div className="projects-wrap" style={{ maxWidth: 680, margin: '0 auto', padding: 24 }}>
      <div className="projects-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, color: 'var(--text)', margin: 0 }}>Projects</h2>
        <button
          className="projects-cta"
          onClick={() => setActiveTab('setup')}
          style={{
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 600,
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          + Start new project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            No projects yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map(project => {
            const { percentage, isComplete, answeredElements, hardElements } = getProjectStatus(project.id);

            return (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                style={{
                  padding: 16,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface2)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {project.addr || 'No address'}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius)',
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: isComplete ? '#10b981' : '#fbbf24',
                      color: isComplete ? '#ffffff' : '#78350f',
                      marginLeft: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isComplete ? '✓ Completed' : '◐ In Progress'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {answeredElements} of {hardElements} elements
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {percentage}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'var(--border)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: isComplete ? '#10b981' : '#fbbf24',
                        width: `${percentage}%`,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                </div>

                {/* Project Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{project.type}</span>
                  <span>{project.date}</span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete project "${project.name}"?`)) {
                      deleteProject(project.id);
                    }
                  }}
                  style={{
                    marginTop: 12,
                    padding: '6px 12px',
                    fontSize: 12,
                    backgroundColor: 'transparent',
                    border: '1px solid var(--text-muted)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Phone-only sticky CTA, per the Figma. On desktop the button above
          the list does this job and this one stays hidden. */}
      <button
        className="projects-bottom-cta"
        onClick={() => setActiveTab('setup')}
      >
        Start new assessment
      </button>
    </div>
  );
};
