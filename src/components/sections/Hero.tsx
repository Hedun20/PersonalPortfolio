import { useState } from 'react';
import { motion } from 'framer-motion';
import { easeOut } from 'framer-motion';
import NeuralNetwork3D from '../three/NeuralNetwork3D';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Three.js Neural Network Background */}
      <div className="absolute inset-0 z-0">
        <NeuralNetwork3D mouseX={mousePos.x} mouseY={mousePos.y} />
      </div>

      {/* Atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-transparent to-bg-primary z-[1]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] bg-accent-primary pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,189,248,0.03) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.p variants={itemVariants} className="section-label mb-6 tracking-wider">
            INTELLIGENCE ARCHITECT
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="font-heading text-5xl font-bold leading-[1.08] sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-glow"
          >
            Engineering Intelligence.{' '}
            <br />
            <span className="gradient-text">Architecting the Future.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-lg sm:text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            Building intelligent systems, scalable software, and private AI infrastructure.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative px-8 py-3.5 rounded-lg font-heading text-sm tracking-wide bg-accent-primary text-bg-primary font-semibold hover:bg-sky-300 transition-all duration-300 shadow-lg shadow-accent-primary/20"
            >
              Explore My Work
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-lg font-heading text-sm tracking-wide border border-border-accent/50 text-text-main hover:border-accent-primary/60 hover:bg-white/[0.03] transition-all duration-300"
            >
              Get in Touch
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-text-secondary tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-accent-primary/60 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}
