import ImmersiveSection from './ImmersiveSection';
import { expertiseData } from '../../data/expertise';

const items = expertiseData.map((entry,i)=>({id:`expertise-${i}`,title:entry.title,description:entry.description,tags:entry.technologies}));

export default function Expertise() {
  return <ImmersiveSection id="expertise" number="03" label="Expertise" heading="Engineering across the full stack." intro="Six connected disciplines. Explore the modules to see the capabilities and tools behind each one." items={items}/>;
}
