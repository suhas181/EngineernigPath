export const CANONICAL_RESOURCE_TYPES = [
  'video',
  'article',
  'book',
  'documentation',
  'course',
  'practice',
] as const;

export const CANONICAL_DIFFICULTIES = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export type CanonicalResourceType = typeof CANONICAL_RESOURCE_TYPES[number];
export type CanonicalDifficulty = typeof CANONICAL_DIFFICULTIES[number];
