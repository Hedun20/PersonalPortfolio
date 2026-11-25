export function energyPoint(angle:number,radius:number,y:number):[number,number,number] {
  return [Math.sin(angle)*radius,y,4-Math.cos(angle)*radius];
}
