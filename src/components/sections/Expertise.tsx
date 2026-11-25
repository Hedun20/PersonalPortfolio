import ClassicBackdrop from '../three/ClassicBackdrop';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Code2, LayoutGrid, Building2, Server, Bot } from 'lucide-react';

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Code2,
  LayoutGrid,
  Building2,
  Server,
  Bot,
};

interface ExpertiseCardProps {
  title: string;
  description: string;
  technologies: string[];
  icon: React.ComponentType<{ className?: string }>;
  index: number;
}

function ExpertiseCard({ title, description, technologies, icon: Icon, index }: ExpertiseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card classic-card p-6 sm:p-8 group hover:border-accent-primary/30 transition-all duration-500"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/[0.06] text-accent-primary group-hover:bg-accent-primary/[0.12] transition-colors duration-300">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-heading text-lg font-semibold text-text-main mb-3 group-hover:text-accent-primary transition-colors duration-300">
        {title}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed mb-5">{description}</p>

      {/* Technology tags */}
      <div className="mt-auto flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="px-2.5 py-1 text-xs rounded-md bg-white/[0.04] text-text-secondary border border-border-subtle group-hover:border-accent-primary/20 transition-colors duration-300"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

const expertiseData = [
  {
    title: 'Artificial Intelligence',
    description:
      'Local LLM deployment, RAG pipelines, OCR, embeddings, and intelligent agent orchestration for private AI systems.',
    technologies: ['Qwen', 'Gemma', 'RAG', 'OCR', 'Embeddings'],
    iconName: 'Brain',
  },
  {
    title: 'Full-Stack Engineering',
    description:
      'End-to-end application development with modern React ecosystems, TypeScript, and performant backend architectures.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    iconName: 'Code2',
  },
  {
    title: 'Software Architecture',
    description:
      'Scalable system design, modular component architecture, microservice patterns, and enterprise-grade solutions.',
    technologies: ['System Design', 'Microservices', 'Domain-Driven'],
    iconName: 'LayoutGrid',
  },
  {
    title: 'Enterprise Applications',
    description:
      'Business management platforms with role-based permissions, document workflows, and automated processes.',
    technologies: ['RBAC', 'Workflows', 'Document Mgmt'],
    iconName: 'Building2',
  },
  {
    title: 'Infrastructure & DevOps',
    description:
      'Containerized deployments, CI/CD pipelines, Linux server management, and reliable infrastructure.',
    technologies: ['Docker', 'CI/CD', 'Nginx', 'Linux'],
    iconName: 'Server',
  },
  {
    title: 'Automation & AI Agents',
    description:
      'Intelligent automation systems connecting models, tools, and APIs into self-directed engineering workflows.',
    technologies: ['AI Agents', 'Workflows', 'API Integration'],
    iconName: 'Bot',
  },
];

export default function Expertise() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="expertise" className="classic-section relative py-24 sm:py-32">
      <ClassicBackdrop variant="expertise" />
      {/* Background accent */}
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px] bg-accent-primary pointer-events-none" />

      <div ref={ref} className="section-container classic-content">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="classic-section-header"
        >
          <p className="section-label mb-4">Expertise</p>
          <h2 className="section-title text-text-main">
            Deep technical capabilities across the full stack.
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mx-auto relative z-[1]">
          {expertiseData.map((item, i) => (
            <ExpertiseCard
              key={item.title}
              title={item.title}
              description={item.description}
              technologies={item.technologies}
              icon={iconComponents[item.iconName]}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
