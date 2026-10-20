import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.hero-secondary', (els) => {
    const gsap = window.gsap;

    const TEXT = {
        delay: 0.2,
        duration: 1.2,
        distance: 32,
        stagger: 0.12,
        ease: 'power2-out'
    };

    const DRIFT = [
        { selector: '.hs-glow-light', x: 2.5, y: 1.5625, scale: 1.05, duration: 13, offset: 0 },
        { selector: '.hs-glow-flare', x: -3.125, y: 1.875, scale: 1.0375, duration: 17, offset: 0.4 }
    ];

    const script = () => {
        els.forEach(self => {
            handleText(self);
            handleGlow(self);
        });
    };

    const handleText = (self) => {
        const items = self.querySelectorAll('.hs-head > *, .hs-para-wrap');
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

    const handleGlow = (self) => {
        const glow = self.querySelector('.hs-glow');
        if (!glow || !gsap) return;

        const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

        DRIFT.forEach(({ selector, x, y, scale, duration, offset }) => {
            const layer = glow.querySelector(selector);
            if (!layer) return;

            gsap.to(layer, {
                x: () => x * rem(),
                y: () => y * rem(),
                scale,
                duration,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                scrollTrigger: {
                    trigger: glow,
                    start: 'top bottom',
                    end: 'bottom top',
                    toggleActions: 'play pause resume pause',
                    invalidateOnRefresh: true
                }
            }).progress(offset);
        });
    };

    script();
});
