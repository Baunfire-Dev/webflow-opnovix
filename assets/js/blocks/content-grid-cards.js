import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-grid-cards', (els, baunfire) => {
    const DRAW = 1.6;
    const STAGGER = 0.15;
    const PULSE = 0.25;
    const START = 'bottom 85%';

    const script = () => {
        els.forEach(self => handleCards(self));
    };

    const handleCards = (self) => {
        const svgs = [...self.querySelectorAll('.cgc-card .cgc-svg')];
        if (!svgs.length) return;

        const reveals = new Map(svgs.map(svg => [svg, cardTimeline(svg)]));

        ScrollTrigger.batch(svgs, {
            start: START,
            once: true,
            onEnter: batch => batch.forEach((svg, i) => reveals.get(svg).delay(i * STAGGER).play())
        });
    };

    const prepareLine = (line) => {
        const style = getComputedStyle(line);
        const width = parseFloat(style.strokeWidth) || 1;
        const scale = style.vectorEffect === 'non-scaling-stroke' ? (line.getScreenCTM()?.a || 1) : 1;
        const pad = width * 2 + 2;
        const dash = line.getTotalLength() * scale + pad;
        gsap.set(line, { strokeDasharray: `${dash} ${dash + pad}`, strokeDashoffset: dash + pad / 2 });
    };

    const cardTimeline = (svg) => {
        const lines = [...svg.querySelectorAll('.cgc-line')];
        const nodes = svg.querySelectorAll('.cgc-node');
        const extras = svg.querySelectorAll('.cgc-relaxed, .cgc-arrow');
        const lattice = svg.querySelector('.cgc-lattice');

        lines.forEach(prepareLine);
        gsap.set([...nodes, ...extras], { autoAlpha: 0 });

        const tl = gsap.timeline({ paused: true })
            .set(lines, { visibility: 'visible' }, 0)
            .to(lines, {
                strokeDashoffset: 0,
                duration: DRAW,
                ease: 'signature'
            }, 0)
            .to(nodes, {
                autoAlpha: 1,
                duration: 0.5,
                ease: 'neutral',
                stagger: { each: 0.015, from: 'center' }
            }, DRAW * 0.3)
            .to(extras, { autoAlpha: 1, duration: 0.6, ease: 'neutral' }, DRAW * 0.45);

        if (svg.classList.contains('is-native') && lattice) {
            tl.fromTo(lattice,
                { scale: 0.8, transformOrigin: '50% 50%' },
                { scale: 1, duration: DRAW, ease: 'signature' },
                0
            );
        }

        if (svg.classList.contains('is-ingan')) handlePulse(svg);

        return tl;
    };

    const handlePulse = (svg) => {
        const left = svg.querySelector('.cgc-arrow.is-left');
        const right = svg.querySelector('.cgc-arrow.is-right');
        if (!left || !right) return;

        const shift = () => {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const scale = svg.viewBox.baseVal.width / (svg.getBoundingClientRect().width || 1);
            return PULSE * rem * scale;
        };

        gsap.timeline({
            repeat: -1,
            yoyo: true,
            defaults: { duration: 1, ease: 'neutral' },
            scrollTrigger: {
                trigger: svg,
                start: 'top bottom',
                end: 'bottom top',
                toggleActions: 'play pause resume pause',
                invalidateOnRefresh: true
            }
        })
            .to(left, { x: () => shift() }, 0)
            .to(right, { x: () => -shift() }, 0);
    };

    script();
});
