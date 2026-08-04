import rawTemplate from '../../placerate-template.json';
import { PlaceRateTemplate } from '../types/placerate';

export const templateData: PlaceRateTemplate = rawTemplate as PlaceRateTemplate;

export const DEFAULT_BENCHMARKS = [
  { name: 'Aura City Centre (QLD)', score: 84 },
  { name: 'Elara Town Centre (NSW)', score: 71 },
  { name: 'Standard Suburban DA', score: 48 },
  { name: 'Car-Dependent Strip', score: 29 }
];
