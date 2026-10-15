import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.proof-outcomes', (els) => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    const X_AXIS = {
        min: 700,
        max: 765,
        ticks: [700, 720, 740, 760],
        title: 'Growth temp (°C)'
    };

    const Y_AXIS = {
        min: 420,
        max: 580,
        floor: 410,
        ticks: [420, 460, 500, 540, 580],
        title: 'nm'
    };

    const SERIES = [
        {
            label: 'GaN (control)',
            color: '#96877A',
            stroke: 2,
            marker: 9,
            fill: 0.14,
            measured: [[718, 502], [763, 427.2]],
            fit: [700, 763]
        },
        {
            label: '~8% Native InGaN®*',
            color: 'var(--_palette---brand--amber)',
            stroke: 2,
            marker: 9,
            fill: 0.08,
            measured: [[700, 580.4], [763, 467.9]],
            fit: [700, 763]
        },
        {
            label: '~13% Native InGaN®*',
            color: 'var(--_palette---brand--coral)',
            stroke: 2.5,
            marker: 11,
            fill: 0.12,
            measured: [[725, 568.1], [760, 508.5]],
            fit: [712.2, 763]
        }
    ];

    const BRACKET = {
        from: 507.4,
        to: 420.8,
        labelAt: 467,
        label: '~80 nm'
    };

    const LAYOUT = {
        wide: { top: 41.56, bottom: 322.44, left: 40, right: 230, bracketGap: 28, pillGap: 24 },
        compact: { top: 41.56, bottom: 282, left: 40, right: 96, bracketGap: 14, pillGap: 10 }
    };

    const WAFER = {
        width: 470,
        height: 300,
        disc: { x: 140, rx: 165, ry: 44 },
        substrate: { cy: 176.9, depth: 13.2, top: 'var(--_palette---neutral--stone)', side: 'var(--_palette---brand--plum)' },
        layer: {
            cy: 121.9,
            depth: 19.8,
            body: 'color-mix(in srgb, var(--_palette---brand--coral) 35%, transparent)',
            rim: 'var(--_palette---brand--coral)',
            gradient: ['var(--_palette---brand--peach)', 'color-mix(in srgb, var(--_palette---brand--coral) 85%, white)', 'color-mix(in srgb, var(--_palette---brand--coral) 70%, white)']
        },
        drop: 12
    };

    const WAFER_LABELS = [
        { text: 'Relaxed Native InGaN®', lines: ['Relaxed Native', 'InGaN®'], y: 16.5, dot: [192.8, 114.6], onLayer: true },
        { text: 'Substrate', lines: ['Substrate'], y: 254.6, dot: [159.8, 202.9], onLayer: false }
    ];

    const LEADER = { gap: 8, run: 26.6, elbow: 6, clearance: 12, dot: 2.5, lineHeight: 14 };

    const COMPACT_BELOW = 640;
    const DASH = '4 3';
    const IN_VIEW = 'top 60%';

    const script = () => {
        els.forEach((self, index) => {
            handleChart(self, index);
            handleWafer(self, index);
        });
    };

    const handleChart = (self, index) => {
        const mount = self.querySelector('.po-chart');
        if (!mount) return;

        const id = `po-${index}`;

        createGraphic(mount, {
            render: (width) => {
                const isCompact = width < COMPACT_BELOW;
                const layout = isCompact ? LAYOUT.compact : LAYOUT.wide;

                mount.classList.toggle('is-compact', isCompact);
                mount.innerHTML = chartHTML(id, width, layout) + legendHTML();
                fitPill(mount);
            },
            hide: setHidden,
            animate: buildTimeline
        });
    };

    const handleWafer = (self, index) => {
        const mount = self.querySelector('.po-wafer');
        if (!mount) return;

        const id = `po-wafer-${index}`;

        createGraphic(mount, {
            render: (width) => {
                mount.innerHTML = waferHTML(id, width);
                placeLeaders(mount, width);
            },
            hide: setWaferHidden,
            animate: buildWaferTimeline
        });
    };

    const createGraphic = (mount, { render, hide, animate }) => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let played = !gsap || !ScrollTrigger || reduce;
        let timeline = null;
        let width = 0;

        const draw = () => {
            width = mount.clientWidth;
            render(width);
            if (!played) hide(mount);
        };

        new ResizeObserver(() => {
            if (Math.abs(mount.clientWidth - width) < 1) return;

            timeline?.progress(1).kill();
            draw();
        }).observe(mount);

        draw();

        if (played) return;

        ScrollTrigger.create({
            trigger: mount,
            start: IN_VIEW,
            once: true,
            onEnter: () => {
                played = true;
                timeline = animate(mount);
            }
        });
    };

    const chartHTML = (id, width, layout) => {
        const scale = createScale(width, layout);
        const floorY = scale.y(Y_AXIS.floor);
        const height = floorY + 40;

        return `
            <svg class="po-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Peak wavelength versus growth temperature">
                <defs>${SERIES.map((series, i) => defsHTML(id, i, series, scale, height)).join('')}</defs>
                ${gridHTML(scale, floorY)}
                <g class="po-areas">${SERIES.map((series, i) => areaHTML(id, i, series, scale, floorY)).join('')}</g>
                <g class="po-lines">${SERIES.map((series, i) => lineHTML(id, i, series, scale)).join('')}</g>
                <g class="po-markers">${SERIES.map(series => markersHTML(series, scale)).join('')}</g>
                ${bracketHTML(scale, layout)}
            </svg>
        `;
    };

    const defsHTML = (id, i, series, scale, height) => `
        <linearGradient id="${id}-fill-${i}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style="stop-color: ${series.color}; stop-opacity: ${series.fill}" />
            <stop offset="1" style="stop-color: ${series.color}; stop-opacity: 0" />
        </linearGradient>
        <clipPath id="${id}-clip-${i}">
            <rect class="po-clip" x="0" y="0" width="${scale.plotRight + 20}" height="${height}" />
        </clipPath>
    `;

    const gridHTML = (scale, floorY) => `
        <g class="po-grid">
            ${Y_AXIS.ticks.map(tick => `
                <line x1="${scale.left}" x2="${scale.plotRight}" y1="${scale.y(tick)}" y2="${scale.y(tick)}" />
                <text class="g-caption" x="${scale.left - 8}" y="${scale.y(tick)}" text-anchor="end" dominant-baseline="middle">${tick}</text>
            `).join('')}
            <text class="g-caption" x="${scale.left - 8}" y="7" text-anchor="end" dominant-baseline="middle">${Y_AXIS.title}</text>
            ${X_AXIS.ticks.map(tick => `
                <text class="g-caption" x="${scale.x(tick)}" y="${floorY + 17}" text-anchor="middle" dominant-baseline="middle">${tick}</text>
            `).join('')}
            <text class="g-caption" x="${(scale.left + scale.plotRight) / 2}" y="${floorY + 35}" text-anchor="middle" dominant-baseline="middle">${X_AXIS.title}</text>
        </g>
    `;

    const areaHTML = (id, i, series, scale, floorY) => {
        const [from, to] = series.fit;
        const points = [
            [scale.x(from), scale.y(fitValue(series, from))],
            [scale.x(to), scale.y(fitValue(series, to))],
            [scale.x(to), floorY],
            [scale.x(from), floorY]
        ];

        return `<polygon class="po-area" points="${points.map(point => point.join(',')).join(' ')}" fill="url(#${id}-fill-${i})" />`;
    };

    const lineHTML = (id, i, series, scale) => {
        const [[start], [end]] = series.measured;
        const [from, to] = series.fit;

        const segment = (a, b, dashed) => `
            <line x1="${scale.x(a)}" y1="${scale.y(fitValue(series, a))}" x2="${scale.x(b)}" y2="${scale.y(fitValue(series, b))}" stroke-width="${series.stroke}" style="stroke: ${series.color}"${dashed ? ` stroke-dasharray="${DASH}"` : ''} />
        `;

        return `
            <g class="po-line" clip-path="url(#${id}-clip-${i})">
                ${from < start ? segment(from, start, true) : ''}
                ${segment(start, end, false)}
                ${to > end ? segment(end, to, true) : ''}
            </g>
        `;
    };

    const markersHTML = (series, scale) => series.measured.map(([temp, nm]) => `
        <polygon class="po-marker" points="${hexPoints(scale.x(temp), scale.y(fitValue(series, temp)), series.marker)}" style="fill: ${series.color}" />
    `).join('');

    const bracketHTML = (scale, layout) => {
        const x = scale.plotRight + layout.bracketGap;
        const top = scale.y(BRACKET.from);
        const bottom = scale.y(BRACKET.to);
        const pillY = scale.y(BRACKET.labelAt);
        const pillX = x + layout.pillGap;

        return `
            <g class="po-bracket">
                <path class="po-bracket-line" d="M${x} ${top}V${bottom}M${x - 4} ${top + 5}L${x} ${top}L${x + 4} ${top + 5}M${x - 4} ${bottom - 5}L${x} ${bottom}L${x + 4} ${bottom - 5}" />
                <g class="po-pill">
                    <rect x="${pillX}" y="${pillY - 11}" width="66" height="22" rx="11" />
                    <text class="g-caption" x="${pillX + 10}" y="${pillY}" dominant-baseline="middle">${BRACKET.label}</text>
                </g>
            </g>
        `;
    };

    const legendHTML = () => `
        <ul class="po-legend">
            ${[...SERIES].reverse().map(series => `
                <li class="po-legend-item">
                    <svg class="po-legend-marker" width="9" height="8" viewBox="0 0 9 8" aria-hidden="true">
                        <polygon points="${hexPoints(4.5, 4, 9)}" style="fill: ${series.color}" />
                    </svg>
                    <span class="g-caption">${series.label}</span>
                </li>
            `).join('')}
        </ul>
    `;

    const fitPill = (mount) => {
        const rect = mount.querySelector('.po-pill rect');
        const text = mount.querySelector('.po-pill text');
        if (!rect || !text) return;

        rect.setAttribute('width', text.getBBox().width + 20);
    };

    const setHidden = (mount) => {
        gsap.set(mount.querySelectorAll('.po-grid, .po-area, .po-bracket'), { opacity: 0 });
        gsap.set(mount.querySelectorAll('.po-clip'), { attr: { width: 0 } });
        gsap.set(mount.querySelectorAll('.po-marker'), { scale: 0, transformOrigin: '50% 50%' });
    };

    const buildTimeline = (mount) => {
        const clips = [...mount.querySelectorAll('.po-clip')];
        const fullWidth = Number(mount.querySelector('.po-svg').getAttribute('width')) + 20;

        return gsap.timeline()
            .to(mount.querySelector('.po-grid'), { opacity: 1, duration: 0.2, ease: 'none' })
            .to(clips, { attr: { width: fullWidth }, duration: 0.9, ease: 'power2.inOut', stagger: 0.15 })
            .to(mount.querySelectorAll('.po-area'), { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.2')
            .to(mount.querySelectorAll('.po-marker'), { scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.05 }, '-=0.2')
            .to(mount.querySelector('.po-bracket'), { opacity: 1, duration: 0.4, ease: 'power1.out' });
    };

    const waferHTML = (id, width) => {
        const { disc, substrate, layer } = WAFER;
        const scale = Math.min(1, width / WAFER.width);
        const offset = width - WAFER.width * scale;
        const height = WAFER.height * scale;
        const [from, mid, to] = layer.gradient;

        const disc3d = (cy, depth, top, side, rim = 'none') => `
            <ellipse cx="${disc.x + disc.rx}" cy="${cy + depth}" rx="${disc.rx}" ry="${disc.ry}" style="fill: ${side}" />
            <rect x="${disc.x}" y="${cy}" width="${disc.rx * 2}" height="${depth}" style="fill: ${side}" />
            <ellipse cx="${disc.x + disc.rx}" cy="${cy}" rx="${disc.rx}" ry="${disc.ry}" style="fill: ${top}; stroke: ${rim}" />
        `;

        const dotHTML = (label) => `<circle class="po-wafer-dot" cx="${label.dot[0]}" cy="${label.dot[1]}" r="${LEADER.dot}" />`;

        return `
            <svg class="po-wafer-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Relaxed Native InGaN layer on a substrate">
                <defs>
                    <linearGradient id="${id}-layer" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" style="stop-color: ${from}" />
                        <stop offset="0.55" style="stop-color: ${mid}" />
                        <stop offset="1" style="stop-color: ${to}" />
                    </linearGradient>
                </defs>
                <g transform="translate(${round(offset)} 0) scale(${round(scale * 1000) / 1000})">
                    <g class="po-wafer-substrate">
                        ${disc3d(substrate.cy, substrate.depth, substrate.top, substrate.side)}
                        ${WAFER_LABELS.filter(label => !label.onLayer).map(dotHTML).join('')}
                    </g>
                    <g class="po-wafer-layer">
                        ${disc3d(layer.cy, layer.depth, `url(#${id}-layer)`, layer.body, layer.rim)}
                        ${WAFER_LABELS.filter(label => label.onLayer).map(dotHTML).join('')}
                    </g>
                </g>
                ${WAFER_LABELS.map((label, i) => `
                    <g class="po-wafer-label${label.onLayer ? ' is-layer' : ''}" data-index="${i}">
                        <text class="g-caption" x="0" y="${round(label.y * scale)}" dominant-baseline="middle">${label.text}</text>
                        <path class="po-wafer-leader" d="" />
                    </g>
                `).join('')}
            </svg>
        `;
    };

    const placeLeaders = (mount, width) => {
        const scale = Math.min(1, width / WAFER.width);
        const offset = width - WAFER.width * scale;

        mount.querySelectorAll('.po-wafer-label').forEach(group => {
            const label = WAFER_LABELS[Number(group.dataset.index)];
            const text = group.querySelector('text');
            const dotX = offset + label.dot[0] * scale;
            const dotY = label.dot[1] * scale;
            const y = label.y * scale;

            let end = text.getComputedTextLength();
            let leaderY = y;

            if (end + LEADER.gap > dotX - LEADER.clearance && label.lines.length > 1) {
                text.innerHTML = label.lines.map((line, i) => `<tspan x="0" dy="${i ? LEADER.lineHeight : 0}">${line}</tspan>`).join('');
                end = Math.max(...[...text.querySelectorAll('tspan')].map(line => line.getComputedTextLength()));
                leaderY = y + LEADER.lineHeight * (label.lines.length - 1);
            }

            const start = end + LEADER.gap;
            const kink = Math.max(start + LEADER.elbow, dotX - LEADER.run * scale);

            group.querySelector('path').setAttribute('d', `M${round(start)} ${round(leaderY)}H${round(kink)}L${round(dotX)} ${round(dotY)}`);
        });
    };

    const setWaferHidden = (mount) => {
        gsap.set(mount.querySelector('.po-wafer-layer'), { y: -WAFER.drop, opacity: 0 });
        gsap.set(mount.querySelector('.po-wafer-label.is-layer'), { opacity: 0 });
    };

    const buildWaferTimeline = (mount) => gsap.timeline()
        .to(mount.querySelector('.po-wafer-layer'), { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
        .to(mount.querySelector('.po-wafer-label.is-layer'), { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.2');

    const createScale = (width, layout) => {
        const plotRight = width - layout.right;

        return {
            left: layout.left,
            plotRight,
            x: (temp) => round(layout.left + (temp - X_AXIS.min) / (X_AXIS.max - X_AXIS.min) * (plotRight - layout.left)),
            y: (nm) => round(layout.top + (Y_AXIS.max - nm) / (Y_AXIS.max - Y_AXIS.min) * (layout.bottom - layout.top))
        };
    };

    const fitValue = (series, temp) => {
        const [[t1, nm1], [t2, nm2]] = series.measured;
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
