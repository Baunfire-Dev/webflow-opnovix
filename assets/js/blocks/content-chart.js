import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-chart', (els, baunfire) => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    const X_AXIS = { min: 700, max: 765 };
    const Y_AXIS = { min: 420, max: 580, title: 'nm' };

    const SERIES = [
        {
            color: 'var(--_palette---brand--coral)',
            fill: 0.26,
            fit: [[725, 568.1], [760, 508.5]],
            range: [712.2, 763],
            points: [[725, 570], [740, 540], [760, 510]]
        },
        {
            color: 'var(--_palette---brand--amber)',
            fill: 0.18,
            fit: [[700, 580.4], [763, 467.9]],
            range: [700, 763],
            points: [[700, 580], [718, 550], [735, 515], [755, 480], [763, 470]]
        },
        {
            color: '#8f877c',
            fill: 0.14,
            fit: [[718, 502], [763, 427.2]],
            range: [700, 763],
            points: [[718, 500], [735, 480], [740, 460], [755, 440], [760, 440], [763, 420]]
        }
    ];

    const DRAW_ORDER = [2, 1, 0];


    const LAYOUT = {
        wide: {
            top: 36.22,
            bottom: 359.78,
            left: 66.15,
            right: 4,
            gridLeft: 40,
            gridRight: 4,
            floor: 410,
            ceiling: null,
            pad: 40,
            labelX: 26,
            labelOffset: 22,
            titleY: 4,
            xTicks: [700, 730, 760],
            yTicks: [420, 500, 580],
            unit: ' °C',
            marker: 11,
            stroke: 3,
            dashed: { stroke: 1.5, pattern: '2 5' },
            arrows: { x: 722, y: 504, top: 568.2, end: 758.8, stroke: 1.5, head: 5, depth: 5 },
            pill: { padX: 10, height: 24 },
            labels: [
                { text: '+80 nm', x: 722, y: 535.1, ax: 1, ay: 0.5, dx: -14, dy: 0 },
                { text: '+45 °C', x: 740.3, y: 504, ax: 0.5, ay: 0, dx: 0, dy: 14 }
            ]
        },
        compact: {
            top: 42,
            bottom: 250,
            left: 43.36,
            right: 15.7,
            gridLeft: 34,
            gridRight: 4,
            floor: 420,
            ceiling: 581,
            pad: 34,
            labelX: 26,
            labelOffset: 27,
            titleY: 21,
            xTicks: [700, 730, 760],
            yTicks: [420, 500, 580],
            unit: ' °C',
            marker: 8,
            stroke: 2,
            dashed: { stroke: 1, pattern: '2 4' },
            arrows: { x: 717.85, y: 500, top: 578.5, end: 764.5, stroke: 1, head: 4, depth: 5 },
            pill: { padX: 6, height: 18 },
            labels: [
                { text: '+80 nm', x: 717.85, y: 578.5, ax: 0.5, ay: 1, dx: 0, dy: -8 },
                { text: '+45 °C', x: 'end', y: 500, ax: 1, ay: 0, dx: 0, dy: 6 }
            ]
        }
    };

    const COMPACT_BELOW = 560;
    const GRADIENT_END = 0.75;
    const POINT_STAGGER = 0.03;

    const script = () => {
        els.forEach((self, index) => {
            handleChart(self, index);
        });
    };

    const handleChart = (self, index) => {
        const mount = self.querySelector('.cc-chart');
        if (!mount) return;

        const id = `cc-${index}`;
        let played = false;
        let timeline = null;
        let width = 0;

        const draw = () => {
            width = mount.clientWidth;
            const layout = width < COMPACT_BELOW ? LAYOUT.compact : LAYOUT.wide;

            mount.classList.toggle('is-compact', layout === LAYOUT.compact);
            mount.innerHTML = chartHTML(id, width, layout);
            fitPills(mount, layout);
            if (!played) setHidden(mount);
        };

        new ResizeObserver(() => {
            if (Math.abs(mount.clientWidth - width) < 1) return;

            timeline?.progress(1).kill();
            draw();
        }).observe(mount);

        draw();

        ScrollTrigger.create({
            trigger: mount,
            start: baunfire.anim.start,
            once: true,
            onEnter: () => {
                played = true;
                timeline = buildTimeline(mount);
            }
        });
    };

    const chartHTML = (id, width, layout) => {
        const scale = createScale(width, layout);
        const floorY = scale.y(layout.floor);
        const height = round(floorY + layout.pad);

        return `
            <svg class="cc-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Peak wavelength versus growth temperature">
                <defs>${SERIES.map((series, i) => defsHTML(id, i, series, scale, height)).join('')}</defs>
                ${gridHTML(scale, floorY, layout)}
                <g class="cc-areas">${SERIES.map((series, i) => areaHTML(id, i, series, scale, floorY, layout)).join('')}</g>
                <g class="cc-lines">${DRAW_ORDER.map(i => lineHTML(id, i, SERIES[i], scale, layout)).join('')}</g>
                <g class="cc-markers">${DRAW_ORDER.map(i => markersHTML(SERIES[i], scale, layout.marker)).join('')}</g>
                ${annotationHTML(scale, layout)}
            </svg>
        `;
    };

    const defsHTML = (id, i, series, scale, height) => `
        <linearGradient id="${id}-fill-${i}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style="stop-color: ${series.color}; stop-opacity: ${series.fill}" />
            <stop offset="${GRADIENT_END}" style="stop-color: ${series.color}; stop-opacity: 0" />
        </linearGradient>
        <clipPath id="${id}-clip-${i}">
            <rect class="cc-clip" x="0" y="0" width="${scale.plotRight + 20}" height="${height}" />
        </clipPath>
    `;

    const gridHTML = (scale, floorY, layout) => `
        <g class="cc-grid">
            ${layout.yTicks.map(tick => `
                <line x1="${layout.gridLeft}" x2="${scale.gridRight}" y1="${scale.y(tick)}" y2="${scale.y(tick)}" />
                <text class="cc-tick" x="${layout.labelX}" y="${scale.y(tick)}" text-anchor="end" dominant-baseline="middle">${tick}</text>
            `).join('')}
            ${layout.xTicks.map(tick => `
                <text class="cc-tick" x="${scale.x(tick)}" y="${round(floorY + layout.labelOffset)}" text-anchor="middle" dominant-baseline="middle">${tick}${layout.unit}</text>
            `).join('')}
            <text class="cc-tick" x="${layout.labelX}" y="${layout.titleY}" text-anchor="end" dominant-baseline="middle">${Y_AXIS.title}</text>
        </g>
    `;

    const areaHTML = (id, i, series, scale, floorY, layout) => {
        const [from, to] = visibleRange(series, layout);
        const points = [
            [scale.x(from), scale.y(fitValue(series, from))],
            [scale.x(to), scale.y(fitValue(series, to))],
            [scale.x(to), floorY],
            [scale.x(from), floorY]
        ];

        return `<polygon class="cc-area" points="${points.map(point => point.join(',')).join(' ')}" fill="url(#${id}-fill-${i})" />`;
    };

    const lineHTML = (id, i, series, scale, layout) => {
        const [[start], [end]] = series.fit;
        const [from, to] = visibleRange(series, layout);
        const { dashed } = layout;

        const segment = (a, b, dash) => `
            <line x1="${scale.x(a)}" y1="${scale.y(fitValue(series, a))}" x2="${scale.x(b)}" y2="${scale.y(fitValue(series, b))}" stroke-width="${dash ? dash.stroke : layout.stroke}" style="stroke: ${series.color}"${dash ? ` stroke-dasharray="${dash.pattern}"` : ''} />
        `;

        return `
            <g class="cc-line" clip-path="url(#${id}-clip-${i})">
                ${dashed && from < start ? segment(from, start, dashed) : ''}
                ${segment(start, end, null)}
                ${dashed && to > end ? segment(end, to, dashed) : ''}
            </g>
        `;
    };

    const markersHTML = (series, scale, size) => series.points.map(([temp, nm]) => `
        <polygon class="cc-marker" data-x="${scale.x(temp)}" points="${hexPoints(scale.x(temp), scale.y(nm), size)}" style="fill: ${series.color}" />
    `).join('');

    const annotationHTML = (scale, layout) => {
        const { arrows, pill } = layout;
        const x = scale.x(arrows.x);
        const y = scale.y(arrows.y);
        const top = scale.y(arrows.top);
        const end = scale.x(arrows.end);
        const { head, depth } = arrows;

        return `
            <g class="cc-bracket">
                <path class="cc-bracket-line" d="M${x} ${y}V${top}M${x - head} ${top + depth}L${x} ${top}L${x + head} ${top + depth}M${x} ${y}H${end}M${end - depth} ${y - head}L${end} ${y}L${end - depth} ${y + head}" stroke-width="${arrows.stroke}" />
                ${layout.labels.map(label => pillHTML(label, scale, pill)).join('')}
            </g>
        `;
    };

    const pillHTML = (label, scale, pill) => {
        const x = (label.x === 'end' ? scale.gridRight : scale.x(label.x)) + label.dx;
        const y = scale.y(label.y) + label.dy;

        return `
            <g class="cc-pill" data-x="${x}" data-y="${y}" data-ax="${label.ax}" data-ay="${label.ay}">
                <rect x="${x}" y="${y}" width="0" height="${pill.height}" rx="${pill.height / 2}" />
                <text x="${x}" y="${y}" dominant-baseline="middle">${label.text}</text>
            </g>
        `;
    };

    const fitPills = (mount, layout) => {
        const { padX, height } = layout.pill;

        mount.querySelectorAll('.cc-pill').forEach(pill => {
            const rect = pill.querySelector('rect');
            const text = pill.querySelector('text');
            const width = round(text.getBBox().width + padX * 2);
            const left = round(Number(pill.dataset.x) - Number(pill.dataset.ax) * width);
            const top = round(Number(pill.dataset.y) - Number(pill.dataset.ay) * height);

            rect.setAttribute('x', left);
            rect.setAttribute('y', top);
            rect.setAttribute('width', width);
            text.setAttribute('x', round(left + padX));
            text.setAttribute('y', round(top + height / 2));
        });
    };

    const setHidden = (mount) => {
        gsap.set(mount.querySelectorAll('.cc-grid, .cc-area, .cc-bracket'), { opacity: 0 });
        gsap.set(mount.querySelectorAll('.cc-clip'), { attr: { width: 0 } });
        gsap.set(mount.querySelectorAll('.cc-marker'), { scale: 0, transformOrigin: '50% 50%' });
    };

    const buildTimeline = (mount) => {
        const clips = [...mount.querySelectorAll('.cc-clip')];
        const markers = [...mount.querySelectorAll('.cc-marker')].sort((a, b) => a.dataset.x - b.dataset.x);
        const fullWidth = Number(mount.querySelector('.cc-svg').getAttribute('width')) + 20;

        return gsap.timeline()
            .to(mount.querySelector('.cc-grid'), { opacity: 1, duration: 0.2, ease: 'none' })
            .to(clips, { attr: { width: fullWidth }, duration: 0.9, ease: 'power2.inOut', stagger: 0.15 })
            .to(mount.querySelectorAll('.cc-area'), { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.2')
            .to(markers, { scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: POINT_STAGGER }, '-=0.1')
            .to(mount.querySelector('.cc-bracket'), { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.2');
    };

    const createScale = (width, layout) => {
        const plotRight = width - layout.right;

        return {
            plotRight,
            gridRight: round(width - layout.gridRight),
            x: (temp) => round(layout.left + (temp - X_AXIS.min) / (X_AXIS.max - X_AXIS.min) * (plotRight - layout.left)),
            y: (nm) => round(layout.top + (Y_AXIS.max - nm) / (Y_AXIS.max - Y_AXIS.min) * (layout.bottom - layout.top))
        };
    };

    const visibleRange = (series, layout) => {
        const [from, to] = series.range;
        if (!layout.ceiling) return [from, to];

        const [[t1, nm1], [t2, nm2]] = series.fit;
        const slope = (nm2 - nm1) / (t2 - t1);
        const atCeiling = t1 + (layout.ceiling - nm1) / slope;

        return [slope < 0 ? Math.max(from, atCeiling) : from, to];
    };

    const fitValue = (series, temp) => {
        const [[t1, nm1], [t2, nm2]] = series.fit;
        return nm1 + (nm2 - nm1) / (t2 - t1) * (temp - t1);
    };

    const hexPoints = (cx, cy, size) => {
        const r = size / 2;
        const h = r * Math.sqrt(3) / 2;

        return [
            [cx - r, cy], [cx - r / 2, cy - h], [cx + r / 2, cy - h],
            [cx + r, cy], [cx + r / 2, cy + h], [cx - r / 2, cy + h]
        ].map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
    };

    const round = (value) => Math.round(value * 100) / 100;

    script();
});
