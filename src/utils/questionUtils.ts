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
