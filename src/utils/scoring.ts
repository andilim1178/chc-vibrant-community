import { ElementConfig, Project } from '../types/placerate';

export function scoreElement(element: ElementConfig, answers?: Record<number, any>): number {
  if (!answers) return 0;
  let total = 0;
  
  element.questions.forEach((q, idx) => {
    const ans = answers[idx];
    if (ans === undefined || ans === null) return;
    
    if (q.type === 'yesno') {
      if (typeof q.scoring === 'object') {
        total += q.scoring[ans] || 0;
      } else {
        if (ans === 'yes') total += 3;
        else if (ans === 'tbc') total += 1.5;
      }
    } else if (q.type === 'proximity') {
      if (q.options && typeof ans === 'number' && q.options[ans]) {
        const val = q.options[ans].value;
        total += typeof val === 'number' ? val : 0;
      }
    } else if (q.type === 'checklist') {
      if (Array.isArray(ans)) {
        if (q.scoring === 'count') {
          total += ans.length;
        } else {
          total += ans.length;
        }
      }
    }
  });

  return Math.min(total, element.maxPoints);
}

export function calculateProjectScore(project: Project): number {
  if (!project.scores) return 0;
  const scores = Object.values(project.scores);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0));
}
