import ClassicBackdrop from '../three/ClassicBackdrop';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const techCategories = [
  {
    name: 'Frontend',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Three.js'],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M3 9h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Backend',
    items: ['Node.js', 'Fastify', 'Express', 'REST APIs'],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="6" rx="1" />
        <rect x="2" y="15" width="20" height="6" rx="1" />
        <circle cx="7" cy="6" r="1" fill="currentColor" />
        <circle cx="7" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Data',
    items: ['PostgreSQL', 'MongoDB', 'pgvector', 'SQL'],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
        <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </svg>
    ),
  },
  {
    name: 'AI & ML',
    items: ['Local LLMs', 'Qwen', 'Gemma', 'RAG', 'OCR', 'Embeddings'],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Infrastructure',
    items: ['Docker', 'Linux', 'Nginx', 'GitHub Actions'],
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M17.5 10.5v7a1.5 1.5 0 01-1.5 1.5h-2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function TechItem({ name, index }: { name: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-border-subtle hover:border-accent-primary/20 hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="w-1 h-1 rounded-full bg-accent-primary/40 group-hover:bg-accent-primary group-hover:shadow-lg group-hover:shadow-accent-primary/40 transition-all duration-300" />
      <span className="text-sm min-w-0 break-words text-text-secondary group-hover:text-text-main transition-colors duration-300">
        {name}
      </span>
    </motion.div>
  );
}

export default function TechStack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="techstack" className="classic-section relative py-24 sm:py-32 overflow-hidden">
      <ClassicBackdrop variant="techstack" />
      <div ref={ref} className="section-container classic-content">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="classic-section-header"
        >
          <p className="section-label mb-4">Technology Stack</p>
          <h2 className="section-title text-text-main">
            Technologies and tools.
          </h2>
        </motion.div>

        {/* Category grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto relative z-[1]">
          {techCategories.map((category, ci) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: ci * 0.1 }}
              className="glass-card p-6 sm:p-8 group hover:border-accent-primary/20 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-6 text-text-secondary group-hover:text-accent-primary transition-colors duration-300">
                {category.icon}
                <h3 className="font-heading font-semibold">{category.name}</h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5 min-[520px]:grid-cols-2">
                {category.items.map((item, i) => (
                  <TechItem key={item} name={item} index={i + ci * 4} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
