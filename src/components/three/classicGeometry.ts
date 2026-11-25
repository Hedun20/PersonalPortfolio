export type Variant = 'home' | 'about' | 'expertise' | 'architecture' | 'projects' | 'techstack' | 'contact';
export type Vec = [number, number, number];
type Segment = [Vec, Vec];
const TAU = Math.PI * 2;
export const labels: Record<Variant, string> = { home: 'Neural network', about: 'Digital DNA', expertise: 'Modular systems', architecture: 'System layers', projects: 'Connected ecosystem', techstack: 'Technology orbit', contact: 'Signal array' };
export const colors: Record<Variant, string> = { home: '#38bdf8', about: '#60a5fa', expertise: '#38bdf8', architecture: '#818cf8', projects: '#34d399', techstack: '#a78bfa', contact: '#67e8f9' };

function ring(radius: number, tilt = 0, height = 0): Segment[] {
  const at = (i: number): Vec => [radius * Math.cos(i * TAU / 64), height + radius * Math.sin(i * TAU / 64) * Math.cos(tilt), radius * Math.sin(i * TAU / 64) * Math.sin(tilt)];
  return Array.from({length: 64}, (_, i) => [at(i), at(i + 1)]);
}
function cube([x,y,z]: Vec, size: number): Segment[] {
  const pts: Vec[] = Array.from({length: 8}, (_, i) => [x + (i & 1 ? size : -size), y + (i & 2 ? size : -size), z + (i & 4 ? size : -size)]);
  return pts.flatMap((p,i) => [1,2,4].filter(bit => !(i & bit)).map(bit => [p,pts[i | bit]] as Segment));
}
function geometry(variant: Variant): Segment[] {
  if (variant === 'home') return [0,.5,1,1.5,2,2.5].flatMap(tilt => ring(2.5,tilt));
  if (variant === 'about') {
    const helix = (i: number, side: number): Vec => [Math.cos(i*.19+side*Math.PI)*1.35, (i-24)*.115, Math.sin(i*.19+side*Math.PI)*1.35];
    return Array.from({length:48},(_,i) => {
      const pair: Segment[] = [[helix(i,0),helix(i+1,0)],[helix(i,1),helix(i+1,1)]];
      if (i%3===0) pair.push([helix(i,0),helix(i,1)]);
      return pair;
    }).flat();
  }
  if (variant === 'expertise') return [-1,1].flatMap(x=>[-1,1].flatMap(y=>[-1,1].flatMap(z=>cube([x*1.05,y*1.05,z*1.05],.66))));
  if (variant === 'architecture') return [-2,-1,0,1,2].flatMap((y,i) => {
    const r = 2.05-i*.12;
    const corners: Vec[] = [[-r,y,-r],[r,y,-r],[r,y,r],[-r,y,r]];
    const result: Segment[] = corners.map((p,j)=>[p,corners[(j+1)%4]]);
    result.push([corners[0],corners[2]],[corners[1],corners[3]]);
    if (i<4) result.push([[0,y,0],[0,y+1,0]]);
    return result;
  });
  if (variant === 'projects') {
    const nodes: Vec[] = Array.from({length:9},(_,i)=>[2.6*Math.cos(i*TAU/9), .85*Math.sin(i*2.1),2.6*Math.sin(i*TAU/9)]);
    return [...cube([0,0,0],.55),...nodes.flatMap((p,i)=>[...cube(p,.22),[[0,0,0],p] as Segment,[p,nodes[(i+1)%nodes.length]] as Segment])];
  }
  if (variant === 'techstack') return [...cube([0,0,0],.55),...ring(1.45,.2),...ring(2.1,1.1),...ring(2.8,2.2),...Array.from({length:6},(_,i)=>cube([2.1*Math.cos(i*TAU/6),2.1*Math.sin(i*TAU/6)*Math.cos(1.1),2.1*Math.sin(i*TAU/6)*Math.sin(1.1)],.16)).flat()];
  return [.55,1.1,1.65,2.2,2.75].flatMap(r=>ring(r,.7)).concat([[[0,-.4,0],[0,.4,0]]]);
}
export const shapes = Object.fromEntries(Object.keys(colors).map(key => [key,geometry(key as Variant)])) as Record<Variant, Segment[]>;
export const vertices = Object.fromEntries(Object.keys(shapes).map(key => [key, shapes[key as Variant].flat()])) as Record<Variant, Vec[]>;
export const buffers = Object.fromEntries(Object.keys(shapes).map(key => [key,new Float32Array(shapes[key as Variant].flat(2))])) as Record<Variant, Float32Array>;

