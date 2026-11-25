import { contact } from '../../data/contact';

const services = [
  {
    title: 'Full-stack development',
    description: 'Build and extend web applications, business tools and internal platforms with maintainable frontend and backend architecture.',
    tools: 'React · TypeScript · Node.js · REST APIs',
  },
  {
    title: 'Private AI & document intelligence',
    description: 'Prototype local AI workflows for sensitive documents, retrieval, OCR and model integration.',
    tools: 'Local LLMs · RAG · OCR · Agent workflows',
  },
  {
    title: 'Architecture & technical consulting',
    description: 'Review existing systems, identify technical risks and plan practical implementation paths for new features and integrations.',
    tools: 'System design · API design · Data modeling',
  },
  {
    title: 'Automation & application delivery',
    description: 'Connect business workflows, data pipelines and repeatable deployment processes to reduce manual work and improve maintainability.',
    tools: 'SQL · Linux · Nginx · Git · CI/CD',
  },
] as const;

export default function CampusServices() {
  return (
    <section id="services" aria-labelledby="services-title" className="border-t border-border-accent bg-bg-primary py-16 sm:py-24">
      <div className="section-container">
        <p className="section-label mb-4">Engineering services</p>
        <h2 id="services-title" className="section-title">How I can help.</h2>
        <p className="section-subtitle mb-10">
          Practical engineering for teams building software, exploring local AI or improving existing systems.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <article key={service.title} className="glass-card flex flex-col gap-4 p-5 sm:p-6">
              <span className="text-xs font-heading tracking-widest text-accent-primary">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="font-heading text-lg font-semibold text-text-main">{service.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{service.description}</p>
              <p className="mt-auto border-t border-border-subtle pt-4 text-xs leading-relaxed text-text-secondary">{service.tools}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-accent-primary px-5 py-3 font-heading text-sm font-semibold text-bg-primary hover:bg-sky-300">Discuss a project on LinkedIn ↗</a>
          <a href={contact.github} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border-accent px-5 py-3 font-heading text-sm text-text-main hover:border-accent-primary">View GitHub ↗</a>
          <a href="./classic/" className="text-sm text-accent-primary underline underline-offset-4">Read the classic portfolio</a>
        </div>
      </div>
    </section>
  );
}
