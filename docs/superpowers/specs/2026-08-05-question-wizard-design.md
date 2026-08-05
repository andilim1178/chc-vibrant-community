# Question Wizard Feature Design

**Date:** 2026-08-05  
**Project:** PlaceRate — Vibrant Community Assessment  
**Feature:** Interactive Question Answering Wizard

## Overview

Users currently cannot answer the assessment questions defined in the PlaceRate template. This feature builds a full-screen wizard interface that guides users through all questions across all elements, allowing them to provide answers, track progress, and optionally add notes.

## User Flow

1. **Entry Point:** User clicks an element (e.g., "Transport") from the element list view
2. **Wizard Launch:** Opens a full-screen question wizard
   - If element has unanswered questions, starts at the first one
   - If element is fully answered, starts at the first question (allowing edits)
3. **Navigation:** Back/forward arrow buttons navigate through all questions across all elements in sequence
4. **Question Answering:** Each question must be answered; N/A is a valid answer option
5. **Return to List:** After the last question of an element, the forward arrow returns to the element list
6. **Results Available:** User can view the results/Vibrancy Score anytime to see partial assessment progress
7. **Editing:** User can re-enter any element via the arrow system to edit previous answers

## Visual Design

### Header Section
- **Element Icon** (left): Icon from element config
- **Element Name** (center): Bold text with element name (e.g., "TRANSPORT")
- **Progress Indicator** (right): "Q2 of 10" format showing current question index and total count

### Question Display
- **Question Text:** Large, readable text
  - Uses `communityQ` when persona is "community" and `plainLanguage: true`
  - Uses `q` (standard question) otherwise
- **Question Context (optional):** Display `communityWhy` explanation for community persona to explain relevance

### Options Section
All question types render as **large button controls**:
- **yesno type:** "Yes" | "No" | "TBC" (plus N/A available on all)
- **proximity type:** Radio-style buttons for each proximity option (e.g., "Within 800m", "800m–2km", "More than 2km")
- **checklist type:** Multiple-select buttons; selected items display in highlighted/filled state

### Notes Section (Conditional)
- **Visibility:** Only shown if `activePersonaConfig.showNotes === true` (Developer and Council personas)
- **Rendering:** Collapsible section at bottom of wizard
- **Interaction:** Click to expand/collapse; text area for note input
- **Persistence:** Saves to context on blur or form submission

### Footer Section
- **Back Button:** Circular icon button with left arrow, navigates to previous question
  - Disabled on first question
- **Forward Button:** Circular icon button with right arrow, navigates to next question
  - On last question of an element, returns to element list

### Styling
- **Background:** Element color (from `ElementConfig.color`)
- **Text Color:** Contrast-aware ink color (use existing `pickInk` utility)
- **Button States:** 
  - Unselected: Light tinted background, darker text
  - Selected: Darker/saturated background, contrast text
  - Disabled (forward on incomplete): Grayed out

## Technical Architecture

### Components

**QuestionWizard (Container)**
- Props: None (reads from context)
- Manages wizard state: current question index, navigation
- Handles question flattening (maps global index to element + question pair)
- Renders header, question card, notes section, footer

**QuestionCard (Presentational)**
- Props: `question: QuestionConfig`, `elementColor: string`, `value: any`
- Renders question text + options based on question type
- Calls `onChange` callback on selection

**OptionButton (Atomic)**
- Props: `label: string`, `selected: boolean`, `onClick: () => void`
- Renders as large, styled button with selection state

**NotesSection (Conditional)**
- Props: `visible: boolean`, `notes: string`, `onChange: (text: string) => void`
- Collapsible editor for element-level notes

### State Management

- **Current Question Index:** Calculated globally across all elements
  - Flattening logic: `elements[i].questions[j]` → global index
  - Reverse mapping: global index → `{ elementId, questionIdx }`
- **Question Navigation:**
  - Back: `currentIndex - 1` (if > 0)
  - Forward: `currentIndex + 1` (if < total); on last question of element → element list
- **Answer Storage:** Via existing `updateProjectAnswers(elementId, questionIdx, value)` in context
- **Notes Storage:** Via existing `updateProjectNotes(elementId, notes)` in context

### Question Traversal

Questions are logically ordered:
1. Flatten all elements with their questions
2. Create ordered list: `[Element0.Q0, Element0.Q1, ..., Element1.Q0, ...]`
3. Forward/back navigate this list; detect element boundaries to determine when to return to list

### Answer Validation

- **Requirement:** Every question must have a value before forward navigation is allowed
- **Valid Values:** 
  - yesno: "yes" | "no" | "tbc" | "n/a"
  - proximity: option value from choices OR "n/a"
  - checklist: array of selected values OR "n/a"
- **Forward Button State:** Disabled if current question has no answer

### Integration Points

- **Context:** `usePlaceRate()` for `activeProject`, `template`, `activePersonaConfig`, `updateProjectAnswers`, `updateProjectNotes`
- **Scoring:** Existing `scoreElement()` in context auto-calculates on answer update
- **Results:** Results view (existing) becomes visible after ≥1 element is answered
- **Entry:** Add click handler to element rows in elements view to launch wizard

## Scope Boundaries

**In Scope:**
- Question wizard UI and navigation
- Answer collection and storage
- Notes section (persona-conditional)
- Integration with existing context and scoring
- Visual styling to match PlaceRate design system

**Out of Scope:**
- Validation rules beyond "answer required"
- Conditional question logic (all questions shown)
- Branching or multi-step scoring
- Export/reporting of answers

## Success Criteria

1. ✅ User can click an element and enter the wizard
2. ✅ Wizard displays questions one at a time with proper context
3. ✅ All three question types (yesno, proximity, checklist) render and accept answers
4. ✅ Back/forward navigation works across all elements
5. ✅ Returning to element list works after finishing an element
6. ✅ Answers are persisted and can be edited
7. ✅ N/A is available and counts as a valid answer
8. ✅ Notes section shows/hides based on persona
9. ✅ Progress indicator updates correctly
10. ✅ Results view is accessible anytime

## File Structure

```
src/
├── components/
│   ├── layout/
│   ├── persona/
│   ├── results/
│   └── questions/                    (NEW)
│       ├── QuestionWizard.tsx         (NEW)
│       ├── QuestionCard.tsx           (NEW)
│       ├── OptionButton.tsx           (NEW)
│       └── NotesSection.tsx           (NEW)
├── context/
│   └── PlaceRateContext.tsx           (EXISTING - no changes)
└── utils/
    └── questionUtils.ts               (NEW - flattening logic)
```

## Open Questions / Notes

- Question ordering: Currently assumes element order from template. If element order becomes dynamic, flattening logic will need refinement.
- Accessibility: ARIA labels on buttons, keyboard navigation through wizard (left/right arrows?)
- Performance: For templates with 100+ questions, consider virtualization (out of scope for MVP)
