import ClassicBackdrop from '../three/ClassicBackdrop';
import { useRef } from 'react';
import { motion, useInView, easeOut } from 'framer-motion';

const aboutSections = [
  {
    title: 'Software Architecture',
    description:
      'Designing maintainable application architectures, clear API boundaries, and data models that support real business workflows.',
  },
  {
    title: 'Full-Stack Development',
    description:
      'Building complete applications from database to UI with TypeScript across the stack. Performance, accessibility, and developer experience are non-negotiable.',
  },
  {
    title: 'AI Orchestration & Local AI',
    description:
      'Deploying local LLMs, building RAG pipelines, creating intelligent agents, and designing private AI infrastructure that respects data sovereignty.',
  },
  {
    title: 'Technical Leadership',
    description:
      'Coordinating technical delivery, aligning engineering decisions with operational needs, and establishing maintainable development practices.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: easeOut },
  }),
};

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="classic-section relative py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px] bg-accent-secondary pointer-events-none" />

      <div ref={ref} className="section-container classic-content">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="classic-section-header"
        >
          <ClassicBackdrop variant="about" />
          <p className="section-label mb-4">About</p>
          <h2 className="section-title text-text-main">
            Building reliable software, from interface to infrastructure.
          </h2>
        </motion.div>

        {/* Content grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {aboutSections.map((section, i) => (
            <motion.div
              key={section.title}
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeInUp}
              className="glass-card p-6 sm:p-8 group hover:border-accent-primary/20 transition-all duration-500"
            >
              <h3 className="font-heading text-lg font-semibold text-text-main mb-3 group-hover:text-accent-primary transition-colors duration-300">
                {section.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">{section.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 glow-line max-w-xs mx-auto"
        />

        {/* Summary line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center text-text-secondary max-w-xl mx-auto"
        >
          Focused on building systems that are not just functional, but elegant in their architecture and intelligent in their execution.
        </motion.p>
      </div>
    </section>
  );
}
