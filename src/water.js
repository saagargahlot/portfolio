export const RIPPLE_LIFETIME = 2200;
export function addRipple(ripples, x, y, now, strength = 1) {
  if (![x,y,now,strength].every(Number.isFinite)) return ripples;
  return [...ripples.filter(r => now-r.born < RIPPLE_LIFETIME).slice(-7),
    {x,y,born:now,strength:Math.max(0,Math.min(strength,1.5))}];
}
export function rippleDisplacement(x,y,now,ripples) {
  let displacement=0;
  for(const ripple of ripples) {
    const age=now-ripple.born;
    if(age<0 || age>=RIPPLE_LIFETIME)continue;
    const distance=Math.hypot(x-ripple.x,y-ripple.y);
    const front=distance-age*.19;
    const envelope=Math.exp(-(front*front)/3600)*(1-age/RIPPLE_LIFETIME);
    displacement+=Math.sin(front*.045)*envelope*14*ripple.strength;
  }
  return displacement;
}
