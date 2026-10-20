import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.tertiary-hero', (els) => {
    const gsap = window.gsap;

    const TEXT = {
        delay: 0.2,
        duration: 1.2,
        distance: 32,
        stagger: 0.12,
        ease: 'power2-out'
    };

    const script = () => {
        els.forEach(self => handleText(self));
    };

    const handleText = (self) => {
        const items = self.querySelectorAll('.th-head > *');
        if (!items.length) return;

        if (!gsap) {
            items.forEach(item => item.style.cssText += 'opacity: 1; visibility: visible;');
            return;
        }

        gsap.fromTo(items,
            { autoAlpha: 0, y: TEXT.distance },
            { autoAlpha: 1, y: 0, duration: TEXT.duration, delay: TEXT.delay, stagger: TEXT.stagger, ease: TEXT.ease, clearProps: 'transform' }
        );
    };

    script();
});
