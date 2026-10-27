import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.ring-accordion', (els) => {
    const RADIUS = 140;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    const RING_DURATION = 800;
    const LABEL_FADE = 200;
    const STOP_DELAY = RING_DURATION * 0.6;
    const GLOW_DELAY = RING_DURATION * 0.35;
    const START_DELAY = 400;
    const MOBILE = { query: '(max-width: 991px)', startDelay: 120, threshold: 0.25 };
    const RING_COLORS = ['#f9a98a', '#ff696a'];
    const SECTORS = 90;
    const SECTOR_WIDTH = 10;
    const STOP_POINTS = '-5,0 -2.5,-4.33 2.5,-4.33 5,0 2.5,4.33 -2.5,4.33';
    let ringCount = 0;

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

        const isMobile = window.matchMedia(MOBILE.query).matches;

        const reveal = () => {
            ring.reveal(() => {
                inView = true;
                ring.update(activeIndex);
            }, isMobile ? MOBILE.startDelay : START_DELAY);
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
        }, { threshold: isMobile ? MOBILE.threshold : 0.3 });

        observer.observe(isMobile ? self.querySelector('.ra-ring') ?? self : self);
    };

    const createRing = (self, items) => {
        const svg = self.querySelector('.ra-ring');
        if (!svg) return null;

        const colors = buildRing(svg, items.length);

        const progress = svg.querySelectorAll('.ra-ring-progress');
        const stops = [...svg.querySelectorAll('.ra-ring-stop')];
        const glow = svg.querySelector('.ra-ring-glow');
        const labels = self.querySelectorAll('.ra-ring-label');
        const title = self.querySelector('.ra-ring-title');
        const count = self.querySelector('.ra-ring-count');
        const total = items.length;
        const start = stops[stops.length - 1];
        const sectors = [...svg.querySelectorAll('.ra-ring-fill path')];
        const span = { value: 1 / total };
        const titles = [...items].map(item => item.querySelector('.ra-item-title')?.textContent.trim() ?? '');

        let current = -1;
        let glowTimer;
        let labelTimer;
        let stopTimer;

        const resetRing = () => {
            const animated = [...progress, ...stops, ...labels, glow].filter(Boolean);
            animated.forEach(node => { node.style.transition = 'none'; });

            progress.forEach(circle => {
                circle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
                circle.style.strokeDashoffset = CIRCUMFERENCE;
            });
            stops.forEach(stop => stop.classList.remove('is-active', 'is-passed', 'is-start'));
            glow?.classList.remove('is-visible');
            labels.forEach(label => label.classList.add('is-hidden'));

            svg.getBoundingClientRect();
            animated.forEach(node => { node.style.transition = ''; });
        };

        const setLabels = (index) => {
            if (title) title.textContent = titles[index] ?? '';
            if (count) count.textContent = `${pad(index + 1)} / ${pad(total)}`;
        };

        const paint = () => {
            sectors.forEach((sector, i) => {
                const amount = Math.min(1, (i + 0.5) / SECTORS / span.value);
                sector.setAttribute('fill', mix(colors[0], colors[1], amount));
            });
        };

        const drawProgress = (step) => {
            const offset = CIRCUMFERENCE * (1 - step / total);
            progress.forEach(circle => { circle.style.strokeDashoffset = offset; });

            if (!sectors.length) return;

            gsap.to(span, {
                value: step / total,
                duration: RING_DURATION / 1000,
                ease: 'power2.inOut',
                overwrite: true,
                onUpdate: paint
            });
        };

        const updateStops = (index) => {
            clearTimeout(stopTimer);

            stops.forEach((stop, i) => {
                stop.classList.remove('is-active');
                stop.classList.toggle('is-passed', i < index);
            });

            stopTimer = setTimeout(() => {
                stops[index]?.classList.add('is-active');
            }, STOP_DELAY);
        };

        const moveGlow = (step) => {
            if (!glow) return;

            clearTimeout(glowTimer);
            glow.classList.remove('is-visible');

            glowTimer = setTimeout(() => {
                const angle = -Math.PI / 2 + step * ((Math.PI * 2) / total);
                glow.setAttribute('cx', (RADIUS * Math.cos(angle)).toFixed(2));
                glow.setAttribute('cy', (RADIUS * Math.sin(angle)).toFixed(2));
                glow.classList.add('is-visible');
            }, GLOW_DELAY);
        };

        const swapLabels = (index) => {
            clearTimeout(labelTimer);
            labels.forEach(label => label.classList.add('is-hidden'));

            labelTimer = setTimeout(() => {
                setLabels(index);
                labels.forEach(label => label.classList.remove('is-hidden'));
            }, LABEL_FADE);
        };

        const update = (index) => {
            if (index === current) return;
            current = index;

            const step = index + 1;

            drawProgress(step);
            updateStops(index);
            moveGlow(step);
            swapLabels(index);
        };

        const reveal = (callback, delay) => {
            start?.classList.add('is-start');
            setTimeout(callback, delay);
        };

        resetRing();
        if (sectors.length) paint();

        return { update, setLabels, reveal };
    };

    const point = (radius, angle) => [radius * Math.cos(angle), radius * Math.sin(angle)].map(value => value.toFixed(2));

    const mix = (from, to, amount) => {
        const channels = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
        const a = channels(from);
        const b = channels(to);
        return `rgb(${a.map((value, i) => Math.round(value + (b[i] - value) * amount)).join(',')})`;
    };

    const sectorHTML = (index) => {
        const outer = RADIUS + SECTOR_WIDTH;
        const inner = RADIUS - SECTOR_WIDTH;
        const from = -Math.PI / 2 + (index / SECTORS) * Math.PI * 2;
        const to = -Math.PI / 2 + ((index + 1.5) / SECTORS) * Math.PI * 2;
        const [ax, ay] = point(outer, from);
        const [bx, by] = point(outer, to);
        const [cx, cy] = point(inner, to);
        const [dx, dy] = point(inner, from);

        return `<path d="M${ax} ${ay}A${outer} ${outer} 0 0 1 ${bx} ${by}L${cx} ${cy}A${inner} ${inner} 0 0 0 ${dx} ${dy}Z"></path>`;
    };

    const stopHTML = (index, total) => {
        const [x, y] = point(RADIUS, -Math.PI / 2 + ((index + 1) / total) * Math.PI * 2);

        return `
            <g transform="translate(${x} ${y})">
                <polygon class="ra-ring-stop" points="${STOP_POINTS}" fill="#5b183f" stroke="rgba(255,255,255,.4)" stroke-width="1.5"></polygon>
            </g>
        `;
    };

    const maskHTML = (id) => `
        <mask id="${id}" maskUnits="userSpaceOnUse" x="-180" y="-180" width="360" height="360">
            <g transform="rotate(-90)"></g>
        </mask>
    `;

    const buildRing = (svg, total) => {
        svg.querySelectorAll('.ra-ring-stop').forEach(stop => {
            const parent = stop.parentElement;
            (parent.matches('g') && parent.childElementCount === 1 ? parent : stop).remove();
        });

        svg.insertAdjacentHTML('beforeend', Array.from({ length: total }, (_, i) => stopHTML(i, total)).join(''));

        const line = svg.querySelector('.ra-ring-progress--line');
        if (!line) return RING_COLORS;

        const stopColors = [...svg.querySelectorAll('linearGradient stop')].map(stop => stop.getAttribute('stop-color'));
        const colors = stopColors.length > 1 ? [stopColors[0], stopColors[stopColors.length - 1]] : RING_COLORS;
        const id = `ra-ring-mask-${ringCount++}`;
        const defs = svg.querySelector('defs') ?? svg.insertAdjacentElement('afterbegin', document.createElementNS('http://www.w3.org/2000/svg', 'defs'));

        line.parentElement.insertAdjacentHTML('afterend', `
            <g class="ra-ring-fill" mask="url(#${id})">
                ${Array.from({ length: SECTORS }, (_, i) => sectorHTML(i)).join('')}
            </g>
        `);

        defs.insertAdjacentHTML('beforeend', maskHTML(id));
        line.setAttribute('stroke', '#fff');
        defs.lastElementChild.querySelector('g').append(line);

        return colors;
    };

    const pad = (number) => String(number).padStart(2, '0');

    script();
});
