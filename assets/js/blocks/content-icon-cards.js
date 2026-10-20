import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-icon-cards', (els, baunfire) => {
    const STAGGER = 0.08;
    const CARD = 0.8;
    const DOTS = 0.6;
    const FADE = 0.3;
    const RISE = { desktop: 2.5, mobile: 1.5 };
    const DESKTOP = '(min-width: 62rem)';
    const MOBILE = '(max-width: 61.9375rem)';

    const script = () => {
        els.forEach(self => handleCards(self));
    };

    const handleCards = (self) => {
        const grid = self.querySelector('.cic-grid');
        const cards = [...self.querySelectorAll('.cic-card')];
        if (!grid || !cards.length) return;

        const mm = gsap.matchMedia();

        mm.add(DESKTOP, () => {
            const tl = gsap.timeline({ paused: true });
            cards.forEach((card, i) => addCard(tl, card, i * STAGGER, RISE.desktop));

            ScrollTrigger.create({
                trigger: grid,
                start: "top 70%",
                once: true,
                onEnter: () => tl.play()
            });
        });

        mm.add(MOBILE, () => {
            cards.forEach(card => {
                const tl = gsap.timeline({ paused: true });
                addCard(tl, card, 0, RISE.mobile);

                ScrollTrigger.create({
                    trigger: card,
                    start: "top 80%",
                    once: true,
                    onEnter: () => tl.play()
                });
            });
        });
    };

    const addCard = (tl, card, at, rise) => {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const dots = prepareDots(card);

        gsap.set(card, { autoAlpha: 0, y: rise * rem });

        tl.to(card, {
            autoAlpha: 1,
            y: 0,
            duration: CARD,
            ease: 'power3-out',
            clearProps: 'transform'
        }, at);

        dots.forEach(({ dot, opacity, delay }) => {
            tl.to(dot, {
                opacity,
                duration: FADE,
                ease: 'power2-out',
                clearProps: 'opacity'
            }, at + delay);
        });
    };

    const prepareDots = (card) => {
        const svg = card.querySelector('.cic-svg');
        if (!svg) return [];

        const { x, y, width, height } = svg.viewBox.baseVal;
        const cx = x + width / 2;
        const cy = y + height / 2;

        const dots = [...svg.querySelectorAll('path')].map(dot => {
            const box = dot.getBBox();
            const distance = Math.hypot(box.x + box.width / 2 - cx, box.y + box.height / 2 - cy);
            const opacity = parseFloat(dot.getAttribute('opacity') ?? 1);
            return { dot, opacity, distance };
        });

        const max = Math.max(...dots.map(({ distance }) => distance)) || 1;

        gsap.set(dots.map(({ dot }) => dot), { opacity: 0 });

        return dots.map(({ dot, opacity, distance }) => ({
            dot,
            opacity,
            delay: (distance / max) * (DOTS - FADE)
        }));
    };

    script();
});
