import { defineBlock } from '../app/baunfire.js';

const gsap = window.gsap;

const SUPERBLOOM = {
    "seedMode": "brtl",
    "seedCount": 1,
    "seedHold": 0,
    "spread": 1,
    "pacing": "none",
    "jitter": 0.25,
    "sizeLag": 0.35,
    "ease": "expo.out",
    "duration": 1,
    "fromScale": 0,
    "fromOpacity": 0,
    "fromRotate": 0,
    "parallax": 18,
    "depthBack": 0.35,
    "depthMid": 0.65,
    "depthFront": 1,
    "smoothing": 0.9,
    "invert": true,
    "swell": true,
    "swellRadius": 110,
    "swellAmount": 0.45,
    "idle": "breathe",
    "idleAmount": 0.06,
    "idleSpeed": 0.35,
    "seed": 2026
};

const BLEED = 40;
const VIEWBOX = { width: 692, height: 727 };
const FULL_CIRCLE = Math.PI * 2;
const SWEEP_DIRECTIONS = {
    brtl: { x: -1, y: -0.75 },
    rtl: { x: -1, y: 0 },
    ltr: { x: 1, y: 0 }
};
const LAYER = { back: 0, mid: 1, front: 2 };

export default defineBlock('section.hero-homepage', (els) => {
    const script = () => {
        els.forEach(self => handleMedia(self));
    };

    const handleMedia = (self) => {
        const wrapper = self.querySelector('.hh-superbloom');
        const canvas = wrapper?.querySelector('canvas');
        if (!canvas || !gsap) return;

        createSuperbloom(wrapper, canvas, SUPERBLOOM);
    };

    script();
});

