import { useRef, useState, type PointerEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ClassicBackdrop from '../three/ClassicBackdrop';
import { colors, labels, type Variant } from '../three/classicGeometry';
import { nearestPoint, snapAngle } from '../../utils/classicRotation';

export interface SceneItem {
  id: string;
  title: string;
  description: string;
  eyebrow?: string;
  tags?: readonly string[];
  href?: string;
  action?: string;
}
interface Props {
  id: Exclude<Variant, 'home'>;
  number: string;
  label: string;
  heading: string;
  intro: string;
  items: readonly SceneItem[];
  footer?: { href: string; label: string };
}
interface Drag {
  pointer: number;
  startX: number;
  startY: number;
  startAngle: number;
  moved: boolean;
}
const pad = (n: number) => String(n).padStart(2,'0');

export default function ImmersiveSection({id,number,label,heading,intro,items,footer}: Props) {
  const [active,setActive] = useState(0);
  const reduced = useReducedMotion();
  const rotation = useRef(0);
  const markers = useRef<HTMLDivElement>(null);
  const gesture = useRef<Drag|null>(null);
  const [dragging,setDragging] = useState(false);
  const item = items[active];
  function select(index: number) {
    const next = (index+items.length)%items.length;
    rotation.current = snapAngle(next,items.length,rotation.current);
    setActive(next);
  }
  function start(event: PointerEvent<HTMLElement>) {
    if (event.button!==0 || !event.isPrimary || (event.target as HTMLElement).closest('button,a')) return;
    gesture.current = {pointer:event.pointerId,startX:event.clientX,startY:event.clientY,startAngle:rotation.current,moved:false};
  }
  function move(event: PointerEvent<HTMLElement>) {
    const drag = gesture.current;
    if (!drag || drag.pointer!==event.pointerId) return;
    const dx=event.clientX-drag.startX, dy=event.clientY-drag.startY;
    if (!drag.moved) {
      if (Math.abs(dy)>12 && Math.abs(dy)>Math.abs(dx)) { gesture.current=null; return; }
      if (Math.abs(dx)<8) return;
      drag.moved=true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    rotation.current=drag.startAngle+dx*.012;
  }
  function finish(event: PointerEvent<HTMLElement>, cancel=false) {
    const drag=gesture.current;
    if (!drag || drag.pointer!==event.pointerId) return;
    gesture.current=null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    if (cancel) { rotation.current=snapAngle(active,items.length,drag.startAngle); return; }
    if (drag.moved) select(nearestPoint(rotation.current,items.length));
  }
  return <section id={id} className="immersive-section" aria-labelledby={`${id}-heading`} style={{'--scene-color':colors[id]} as React.CSSProperties}>
    <div className={`immersive-stage${dragging?' is-dragging':''}`} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={e=>finish(e,true)} onLostPointerCapture={e=>finish(e,true)} onPointerLeave={e=>{if(!gesture.current?.moved)finish(e,true);}}>
      <ClassicBackdrop variant={id} interaction={{rotation,markers,count:items.length,active}}/>
      <div className="immersive-scrim" aria-hidden="true"/>
      <div ref={markers} className="immersive-markers">
        {items.map((entry,i)=><button key={entry.id} type="button" data-scene-marker className={`immersive-marker${i===active?' is-active':''}`} aria-label={`Focus point ${pad(i+1)}: ${entry.title}`} aria-pressed={i===active} onClick={()=>select(i)}>{pad(i+1)}</button>)}
      </div>
      <div className="immersive-content">
        <header className="immersive-heading">
          <p className="immersive-kicker"><span>{number} / 07</span><span>{label}</span></p>
          <h2 id={`${id}-heading`}>{heading}</h2>
          <p className="immersive-intro">{intro}</p>
        </header>
        <div className="immersive-space" data-scene-drag-area aria-hidden="true">
          <div className="immersive-hint"><span className="immersive-hint-dot"/>{labels[id]} <span>·</span> Drag to rotate / select a point</div>
        </div>
        <div className="immersive-information">
          <div className="immersive-readout" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={item.id} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={reduced?{opacity:0}:{opacity:0,y:-6}} transition={{duration:reduced?0:.18}}>
                <p className="immersive-coordinate"><span>{pad(active+1)} / {pad(items.length)}</span> {item.eyebrow??'ACTIVE NODE'}</p>
                <h3>{item.title}</h3>
                <p className="immersive-description">{item.description}</p>
                {!!item.tags?.length&&<ul className="immersive-tags" aria-label="Technologies">{item.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}
                {item.href&&<a className="immersive-link" href={item.href} target={item.href.startsWith('https://')?'_blank':undefined} rel="noopener noreferrer">{item.action??'Explore'} <span aria-hidden="true">↗</span></a>}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="immersive-controls">
            <div className="immersive-navigation" role="group" aria-label={`${label} information points`}>
              {items.map((entry,i)=><button key={entry.id} type="button" aria-pressed={active===i} onClick={()=>select(i)}><span aria-hidden="true">{pad(i+1)}</span>{entry.title}</button>)}
            </div>
            <div className="immersive-stepper" aria-label="Browse information points">
              <button type="button" aria-label="Previous point" onClick={()=>select(active-1)}>←</button>
              <span>{pad(active+1)} / {pad(items.length)}</span>
              <button type="button" aria-label="Next point" onClick={()=>select(active+1)}>→</button>
              {footer&&<a className="immersive-link" href={footer.href}>{footer.label} ↗</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
