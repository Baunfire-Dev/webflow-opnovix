import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-stats-text', (els, baunfire) => {
    const DURATION = 1;
    const EASE = 'power3-out';
    const NUMBER = /\d+(?:\.\d+)?/;
    const WORDS = {
        duration: 0.8,
        distance: 32,
        stagger: 0.12,
        ease: 'power2-out',
        paraOffset: 0.25,
        lineOffset: 0.4,
        lineDuration: 0.7,
        lineEase: 'signature',
        start: 'top 80%',
        desktop: '(min-width: 992px)'
    };

    const script = () => {
        els.forEach(self => {
            handleWords(self);
            handleStats(self);
        });
    };

    const wordHTML = (title) => `<span class="cst-word">${title.innerHTML}</span>`;

    const handleWords = (self) => {
        const items = [...self.querySelectorAll('.cst-item')];
        if (!items.length) return;

        items.forEach(item => {
            const title = item.querySelector('.cst-title');
            if (title) title.innerHTML = wordHTML(title);
        });

        const groups = window.matchMedia(WORDS.desktop).matches
            ? [{ trigger: self.querySelector('.cst-items'), items }]
            : items.map(item => ({ trigger: item, items: [item] }));

        groups.forEach(group => {
            ScrollTrigger.create({
                trigger: group.trigger,
                start: WORDS.start,
                once: true,
                onEnter: () => animateWords(group.items)
            });
        });
    };

    const animateWords = (batch) => {
        const words = batch.map(item => item.querySelector('.cst-word')).filter(Boolean);
        const paras = batch.map(item => item.querySelector('.cst-para')).filter(Boolean);
        const from = { autoAlpha: 0, y: WORDS.distance };
        const to = { autoAlpha: 1, y: 0, duration: WORDS.duration, stagger: WORDS.stagger, ease: WORDS.ease, clearProps: 'transform' };

        gsap.timeline()
            .fromTo(words, from, to, 0)
            .fromTo(paras, from, to, WORDS.paraOffset)
            .fromTo(words, { '--cst-line': 0 }, { '--cst-line': 1, duration: WORDS.lineDuration, stagger: WORDS.stagger, ease: WORDS.lineEase }, WORDS.lineOffset);
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
