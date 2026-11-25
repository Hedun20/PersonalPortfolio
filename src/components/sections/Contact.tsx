import { motion } from 'framer-motion';
import { easeOut } from 'framer-motion';
import { Mail, GitFork, Link, MapPin, ArrowUpRight } from 'lucide-react';

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

interface ContactLinkProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  description: string;
  index: number;
}

function ContactLink({ icon: Icon, label, href, description, index }: ContactLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="group glass-card p-6 sm:p-8 flex items-start gap-5 hover:border-accent-primary/30 transition-all duration-500"
    >
      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-primary/[0.08] border border-border-accent/20 flex items-center justify-center group-hover:bg-accent-primary/[0.15] transition-colors duration-300">
        <Icon className="h-5 w-5 text-accent-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-heading text-base font-semibold text-text-main group-hover:text-accent-primary transition-colors duration-300">
            {label}
          </h3>
          <ArrowUpRight className="h-4 w-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </motion.a>
  );
}

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[120px] bg-accent-secondary pointer-events-none" />

      <div className="section-container relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={itemVariants} className="section-label mb-4 tracking-wider">
            GET IN TOUCH
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="section-title mb-6"
          >
            Let&apos;s Build Something
            <br />
            <span className="gradient-text">Intelligent Together</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-text-secondary text-lg max-w-2xl leading-relaxed mb-16"
          >
            I&apos;m always interested in discussing new opportunities, creative projects,
            or collaborations at the intersection of AI and software engineering.
          </motion.p>
        </motion.div>

        {/* Contact links grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <ContactLink
            icon={Mail}
            label="Email"
            href="mailto:timur@example.com"
            description="timur@example.com"
            index={0}
          />
          <ContactLink
            icon={GitFork}
            label="GitHub"
            href="https://github.com/timur"
            description="Open-source projects and code samples"
            index={1}
          />
          <ContactLink
            icon={Link}
            label="LinkedIn"
            href="https://linkedin.com/in/timur"
            description="Professional network and updates"
            index={2}
          />
          <ContactLink
            icon={MapPin}
            label="Location"
            href="#"
            description="Available for remote work worldwide"
            index={3}
          />
        </div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 glass-card p-8 sm:p-10 text-center max-w-2xl mx-auto"
        >
          <h3 className="font-heading text-xl font-semibold mb-3">
            Have a project in mind?
          </h3>
          <p className="text-text-secondary text-base mb-6 leading-relaxed">
            Whether it&apos;s a private AI system, a scalable web application, or
            enterprise-grade architecture — let&apos;s turn your vision into reality.
          </p>
          <a
            href="mailto:timur@example.com"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-heading text-sm tracking-wide bg-accent-primary text-bg-primary font-semibold hover:bg-sky-300 transition-all duration-300 shadow-lg shadow-accent-primary/20"
          >
            <Mail className="h-4 w-4" />
            Send a Message
          </a>
        </motion.div>
      </div>
    </section>
  );
}
