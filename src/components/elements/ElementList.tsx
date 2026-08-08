import React from 'react';
import { ElementConfig } from '../../types/placerate';
import { pickInk } from '../../utils/contrast';
import { completionFor } from '../../utils/questionUtils';

interface ElementListProps {
  label: string;
  elements: ElementConfig[];
  answers: Record<string, Record<number, any>> | undefined;
  onOpenElement: (elementId: string) => void;
  onClose: () => void;
  onViewReport: () => void;
}

/** Full-screen list of one type's elements, opened from the Elements tab's rainbow. */
export const ElementList: React.FC<ElementListProps> = ({ label, elements, answers, onOpenElement, onClose, onViewReport }) => {
  const hasProject = answers !== undefined;
  const setPercent = completionFor(elements, answers).percent;

  return (
    <div
      className="element-scope overlay-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg)',
        // Above the sticky .top-bar (z-index 100); below ElementInfo (200) so
        // opening an element's detail stacks on top of this list, not behind it.
        zIndex: 150,
        overflowY: 'auto',
        padding: '24px 16px 40px',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="home-card">
          <div className="home-head">
            <button
              className="home-head-button"
              onClick={onClose}
              aria-label="Back to elements"
              style={{ fontFamily: 'Material Icons', fontSize: '20px' }}
            >
              arrow_back
            </button>
            <div className="home-head-title">{label}</div>
          </div>

          <div
            className="overview-bar"
            role="progressbar"
            aria-valuenow={setPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} completion`}
            style={{ marginTop: 16 }}
          >
            <div className="overview-bar-fill" style={{ width: `${setPercent}%` }} />
          </div>
          <p className="overview-bar-label">{setPercent}% Complete</p>

          <div className="el-list" style={{ marginTop: 16 }}>
            {elements.map(e => {
              const hex = e.color || 'var(--el-default)';
              const onEl = pickInk(hex === 'var(--el-default)' ? '#767482' : hex);
              const completion = completionFor([e], answers);
              const isComplete = completion.percent === 100;
              const isStarted = completion.answered > 0;
              const statusLabel = isComplete ? 'Complete' : isStarted ? 'Resume' : 'Start';
              return (
                <div
                  key={e.id}
                  className="el-row"
                  role="button"
                  tabIndex={0}
                  aria-disabled={!hasProject}
                  onClick={() => onOpenElement(e.id)}
                  onKeyDown={evt => evt.key === 'Enter' && onOpenElement(e.id)}
                  style={{
                    backgroundColor: hex === 'var(--el-default)' ? 'var(--el-default)' : hex,
                    '--on-el': onEl,
                    cursor: 'pointer',
                    opacity: hasProject ? 1 : 0.5,
                  } as React.CSSProperties & { '--on-el': string }}
                >
                  <span>{e.name}</span>
                  {hasProject && (
                    <span className={`el-status ${isComplete ? 'is-complete' : 'is-started'}`}>
                      {statusLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="action-bar action-bar-secondary"
            onClick={onViewReport}
            role="button"
            tabIndex={0}
            onKeyDown={evt => evt.key === 'Enter' && onViewReport()}
          >
            View Report
          </div>
        </div>
      </div>
    </div>
  );
};
