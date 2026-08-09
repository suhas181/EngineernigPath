export type ResourceLanguage = 'Java' | 'Python' | 'C++' | 'JavaScript' | 'TypeScript' | 'All';

export type ResourceType =
  | 'video'
  | 'playlist'
  | 'github'
  | 'documentation'
  | 'article'
  | 'course'
  | 'practice'
  | 'open-source'
  | 'interview'
  | 'book'
  | 'interactive'
  | 'project';

export type ResourceCategory =
  | 'Recommended'
  | 'Programming Languages'
  | 'Data Structures & Algorithms'
  | 'Web Development'
  | 'CS Fundamentals'
  | 'Git & GitHub'
  | 'Open Source & GSoC'
  | 'Aptitude'
  | 'Interview Preparation'
  | 'Projects'
  | string;

export type ResourceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'beginner' | 'intermediate' | 'advanced';
export type ResourceStage = 'learn' | 'notes' | 'practice' | 'interview' | 'project' | 'revision';

export interface LibraryResource {
  id: string;
  title: string;
  description?: string;
  provider: string;
  category?: ResourceCategory;
  topic?: string;
  type: ResourceType;
  url: string;
  thumbnail?: string;
  duration?: string;
  level: ResourceLevel;
  difficulty?: ResourceLevel;
  estimatedHours?: number;
  tags: string[];
  featured?: boolean;
  language?: ResourceLanguage;
  free?: boolean;
  verified?: boolean;
  curriculumKey?: string;
  order?: number;
  stage?: ResourceStage;
  clicks?: number;
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
