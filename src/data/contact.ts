// Single source of truth for public professional contact links.
// Add an email only after the owner confirms that it is intended for publication.
export const contact = {
  name: 'Tymur Abbasov',
  email: '' as string,
  github: 'https://github.com/Hedun20',
  linkedin: 'https://www.linkedin.com/in/tymur-abbasov/',
  locationLabel: 'Location',
  location: 'Germany · Remote collaboration',
} as const;

type ContactLink = {
  key: 'email' | 'github' | 'linkedin';
  label: string;
  href: string;
  description: string;
};

export const contactLinks: ContactLink[] = [
  ...(contact.email ? [{
    key: 'email' as const,
    label: 'Email',
    href: `mailto:${contact.email}`,
    description: contact.email,
  }] : []),
  {
    key: 'github',
    label: 'GitHub',
    href: contact.github,
    description: 'Projects and code samples',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: contact.linkedin,
    description: 'Professional network and opportunities',
  },
];
