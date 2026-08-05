export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book' | 'documentation' | 'course' | 'practice' | 'interactive' | 'project';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'beginner' | 'intermediate' | 'advanced';
  level?: 'beginner' | 'intermediate' | 'advanced';
  provider?: string;
  estimatedHours?: number;
  tags?: string[];
  stage?: 'learn' | 'notes' | 'practice' | 'interview' | 'project' | 'revision';
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
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'beginner' | 'intermediate' | 'advanced';
  githubSubmission?: string;
  liveDemoSubmission?: string;
  isCompleted: boolean;
}

export interface LearningSprint {
  id: string;
  sprintNumber: number;
  sprintGoal: string;
  todaysFocus: string;
  estimatedHours: number;
  topics: string[];
  curriculumKeys: string[];
  resources?: Resource[];
  learnResources?: Resource[];
  notesResources?: Resource[];
  practice: PracticeProblem[];
  interviewQuestions: string[];
  miniProject?: MonthProject;
  revision?: Resource[];
  sprintProgress: number;
  expectedOutcomes: string;
  isCompleted?: boolean;
}

export interface MonthlyMilestoneSummary {
  topicsCompleted: number;
  totalTopics: number;
  problemsSolved: number;
  totalProblems: number;
  projectStatus: 'not_started' | 'in_progress' | 'completed';
  readinessImprovement: {
    currentReadinessPercent: number;
    expectedReadinessPercent: number;
    improvementPercent: number;
  };
  recommendedNextSteps: string[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: Resource[];
  learnResources?: Resource[];
  notesResources?: Resource[];
  revisionResources?: Resource[];
  interviewResources?: Resource[];
  practiceResources?: Resource[];
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
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  primaryVideo?: Resource;
  alternativeVideos?: Resource[];
  primaryNote?: Resource;
  alternativeNotes?: Resource[];
  primaryDsaSheet?: { name: string; url: string; badge: string };
  alternativeDsaSheets?: Array<{ name: string; url: string }>;
  learningSprints?: LearningSprint[];
  monthlyMilestoneSummary?: MonthlyMilestoneSummary;
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