function createSuperbloom(wrapper, canvas, settings) {
    const context = canvas.getContext('2d');
    const hexes = getHexes();
    const mouse = { x: 0, y: 0, isOverPage: false };
    const idle = { strength: 0 };
    const layerOffsets = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
    const layerDepths = [settings.depthBack, settings.depthMid, settings.depthFront];
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const moveLayerX = layerOffsets.map(offset => gsap.quickTo(offset, 'x', { duration: settings.smoothing, ease: 'power3.out' }));
    const moveLayerY = layerOffsets.map(offset => gsap.quickTo(offset, 'y', { duration: settings.smoothing, ease: 'power3.out' }));

    let pixelRatio = 1;
    let graphic = { x: 0, y: 0, scale: 1 };
    let timeline = null;
    let isRunning = false;

    function resize() {
        const box = canvas.getBoundingClientRect();
        pixelRatio = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(box.width * pixelRatio);
        canvas.height = Math.round(box.height * pixelRatio);

        const availableWidth = box.width - BLEED * 2;
        const availableHeight = box.height - BLEED * 2;
        const scale = Math.min(availableWidth / VIEWBOX.width, availableHeight / VIEWBOX.height);

        graphic = {
            scale,
            x: BLEED + (availableWidth - VIEWBOX.width * scale) / 2,
            y: BLEED + (availableHeight - VIEWBOX.height * scale) / 2
        };
    }

    function playLoadIn() {
        setDelays(hexes, settings);
        timeline = gsap.timeline();

        hexes.forEach(hex => {
            timeline.fromTo(hex,
                { scale: settings.fromScale, rotation: settings.fromRotate },
                { scale: 1, rotation: 0, duration: settings.duration, ease: settings.ease },
                hex.delay
            );

            if (settings.fromOpacity < 1) {
                timeline.fromTo(hex,
                    { opacity: settings.fromOpacity },
                    { opacity: 1, duration: Math.max(0.1, settings.duration * 0.5), ease: 'power1.out' },
                    hex.delay
                );
            } else {
                hex.opacity = 1;
            }
        });

        timeline.fromTo(idle,
            { strength: 0 },
            { strength: 1, duration: 1.2, ease: 'sine.inOut' },
            timeline.duration()
        );
    }

    function start() {
        if (isRunning) return;
        isRunning = true;

        if (!timeline) playLoadIn();
        else if (timeline.progress() < 1) timeline.resume();

        gsap.ticker.add(render);
        listenToMouse();
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;

        gsap.ticker.remove(render);
        if (timeline && timeline.progress() < 1) timeline.pause();
        stopListeningToMouse();
    }

    function listenToMouse() {
        if (!canHover) return;

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    }

    function stopListeningToMouse() {
        if (!canHover) return;

        window.removeEventListener('pointermove', handlePointerMove);
        document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
        mouse.isOverPage = false;
    }

    function handlePointerMove(event) {
        const box = canvas.getBoundingClientRect();
        mouse.x = event.clientX - box.left;
        mouse.y = event.clientY - box.top;
        mouse.isOverPage = true;

        const amountX = clamp((mouse.x - box.width / 2) / (box.width / 2), -1, 1);
        const amountY = clamp((mouse.y - box.height / 2) / (box.height / 2), -1, 1);
        const direction = settings.invert ? -1 : 1;

        layerDepths.forEach((depth, layer) => {
            moveLayerX[layer](amountX * settings.parallax * depth * direction);
            moveLayerY[layer](amountY * settings.parallax * depth * direction);
        });
    }

    function handlePointerLeave() {
        mouse.isOverPage = false;

        layerDepths.forEach((depth, layer) => {
            moveLayerX[layer](0);
            moveLayerY[layer](0);
        });
    }

    function getDrift(layer, time) {
        if (settings.idle !== 'drift') return { x: 0, y: 0 };

        const amount = settings.idleAmount * idle.strength * (0.4 + layer * 0.3);
        const speed = settings.idleSpeed * FULL_CIRCLE;

        return {
            x: Math.sin(time * speed * 0.5 + layer * 1.7) * amount * 120,
            y: Math.cos(time * speed * 0.37 + layer * 2.3) * amount * 80
        };
    }

    function getIdleScale(hex, time) {
        const speed = settings.idleSpeed * FULL_CIRCLE;

        if (settings.idle === 'breathe') {
            return 1 + settings.idleAmount * Math.sin(time * speed - hex.x * 0.012) * idle.strength;
        }

        if (settings.idle === 'twinkle') {
            const pulse = Math.max(0, Math.sin(time * speed * 0.5 + hex.phase)) ** 24;
            return 1 + settings.idleAmount * 6 * pulse * idle.strength;
        }

        return 1;
    }

    function updateSwell(hex, screenX, screenY) {
        let target = 1;

        if (settings.swell && mouse.isOverPage) {
            const distanceToMouse = Math.hypot(screenX - mouse.x, screenY - mouse.y);

            if (distanceToMouse < settings.swellRadius) {
                const closeness = 1 - distanceToMouse / settings.swellRadius;
                target = 1 + settings.swellAmount * closeness * closeness;
            }
        }

        hex.swell += (target - hex.swell) * 0.14;
    }

    function drawHex(x, y, radius, rotation, color, opacity) {
        const startAngle = rotation * Math.PI / 180;

        context.globalAlpha = clamp(opacity, 0, 1);
        context.fillStyle = color;
        context.beginPath();

        for (let corner = 0; corner < 6; corner++) {
            const angle = startAngle + corner * Math.PI / 3;
            const cornerX = x + radius * Math.cos(angle);
            const cornerY = y + radius * Math.sin(angle);

            if (corner === 0) context.moveTo(cornerX, cornerY);
            else context.lineTo(cornerX, cornerY);
        }

        context.closePath();
        context.fill();
    }

    function render() {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const time = gsap.ticker.time;
        const drift = [0, 1, 2].map(layer => getDrift(layer, time));

        hexes.forEach(hex => {
            const isHidden = hex.scale <= 0.002 || hex.opacity <= 0.002;
            if (isHidden) {
                hex.swell = 1;
                return;
            }

            const offset = layerOffsets[hex.layer];
            const screenX = graphic.x + hex.x * graphic.scale + offset.x + drift[hex.layer].x;
            const screenY = graphic.y + hex.y * graphic.scale + offset.y + drift[hex.layer].y;

            updateSwell(hex, screenX, screenY);

            const radius = hex.radius * graphic.scale * hex.scale * hex.swell * getIdleScale(hex, time);
            if (radius < 0.2) return;

            drawHex(screenX, screenY, radius, hex.rotation, hex.color, hex.opacity);
        });

        context.globalAlpha = 1;
    }

    new ResizeObserver(resize).observe(canvas);
    resize();

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
    }, { threshold: 0.05 }).observe(wrapper);
}

function setDelays(hexes, settings) {
    const random = createRandom(settings.seed);

    hexes.forEach(hex => {
        hex.random = random();
        hex.phase = random() * FULL_CIRCLE;
    });

    const firstHexes = SWEEP_DIRECTIONS[settings.seedMode]
        ? setProgressBySweep(hexes, settings)
        : setProgressFromSeeds(hexes, settings, random);

    const pacing = settings.pacing === 'none' ? (progress => progress) : gsap.parseEase(settings.pacing);

    hexes.forEach(hex => {
        if (firstHexes.includes(hex)) {
            hex.delay = hex.random * 0.15;
            return;
        }

        hex.delay = settings.seedHold
            + settings.spread * pacing(hex.progress)
            + settings.jitter * hex.random
            + settings.sizeLag * (1 - hex.sizeRatio);
    });
}

