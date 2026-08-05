import React, { useState, useMemo, useEffect } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';
import { flattenQuestions, getQuestionAtIndex, getTotalQuestionCount, isLastQuestionOfElement } from '../../utils/questionUtils';
import { pickInk } from '../../utils/contrast';
import { QuestionCard } from './QuestionCard';
import { NotesSection } from './NotesSection';

interface QuestionWizardProps {
  onClose: () => void;
  initialElementId?: string;
}

export const QuestionWizard: React.FC<QuestionWizardProps> = ({
  onClose,
  initialElementId
}) => {
  const { template, activeProject, activePersonaConfig, updateProjectAnswers, updateProjectNotes, setActiveTab } = usePlaceRate();

  // Calculate starting index based on initialElementId
  const startIndex = useMemo(() => {
    if (!initialElementId) return 0;

    const flattened = flattenQuestions(template.elements);
    const firstQuestionOfElement = flattened.findIndex(fq => fq.elementId === initialElementId);
    return firstQuestionOfElement >= 0 ? firstQuestionOfElement : 0;
  }, [initialElementId, template.elements]);

  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Get the current question
  const currentQuestion = getQuestionAtIndex(template.elements, currentIndex);
  const totalQuestions = getTotalQuestionCount(template.elements);

  // Get the current answer from active project
  const currentAnswer = currentQuestion
    ? activeProject?.answers[currentQuestion.elementId]?.[currentQuestion.questionIdx]
    : undefined;

  // Get current element for styling
  const currentElement = currentQuestion
    ? template.elements.find(el => el.id === currentQuestion.elementId)
    : null;

  // Determine colors
  const elementColor = currentElement?.color || 'var(--el-default)';
  const resolvedColor = elementColor === 'var(--el-default)' ? '#767482' : elementColor;
  const textColor = pickInk(resolvedColor);

  // Navigation logic
  const canGoBack = currentIndex > 0;
  // An answer counts only if it is actually set. An empty checklist array ([])
  // means "nothing ticked yet" and must not unlock the forward button.
  const canGoForward =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);
  const isLastQuestionOfCurrentElement = currentQuestion
    ? isLastQuestionOfElement(template.elements, currentIndex)
    : false;
  const isLastQuestionOverall = currentIndex === totalQuestions - 1;

  // Handle back button
  const handleBack = () => {
    if (canGoBack) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Handle forward button
  const handleForward = () => {
    if (!canGoForward) return;

    if (isLastQuestionOverall || isLastQuestionOfCurrentElement) {
      onClose();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Handle home button
  const handleHome = () => {
    onClose();
    setActiveTab('elements');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack arrow keys while the user is typing in a text field
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTextInput =
        tag === 'TEXTAREA' || tag === 'INPUT' || target?.isContentEditable === true;
      if (isTextInput) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleForward();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, canGoBack, canGoForward, isLastQuestionOfCurrentElement, isLastQuestionOverall, onClose]);

  // Handle answer change
  const handleAnswerChange = (value: any) => {
    if (currentQuestion) {
      updateProjectAnswers(currentQuestion.elementId, currentQuestion.questionIdx, value);
    }
  };

  // Handle notes change
  const handleNotesChange = (notes: string) => {
    if (currentQuestion) {
      updateProjectNotes(currentQuestion.elementId, notes);
    }
  };

  // Get current notes
  const currentNotes = currentQuestion
    ? activeProject?.notes[currentQuestion.elementId] || ''
    : '';

  // Without an active project there is nowhere to store answers, so never open.
  if (!activeProject || !currentQuestion || !currentElement) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        zIndex: 1000,
        fontFamily: 'inherit',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: '100%',
          backgroundColor: elementColor,
          color: textColor,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
        style={{
          padding: '24px',
          borderBottom: `1px solid rgba(0, 0, 0, 0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Left: Home button */}
        <button
          onClick={handleHome}
          aria-label="Back to elements"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `2px solid ${textColor}`,
            backgroundColor: 'transparent',
            color: textColor,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          🏠
        </button>

        {/* Center: Element name */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '1px',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {activePersonaConfig.plainLanguage && currentElement.communityName
              ? currentElement.communityName
              : currentElement.name}
          </h1>
        </div>

        {/* Right: Progress */}
        <div
          style={{
            fontSize: '12px',
            opacity: 0.7,
            minWidth: '60px',
            textAlign: 'right',
          }}
        >
          Q{currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            transition: 'width 200ms ease',
          }}
        />
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 32px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '560px', width: '100%' }}>
          {/* Question Card */}
          <QuestionCard
            question={currentQuestion.question}
            value={currentAnswer}
            elementColor={elementColor}
            persona={activePersonaConfig.label}
            plainLanguage={activePersonaConfig.plainLanguage}
            onChange={handleAnswerChange}
          />

          {/* Notes Section - Always show */}
          <NotesSection
            visible={true}
            notes={currentNotes}
            onChange={handleNotesChange}
            elementName={
              activePersonaConfig.plainLanguage && currentElement.communityName
                ? currentElement.communityName
                : currentElement.name
            }
          />

          {/* Navigation buttons - Below content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: `1px solid rgba(255, 255, 255, 0.2)`,
            }}
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              aria-label="Previous question"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${textColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                cursor: canGoBack ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                opacity: canGoBack ? 1 : 0.3,
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (canGoBack) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ←
            </button>

            {/* Center: Question counter */}
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              {currentIndex + 1} / {totalQuestions}
            </span>

            {/* Forward button */}
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              aria-label={isLastQuestionOverall || isLastQuestionOfCurrentElement ? "Finish assessment" : "Next question"}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${textColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                cursor: canGoForward ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                opacity: canGoForward ? 1 : 0.3,
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                if (canGoForward) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
