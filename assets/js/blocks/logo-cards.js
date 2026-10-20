import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.logo-cards', (els, baunfire) => {
    const STAGGER = 0.08;
    const DURATION = 0.8;
    const RISE = 1.5;

    const script = () => {
        els.forEach(self => handleCards(self));
    };

    const handleCards = (self) => {
        const cards = [...self.querySelectorAll('.lc-card')];
        if (!cards.length) return;

        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

        gsap.set(cards, { autoAlpha: 0, y: RISE * rem });

        ScrollTrigger.batch(cards, {
            start: "top 80%",
            once: true,
            onEnter: batch => gsap.to(batch, {
                autoAlpha: 1,
                y: 0,
                duration: DURATION,
                ease: 'power3-out',
                stagger: STAGGER,
                clearProps: 'transform'
            })
        });
    };

    script();
});
