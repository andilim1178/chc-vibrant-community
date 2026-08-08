import { ElementConfig, QuestionConfig } from '../types/placerate';

export interface FlatQuestion {
  elementId: string;
  questionIdx: number;
  question: QuestionConfig;
}

/**
 * Flattens all elements and their questions into a single ordered array.
 * Order: Element 0 Question 0, Element 0 Question 1, ..., Element 1 Question 0, etc.
 */
export function flattenQuestions(elements: ElementConfig[]): FlatQuestion[] {
  const flattened: FlatQuestion[] = [];

  for (const element of elements) {
    for (let i = 0; i < element.questions.length; i++) {
      flattened.push({
        elementId: element.id,
        questionIdx: i,
        question: element.questions[i],
      });
    }
  }

  return flattened;
}

/**
 * Returns the flattened question at a specific global index, or null if out of bounds.
 */
export function getQuestionAtIndex(
  elements: ElementConfig[],
  index: number
): FlatQuestion | null {
  const flattened = flattenQuestions(elements);

  if (index < 0 || index >= flattened.length) {
    return null;
  }

  return flattened[index];
}

/**
 * Returns the total count of all questions across all elements.
 */
export function getTotalQuestionCount(elements: ElementConfig[]): number {
  let count = 0;

  for (const element of elements) {
    count += element.questions.length;
  }

  return count;
}

/**
 * Returns true if the question at globalIndex is the last question of its element.
 * Used to detect when to return to element list during wizard navigation.
 */
export function isLastQuestionOfElement(
  elements: ElementConfig[],
  globalIndex: number
): boolean {
  const flatQuestion = getQuestionAtIndex(elements, globalIndex);

  if (!flatQuestion) {
    return false;
  }

  // Find the element and check if this is the last question
  const element = elements.find((el) => el.id === flatQuestion.elementId);

  if (!element) {
    return false;
  }

  // Check if the question index is the last one in the element
  return flatQuestion.questionIdx === element.questions.length - 1;
}

/**
 * An answer counts as given only if it is actually set. An empty checklist
 * array means "nothing ticked yet" — the same rule the wizard uses to decide
 * whether the forward button unlocks.
 */
export function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export interface Completion {
  answered: number;
  total: number;
  percent: number;
}

/**
 * Share of questions answered across the given elements. Completion is counted
 * per question, not per element, so a part-finished element still moves the bar.
 */
export function completionFor(
  elements: ElementConfig[],
  answers: Record<string, Record<number, any>> | undefined
): Completion {
  let answered = 0;
  let total = 0;

  for (const element of elements) {
    total += element.questions.length;
    const elementAnswers = answers?.[element.id];
    if (!elementAnswers) continue;
    for (let i = 0; i < element.questions.length; i++) {
      if (isAnswered(elementAnswers[i])) answered++;
    }
  }

  return {
    answered,
    total,
    percent: total > 0 ? Math.round((answered / total) * 100) : 0,
  };
}
