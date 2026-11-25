export interface ProjectData {
  name: string;
  description: string;
  technologies: string[];
  focus: string;
  color: string;
}

export const projectsData: ProjectData[] = [
  {
    name: 'THAI / Bright Mind',
    description:
      'A local-first AI platform for private document processing, OCR, RAG-based retrieval, intelligent agents, and permission-aware business workflows.',
    technologies: ['OCR', 'RAG', 'Embeddings', 'Local LLMs', 'RBAC'],
    focus: 'Private AI & Document Intelligence',
    color: '#38BDF8',
  },
  {
    name: 'Enterprise CRM',
    description:
      'A full-stack business management platform featuring scalable backend architecture, role-based permissions, document management, and workflow automation.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    focus: 'Enterprise Software Architecture',
    color: '#8B5CF6',
  },
  {
    name: 'AI Automation Infrastructure',
    description:
      'Systems that connect intelligent models, software tools, APIs, and automated engineering workflows into cohesive operational pipelines.',
    technologies: ['AI Agents', 'APIs', 'Workflows', 'Automation'],
    focus: 'Intelligent System Integration',
    color: '#34D399',
  },
  {
    name: 'Interactive Engineering Experiments',
    description:
      'Explorations at the intersection of local AI models, intelligent agents, real-time 3D interfaces, and advanced web technologies.',
    technologies: ['Three.js', 'Local LLMs', 'WebGL', 'React'],
    focus: 'Research & Creative Engineering',
    color: '#F472B6',
  },
];
