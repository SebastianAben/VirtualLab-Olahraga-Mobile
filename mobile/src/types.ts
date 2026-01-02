export type ExerciseIntensity = 'rest' | 'jog' | 'sprint';

export type HeartRateZone = 'resting' | 'fat-burn' | 'cardio' | 'peak';

export interface SimulationState {
  currentHeartRate: number;
  targetHeartRate: number;
  intensity: ExerciseIntensity;
  zone: HeartRateZone;
  history: number[];
  isRunning: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  benefit: string;
  targetZone: HeartRateZone;
  goalDuration: number; // Target
  totalDuration: number; // Total Time
  elapsedTime: number; 
  timeInZone: number;
  completed: boolean;
  grade: string | null;
}

export interface GradeInsight {
  title: string;
  feedback: string;
  improvement: string;
  impact: string;
}

export interface User {
  email: string;
  token: string;
}

export interface SimulationResult {
  _id: string;
  userId: string;
  challenge: string;
  timeAchieved: number;
  grade: string;
  timestamp: string;
}

export interface LearningChapter {
  id: string;
  title: string;
  summary: string;
  icon: 'book' | 'activity' | 'brain' | 'heart' | 'target' | 'recovery';
  takeaways: string[];
  recommendedReading?: string[];
  detailedContent?: string[];
}
