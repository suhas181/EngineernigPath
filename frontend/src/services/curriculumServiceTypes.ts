export interface GuidedStepResource {
  id?: string;
  title: string;
  provider: string;
  url: string;
  type?: string;
  difficulty?: string;
  level?: string;
  estimatedHours?: number;
  tags?: string[];
  badge?: string;
}

export interface TopicGuidedFlow {
  hasResources: boolean;
  step1PrimaryPlaylist?: GuidedStepResource;
  step2Documentation?: GuidedStepResource;
  step3PracticeSheet?: GuidedStepResource;
  step4PracticeProblems: GuidedStepResource[];
  step5Projects: GuidedStepResource[];
  step6InterviewQuestions: string[];
  step7RevisionNotes: Array<{ title: string; text: string }>;
  alternativeResources: {
    videos: GuidedStepResource[];
    notes: GuidedStepResource[];
    sheets: Array<{ name: string; url: string }>;
  };
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  curriculumKeys: string[];
  resourceCount: number;
  guidedFlow: TopicGuidedFlow;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  topics: CurriculumTopic[];
}

export interface CurriculumCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  moduleCount: number;
  topicCount: number;
  modules: CurriculumModule[];
}

export interface CareerRoleCurriculum {
  role: string;
  language: 'Java' | 'Python' | 'C++';
  categories: CurriculumCategory[];
}
