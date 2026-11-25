import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SECTIONS, SECTION_LABELS } from '../../data/sections';

// Derived from SECTIONS so a section can never be added to the page without
// also appearing in the nav (and vice versa). Tech Stack was missing here.
const navItems = SECTIONS.map((id) => ({
  href: `#${id}`,
  label: SECTION_LABELS[id],
}));

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 64rem)');
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <a href="#home" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-heading font-bold text-bg-primary text-sm transition-transform duration-300 group-hover:scale-105">
            IA
          </div>
          <span className="hidden sm:inline-block font-heading font-semibold tracking-tight text-text-main">
            Intelligence Architect
          </span>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-2 xl:px-3 py-2 text-sm text-text-secondary hover:text-accent-primary transition-colors duration-200 rounded-md hover:bg-white/5"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-text-secondary hover:text-accent-primary transition-colors rounded-md hover:bg-white/5"
          ref={toggleRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-navigation"
        hidden={!isOpen}
        className="fixed inset-0 top-[65px] z-40 overflow-y-auto overscroll-contain bg-bg-primary/98 backdrop-blur-lg lg:hidden"
      >
        <ul className="flex flex-col items-center gap-2 py-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-6 py-3 text-lg font-heading text-text-main hover:text-accent-primary transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
