// Section navigation identifiers — the single source of truth for section ids.
// Every id listed here must exist as an `id` on the rendered section, and every
// section rendered by App must be listed here.
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

// Human-readable labels. Typed as Record<SectionId, string> so a section cannot
// be added without giving it a label, which is what let the nav drift out of sync.
export const SECTION_LABELS: Record<SectionId, string> = {
  home: 'Home',
  about: 'About',
  expertise: 'Expertise',
  architecture: 'Architecture',
  projects: 'Projects',
  techstack: 'Tech Stack',
  contact: 'Contact',
};
