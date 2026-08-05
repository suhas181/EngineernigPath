export type ResourceLanguage = 'Java' | 'Python' | 'C++' | 'JavaScript' | 'TypeScript' | 'All';
export type ResourceType = 'video' | 'article' | 'book' | 'interactive' | 'practice' | 'project';
export type ResourceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ResourceStage = 'learn' | 'notes' | 'practice' | 'interview' | 'project' | 'revision';

export interface LibraryResource {
  id: string;
  curriculumKey: string;
  language: ResourceLanguage;
  title: string;
  provider: string;
  type: ResourceType;
  level: ResourceLevel;
  difficulty?: ResourceLevel;
  estimatedHours: number;
  tags: string[];
  url: string;
  free: boolean;
  order: number;
  stage: ResourceStage;
}

export interface TopicArchitecture {
  curriculumKey: string;
  title: string;
  description: string;
  pillar: 'DSA' | 'Development' | 'Theory' | 'Aptitude' | 'Resume' | 'Tools' | 'Projects';
  prerequisiteTopics: string[];
  placementWeight: number; // Percentage contribution (0-100)
  estimatedHours: number;
  difficulty: ResourceLevel;
  unlocks: string[];
}
