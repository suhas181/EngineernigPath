export const CANONICAL_CAREER_PATHS = [
  'Software Engineer (SDE)',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'AI / ML Engineer',
  'Data Scientist / Analyst',
  'DevOps Engineer',
  'Mobile App Developer',
] as const;

export type CanonicalCareerPath = typeof CANONICAL_CAREER_PATHS[number];
