import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.ring-accordion', (els) => {
    const RADIUS = 140;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const RING_DURATION = 800;
    const LABEL_FADE = 200;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const script = () => {
        els.forEach(self => handleAccordion(self));
    };

    const handleAccordion = (self) => {
        const items = self.querySelectorAll('.ra-item');
        if (!items.length) return;

        const ring = createRing(self, items);

        let activeIndex = 0;
        let inView = false;

        const setActive = (index) => {
            activeIndex = index;

            items.forEach((item, i) => item.classList.toggle('active', i === index));

            if (ring && inView) ring.update(index);
        };

        items.forEach((item, index) => {
            const number = item.querySelector('#ra-item-number');
            if (number) number.textContent = pad(index + 1);

            if (item.classList.contains('active')) activeIndex = index;

            item.querySelectorAll('.ra-item-title, .ra-item-icon').forEach(trigger => {
                trigger.addEventListener('click', () => setActive(index));
            });
        });

        setActive(activeIndex);

        if (!ring) return;

        ring.setLabels(activeIndex);

        const reveal = () => {
            inView = true;
            ring.update(activeIndex);
        };

        if (!('IntersectionObserver' in window)) {
            reveal();
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                reveal();
                observer.disconnect();
            });
        }, { threshold: 0.3 });

        observer.observe(self);
    };

    const createRing = (self, items) => {
        const svg = self.querySelector('.ra-ring');
        if (!svg) return null;

        const progress = svg.querySelectorAll('.ra-ring-progress');
        const stops = [...svg.querySelectorAll('.ra-ring-stop')];
        const glow = svg.querySelector('.ra-ring-glow');
        const labels = self.querySelectorAll('.ra-ring-label');
        const title = self.querySelector('.ra-ring-title');
        const count = self.querySelector('.ra-ring-count');
        const total = stops.length || items.length;
        const titles = [...items].map(item => item.querySelector('.ra-item-title')?.textContent.trim() ?? '');

        let current = -1;
        let glowTimer;
        let labelTimer;

        const resetRing = () => {
            const animated = [...progress, ...stops, glow].filter(Boolean);
            animated.forEach(node => { node.style.transition = 'none'; });

            progress.forEach(circle => {
                circle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
                circle.style.strokeDashoffset = CIRCUMFERENCE;
            });
            stops.forEach(stop => stop.classList.remove('is-active', 'is-passed'));
            glow?.classList.remove('is-visible');

            svg.getBoundingClientRect();
            animated.forEach(node => { node.style.transition = ''; });
        };

        const setLabels = (index) => {
            if (title) title.textContent = titles[index] ?? '';
            if (count) count.textContent = `${pad(index + 1)} / ${pad(total)}`;
        };

        const drawProgress = (step) => {
            const offset = CIRCUMFERENCE * (1 - step / total);
            progress.forEach(circle => { circle.style.strokeDashoffset = offset; });
        };

        const updateStops = (index) => {
            stops.forEach((stop, i) => {
                stop.classList.toggle('is-active', i === index);
                stop.classList.toggle('is-passed', i < index);
            });
        };

        const moveGlow = (step, reduce) => {
            if (!glow) return;

            clearTimeout(glowTimer);
            glow.classList.remove('is-visible');

            glowTimer = setTimeout(() => {
                const angle = -Math.PI / 2 + step * ((Math.PI * 2) / total);
                glow.setAttribute('cx', (RADIUS * Math.cos(angle)).toFixed(2));
                glow.setAttribute('cy', (RADIUS * Math.sin(angle)).toFixed(2));
                glow.classList.add('is-visible');
            }, reduce ? 0 : RING_DURATION - 100);
        };

        const swapLabels = (index, reduce) => {
            clearTimeout(labelTimer);
            labels.forEach(label => label.classList.add('is-hidden'));

            labelTimer = setTimeout(() => {
                setLabels(index);
                labels.forEach(label => label.classList.remove('is-hidden'));
            }, reduce ? 0 : LABEL_FADE);
        };

        const update = (index) => {
            if (index === current) return;
            current = index;

            const reduce = reducedMotion.matches;
            const step = index + 1;

            drawProgress(step);
            updateStops(index);
            moveGlow(step, reduce);
            swapLabels(index, reduce);
        };

        resetRing();

        return { update, setLabels };
    };

    const pad = (number) => String(number).padStart(2, '0');

    script();
});
