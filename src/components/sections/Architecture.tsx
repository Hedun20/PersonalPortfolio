import ClassicBackdrop from '../three/ClassicBackdrop';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { architectureNodes, type ArchitectureNode } from '../../data/architecture';

const layerNames = [
  'Presentation Layer',
  'Gateway Layer',
  'Orchestration Layer',
  'Agent Layer',
  'Runtime Layer',
  'Processing Layer',
  'Intelligence Layer',
  'Storage Layer',
  'Security Foundation',
];

function ArchitectureNodeCard({ node, isActive, onSelect }: {
  node: ArchitectureNode;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" aria-pressed={isActive} onClick={onSelect}
      className={`glass-card architecture-card w-full text-left p-4 sm:p-5 transition-colors duration-300 ${isActive ? 'border-accent-primary/60 bg-bg-elevated/60' : 'hover:border-accent-primary/30'}`}>
      <span className="flex items-center gap-3 mb-2">
        <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-accent-primary' : 'bg-text-secondary/50'}`} />
        <span className="font-heading text-sm font-semibold text-text-main">{node.label}</span>
      </span>
      <span className="block text-sm text-text-secondary leading-relaxed">{node.description}</span>
    </button>
  );
}

export default function Architecture() {
  const ref = useRef(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section id="architecture" className="classic-section relative py-24 sm:py-32 overflow-hidden">
      <ClassicBackdrop variant="architecture" />
      {/* Background accent */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[600px] rounded-full opacity-[0.015] blur-[120px] bg-accent-primary pointer-events-none" />

      <div ref={ref} className="section-container classic-content">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="classic-section-header classic-section-header--compact"
        >
          <p className="section-label mb-4">AI Architecture</p>
          <h2 className="section-title text-text-main">
            System architecture and data flow.
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-text-secondary max-w-xl mx-auto"
          >
            A conceptual reference architecture for private AI systems — select a layer to highlight it.
          </motion.p>
        </motion.div>

        {/* Architecture visualization */}
        <div className="max-w-3xl mx-auto relative z-[1]">
          {architectureNodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
              className="relative mb-4 last:mb-0"
            >
              {/* Connection line */}
              {i < architectureNodes.length - 1 && (
                <div className="absolute left-[19px] top-full h-4 w-[2px] bg-gradient-to-b from-accent-primary/30 to-transparent" />
              )}

              {/* Layer label */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary font-heading w-24 shrink-0 hidden sm:block">
                  {layerNames[i]}
                </span>
                <div className="flex-1 min-w-0">
                  <ArchitectureNodeCard
                    node={node}
                    isActive={activeNode === node.id}
                    onSelect={() => setActiveNode(current => current === node.id ? null : node.id)}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-xs tracking-widest uppercase text-text-secondary/50 mb-3">Data Flow</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {architectureNodes.slice(0, 6).map((node, i) => (
              <motion.div key={node.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 + 1 }}>
                <span className="text-xs sm:text-sm font-heading text-text-secondary px-3 py-1 rounded-md bg-white/[0.03] border border-border-subtle">
                  {node.label}
                </span>
                {i < 5 && (
                  <svg width="24" height="16" className="inline-block mx-1 text-accent-primary/40" viewBox="0 0 24 16" fill="none">
                    <path d="M5 8h14m0 0l-4.5-4.5m4.5 4.5L15.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
