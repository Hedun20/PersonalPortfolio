export interface ArchitectureNode {
  id: string;
  label: string;
  description: string;
  layer: number;
}

export const architectureNodes: ArchitectureNode[] = [
  {
    id: 'ui',
    label: 'User Interface',
    description: 'React-based responsive web application with real-time interaction and Three.js visualizations.',
    layer: 0,
  },
  {
    id: 'api-gateway',
    label: 'API Gateway',
    description: 'Centralized routing, authentication verification, rate limiting, and request orchestration layer.',
    layer: 1,
  },
  {
    id: 'orchestration',
    label: 'AI Orchestration',
    description: 'Model selection, context management, prompt engineering pipelines, and multi-model coordination.',
    layer: 2,
  },
  {
    id: 'agents',
    label: 'Intelligent Agents',
    description: 'Bounded AI capabilities for document analysis and workflow proposals; the control plane validates permissions and human confirmation for critical actions.',
    layer: 3,
  },
  {
    id: 'llm-runtime',
    label: 'Local LLM Runtime',
    description: 'Replaceable local model runtimes serving quantized models through a provider abstraction, with hardware-aware configuration.',
    layer: 4,
  },
  {
    id: 'doc-processing',
    label: 'Document Processing',
    description: 'Multi-format document ingestion, OCR pipeline, text extraction, chunking, and preprocessing.',
    layer: 5,
  },
  {
    id: 'embeddings',
    label: 'Embeddings & Vector Search',
    description: 'Semantic embeddings generation with pgvector for high-performance similarity search and RAG retrieval.',
    layer: 6,
  },
  {
    id: 'database',
    label: 'Database & Storage',
    description: 'PostgreSQL for authoritative state, local file storage, and vector index management.',
    layer: 7,
  },
  {
    id: 'security',
    label: 'Security & Permissions',
    description: 'Role-based access control, workspace isolation, audit logging and permission-aware workflow routing.',
    layer: 8,
  },
];

export interface ArchitectureConnection {
  from: string;
  to: string;
}

export const architectureConnections: ArchitectureConnection[] = [
  { from: 'ui', to: 'api-gateway' },
  { from: 'api-gateway', to: 'orchestration' },
  { from: 'orchestration', to: 'agents' },
  { from: 'agents', to: 'llm-runtime' },
  { from: 'agents', to: 'doc-processing' },
  { from: 'doc-processing', to: 'embeddings' },
  { from: 'embeddings', to: 'database' },
  { from: 'orchestration', to: 'security' },
  { from: 'api-gateway', to: 'security' },
];
