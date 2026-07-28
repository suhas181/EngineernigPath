export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book' | 'documentation' | 'course' | 'practice';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isCompleted: boolean;
}

export interface PracticeProblem {
  id: string;
  title: string;
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
}

export interface MonthProject {
  title: string;
  description: string;
  technologies: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  githubSubmission?: string;
  liveDemoSubmission?: string;
  isCompleted: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: Resource[];
  
  whyThisMonth?: string;
  learningObjectives?: string[];
  weeklyStudyPlan?: string[];
  estimatedStudyHours?: number;
  topics?: string[];
  curriculumKeys?: string[];
  practiceProblems?: PracticeProblem[];
  project?: MonthProject;
  interviewPrep?: string[];
  weeklyMilestones?: string[];
  monthlyGoal?: string;
  expectedOutcome?: string;
  placementReadinessImprovement?: number;
}

export interface RoadmapData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
  lastWeeklyReviewDate?: string;
  version?: string;
  source?: 'gemini' | 'fallback';
  createdAt: string;
  updatedAt: string;
  summary?: {
    currentPlacementReadiness?: number;
    estimatedFinalReadiness?: number;
    biggestStrengths?: string[];
    biggestWeaknesses?: string[];
    topThreePriorities?: string[];
    estimatedCompletionDate?: string;
  };
}

export interface StaticTrackMonth {
  number: number;
  title: string;
  focus: string;
  topics: string[];
  tools: string[];
  youtube: {
    channel: string;
    bestFor: string;
    searchUrl: string;
  }[];
  project: {
    title: string;
    description: string;
  };
}
