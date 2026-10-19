import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-grid-cards', (els, baunfire) => {
    const DRAW = 1.2;
    const STAGGER = 0.2;
    const PULSE = 0.25;

    const script = () => {
        els.forEach(self => handleReveal(self));
    };

    const handleReveal = (self) => {
        const svgs = [...self.querySelectorAll('.cgc-svg')];
        if (!svgs.length) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: self.querySelector('.cgc-grid') || self,
                start: baunfire.anim.start,
                once: true
            }
        });

        svgs.forEach((svg, i) => {
            const lines = [...svg.querySelectorAll('.cgc-line')];
            const nodes = svg.querySelectorAll('.cgc-node');
            const extras = svg.querySelectorAll('.cgc-relaxed, .cgc-arrow');
            const lattice = svg.querySelector('.cgc-lattice');
            const at = i * STAGGER;

            lines.forEach(line => {
                const length = line.getTotalLength();
                gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
            });

            gsap.set(nodes, { autoAlpha: 0 });
            gsap.set(extras, { autoAlpha: 0 });

            tl.to(lines, {
                strokeDashoffset: 0,
                duration: DRAW,
                ease: 'neutral',
                clearProps: 'strokeDasharray,strokeDashoffset'
            }, at)
                .to(nodes, {
                    autoAlpha: 1,
                    duration: 0.3,
                    ease: 'power2-in-out',
                    stagger: { each: 0.015, from: 'center' }
                }, at + DRAW * 0.5)
                .to(extras, { autoAlpha: 1, duration: 0.4, ease: 'power2-in-out' }, at + DRAW * 0.5);

            if (svg.classList.contains('is-native') && lattice) {
                tl.fromTo(lattice,
                    { scale: 0.8, transformOrigin: '50% 50%' },
                    { scale: 1, duration: 0.8, ease: 'power3-in-out' },
                    at
                );
            }

            if (svg.classList.contains('is-ingan')) handlePulse(svg);
        });
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
