import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.fixed-scroll', (els) => {
    const GRAY = '#E3E1DE';
    const BASE = 355;
    const FLOW = { radius: 2, walkers: 5, walkerGap: 0.35, window: 0.68, drain: 0.15, nodeFade: 0.12, swap: 0.9 };

    const STEPS = [
        { size: 310, color: GRAY },
        { size: 355, color: '#3A58EF' },
        { size: 400, color: '#38CA73' },
        { size: 446, color: '#FF696A' }
    ];

    const BACK_LINES = [
        'M228.493 275.74H81.0342L7.30371 148.036L81.0342 20.333H228.493L302.224 148.036L228.493 275.74Z',
        'M265.066 211.577H44.0034M44.0034 83.8838H265.066',
        'M7.61792 148.035H301.908',
        'M43.8904 212.691L155.754 20.0112',
        'M81.2463 275.55L229.604 20.0114',
        'M155.655 275.55L267.518 82.8701',
        'M43.8904 82.8701L155.754 275.55',
        'M80.9553 20.1801L229.233 273.817',
        'M153.815 20.0112L265.679 212.691'
    ];

    const BACK_NODES = [
        'M272.61 84.978L269.89 89.688H264.452L261.732 84.978L264.452 80.2681H269.89L272.61 84.978Z',
        'M197.519 84.9779L194.8 89.688H189.361L186.642 84.9779L189.361 80.2679H194.8L197.519 84.9779Z',
        'M122.429 84.9779L119.709 89.688H114.271L111.552 84.9779L114.271 80.2679H119.709L122.429 84.9779Z',
        'M47.3384 84.9779L44.6191 89.688H39.1805L36.4612 84.9779L39.1805 80.2679H44.6191L47.3384 84.9779Z',
        'M272.61 212.13L269.89 216.84H264.452L261.732 212.13L264.452 207.42H269.89L272.61 212.13Z',
        'M197.519 212.13L194.8 216.84H189.361L186.642 212.13L189.361 207.42H194.8L197.519 212.13Z',
        'M122.429 212.13L119.709 216.84H114.271L111.552 212.13L114.271 207.42H119.709L122.429 212.13Z',
        'M47.3384 212.13L44.6191 216.84H39.1805L36.4612 212.13L39.1805 207.42H44.6191L47.3384 212.13Z',
        'M235.899 276.237L233.18 280.947H227.741L225.022 276.237L227.741 271.527H233.18L235.899 276.237Z',
        'M160.809 276.237L158.09 280.947H152.651L149.932 276.237L152.651 271.527H158.09L160.809 276.237Z',
        'M85.7183 276.237L82.999 280.947H77.5604L74.8411 276.237L77.5604 271.527H82.999L85.7183 276.237Z',
        'M310 148.734L307.281 153.444H301.842L299.123 148.734L301.842 144.024H307.281L310 148.734Z',
        'M235.219 148.734L232.5 153.444H227.061L224.342 148.734L227.061 144.024H232.5L235.219 148.734Z',
        'M160.439 148.734L157.719 153.444H152.281L149.562 148.734L152.281 144.024H157.719L160.439 148.734Z',
        'M85.658 148.734L82.9387 153.444H77.5001L74.7808 148.734L77.5001 144.024H82.9387L85.658 148.734Z',
        'M10.8772 148.734L8.1579 153.444H2.7193L0 148.734L2.7193 144.024H8.1579L10.8772 148.734Z',
        'M235.219 21.0746L232.5 25.7845H227.061L224.342 21.0746L227.061 16.3646H232.5L235.219 21.0746Z',
        'M160.438 21.0745L157.719 25.7845H152.281L149.561 21.0745L152.281 16.3646H157.719L160.438 21.0745Z',
        'M85.6577 21.0745L82.9384 25.7845H77.4998L74.7805 21.0745L77.4998 16.3646H82.9384L85.6577 21.0745Z'
    ];

    const TOP_LINES = [
        'M262.959 318.016H91.4985L5.76807 169.525L91.4985 21.0363L262.959 21.0364L348.691 169.526L262.959 318.016Z',
        'M305.416 243.368H48.5117',
        'M48.5117 94.9719H305.416',
        'M6.22681 169.524H348.231',
        'M48.3799 244.664L178.38 20.7435',
        'M91.792 317.714L264.203 20.7434',
        'M178.265 317.714L308.266 93.7938',
        'M48.3799 93.7936L178.38 317.714',
        'M91.4541 20.9398L263.772 315.699',
        'M176.127 20.7433L306.128 244.663'
    ];

    const TOP_ACCENTS = [
        { d: 'M49.0838 244.496L6.49976 170.786', g: [7.198, 172.481, 44.798, 239.827] },
        { d: 'M48.5 95.8669L92.0161 20.2863', g: [87.5382, 28.0842, 48.8523, 94.5329] },
        { d: 'M91.8286 169.655L133.984 98.5262', g: [132.839, 101.389, 96.9957, 164.899] },
        { d: 'M220.5 244.722L264.016 170.286', g: [261.153, 176.012, 224.756, 238.898] },
        { d: 'M222.5 243.286L263.5 316.286', g: [229.016, 253.056, 262.835, 312.695] },
        { d: 'M178.5 24.2861L219.298 95.7922', g: [217.093, 92.76, 181.147, 34.269] },
        { d: 'M307.5 97.2863L348.5 169.286', g: [309.667, 102.136, 346.284, 165.349] },
        { d: 'M51.5325 242.818L133.878 242.816', g: [53.2503, 242.817, 53.2701, 241.601] },
        { d: 'M175.21 169.528L257.556 169.526', g: [257.556, 170.026, 175.21, 170.028] },
        { d: 'M50.5002 95.2881L132.846 95.2861', g: [49.355, 95.2864, 49.3749, 94.0699] }
    ];

    const TOP_NODES = [
        'M312.182 97.3136L309.068 102.707H302.84L299.726 97.3136L302.84 91.92H309.068L312.182 97.3136Z',
        'M226.191 97.3135L223.077 102.707H216.849L213.735 97.3135L216.849 91.9199H223.077L226.191 97.3135Z',
        'M140.201 97.3135L137.087 102.707H130.859L127.745 97.3135L130.859 91.9199H137.087L140.201 97.3135Z',
        'M54.2105 97.3135L51.0965 102.707H44.8684L41.7544 97.3135L44.8684 91.9199H51.0965L54.2105 97.3135Z',
        'M312.182 242.923L309.068 248.316H302.84L299.726 242.923L302.84 237.529H309.068L312.182 242.923Z',
        'M226.191 242.923L223.077 248.316H216.849L213.735 242.923L216.849 237.529H223.077L226.191 242.923Z',
        'M140.201 242.923L137.087 248.316H130.859L127.745 242.923L130.859 237.529H137.087L140.201 242.923Z',
        'M54.2105 242.923L51.0965 248.316H44.8684L41.7544 242.923L44.8684 237.529H51.0965L54.2105 242.923Z',
        'M270.143 316.336L267.029 321.729H260.8L257.686 316.336L260.8 310.942H267.029L270.143 316.336Z',
        'M184.152 316.336L181.038 321.729H174.81L171.696 316.336L174.81 310.942H181.038L184.152 316.336Z',
        'M98.1612 316.336L95.0472 321.729H88.8191L85.7051 316.336L88.8191 310.942H95.0472L98.1612 316.336Z',
        'M355 170.324L351.886 175.718H345.658L342.544 170.324L345.658 164.931H351.886L355 170.324Z',
        'M269.364 170.324L266.25 175.718H260.022L256.908 170.324L260.022 164.931H266.25L269.364 170.324Z',
        'M183.728 170.324L180.614 175.718H174.386L171.272 170.324L174.386 164.931H180.614L183.728 170.324Z',
        'M98.0922 170.324L94.9782 175.718H88.7501L85.636 170.324L88.7501 164.931H94.9782L98.0922 170.324Z',
        'M12.4562 170.324L9.3421 175.718H3.11403L0 170.324L3.11403 164.931H9.3421L12.4562 170.324Z',
        'M269.364 24.1338L266.25 29.5275H260.022L256.908 24.1338L260.022 18.7402H266.25L269.364 24.1338Z',
        'M183.728 24.1338L180.614 29.5275H174.386L171.272 24.1338L174.386 18.7402H180.614L183.728 24.1338Z',
        'M98.0922 24.1338L94.9782 29.5275H88.7501L85.636 24.1338L88.7501 18.7402H94.9782L98.0922 24.1338Z'
    ];

    const backHTML = () => `
        <svg class="fs-graphic-back" viewBox="0 0 310 297" fill="none" xmlns="http://www.w3.org/2000/svg">
            ${BACK_LINES.map(d => `<path d="${d}" stroke="${GRAY}" vector-effect="non-scaling-stroke"/>`).join('')}
            ${BACK_NODES.map(d => `<path d="${d}" fill="${GRAY}"/>`).join('')}
        </svg>
    `;

    const topHTML = () => `
        <div class="fs-graphic-top">
            <svg viewBox="0 0 355 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${TOP_LINES.map(d => `<path d="${d}" stroke="${GRAY}" vector-effect="non-scaling-stroke"/>`).join('')}
                ${TOP_ACCENTS.map(accent => `<path d="${accent.d}" stroke="${GRAY}" vector-effect="non-scaling-stroke"/>`).join('')}
                <g class="fs-graphic-solid">${TOP_LINES.map(d => `<path d="${d}"/>`).join('')}</g>
                <g class="fs-graphic-flow"></g>
                ${TOP_NODES.map(d => `<path class="fs-graphic-node" d="${d}"/>`).join('')}
            </svg>
        </div>
    `;

    const graphicHTML = () => `
        <div class="fs-graphic" aria-hidden="true">
            <div class="fs-graphic-sticky">
                <div class="fs-graphic-box">
                    ${backHTML()}
                    ${topHTML()}
                </div>
            </div>
        </div>
    `;

    const script = () => {
        els.forEach(self => handleGraphic(self));
    };

    const handleGraphic = (self) => {
        const body = self.querySelector('.fs-body');
        const items = [...self.querySelectorAll('.fs-item')];
        if (!body || items.length < 2) return;

        const mm = gsap.matchMedia();

        mm.add('(min-width: 992px)', () => handleDesktop(self, body, items));
    };

    const handleDesktop = (self, body, items) => {
        body.insertAdjacentHTML('afterbegin', graphicHTML());

        const graphic = body.querySelector('.fs-graphic');
        const top = graphic.querySelector('.fs-graphic-top');
        const box = graphic.querySelector('.fs-graphic-box');
        const nodes = [...graphic.querySelectorAll('.fs-graphic-node')];
        const network = buildNetwork([...graphic.querySelectorAll('.fs-graphic-solid path')], nodes);
        graphic.querySelector('.fs-graphic-flow').insertAdjacentHTML('beforeend', network.segments.map(segmentHTML).join(''));
        const lights = [...graphic.querySelectorAll('.fs-graphic-light')];
        const lengths = network.segments.map(segment => segment.length);
        const segmentDelay = (j) => network.segments[j].delay;
        const nodeDelay = (j) => network.nodeTimes[j];
        const steps = STEPS.slice(0, items.length);
        const octagons = items.slice(0, steps.length).map(item => item.querySelector('.fs-octagon'));
        let widths = [];

        const measure = () => {
            self.style.setProperty('--fs-item-h', `${items[0].offsetHeight}px`);

            const measured = octagons.map(octagon => octagon?.offsetWidth || 0);
            const hasAll = measured.every(width => width > 0);

            if (hasAll) self.style.setProperty('--fs-oct-w', `${measured[0]}px`);
            else self.style.removeProperty('--fs-oct-w');

            widths = hasAll ? measured : steps.map(step => box.offsetWidth * step.size / steps[0].size);
        };

        const scaleAt = (i) => widths[i] / (widths[0] * BASE / steps[0].size);

        measure();
        ScrollTrigger.addEventListener('refreshInit', measure);

        gsap.set(top, {
            xPercent: -50,
            yPercent: -50,
            autoAlpha: 0,
            scale: scaleAt(0),
            '--fs-color': steps[0].color,
            '--fs-light': steps[0].color,
            '--fs-solid': 'transparent'
        });

        lights.forEach((light, i) => {
            gsap.set(light, { strokeDasharray: `${lengths[i]} ${lengths[i] + 1}`, strokeDashoffset: lengths[i] });
        });

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: items[0],
                start: 'center center',
                endTrigger: items[steps.length - 1],
                end: 'center center',
                scrub: true,
                invalidateOnRefresh: true
            }
        });

        steps.slice(1).forEach((step, i) => {
            const at = i + 0.15;
            const prev = steps[i];
            const draw = at + (i === 0 ? 0 : FLOW.drain);

            if (i === 0) tl.fromTo(top, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, immediateRender: false }, at);

            if (i > 0) {
                tl.fromTo(top,
                    { '--fs-solid': prev.color, '--fs-color': prev.color, '--fs-light': prev.color },
                    { '--fs-solid': GRAY, '--fs-color': GRAY, '--fs-light': GRAY, duration: FLOW.drain, ease: 'neutral', immediateRender: false },
                    at
                )
                    .fromTo(nodes,
                        { fill: prev.color },
                        { fill: GRAY, duration: FLOW.drain, ease: 'neutral', immediateRender: false },
                        at
                    );
            }

            tl.fromTo(top,
                { '--fs-solid': i === 0 ? 'transparent' : GRAY, '--fs-color': GRAY },
                { '--fs-solid': step.color, '--fs-color': step.color, duration: 0, immediateRender: false },
                at + FLOW.swap
            )
                .fromTo(top,
                    { '--fs-light': i === 0 ? prev.color : GRAY },
                    { '--fs-light': step.color, duration: 0, immediateRender: false },
                    draw
                )
                .fromTo(top,
                    { scale: () => scaleAt(i) },
                    { scale: () => scaleAt(i + 1), duration: 0.7, ease: 'neutral', immediateRender: false },
                    at
                )
                .fromTo(lights,
                    { strokeDashoffset: 0 },
                    { strokeDashoffset: (j) => lengths[j], duration: 0, immediateRender: false },
                    draw
                )
                .fromTo(lights,
                    { strokeDashoffset: (j) => lengths[j] },
                    {
                        strokeDashoffset: 0,
                        duration: network.hop,
                        stagger: segmentDelay,
                        immediateRender: false
                    },
                    draw
                )
                .fromTo(nodes,
                    { fill: GRAY },
                    { fill: step.color, duration: FLOW.nodeFade, ease: 'neutral', stagger: nodeDelay, immediateRender: false },
                    draw
                );
        });

        tl.set({}, {}, steps.length - 1);

        return () => {
            ScrollTrigger.removeEventListener('refreshInit', measure);
            self.style.removeProperty('--fs-item-h');
            self.style.removeProperty('--fs-oct-w');
            graphic.remove();
        };
    };

    const segmentHTML = ({ x1, y1, x2, y2 }) => `
        <path class="fs-graphic-light" d="M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}"/>
    `;

    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    const walk = (edges, points) => {
        const remaining = new Set(edges);
        const open = (point) => edges.filter(edge => remaining.has(edge) && (edge.a.point === point || edge.b.point === point));
        const starts = [...points].sort(() => Math.random() - 0.5).slice(0, FLOW.walkers);
        const walkers = starts.map((point, i) => ({ point, time: i * FLOW.walkerGap }));

        while (remaining.size) {
            const walker = walkers.reduce((first, item) => (item.time < first.time ? item : first));
            let options = open(walker.point);

            if (!options.length) {
                const edge = pick([...remaining]);
                walker.point = pick([edge.a.point, edge.b.point]);
                options = open(walker.point);
            }

            const edge = pick(options);
            const forward = edge.a.point === walker.point;

            remaining.delete(edge);
            edge.from = forward ? edge.a : edge.b;
            edge.to = forward ? edge.b : edge.a;
            edge.delay = walker.time;
            walker.time += 1;
            walker.point = edge.to.point;
        }

        const hop = FLOW.window / Math.max(...edges.map(edge => edge.delay + 1));
        edges.forEach(edge => { edge.delay *= hop; });

        return hop;
    };

    const buildNetwork = (paths, nodes) => {
        const box = paths[0].getBBox();
        const spacing = box.width / (FLOW.radius * 2);
        const rise = spacing * Math.sqrt(3) / 2;
        const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        const points = [];

        for (let q = -FLOW.radius; q <= FLOW.radius; q++) {
            for (let r = -FLOW.radius; r <= FLOW.radius; r++) {
                if (Math.abs(q + r) > FLOW.radius) continue;
                points.push({ x: center.x + (q + r / 2) * spacing, y: center.y + r * rise });
            }
        }

        const nearest = (x, y) => points.reduce((best, point) => (
            Math.hypot(point.x - x, point.y - y) < Math.hypot(best.x - x, best.y - y) ? point : best
        ));

        const edges = paths.flatMap(path => {
            const total = path.getTotalLength();
            const count = Math.max(1, Math.round(total / spacing));
            const marks = Array.from({ length: count + 1 }, (_, i) => path.getPointAtLength(total * i / count));

            return marks.slice(0, -1).map((mark, i) => {
                const next = marks[i + 1];

                return {
                    a: { x: mark.x, y: mark.y, point: nearest(mark.x, mark.y) },
                    b: { x: next.x, y: next.y, point: nearest(next.x, next.y) },
                    length: Math.hypot(next.x - mark.x, next.y - mark.y)
                };
            });
        });

        const hop = walk(edges, points);

        const segments = edges.map(edge => ({
            x1: edge.from.x,
            y1: edge.from.y,
            x2: edge.to.x,
            y2: edge.to.y,
            delay: edge.delay,
            length: edge.length
        }));

        const reachedAt = (point) => Math.min(...edges.flatMap(edge => {
            if (edge.from.point === point) return [edge.delay];
            if (edge.to.point === point) return [edge.delay + hop];
            return [];
        }));

        const nodeTimes = nodes.map(node => {
            const nodeBox = node.getBBox();
            return reachedAt(nearest(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2));
        });

        return { segments, nodeTimes, hop };
    };

    script();
});
