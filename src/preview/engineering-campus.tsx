import { createRoot } from 'react-dom/client';
import '../index.css';
import EngineeringCampus from '../components/three/EngineeringCampus';
import CampusServices from '../components/sections/CampusServices';

const root = document.getElementById('root');
if (!root) throw new Error('Missing preview root');
createRoot(root).render(
  <main>
    <EngineeringCampus />
    <CampusServices />
  </main>,
);
