export interface ExpertiseItem {
  title: string;
  description: string;
  technologies: string[];
  icon: string;
}

export const expertiseData: ExpertiseItem[] = [
  {
    title: 'Artificial Intelligence',
    description:
      'Local LLM deployment, RAG pipelines, OCR, embeddings, and intelligent agent orchestration for private AI systems.',
    technologies: ['Qwen', 'Gemma', 'RAG', 'OCR', 'LangChain'],
    icon: 'Brain',
  },
  {
    title: 'Full-Stack Engineering',
    description:
      'End-to-end application development with modern React ecosystems, TypeScript, and performant backend architectures.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    icon: 'Code2',
  },
  {
    title: 'Software Architecture',
    description:
      'Scalable system design, modular component architecture, microservice patterns, and enterprise-grade solutions.',
    technologies: ['System Design', 'Microservices', 'Domain-Driven'],
    icon: 'LayoutGrid',
  },
  {
    title: 'Enterprise Applications',
    description:
      'Business management platforms with role-based permissions, document workflows, and automated processes.',
    technologies: ['RBAC', 'Workflows', 'Document Management'],
    icon: 'Building2',
  },
  {
    title: 'Infrastructure & DevOps',
    description:
      'Containerized deployments, CI/CD pipelines, Linux server management, and reliable cloud-native infrastructure.',
    technologies: ['Docker', 'CI/CD', 'Nginx', 'Linux'],
    icon: 'Server',
  },
  {
    title: 'Automation & AI Agents',
    description:
      'Intelligent automation systems connecting models, tools, and APIs into self-directed engineering workflows.',
    technologies: ['AI Agents', 'Workflows', 'API Integration'],
    icon: 'Bot',
  },
];
