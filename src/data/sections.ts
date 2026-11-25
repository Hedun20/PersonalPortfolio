// Section navigation identifiers
export const SECTIONS = [
  'home',
  'about',
  'expertise',
  'architecture',
  'projects',
  'techstack',
  'contact'
] as const;

export type SectionId = typeof SECTIONS[number];