function setProgressBySweep(hexes, settings) {
    const direction = SWEEP_DIRECTIONS[settings.seedMode];

    hexes.forEach(hex => {
        hex.progress = hex.x * direction.x + hex.y * direction.y + (hex.random - 0.5) * 40;
    });
    normalizeProgress(hexes);

    return hexes
        .filter(hex => hex.layer !== LAYER.back)
        .sort((a, b) => a.progress - b.progress)
        .slice(0, settings.seedCount);
}

function setProgressFromSeeds(hexes, settings, random) {
    const bigHexes = hexes.filter(hex => hex.layer === LAYER.front);
    let candidates = bigHexes.slice();

    if (settings.seedMode === 'core') {
        const center = {
            x: average(bigHexes.map(hex => hex.x)),
            y: average(bigHexes.map(hex => hex.y))
        };
        candidates = candidates
            .sort((a, b) => distance(a, center) - distance(b, center))
            .slice(0, Math.max(settings.seedCount * 3, 12));
    }

    const seeds = [candidates[Math.floor(random() * Math.min(4, candidates.length))]];
    const seedCount = Math.min(settings.seedCount, candidates.length);

    while (seeds.length < seedCount) {
        seeds.push(findFarthestHex(candidates, seeds, random));
    }

    hexes.forEach(hex => {
        hex.progress = Math.min(...seeds.map(seed => distance(hex, seed)));
    });
    normalizeProgress(hexes);

    return seeds;
}

function findFarthestHex(candidates, seeds, random) {
    let farthest = null;
    let farthestScore = -1;

    candidates.forEach(hex => {
        if (seeds.includes(hex)) return;

        const closestSeed = Math.min(...seeds.map(seed => distance(hex, seed)));
        const score = closestSeed * (0.85 + random() * 0.3);

        if (score > farthestScore) {
            farthestScore = score;
            farthest = hex;
        }
    });

    return farthest;
}

function normalizeProgress(hexes) {
    const values = hexes.map(hex => hex.progress);
    const min = Math.min(...values);
    const range = (Math.max(...values) - min) || 1;

    hexes.forEach(hex => {
        hex.progress = (hex.progress - min) / range;
    });
}

function getHexes() {
    const hexes = getHexRows().trim().split('\n').map(row => {
        const [rightX, centerY, leftX, color] = row.trim().split(' ').map((value, index) => index < 3 ? Number(value) : value);
        const radius = (rightX - leftX) / 2;

        return {
            x: rightX - radius,
            y: centerY,
            radius,
            color: `#${color}`,
            layer: radius >= 8.5 ? LAYER.front : radius >= 4.5 ? LAYER.mid : LAYER.back,
            scale: 0,
            opacity: 0,
            rotation: 0,
            swell: 1,
            delay: 0,
            progress: 0,
            random: 0,
            phase: 0
        };
    });

    const radii = hexes.map(hex => hex.radius);
    const smallest = Math.min(...radii);
    const largest = Math.max(...radii);

    hexes.forEach(hex => {
        hex.sizeRatio = (hex.radius - smallest) / (largest - smallest);
    });

    return hexes;
}

