import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  description: string;
  technologies: string[];
  focus: string;
  color: string;
  index: number;
}

function ProjectCard({ name, description, technologies, focus, color, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="group relative glass-card p-6 sm:p-8 overflow-hidden hover:border-accent-primary/30 transition-all duration-500"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />

      <div className="mb-6">
        <h3 className="font-heading text-xl font-semibold text-text-main mb-2 group-hover:text-accent-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="text-xs tracking-wider uppercase" style={{ color: `${color}CC` }}>
          {focus}
        </p>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-6">{description}</p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-6">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="px-2.5 py-1 text-xs rounded-md bg-white/[0.04] text-text-secondary border border-border-subtle"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Interactive hover indicator */}
      <div className="flex items-center gap-2 text-sm font-heading text-text-secondary group-hover:text-accent-primary transition-colors duration-300">
        <span>Explore</span>
        <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      {/* Subtle glow on hover */}
      <div
        className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-[0.04] blur-[60px] transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

const projectsData = [
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

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="projects" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.015] blur-[150px] bg-accent-secondary pointer-events-none" />

      <div ref={ref} className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <p className="section-label mb-4">Projects</p>
          <h2 className="section-title text-text-main">
            Featured work and engineering experiments.
          </h2>
        </motion.div>

        {/* Projects grid */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto relative z-[1]">
          {projectsData.map((project, i) => (
            <ProjectCard key={project.name} index={i} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
