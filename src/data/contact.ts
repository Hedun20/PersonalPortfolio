// Single source of truth for the contact section.
// TODO: replace the placeholder handles below with the real ones before deploying.
export const contact = {
  name: 'Timur',
  email: 'timur@example.com',
  github: 'https://github.com/timur',
  linkedin: 'https://linkedin.com/in/timur',
  locationLabel: 'Location',
  location: 'Available for remote work worldwide',
} as const

export const contactLinks = [
  {
    key: 'email',
    label: 'Email',
    href: `mailto:${contact.email}`,
    description: contact.email,
  },
  {
    key: 'github',
    label: 'GitHub',
    href: contact.github,
    description: 'Open-source projects and code samples',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: contact.linkedin,
    description: 'Professional network and updates',
  },
] as const