function createRandom(seed) {
    let state = seed;

    return () => {
        state |= 0;
        state = state + 0x6D2B79F5 | 0;
        let value = Math.imul(state ^ state >>> 15, 1 | state);
        value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getHexRows() {
    return `556.127 438.257 532.395 D276B2
508.663 438.257 484.93 F68292
484.93 450.123 461.198 F77D89
461.198 461.198 437.465 F87983
437.465 473.064 413.733 FA757D
413.733 484.931 390.001 FC7176
390.001 499.961 366.268 FD6D71
366.269 511.827 342.537 FF6A6B
342.536 523.693 318.804 FE7470
579.859 451.705 556.127 975BE1
627.324 477.02 603.592 3A5DE9
532.395 451.705 508.662 F1849A
603.592 463.571 579.859 6B58EA
603.592 490.468 579.859 6158EB
556.127 411.36 532.395 E57FA4
508.663 411.36 484.93 F6808F
444.585 371.806 420.853 FA747B
420.853 359.94 397.12 FC7075
396.946 348.082 373.213 FE6B6E
373.388 336.208 349.656 FE6E6C
373.388 309.311 349.656 FE726E
349.656 324.342 325.923 FD7F75
350.702 174.941 326.97 FC8679
374.03 188.775 350.298 FD7872
374.435 215.341 350.703 FE7771
421.899 188.444 398.167 FD6D70
421.899 242.237 398.167 FD6E72
463.751 297.491 440.019 FA7780
488.886 315.64 465.153 F87B85
511.036 330.67 487.303 F7808E
421.899 215.341 398.167 FD6D70
444.585 256.309 420.853 FB7278
468.318 272.131 444.586 F9757E
534.768 344.91 511.036 F58394
558.5 358.358 534.767 E981A1
558.5 308.52 534.767 F38597
558.5 281.623 534.767 F48596
558.5 254.727 534.767 F48495
558.5 227.83 534.767 F58698
558.5 200.934 534.767 F58596
582.625 188.775 558.892 EB829F
582.233 162.171 558.5 EC829E
605.965 148.723 582.233 B268CC
581.848 135.655 558.115 EE839C
603.592 120.244 579.859 BD6DC3
624.951 103.631 601.219 8F58E6
648.683 89.3916 624.951 6158EB
686.655 56.9577 662.922 3A73D1
398.167 201.892 374.435 FE6B6B
398.167 228.789 374.435 FF6A6B
349.656 149.652 325.923 FC8779
303.238 148.425 279.506 F9A588
303.238 121.529 279.506 F9A789
374.435 161.493 350.703 FE7972
326.97 161.874 303.238 FB9681
326.409 134.78 302.677 FA9781
421.899 161.547 398.167 FE6B6D
398.167 175.322 374.435 FF6B6B
302.191 324.342 278.459 FA9881
302.191 351.238 278.459 FB9781
254.335 323.967 230.603 FAAC7F
254.727 351.238 230.994 FAAB82
302.191 297.445 278.459 FA9C83
325.924 337.79 302.191 FC8A7B
325.924 310.894 302.191 FC8E7D
278.459 310.894 254.727 F9A889
278.459 337.79 254.727 F9A387
484.93 423.227 461.198 F77C89
461.198 434.301 437.465 F97983
437.465 446.168 413.733 FB757D
413.733 458.034 390.001 FC7075
390.001 473.064 366.268 FE6B6D
366.269 484.931 342.537 FF6C6B
579.859 424.808 556.127 A05FDA
598.846 438.257 579.86 6D58E9
530.021 398.703 511.036 F58596
486.512 397.121 467.527 F87D89
486.512 473.064 467.527 F77E8C
371.806 538.724 352.82 FE6A6C
463.571 384.464 444.585 F97882
439.442 348.451 420.456 FB737A
416.107 334.559 397.121 FC6F74
395.185 324.585 376.199 FE6C6E
349.656 299.027 330.67 FC8277
325.924 285.579 306.938 FC907E
349.12 200.31 330.135 FC8478
325.388 186.807 306.402 FB907E
300.865 173.74 281.879 F9A286
277.924 134.977 258.938 FAAC7F
277.924 109.663 258.938 FAAB83
393.421 149.627 374.435 FE6F6D
438.512 228.789 419.526 FC7176
646.31 370.224 627.324 3A73D2
666.878 355.985 647.892 399DA3
646.31 343.327 627.324 3A6ED8
691.401 340.954 672.416 79CBDD
438.512 201.892 419.526 FD7176
438.512 174.995 419.526 FD6F73
371.271 135.387 352.285 FD7B73
349.12 124.534 330.135 FC8A7B
373.388 362.313 354.402 FE6B6B
349.656 348.074 330.67 FD8176
325.924 362.313 306.938 FC897A
273.712 367.06 254.726 F9A487
230.994 336.208 212.008 FAAF6F
342.536 499.961 323.55 FE7872
321.177 538.724 302.191 FD8176
349.656 549.799 330.67 FE6D6C
508.663 463.572 489.677 F58292
530.812 478.602 511.827 EF849D
577.486 477.02 558.5 8F58E6
577.486 371.806 558.5 AF67CE
577.486 344.909 558.5 B76AC8
531.604 294.281 512.618 F58292
482.557 287.161 463.571 F97A84
532.395 270.548 513.409 F58291
532.395 246.816 513.409 F58292
532.395 223.084 513.409 F58190
556.127 174.037 537.141 F58495
556.127 149.514 537.141 F58495
598.846 174.037 579.86 B368CB
622.578 131.319 603.592 8958E7
577.486 502.334 558.5 8A58E6
622.578 502.334 603.592 3A62E5
622.578 527.648 603.592 3A67DF
642.354 540.306 628.115 399EA3
640.772 567.598 630.488 39A897
662.923 552.568 652.639 3ECA7D
662.923 524.88 652.639 3BCA77
662.923 434.697 652.639 39B688
686.655 421.249 676.371 4ACA8F
686.655 395.143 676.371 79CBDF
662.923 407.8 652.639 39AE91
641.564 392.77 631.28 3A7FC5
640.772 415.711 630.488 3A82C1
615.458 346.096 605.174 5458EC
628.115 331.066 617.831 3F58EE
641.564 318.409 631.28 3A6CD9
615.458 325.528 608.338 5558EC
685.073 539.119 677.953 5DCBAF
685.073 568.389 677.953 60CBB5
685.073 596.868 677.953 64CBBC
685.073 625.346 677.953 68CBC2
661.341 636.422 654.221 4BCA92
639.19 622.973 632.071 39B886
616.249 636.422 609.13 3A89B9
604.383 596.868 597.263 3A67DF
568.785 597.659 561.665 7458E9
547.425 581.046 540.306 A662D5
522.111 534.373 514.991 E981A0
412.942 567.598 405.823 FA747B
367.851 592.121 360.731 FD6E71
367.851 620.6 360.731 FD6D70
340.954 627.72 333.834 FE6C6C
287.952 656.199 280.832 FC897A
265.01 660.945 257.891 FB9681
235.741 653.034 228.621 F9A689
235.741 683.095 228.621 F9A487
214.382 696.543 207.262 F9AA84
166.917 660.945 159.798 FBB363
145.558 682.304 138.438 FCB657
143.542 617.021 136.423 FCB751
166.917 603.196 159.798 FCB45F
212.717 595.347 205.598 FAAD7B
230.203 606.361 223.083 F9AA86
248.398 595.286 241.278 FAA286
248.398 567.598 241.278 F9A387
248.398 538.328 241.278 F9A688
248.398 505.894 241.278 F9A789
256.309 464.758 249.189 F9A689
276.877 482.953 269.757 FB9982
286.37 445.772 279.25 FB9681
296.654 470.295 289.534 FB8E7D
318.013 427.577 310.893 FD8679
342.536 402.263 335.416 FD7871
388.419 397.516 381.299 FE6C6F
285.579 408.592 278.459 FA9982
235.741 408.592 228.621 F9AC7B
230.994 381.695 223.874 FAAD78
145.558 431.533 138.438 FDBE4B
87.8093 395.934 80.6896 FEDA3B
126.572 311.289 119.453 FECD42
167.708 316.035 160.588 FDB94D
188.276 282.019 181.157 FCB45C
227.039 283.601 219.919 FBB06E
236.796 251.759 229.676 FAAF72
256.309 270.153 249.189 FAAC80
256.309 229.017 249.189 FAAC7E
247.607 194.21 240.488 FAAE73
295.863 211.613 288.743 FAA086
316.051 243.84 308.931 FB917E
244.443 157.82 237.323 FBAF72
190.649 128.55 183.53 FCB752
235.741 100.072 228.621 FBB267
272.043 69.5707 264.924 FAAD7C
368.642 39.9493 361.522 FD8277
318.013 69.2193 310.893 FA9C84
102.049 24.9191 94.9291 FFDD39
368.642 68.4283 361.522 FC7F75
390.792 80.2945 383.672 FE726F
415.315 93.7426 408.195 FE6B6D
444.585 39.9493 437.466 FC6F74
64.0774 380.904 56.9577 FFDD39
212.799 566.015 205.68 FAAD78
185.112 524.88 177.992 FBB265
165.335 554.15 161.379 FCB45B
165.335 631.675 161.379 FCB361
189.067 675.185 185.112 FAAF72
211.218 642.75 207.262 FAAC7E
263.428 683.095 259.473 FB9380
315.64 663.318 311.684 FD7871
339.372 649.87 335.417 FE6A6A
388.419 607.943 384.463 FC7076
434.301 554.941 430.346 F97881
521.32 566.016 517.364 DE7CA9
212.799 619.018 205.68 FAAC7D
108.377 702.081 101.258 FEC149
197.77 717.111 190.65 FAAD7B
354.402 582.628 347.283 FE6A6C
590.144 672.021 583.024 3A5BEC
642.354 698.917 635.235 3DCA7A
683.491 723.44 676.371 75CBD8
616.249 660.154 609.13 398FB3
617.831 580.255 610.712 3A80C4
685.073 660.154 677.953 6ECBCB
616.249 304.96 609.13 5858EC
616.249 284.392 609.13 5C58EB
662.131 230.599 655.012 45CA88
639.19 194.21 632.071 4358EE
661.341 179.179 654.221 39C37A
661.341 153.865 654.221 39C37A
684.282 114.311 677.162 49CA8E
684.282 88.2054 677.162 3994AD
661.341 45.4871 654.221 3A5AED
661.341 17.0081 654.221 4058EE
684.282 28.8742 677.162 3A86BC
639.981 32.8299 632.862 6758EA
616.249 44.696 609.13 9359E4
590.144 58.9353 583.024 CE75B6
590.144 24.1278 583.024 D879AD
571.158 78.7122 564.038 E981A0
553.754 66.0551 546.634 F48292
552.172 92.9518 545.052 F58393
508.374 182.461 501.254 F77D89
508.374 209.579 501.254 F77E8A
508.374 234.073 501.254 F77F8C
508.374 150.968 501.254 F87D89
463.76 171.268 456.64 FB757C
446.167 156.238 439.048 FB7278
443.794 111.147 436.674 FC7075
639.981 4.35099 632.862 3A70D5
617.04 202.12 609.92 6E58E9
685.073 243.256 677.953 5FCBB2
658.177 308.916 647.893 398EB3
673.207 300.214 662.923 39AC93
688.237 291.512 677.953 6BCBC6
688.237 269.362 677.953 64CBBB
685.864 195.001 675.58 59CBA8
662.131 284.392 651.847 3992B0
662.131 256.705 651.847 43CA84
640.772 270.944 630.488 3A5FE8
620.205 255.913 609.921 6058EB
620.205 229.017 609.921 6858EA
640.772 167.313 630.488 4B58ED
639.981 296.258 629.697 3A64E2
593.308 306.542 583.024 8958E7
593.308 276.481 583.024 9159E5
593.308 244.839 583.024 9B5DDE
593.308 218.733 583.024 A060D9
593.308 198.165 583.024 A562D5
617.831 182.344 607.547 7658E9
641.564 141.998 631.28 5058EC
662.923 130.132 652.639 3A7FC5
662.923 103.236 652.639 3A78CD
525.169 141.565 514.885 F77E8C
549.007 123.012 538.723 F58393
527.648 104.027 517.364 F77F8D
454.869 214.778 444.585 FB747C
447.75 183.925 437.466 FB7177
475.438 229.017 465.153 FA7882
475.438 200.538 465.153 F97781
413.733 123.012 403.449 FE6A6C
391.583 108.773 381.299 FF716E
459.926 140.416 449.642 FB747B
436.674 140.416 426.39 FC6F74
367.06 95.3247 356.776 FD8076
343.327 81.0855 333.043 FB8E7D
250.771 107.982 240.487 FBB06F
250.771 81.0855 240.487 FBB06D
272.13 88.6907 261.846 FAAC7C
233.383 45.6722 223.099 FBB267
252.354 54.98 242.07 FBB06C
219.128 28.8743 208.844 FCB45D
219.128 59.7262 208.844 FCB35F
191.441 43.1137 181.157 FDBA4D
167.708 54.98 157.424 FDC447
119.452 74.7566 109.168 FFDB3A
168.5 80.2943 158.216 FDC448
193.814 96.1156 183.53 FCB753
218.337 113.52 208.053 FBB361
218.337 143.58 208.053 FBB266
192.232 158.611 181.948 FCB655
273.712 175.224 263.428 F9AA84
300.714 190.166 290.43 FA9F85
319.595 224.271 309.311 FB917E
345.701 248.003 335.417 FC8377
367.06 259.869 356.776 FE7470
390.001 273.318 379.717 FE6A6B
411.36 285.184 401.076 FD6E72
411.36 309.707 401.076 FC6F74
415.315 408.591 405.031 FC7177
394.747 420.458 384.463 FD6E71
369.433 433.115 359.149 FF696A
321.177 388.024 310.893 FB8679
344.909 445.772 334.625 FD7470
321.177 456.056 310.893 FC8277
321.177 482.953 310.893 FC8176
298.236 497.192 287.952 FC8C7C
296.654 518.551 286.37 FC8C7C
296.654 543.074 286.37 FC8C7C
270.548 554.15 260.264 FA9982
273.712 526.462 263.428 FA9982
272.13 581.837 261.846 FB9781
231.785 551.776 221.501 FAAB81
231.785 580.255 221.501 F9AA85
222.292 516.462 212.008 FAAD7B
247.607 376.948 237.323 F9AB82
260.265 393.56 249.981 F9A88A
214.382 392.77 204.098 FBB06D
192.232 406.218 181.948 FBB360
192.232 380.113 181.948 FCB45E
169.291 418.876 159.007 FDB752
169.291 391.188 159.007 FDB751
169.291 366.664 159.007 FDB750
148.722 379.322 138.438 FDC049
126.572 365.082 116.288 FECA44
126.572 336.603 116.288 FDCC42
148.722 326.319 138.438 FDC149
205.68 297.049 195.396 FCB362
186.694 305.751 176.41 FCB657
221.501 211.613 211.217 FBB06C
272.13 199.747 261.846 F9AA85
103.631 351.634 93.3473 FFD63D
87.8093 368.246 77.5253 FFDB3A
148.722 283.601 138.438 FDC149
53.793 351.634 43.509 FEDD39
67.4934 415.29 57.2094 FFDD39
105.34 450.496 95.0558 FFD041
29.27 473.46 18.986 FFDD39
10.2839 407.076 0 FFDD39
169.291 340.559 159.007 FDB94E
272.13 607.943 261.846 FB9680
272.13 634.048 261.846 FB9480
294.281 622.182 283.997 FC8779
318.803 608.734 308.519 FD7B73
318.803 637.213 308.519 FD7972
291.051 701.337 280.767 FD8578
343.327 596.868 333.043 FE6D6C
369.433 567.598 359.149 FE6C6E
391.583 553.359 381.299 FC6F74
391.583 581.837 381.299 FC7075
367.06 666.483 356.776 FD6D71
414.524 539.911 404.24 FB747B
437.465 525.671 427.181 FA7780
459.616 514.596 449.332 F87B87
481.766 501.938 471.482 F67F8D
494.423 548.612 484.139 F58191
437.465 602.405 427.181 F97882
525.275 597.659 514.991 DE7CAA
522.111 651.452 511.827 D578AF
440.63 651.452 430.346 F87984
503.916 492.445 493.632 F58393
525.275 509.058 514.991 E880A0
549.007 552.568 538.723 B067CD
249.98 620.6 239.696 FAA186
231.785 632.466 221.501 FAAA89
214.382 666.483 204.098 FAAC80
192.232 644.332 181.948 FBAF72
192.232 615.854 181.948 FBB06F
192.232 583.419 181.948 FAB06D
344.909 471.878 334.625 FE7470
438.256 315.244 427.972 FB737A
458.825 328.693 448.541 F97780
461.013 357.531 445.762 F97881
480.975 344.514 470.691 F87C87
483.672 371.693 467.985 F77D88
503.916 357.962 493.632 F6808E
503.716 386.29 488.465 F6808E
526.066 370.62 515.782 F58495
549.007 384.068 538.723 DF7CA8
571.949 396.725 561.665 A361D7
593.308 409.383 583.024 7458E9
617.831 422.831 607.547 4158EE
640.468 433.773 630.184 3A86BD
640.772 463.176 630.488 398FB2
640.772 488.49 630.488 3992AF
617.04 450.518 606.756 3B58EF
662.923 467.922 652.639 39BE80
662.923 497.983 652.639 38C678
686.655 512.223 676.371 84CCF1
686.655 482.162 676.371 84CCF1
686.655 450.518 676.371 4ECA96
686.655 318.409 676.371 6DCBCA
390.001 298.632 379.717 FE6A6B
367.06 285.184 356.776 FE736F
345.701 272.526 335.417 FD8176
302.191 272.526 291.907 FA9881
287.161 256.705 276.877 F9A487
167.708 5.142 157.424 FEC845
148.722 111.146 138.438 FECA44
246.025 131.715 235.741 FBB06F
343.327 54.98 333.043 FC8F7D
295.863 100.938 285.579 F9A889
492.293 273.318 482.009 F87C88
570.366 244.839 560.082 DA7AAC
593.308 334.23 583.024 8458E7
627.324 356.381 617.04 3B58EF
627.324 381.695 617.04 3A5EE9
686.655 369.038 676.371 79CBDE
662.923 582.629 652.639 42CA82
591.726 582.629 581.442 4F58ED
570.366 567.598 560.082 7D58E8
607.548 567.598 597.264 3A60E6
605.965 542.284 595.681 3D58EE
640.772 595.286 630.488 39AE91
640.772 651.452 630.488 39BD80
676.371 651.452 666.087 5ECBB0
676.371 682.304 666.087 62CBB8
617.831 607.943 607.547 3A81C2
591.726 623.764 581.442 4758ED
662.923 610.316 652.639 47CA8A
620.205 554.545 605.965 3A70D5
572.74 540.306 558.501 8458E7
551.38 522.111 537.141 B96AC6
551.38 492.05 537.141 C470BE
594.099 554.545 579.859 5858EC
642.354 514.2 628.115 3996AB
664.505 381.299 650.265 39A699
664.505 330.67 650.265 399AA6
618.019 370.62 603.78 5358EC
596.016 383.822 581.776 7B58E8
595.681 358.358 581.442 8158E7
617.831 395.538 603.592 4C58ED
572.74 320.386 558.501 C370BE
572.74 295.072 558.501 C671BC
572.74 269.757 558.501 D076B4
572.74 212.8 558.501 E37FA5
553.754 332.253 539.514 EC829E
528.439 318.804 514.2 F58393
503.916 303.774 489.677 F77E8B
440.262 279.623 426.022 FB7379
418.392 263.877 404.152 FD6F73
395.647 250.754 381.408 FE6A6C
479.393 257.891 465.153 F97983
458.825 246.816 444.585 FA757D
511.994 281.372 497.755 F6808D
514.619 258.628 500.379 F77F8D
371.153 237.633 356.914 FE7570
347.534 220.137 333.295 FD8377
326.539 206.14 312.3 FB9480
275.55 160.291 261.311 FAAC80
322.224 114.288 307.984 FA9982
299.818 75.7971 285.579 F9A98A
221.501 87.0185 207.262 FBB361
193.814 68.8238 179.575 FDB84F
191.441 331.461 177.202 FCB559
151.096 351.238 136.856 FDBF4A
116.288 381.299 102.049 FECE42
321.177 559.292 306.938 FC7B73
344.909 569.575 330.67 FE6D6C
390.001 523.693 375.761 FD6E72
409.778 509.454 395.539 FC7278
432.719 497.587 418.479 FA767F
456.451 484.14 442.212 F97A85
321.177 583.815 306.938 FD7A73
296.654 595.681 282.414 FC897A
296.654 571.158 282.414 FC8B7B
209.635 321.969 195.396 FBB265
208.053 346.492 193.813 FBB264
191.441 356.776 177.202 FCB45D
212.009 370.224 197.769 FCB269
228.621 363.105 214.382 FAAE73
228.621 312.476 214.382 FBB06E
249.472 298.846 235.233 F9AC7C
273.712 287.952 259.473 F9A98A
292.698 380.508 278.459 FA9881
347.283 374.18 333.043 FD7972
371.015 388.419 356.776 FF6A6B
392.374 373.388 378.135 FD6C6E
416.897 383.672 402.658 FB7076
437.465 394.747 423.226 FB747B
461.198 412.942 446.958 F97983
437.465 424.017 423.226 FA757C
412.151 436.675 397.912 FC7176
388.419 450.914 374.179 FE6C6F
366.269 465.153 352.03 FE6E6C
321.177 509.454 306.938 FD7F75
527.648 196.187 513.409 F6808F
527.364 167.306 513.125 F6808E
573.531 108.378 559.291 F0849B
596.472 91.7652 582.233 C470BF
620.205 74.361 605.965 9158E6
642.663 116.258 628.424 5958EC
620.205 157.425 605.965 7F58E8
643.937 58.5396 629.698 6558EA
664.505 75.9435 650.265 3A59EE
601.219 514.991 582.233 5A58EB
553.754 463.572 534.768 CF75B5
532.395 424.808 508.662 F38699
682.699 138.834 678.744 4FCA99
499.961 122.222 496.006 F87B86
470.691 94.5337 466.736 FB767E
470.691 58.1441 466.736 FB757C
413.733 58.1441 409.778 FE6A6C
390.792 58.1441 386.837 FF7470
340.163 25.71 336.207 FB917E
189.067 16.2173 185.112 FDBA4D
145.558 65.2639 141.603 FECD42
215.964 176.015 212.009 FBB168
152.678 32.0386 148.722 FECB43
126.572 43.9049 122.617 FED73D
499.961 76.339 496.006 F97B85
145.558 404.636 141.603 FDBE4B
211.218 420.458 207.262 FBB06F
268.966 503.521 265.011 FA9B83`;
}