import { createRoot } from 'react-dom/client';
import '../index.css';
import EngineeringCampus from '../components/three/EngineeringCampus';

const root = document.getElementById('root');
if (!root) throw new Error('Missing preview root');
createRoot(root).render(<EngineeringCampus />);
