import ImmersiveSection from './ImmersiveSection';

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
const items = aboutSections.map((entry,i)=>({id:`about-${i}`,...entry}));

export default function About() {
  return <ImmersiveSection id="about" number="02" label="About" heading="Building reliable software." intro="From interface to infrastructure. Explore the four perspectives behind my engineering work." items={items}/>;
}
