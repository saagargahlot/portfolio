import React, { useLayoutEffect, useRef } from 'react';
import { animate } from 'animejs';

export default function CuriosityHeading() {
  const heading = useRef(null);
  const ink = useRef(null);
  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches || window.scrollY > 0) return;
    const entrance = animate(heading.current, {
      translateY: [14, 0], duration: 850, ease: 'out(3)',
    });
    const reveal = animate(ink.current, {
      clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
      duration: 1350, delay: 400, ease: 'inOut(3)',
    });
    function settle() {
      entrance.cancel(); reveal.cancel();
      if (heading.current) heading.current.style.transform = 'none';
      if (ink.current) ink.current.style.clipPath = 'none';
    }
    function preferenceChanged() { if (media.matches) settle(); }
    media.addEventListener('change', preferenceChanged);
    return () => { settle(); media.removeEventListener('change', preferenceChanged); };
  }, []);
  return <h1 ref={heading} id="hero-title" className="curiosity-heading">
    I build what<br/>sparks my{' '}
    <span className="curiosity-word">
      <span>curiosity.</span>
      <span ref={ink} className="curiosity-ink" aria-hidden="true">curiosity.</span>
    </span>
  </h1>;
}
