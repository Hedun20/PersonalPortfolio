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

function ArchitectureNodeCard({
  node,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: {
  node: ArchitectureNode;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.6, scale: 0.97 }}
      whileHover={{ opacity: 1, scale: 1.02 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`glass-card p-4 sm:p-5 cursor-pointer transition-all duration-300 ${isActive ? 'border-accent-primary/40 bg-bg-elevated/60' : 'hover:border-accent-primary/20'}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${isActive ? 'bg-accent-primary shadow-lg shadow-accent-primary/40' : 'bg-text-secondary/50'}`}
        />
        <h4 className="font-heading text-sm font-semibold text-text-main">{node.label}</h4>
      </div>
      {isActive && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs text-text-secondary leading-relaxed pt-1"
        >
          {node.description}
        </motion.p>
      )}
    </motion.div>
  );
}

export default function Architecture() {
  const ref = useRef(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section id="architecture" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[600px] rounded-full opacity-[0.015] blur-[120px] bg-accent-primary pointer-events-none" />

      <div ref={ref} className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8"
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
            Interactive visualization of the intelligent system layers and their connections.
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
                <span className="text-xs text-text-secondary/60 font-heading w-16 shrink-0 hidden sm:block">
                  {layerNames[i]}
                </span>
                <div className="flex-1">
                  <ArchitectureNodeCard
                    node={node}
                    isActive={activeNode === node.id}
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
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
