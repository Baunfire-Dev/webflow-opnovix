import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.proof-outcomes', (els) => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    const X_AXIS = {
        min: 700,
        max: 765,
        title: 'Growth temp (°C)'
    };

    const Y_AXIS = {
        min: 420,
        max: 580,
        floor: 410,
        title: 'nm'
    };

    const SERIES = [
        {
            label: 'GaN (control)',
            short: 'GaN',
            color: '#96877A',
            stroke: 2,
            marker: 9,
            fill: 0.14,
            measured: [[718, 502], [763, 427.2]],
            fit: [700, 763]
        },
        {
            label: '~8% Native InGaN®*',
            short: '~8%*',
            color: 'var(--_palette---brand--amber)',
            stroke: 2,
            marker: 9,
            fill: 0.08,
            measured: [[700, 580.4], [763, 467.9]],
            fit: [700, 763]
        },
        {
            label: '~13% Native InGaN®*',
            short: '~13% Native InGaN®*',
            color: 'var(--_palette---brand--coral)',
            stroke: 2.5,
            marker: 11,
            fill: 0.12,
            measured: [[725, 568.1], [760, 508.5]],
            fit: [712.2, 763]
        }
    ];

    const BRACKET_LABEL = '~80 nm';

    const LAYOUT = {
        wide: {
            top: 41.56,
            bottom: 322.44,
            left: 40,
            gridLeft: 40,
            right: 230,
            xTicks: [700, 720, 740, 760],
            yTicks: [420, 460, 500, 540, 580],
            unit: '',
            titles: true,
            labelOffset: 17,
            pad: 40,
            marker: null,
            bracket: { from: 507.4, to: 420.8, labelAt: 467, gap: 28, pillGap: 24, stroke: 1, arrows: true },
            pill: { padX: 10, height: 22 }
        },
        compact: {
            top: 18.78,
            bottom: 191.22,
            left: 37.55,
            gridLeft: 30,
            right: 4,
            xTicks: [700, 730, 760],
            yTicks: [420, 500, 580],
            unit: '°',
            titles: false,
            labelOffset: 17,
            pad: 28,
            marker: 8,
            bracket: { at: 740, from: 538, to: 470, labelAt: 504, pillGap: 8, stroke: 1.5, arrows: false },
            pill: { padX: 8, height: 20 }
        }
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
        drop: 12,
        compact: { below: 400, width: 200, pad: 8 }
    };

    const WAFER_CAPTION = 'Relaxed Native InGaN® on substrate';

    const WAFER_LABELS = [
        { text: 'Relaxed Native InGaN®', lines: ['Relaxed Native', 'InGaN®'], y: 16.5, dot: [192.8, 114.6], onLayer: true },
        { text: 'Substrate', lines: ['Substrate'], y: 254.6, dot: [159.8, 202.9], onLayer: false }
    ];

    const LEADER = { gap: 8, run: 26.6, elbow: 6, clearance: 12, dot: 2.5, lineHeight: 14 };

    const FOOTNOTE = 'Photoluminescence from matched quantum-well growths on GaN vs. Native InGaN® templates. *Approximate InN mole fractions, shown for reference.';

    const ATTRIBUTES = ['MOCVD grown', 'Several microns thick', 'Smooth & pit-free', 'Substrate-flexible'];

    const ATTRIBUTE_ICON = { width: 12, color: 'var(--_palette---brand--coral)' };

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
                mount.innerHTML = isCompact
                    ? legendHTML(isCompact) + chartHTML(id, width, layout) + footnoteHTML()
                    : chartHTML(id, width, layout) + legendHTML(isCompact) + footnoteHTML();
                fitPill(mount, layout);
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
                const isCompact = width < WAFER.compact.below;

                mount.classList.toggle('is-compact', isCompact);
                mount.innerHTML = waferHTML(id, width, isCompact) + attributesHTML();
                if (!isCompact) placeLeaders(mount, width);
            },
            hide: setWaferHidden,
            animate: buildWaferTimeline
        });
    };

    const createGraphic = (mount, { render, hide, animate }) => {
        let played = !gsap || !ScrollTrigger;
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
        const height = floorY + layout.pad;

        return `
            <svg class="po-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Peak wavelength versus growth temperature">
                <defs>${SERIES.map((series, i) => defsHTML(id, i, series, scale, height)).join('')}</defs>
                ${gridHTML(scale, floorY, layout)}
                <g class="po-areas">${SERIES.map((series, i) => areaHTML(id, i, series, scale, floorY)).join('')}</g>
                <g class="po-lines">${SERIES.map((series, i) => lineHTML(id, i, series, scale)).join('')}</g>
                <g class="po-markers">${SERIES.map(series => markersHTML(series, scale, layout.marker || series.marker)).join('')}</g>
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

    const gridHTML = (scale, floorY, layout) => `
        <g class="po-grid">
            ${layout.yTicks.map(tick => `
                <line x1="${layout.gridLeft}" x2="${scale.plotRight}" y1="${scale.y(tick)}" y2="${scale.y(tick)}" />
                <text class="po-tick g-caption" x="${layout.gridLeft - 8}" y="${scale.y(tick)}" text-anchor="end" dominant-baseline="middle">${tick}</text>
            `).join('')}
            ${layout.xTicks.map(tick => `
                <text class="po-tick g-caption" x="${scale.x(tick)}" y="${floorY + layout.labelOffset}" text-anchor="middle" dominant-baseline="middle">${tick}${layout.unit}</text>
            `).join('')}
            ${layout.titles ? `
                <text class="g-caption" x="${layout.gridLeft - 8}" y="7" text-anchor="end" dominant-baseline="middle">${Y_AXIS.title}</text>
                <text class="g-caption" x="${(layout.gridLeft + scale.plotRight) / 2}" y="${floorY + layout.labelOffset * 2 + 1}" text-anchor="middle" dominant-baseline="middle">${X_AXIS.title}</text>
            ` : ''}
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

    const markersHTML = (series, scale, size) => series.measured.map(([temp]) => `
        <polygon class="po-marker" points="${hexPoints(scale.x(temp), scale.y(fitValue(series, temp)), size)}" style="fill: ${series.color}" />
    `).join('');

    const bracketHTML = (scale, layout) => {
        const { bracket, pill } = layout;
        const x = bracket.at ? scale.x(bracket.at) : scale.plotRight + bracket.gap;
        const top = scale.y(bracket.from);
        const bottom = scale.y(bracket.to);
        const pillY = scale.y(bracket.labelAt);
        const pillX = x + bracket.pillGap;
        const arrows = bracket.arrows ? `M${x - 4} ${top + 5}L${x} ${top}L${x + 4} ${top + 5}M${x - 4} ${bottom - 5}L${x} ${bottom}L${x + 4} ${bottom - 5}` : '';

        return `
            <g class="po-bracket">
                <path class="po-bracket-line" d="M${x} ${top}V${bottom}${arrows}" stroke-width="${bracket.stroke}" />
                <g class="po-pill">
                    <rect x="${pillX}" y="${pillY - pill.height / 2}" width="66" height="${pill.height}" rx="${pill.height / 2}" />
                    <text class="g-caption" x="${pillX + pill.padX}" y="${pillY}" dominant-baseline="middle">${BRACKET_LABEL}</text>
                </g>
            </g>
        `;
    };

    const legendHTML = (isCompact) => `
        <ul class="po-legend">
            ${[...SERIES].reverse().map(series => `
                <li class="po-legend-item">
                    ${isCompact
                        ? `<span class="po-legend-line" style="background: ${series.color}"></span>`
                        : `<svg class="po-legend-marker" width="9" height="8" viewBox="0 0 9 8" aria-hidden="true">
                            <polygon points="${hexPoints(4.5, 4, 9)}" style="fill: ${series.color}" />
                        </svg>`}
                    <span class="g-caption">${isCompact ? series.short : series.label}</span>
                </li>
            `).join('')}
        </ul>
    `;

    const footnoteHTML = () => `<p class="po-footnote g-caption">${FOOTNOTE}</p>`;

    const attributesHTML = () => {
        const { width, color } = ATTRIBUTE_ICON;
        const height = round(width * Math.sqrt(3) / 2);

        return `
            <ul class="po-attributes">
                ${ATTRIBUTES.map(text => `
                    <li class="po-attribute">
                        <svg class="po-attribute-icon" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
                            <polygon points="${hexPoints(width / 2, height / 2, width)}" style="fill: ${color}" />
                        </svg>
                        <span class="g-caption">${text.replace('&', '&amp;')}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    };

    const fitPill = (mount, layout) => {
        const rect = mount.querySelector('.po-pill rect');
        const text = mount.querySelector('.po-pill text');
        if (!rect || !text) return;

        rect.setAttribute('width', text.getBBox().width + layout.pill.padX * 2);
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
            .to(mount.querySelector('.po-grid'), { opacity: 1, duration: 0.15, ease: 'none' }, 0)
            .to(clips, { attr: { width: fullWidth }, duration: 0.675, ease: 'power2.inOut', stagger: 0.1125 }, 0)
            .to(mount.querySelectorAll('.po-area'), { opacity: 1, duration: 0.3, ease: 'power1.out' }, '-=0.15')
            .to(mount.querySelectorAll('.po-marker'), { scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.0375 }, '-=0.15')
            .to(mount.querySelector('.po-bracket'), { opacity: 1, duration: 0.3, ease: 'power1.out' }, '<');
    };

    const waferFrame = (width, isCompact) => {
        const { disc, substrate, layer, compact } = WAFER;

        if (!isCompact) {
            const scale = Math.min(1, width / WAFER.width);
            return { scale, x: width - WAFER.width * scale, y: 0, height: WAFER.height * scale };
        }

        const scale = compact.width / (disc.rx * 2);
        const top = layer.cy - disc.ry;
        const bottom = substrate.cy + substrate.depth + disc.ry;

        return {
            scale,
            x: (width - compact.width) / 2 - disc.x * scale,
            y: compact.pad - top * scale,
            height: (bottom - top) * scale + compact.pad * 2
        };
    };

    const waferHTML = (id, width, isCompact) => {
        const { disc, substrate, layer } = WAFER;
        const frame = waferFrame(width, isCompact);
        const { scale, height } = frame;
        const [from, mid, to] = layer.gradient;

        const disc3d = (cy, depth, top, side, rim = 'none') => `
            <ellipse cx="${disc.x + disc.rx}" cy="${cy + depth}" rx="${disc.rx}" ry="${disc.ry}" style="fill: ${side}" />
            <rect x="${disc.x}" y="${cy}" width="${disc.rx * 2}" height="${depth}" style="fill: ${side}" />
            <ellipse cx="${disc.x + disc.rx}" cy="${cy}" rx="${disc.rx}" ry="${disc.ry}" style="fill: ${top}; stroke: ${rim}" />
        `;

        const dotHTML = (label) => isCompact ? '' : `<circle class="po-wafer-dot" cx="${label.dot[0]}" cy="${label.dot[1]}" r="${LEADER.dot}" />`;

        const labelsHTML = () => WAFER_LABELS.map((label, i) => `
            <g class="po-wafer-label${label.onLayer ? ' is-layer' : ''}" data-index="${i}">
                <text class="g-caption" x="0" y="${round(label.y * scale)}" dominant-baseline="middle">${label.text}</text>
                <path class="po-wafer-leader" d="" />
            </g>
        `).join('');

        return `
            <div class="po-wafer-figure">
                <svg class="po-wafer-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Relaxed Native InGaN layer on a substrate">
                    <defs>
                        <linearGradient id="${id}-layer" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" style="stop-color: ${from}" />
                            <stop offset="0.55" style="stop-color: ${mid}" />
                            <stop offset="1" style="stop-color: ${to}" />
                        </linearGradient>
                    </defs>
                    <g transform="translate(${round(frame.x)} ${round(frame.y)}) scale(${round(scale * 1000) / 1000})">
                        <g class="po-wafer-substrate">
                            ${disc3d(substrate.cy, substrate.depth, substrate.top, substrate.side)}
                            ${WAFER_LABELS.filter(label => !label.onLayer).map(dotHTML).join('')}
                        </g>
                        <g class="po-wafer-layer">
                            ${disc3d(layer.cy, layer.depth, `url(#${id}-layer)`, layer.body, layer.rim)}
                            ${WAFER_LABELS.filter(label => label.onLayer).map(dotHTML).join('')}
                        </g>
                    </g>
                    ${isCompact ? '' : labelsHTML()}
                </svg>
                ${isCompact ? `<p class="po-wafer-caption g-caption">${WAFER_CAPTION}</p>` : ''}
            </div>
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
        gsap.set(mount.querySelectorAll('.po-wafer-label.is-layer'), { opacity: 0 });
    };

    const buildWaferTimeline = (mount) => gsap.timeline()
        .to(mount.querySelector('.po-wafer-layer'), { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
        .to(mount.querySelectorAll('.po-wafer-label.is-layer'), { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.2');

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
