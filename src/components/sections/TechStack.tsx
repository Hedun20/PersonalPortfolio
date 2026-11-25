import ImmersiveSection from './ImmersiveSection';

const items = [
  {id:'tech-0',title:'Frontend',description:"Responsive interfaces, interactive web applications and real-time visualization.",tags:['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Three.js']},
  {id:'tech-1',title:'Backend',description:"Application services, typed APIs and backend integration.",tags:['Node.js', 'Fastify', 'Express', 'REST APIs']},
  {id:'tech-2',title:'Data',description:"Relational and document data, querying and vector retrieval.",tags:['PostgreSQL', 'MongoDB', 'pgvector', 'SQL']},
  {id:'tech-3',title:'AI & ML',description:"Local models, document extraction and retrieval workflows.",tags:['Local LLMs', 'Qwen', 'Gemma', 'RAG', 'OCR', 'Embeddings']},
  {id:'tech-4',title:'Infrastructure',description:"Deployment, server operations and repeatable delivery.",tags:['Docker', 'Linux', 'Nginx', 'GitHub Actions']},
];

export default function TechStack() {
  return <ImmersiveSection id="techstack" number="06" label="Technology Stack" heading="The tools behind the work." intro="Five technology orbits, from the browser to the infrastructure layer." items={items}/>;
}
