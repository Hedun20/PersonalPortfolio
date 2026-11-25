import ImmersiveSection from './ImmersiveSection';
import { projectsData } from '../../data/projects';

const actions = [
  {href:'#architecture',action:'View AI architecture'},
  {href:'#expertise',action:'View software expertise'},
  {href:'#techstack',action:'View technology stack'},
  {href:'../',action:'Visit T3 Campus'},
];
const items = projectsData.map((entry,i)=>({id:`project-${i}`,title:entry.name,description:entry.description,eyebrow:entry.focus,tags:entry.technologies,...actions[i]}));

export default function Projects() {
  return <ImmersiveSection id="projects" number="05" label="Projects" heading="Ideas built into systems." intro="Featured work and engineering experiments. Rotate the network to discover the projects and technologies." items={items}/>;
}
