export interface Lesson {
  id: string;
  type: 'alphabet' | 'word' | 'phrase';
  label: string;
  imageKeyword: string; // For picsum
  description: string; // Description of the sign
  difficulty: 1 | 2 | 3;
}

export interface UserProgress {
  stars: number;
  completedLessons: string[];
  currentLevel: number;
}

export enum Screen {
  HOME = 'HOME',
  MAP = 'MAP',
  LESSON = 'LESSON',
  PRACTICE = 'PRACTICE',
  PROFILE = 'PROFILE'
}

export interface VerificationResult {
  correct: boolean;
  feedback: string;
}
