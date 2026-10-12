import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.ring-accordion', (els, baunfire) => {
    const RADIUS = 140;
    const CIRC = 2 * Math.PI * RADIUS;
    const RING_DURATION = 800; // keep in sync with .ra-ring-progress transition
    const LABEL_FADE = 200;    // keep in sync with .ra-ring-label transition

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pad = n => String(n).padStart(2, '0');

    const script = () => {
        els.forEach(self => handleAccordion(self));
    };

    const createRing = (self, items) => {
        const svg = self.querySelector('.ra-ring');

        if (!svg) return null;

        const progress = svg.querySelectorAll('.ra-ring-progress');
        const stops = [...svg.querySelectorAll('.ra-ring-stop')];
        const glow = svg.querySelector('.ra-ring-glow');
        // Labels are HTML overlaid on the ring (not SVG <text>) so they don't scale with the viewBox
        const labels = self.querySelectorAll('.ra-ring-label');
        const title = self.querySelector('.ra-ring-title');
        const count = self.querySelector('.ra-ring-count');
        const total = stops.length || items.length;
        const titles = [...items].map(item =>
            item.querySelector('.ra-item-title')?.textContent.trim() ?? ''
        );

        let current = -1;
        let glowTimer;
        let labelTimer;

        // Reset to an empty ring without animating, so any state saved into
        // the embed (inline styles, is-active, is-visible) can't flash or unwind.
        const animated = [...progress, ...stops, glow].filter(Boolean);
        animated.forEach(node => { node.style.transition = 'none'; });

        progress.forEach(circle => {
            circle.style.strokeDasharray = `${CIRC} ${CIRC}`;
            circle.style.strokeDashoffset = CIRC;
        });
        stops.forEach(stop => stop.classList.remove('is-active', 'is-passed'));
        glow?.classList.remove('is-visible');

        svg.getBoundingClientRect(); // commit the reset before re-enabling transitions
        animated.forEach(node => { node.style.transition = ''; });

        const setLabels = index => {
            if (title) title.textContent = titles[index] ?? '';
            if (count) count.textContent = `${pad(index + 1)} / ${pad(total)}`;
        };

        const update = index => {
            if (index === current) return;
            current = index;

            const reduce = reducedMotion.matches;
            const step = index + 1;

            // Ring: draw (or un-draw) to the new stop
            const offset = CIRC * (1 - step / total);
            progress.forEach(circle => {
                circle.style.strokeDashoffset = offset;
            });

            // Stops: passed / active / upcoming
            stops.forEach((stop, i) => {
                stop.classList.toggle('is-active', i === index);
                stop.classList.toggle('is-passed', i < index);
            });

            // Glow: fade out, move, fade back in as the ring lands
            if (glow) {
                clearTimeout(glowTimer);
                glow.classList.remove('is-visible');

                glowTimer = setTimeout(() => {
                    const angle = -Math.PI / 2 + step * ((Math.PI * 2) / total);
                    glow.setAttribute('cx', (RADIUS * Math.cos(angle)).toFixed(2));
                    glow.setAttribute('cy', (RADIUS * Math.sin(angle)).toFixed(2));
                    glow.classList.add('is-visible');
                }, reduce ? 0 : RING_DURATION - 100);
            }

            // Center labels: quick crossfade
            clearTimeout(labelTimer);
            labels.forEach(label => label.classList.add('is-hidden'));

            labelTimer = setTimeout(() => {
                setLabels(index);
                labels.forEach(label => label.classList.remove('is-hidden'));
            }, reduce ? 0 : LABEL_FADE);
        };

        return { update, setLabels };
    };

    const handleAccordion = (self) => {
        const items = self.querySelectorAll('.ra-item');

        if (!items.length) return;

        const ring = createRing(self, items);

        let activeIndex = 0;
        let inView = false;

        const setActive = index => {
            activeIndex = index;

            items.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });

            if (ring && inView) ring.update(index);
        };

        items.forEach((item, index) => {
            const number = item.querySelector('#ra-item-number');

            if (number) {
                number.textContent = String(index + 1).padStart(2, '0');
            }

            if (item.classList.contains('active')) {
                activeIndex = index;
            }

            const triggers = item.querySelectorAll(
                '.ra-item-title, .ra-item-icon'
            );

            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => setActive(index));
            });
        });

        setActive(activeIndex);

        if (!ring) return;

        // Show the label right away; draw the ring the first time the section is in view
        ring.setLabels(activeIndex);

        if (!('IntersectionObserver' in window)) {
            inView = true;
            ring.update(activeIndex);
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                inView = true;
                ring.update(activeIndex);
                observer.disconnect();
            });
        }, { threshold: 0.3 });

        observer.observe(self);
    };

    script();
});