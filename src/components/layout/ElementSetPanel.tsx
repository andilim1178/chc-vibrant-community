import React from 'react';
import { ElementConfig } from '../../types/placerate';
import { completionFor } from '../../utils/questionUtils';

export const ELEMENT_SETS = [
  { type: 'hard' as const, label: 'Hard Elements' },
  { type: 'soft' as const, label: 'Soft Elements' },
];

interface ElementSetPanelProps {
  type: 'hard' | 'soft';
  elements: ElementConfig[];
  answers: Record<string, Record<number, any>> | undefined;
  /** Open the full-screen list of this set's elements (the rainbow is one button). */
  onOpenList: (type: 'hard' | 'soft') => void;
}

/** One set's heading, completion percentage, and rainbow — opens the full element list when clicked. */
export const ElementSetPanel: React.FC<ElementSetPanelProps> = ({ type, elements, answers, onOpenList }) => {
  const set = ELEMENT_SETS.find(s => s.type === type)!;
  const setElements = elements.filter(e => e.type === type);
  const percent = completionFor(setElements, answers).percent;

  return (
    <section className="overview-section">
      <div className="overview-section-head">
        <h2>{set.label}</h2>
        <span className="overview-section-pct">{percent}% Complete</span>
      </div>
      <div
        className="overview-swatches"
        role="button"
        tabIndex={0}
        aria-label={`View all ${set.label.toLowerCase()}`}
        onClick={() => onOpenList(type)}
        onKeyDown={evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            onOpenList(type);
          }
        }}
      >
        {setElements.map(e => (
          <div key={e.id} title={e.name} style={{ backgroundColor: e.color || 'var(--el-default)' }} />
        ))}
      </div>
    </section>
  );
};
