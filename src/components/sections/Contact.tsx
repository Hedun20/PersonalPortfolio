import ClassicBackdrop from '../three/ClassicBackdrop';
import { motion } from 'framer-motion';
import { easeOut } from 'framer-motion';
import { Mail, GitFork, Link, MapPin, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { contact, contactLinks } from '../../data/contact';

const linkIcons: Record<(typeof contactLinks)[number]['key'], LucideIcon> = {
  email: Mail,
  github: GitFork,
  linkedin: Link,
};

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
  icon: LucideIcon;
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
        <p className="text-sm text-text-secondary leading-relaxed break-words">{description}</p>
      </div>
    </motion.a>
  );
}

export default function Contact() {
  return (
    <section
      id="contact"
      className="classic-section relative py-24 sm:py-32 overflow-hidden"
    >
      <ClassicBackdrop variant="contact" />
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[120px] bg-accent-secondary pointer-events-none" />

      <div className="section-container classic-content">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="classic-section-header"
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
            className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed"
          >
            I&apos;m always interested in discussing new opportunities, creative projects,
            or collaborations at the intersection of AI and software engineering.
          </motion.p>
        </motion.div>

        {/* Contact links grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactLinks.map((link, index) => (
            <ContactLink
              key={link.key}
              icon={linkIcons[link.key]}
              label={link.label}
              href={link.href}
              description={link.description}
              index={index}
            />
          ))}

          {/* Location is information, not a link, so it is not an anchor. */}
          <div className="glass-card p-6 sm:p-8 flex items-start gap-5">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-primary/[0.08] border border-border-accent/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-accent-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-semibold text-text-main mb-1">
                {contact.locationLabel}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {contact.location}
              </p>
            </div>
          </div>
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
            href={contact.email ? `mailto:${contact.email}` : contact.linkedin}
            target={contact.email ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-heading text-sm tracking-wide bg-accent-primary text-bg-primary font-semibold hover:bg-sky-300 transition-all duration-300 shadow-lg shadow-accent-primary/20"
          >
            <Mail className="h-4 w-4" />
            {contact.email ? 'Send a Message' : 'Connect on LinkedIn'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
