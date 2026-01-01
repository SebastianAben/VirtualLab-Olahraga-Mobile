import { HeartRateZone } from './types';

// API Configuration
export const API_BASE_URL = 'http://localhost:5000';

// Zone Colors
export const ZONE_COLORS: Record<HeartRateZone, string> = {
  resting: '#10b981',    // green
  'fat-burn': '#3b82f6', // blue
  cardio: '#f59e0b',     // amber
  peak: '#ef4444',       // red
};

// Zone Information
export const ZONE_INFO: Record<
  HeartRateZone,
  { label: string; bgColor: string; description: string; range: string }
> = {
  resting: {
    label: 'Resting',
    bgColor: '#dcfce7',
    description: 'Normal resting heart rate',
    range: '60-94 BPM',
  },
  'fat-burn': {
    label: 'Fat Burn',
    bgColor: '#dbeafe',
    description: 'Light exercise, optimal for fat burning',
    range: '95-114 BPM',
  },
  cardio: {
    label: 'Cardio',
    bgColor: '#fef3c7',
    description: 'Moderate to vigorous exercise',
    range: '115-154 BPM',
  },
  peak: {
    label: 'Peak',
    bgColor: '#fee2e2',
    description: 'Maximum effort exercise',
    range: '155-200 BPM',
  },
};

// Intensity Targets
export const INTENSITY_TARGETS = {
  rest: { label: 'Rest', target: 70 },
  jog: { label: 'Jog', target: 135 },
  sprint: { label: 'Sprint', target: 175 },
};
