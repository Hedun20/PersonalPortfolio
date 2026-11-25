import ImmersiveSection from './ImmersiveSection';
import { architectureNodes } from '../../data/architecture';

const items = architectureNodes.map(node=>({id:node.id,title:node.label,description:node.description,eyebrow:`LAYER ${String(node.layer+1).padStart(2,'0')}`}));

export default function Architecture() {
  return <ImmersiveSection id="architecture" number="04" label="AI Architecture" heading="Systems designed to connect." intro="A conceptual reference architecture for private AI. Explore each of the nine layers, from the interface to the security foundation." items={items}/>;
}
