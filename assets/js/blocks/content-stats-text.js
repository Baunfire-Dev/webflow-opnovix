import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-stats-text', (els, baunfire) => {
    const DURATION = 1;
    const EASE = 'power3-out';
    const NUMBER = /\d+(?:\.\d+)?/;

    const script = () => {
        els.forEach(self => handleStats(self));
    };

    const handleStats = (self) => {
        const stats = self.querySelector('.cst-stats');
        const counters = [...self.querySelectorAll('.cst-value')].map(parseValue).filter(Boolean);
        if (!stats || !counters.length) return;

        counters.forEach(counter => render(counter, 0));

        ScrollTrigger.create({
            trigger: stats,
            start: baunfire.anim.start,
            once: true,
            onEnter: () => counters.forEach(countUp)
        });
    };

    const parseValue = (el) => {
        const text = el.textContent.trim();
        const match = text.match(NUMBER);
        if (!match) return null;

        return {
            el,
            text,
            prefix: text.slice(0, match.index),
            suffix: text.slice(match.index + match[0].length),
            target: parseFloat(match[0]),
            decimals: (match[0].split('.')[1] || '').length
        };
    };

    const render = ({ el, prefix, suffix, decimals }, value) => {
        el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
    };

    const countUp = (counter) => {
        const state = { value: 0 };

        gsap.to(state, {
            value: counter.target,
            duration: DURATION,
            ease: EASE,
            onUpdate: () => render(counter, state.value),
            onComplete: () => {
                counter.el.textContent = counter.text;
            }
        });
    };

    script();
});
