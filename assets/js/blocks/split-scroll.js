import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.split-scroll', (els, baunfire) => {
    const STEP = 0.6;
    const STEP_MOBILE = 0.35;
    const HOLD = 0.2;
    const BLOOM = {
        duration: 1.2,
        ease: 'expo-out',
        fadeDuration: 0.6,
        spread: 0.8,
        jitter: 0.12,
        sizeLag: 0.12,
        reverseSpeed: 1.6,
        seed: 2026
    };

    const script = () => {
        els.forEach(self => handlePanels(self));
    };

    const getOpacities = (progress, total) => {
        const scaled = Math.min(progress, 0.9999) * total;
        const current = Math.floor(scaled);
        const local = scaled - current;
        const fade = local < HOLD ? 0 : (local - HOLD) / (1 - HOLD);
        const isLast = current === total - 1;

        return Array.from({ length: total }, (_, i) => {
            if (i === current) return isLast ? 1 : Math.max(0, 1 - fade * 2);
            if (i === current + 1) return Math.max(0, fade * 2 - 1);
            return 0;
        });
    };

    const handlePanels = (self) => {
        const body = self.querySelector('.ss-body');
        const panels = [...self.querySelectorAll('.ss-panel')];
        if (!body || panels.length < 2) return;

        const medias = panels.map(panel => panel.querySelector('.ss-panel-media'));
        const images = panels.map(panel => panel.querySelector('.ss-panel-img'));
        const patterns = panels.map(panel => panel.querySelector('.ss-panel-pattern'));
        const contents = panels.map(panel => panel.querySelector('.ss-panel-content'));
        const fadeTo = contents.map(content => gsap.quickTo(content, 'opacity', { duration: 0.3, ease: 'power1.out' }));
        const mobileQuery = window.matchMedia('(max-width: 991px)');
        let activeMedia = 0;
        let media = null;

        gsap.set(medias.slice(1), { backgroundColor: 'transparent' });
        patterns.slice(1).forEach(pattern => pattern && gsap.set(pattern, { autoAlpha: 0 }));
        gsap.set(images, { autoAlpha: 0 });
        gsap.set(contents.slice(1), { opacity: 0, pointerEvents: 'none' });
        gsap.set(panels, { opacity: 1 });

        loadHexes(images.map(image => image.getAttribute('src')))
            .then(data => createBloom(medias[0], data, body))
            .catch(() => createFade(images, body))
            .then(controller => {
                media = controller;
                media.show(activeMedia);
            });

        const update = (progress) => {
            const opacities = getOpacities(progress, panels.length);
            const isMobile = mobileQuery.matches;

            opacities.forEach((opacity, i) => {
                if (isMobile) gsap.set(contents[i], { opacity, overwrite: true });
                else fadeTo[i](opacity);
                contents[i].style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
            });

            const nextMedia = Math.min(panels.length - 1, Math.floor(progress * panels.length + (1 - HOLD) / 2));
            if (nextMedia === activeMedia) return;

            activeMedia = nextMedia;
            media?.show(activeMedia);
        };

        const track = document.createElement('div');
        track.className = 'ss-track';
        body.before(track);
        track.append(body);

        const measure = () => {
            self.style.setProperty('--ss-body-h', `${body.offsetHeight}px`);
            const step = window.matchMedia('(max-width: 991px)').matches ? STEP_MOBILE : STEP;
            self.style.setProperty('--ss-dist', `${window.innerHeight * step * panels.length}px`);
        };

        const stickyTop = () => parseFloat(getComputedStyle(body).top) || 0;

        measure();
        ScrollTrigger.addEventListener('refreshInit', measure);

        ScrollTrigger.create({
            trigger: track,
            start: () => `top ${stickyTop()}px`,
            end: () => `bottom ${stickyTop() + body.offsetHeight}px`,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => update(progress)
        });
    };

    const createFade = (images, trigger) => {
        let active = 0;

        gsap.to(images[0], {
            autoAlpha: 1,
            duration: 1,
            ease: 'neutral',
            scrollTrigger: { trigger, start: baunfire.anim.start, once: true }
        });

        const show = (next) => {
            images.forEach((image, i) => {
                if (i === 0) return;

                const isIn = i <= next;

                if (isIn && i > active) {
                    gsap.to(image, { autoAlpha: 1, duration: 0.8, ease: 'neutral', overwrite: true });
                } else if (!isIn) {
                    gsap.to(image, { autoAlpha: 0, duration: 0.6, ease: 'neutral', overwrite: true });
                }
            });

            active = next;
        };

        return { show };
    };

    const loadHexes = async (sources) => {
        const texts = await Promise.all(sources.map(async (src) => {
            const response = await fetch(src);
            if (!response.ok) throw new Error(src);
            return response.text();
        }));

        const found = new Map();
        let viewBox = null;

        texts.forEach((text, stage) => {
            const svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
            const [x, y, width, height] = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
            viewBox ??= { x, y, width, height };

            svg.querySelectorAll('path').forEach(path => {
                const d = path.getAttribute('d');
                if (!found.has(d)) found.set(d, parseHex(d, path.getAttribute('fill'), stage));
            });
        });

        const hexes = [...found.values()];
        if (!viewBox?.width || !hexes.length || hexes.includes(null)) throw new Error('hexes');

        return { viewBox, hexes };
    };

    const parseHex = (d, color, stage) => {
        const numbers = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number);
        const points = [];

        for (let i = 0; i + 1 < numbers.length && points.length < 6; i += 2) {
            points.push([numbers[i], numbers[i + 1]]);
        }

        if (points.length < 6) return null;

        const x = average(points.map(point => point[0]));
        const y = average(points.map(point => point[1]));

        return {
            x,
            y,
            color,
            stage,
            radius: average(points.map(([px, py]) => Math.hypot(px - x, py - y))),
            points: points.map(([px, py]) => [px - x, py - y]),
            scale: 0,
            opacity: 0
        };
    };

    const canvasHTML = () => `
        <canvas class="ss-canvas" aria-hidden="true"></canvas>
    `;

    const createBloom = (media, { viewBox, hexes }, body) => {
        media.insertAdjacentHTML('beforeend', canvasHTML());
        const canvas = media.lastElementChild;
        const context = canvas.getContext('2d');

        setDelays(hexes);

        const stageCount = Math.max(...hexes.map(hex => hex.stage)) + 1;
        const timelines = Array.from({ length: stageCount }, (_, stage) => {
            const timeline = gsap.timeline({ paused: true });

            hexes.filter(hex => hex.stage === stage).forEach(hex => {
                timeline
                    .fromTo(hex, { scale: 0 }, { scale: 1, duration: BLOOM.duration, ease: BLOOM.ease }, hex.delay)
                    .fromTo(hex, { opacity: 0 }, { opacity: 1, duration: BLOOM.fadeDuration, ease: 'power1.out' }, hex.delay);
            });

            return timeline;
        });

        let fit = { x: 0, y: 0, scale: 1 };
        let entered = false;
        let current = 0;
        let isRendering = false;

        const resize = () => {
            const box = canvas.getBoundingClientRect();
            const area = media.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(box.width * ratio));
            canvas.height = Math.max(1, Math.round(box.height * ratio));

            const size = Math.min(area.width / viewBox.width, area.height / viewBox.height);
            const scale = size * ratio;
            fit = {
                scale,
                x: (area.left - box.left + (area.width - viewBox.width * size) / 2) * ratio - viewBox.x * scale,
                y: (area.top - box.top + (area.height - viewBox.height * size) / 2) * ratio - viewBox.y * scale
            };

            render();
        };

        const render = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            hexes.forEach(hex => {
                if (hex.scale <= 0.002 || hex.opacity <= 0.002) return;

                context.globalAlpha = hex.opacity;
                context.fillStyle = hex.color;
                context.beginPath();

                hex.points.forEach(([dx, dy], i) => {
                    const px = fit.x + (hex.x + dx * hex.scale) * fit.scale;
                    const py = fit.y + (hex.y + dy * hex.scale) * fit.scale;
                    if (i) context.lineTo(px, py);
                    else context.moveTo(px, py);
                });

                context.closePath();
                context.fill();
            });

            context.globalAlpha = 1;
        };

        const setRendering = (state) => {
            if (state === isRendering) return;
            isRendering = state;

            if (state) gsap.ticker.add(render);
            else gsap.ticker.remove(render);
        };

        const show = (stage) => {
            current = stage;
            if (!entered) return;

            timelines.forEach((timeline, i) => {
                if (i <= stage) timeline.timeScale(1).play();
                else timeline.timeScale(BLOOM.reverseSpeed).reverse();
            });
        };

        const observer = new ResizeObserver(resize);
        [canvas, media, body].forEach(el => observer.observe(el));
        ScrollTrigger.addEventListener('refresh', resize);
        resize();

        new IntersectionObserver(([entry]) => setRendering(entry.isIntersecting)).observe(canvas);

        ScrollTrigger.create({
            trigger: body,
            start: baunfire.anim.start,
            once: true,
            onEnter: () => {
                entered = true;
                show(current);
            }
        });

        return { show };
    };

    const setDelays = (hexes) => {
        const random = createRandom(BLOOM.seed);
        const radii = hexes.map(hex => hex.radius);
        const smallest = Math.min(...radii);
        const range = (Math.max(...radii) - smallest) || 1;

        hexes.forEach(hex => {
            hex.random = random();
            hex.sizeRatio = (hex.radius - smallest) / range;
        });

        const stages = [...new Set(hexes.map(hex => hex.stage))];

        stages.forEach(stage => {
            const group = hexes.filter(hex => hex.stage === stage);
            const built = hexes.filter(hex => hex.stage < stage);
            const origins = built.length
                ? built
                : [{ x: average(group.map(hex => hex.x)), y: average(group.map(hex => hex.y)) }];

            group.forEach(hex => {
                hex.progress = Math.min(...origins.map(origin => Math.hypot(hex.x - origin.x, hex.y - origin.y)));
            });

            const values = group.map(hex => hex.progress);
            const min = Math.min(...values);
            const spread = (Math.max(...values) - min) || 1;

            group.forEach(hex => {
                hex.delay = BLOOM.spread * (hex.progress - min) / spread
                    + BLOOM.jitter * hex.random
                    + BLOOM.sizeLag * (1 - hex.sizeRatio);
            });
        });
    };

    const createRandom = (seed) => {
        let state = seed;

        return () => {
            state |= 0;
            state = state + 0x6D2B79F5 | 0;
            let value = Math.imul(state ^ state >>> 15, 1 | state);
            value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
            return ((value ^ value >>> 14) >>> 0) / 4294967296;
        };
    };

    const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

    script();
});
