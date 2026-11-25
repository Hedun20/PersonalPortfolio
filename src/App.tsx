import { useRef } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Expertise from './components/sections/Expertise';
import Architecture from './components/sections/Architecture';
import Projects from './components/sections/Projects';
import TechStack from './components/sections/TechStack';
import Contact from './components/sections/Contact';

function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className="min-h-screen bg-bg-primary text-text-main">
      <Navbar />
      <main>
        <section id="home" aria-label="Hero">
          <Hero />
        </section>
        <About />
        <Expertise />
        <Architecture />
        <Projects />
        <TechStack />
        <Contact />
      </main>
    </div>
  );
}

export default App;
