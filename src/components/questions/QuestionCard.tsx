import React from 'react';
import { QuestionConfig } from '../../types/placerate';
import { pickInk } from '../../utils/contrast';
import { OptionButton } from './OptionButton';

interface QuestionCardProps {
  question: QuestionConfig;
  value: any;
  elementColor: string;
  persona: string;
  plainLanguage: boolean;
  onChange: (value: any) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = (props) => {
  const {
    question,
    value,
    elementColor,
    plainLanguage,
    onChange,
  } = props;
  // Question text selection: use communityQ if plainLanguage and exists, else q
  const questionText = plainLanguage && question.communityQ ? question.communityQ : question.q;

  // Context text: use communityWhy if plainLanguage and exists
  const contextText = plainLanguage && question.communityWhy ? question.communityWhy : null;

  // Text color
  const resolvedColor = elementColor === 'var(--el-default)' ? '#767482' : elementColor;
  const textColor = pickInk(resolvedColor);

  // Render yes/no question type
  const renderYesNo = () => {
    const options = [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'To Be Confirmed', value: 'tbc' },
      { label: 'N/A', value: 'n/a' },
    ];

    return (
      <div style={{ marginTop: '32px' }}>
        {options.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    );
  };

  // Render proximity question type
  const renderProximity = () => {
    const options = [
      ...(question.options || []),
      { title: 'N/A', value: 'n/a' },
    ];

    return (
      <div style={{ marginTop: '32px' }}>
        {options.map((option) => (
          <OptionButton
            key={option.value}
            label={option.title}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    );
  };

  // Render checklist question type
  const renderChecklist = () => {
    const isNASelected = value === 'n/a';
    const selectedItems = Array.isArray(value) ? value : [];

    return (
      <div style={{ marginTop: '32px' }}>
        {/* N/A Button */}
        <OptionButton
          label="N/A - Not applicable"
          selected={isNASelected}
          disabled={Array.isArray(value) && value.length > 0}
          onClick={() => {
            if (isNASelected) {
              onChange([]);
            } else {
              onChange('n/a');
            }
          }}
        />

        {/* Options */}
        {(question.options || []).map((option) => (
          <OptionButton
            key={option.value}
            label={option.title}
            selected={selectedItems.includes(option.value)}
            disabled={isNASelected}
            onClick={() => {
              if (isNASelected) {
                // If N/A is selected, clicking an option deselects N/A and selects just that option
                onChange([option.value]);
              } else {
                // Toggle the option
                const newValues = selectedItems.includes(option.value)
                  ? selectedItems.filter((v) => v !== option.value)
                  : [...selectedItems, option.value];
                onChange(newValues);
              }
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ color: textColor }}>
      {/* Question Text */}
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '20px',
          lineHeight: 1.3,
        }}
      >
        {questionText}
      </h2>

      {/* Context Text (Optional) */}
      {contextText && (
        <p
          style={{
            fontSize: '14px',
            marginBottom: '24px',
            opacity: 0.85,
            fontStyle: 'italic',
          }}
        >
          {contextText}
        </p>
      )}

      {/* Question Type Rendering */}
      {question.type === 'yesno' && renderYesNo()}
      {question.type === 'proximity' && renderProximity()}
      {question.type === 'checklist' && renderChecklist()}
    </div>
  );
};
