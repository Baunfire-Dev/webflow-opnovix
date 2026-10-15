import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.split-scroll', (els, baunfire) => {
    const STEP = 0.6;
    const STEP_MOBILE = 0.35;
    const HOLD = 0.2;

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
        let activeMedia = 0;

        gsap.set(medias.slice(1), { backgroundColor: 'transparent' });
        patterns.slice(1).forEach(pattern => pattern && gsap.set(pattern, { autoAlpha: 0 }));
        gsap.set(images.slice(1), { autoAlpha: 0 });
        gsap.set(contents.slice(1), { opacity: 0, pointerEvents: 'none' });
        gsap.set(panels, { opacity: 1 });

        const showMedia = (next) => {
            images.forEach((image, i) => {
                if (i === 0) return;

                const isIn = i <= next;

                if (isIn && i > activeMedia) {
                    gsap.to(image, { autoAlpha: 1, duration: 0.8, ease: 'neutral', overwrite: true });
                } else if (!isIn) {
                    gsap.to(image, { autoAlpha: 0, duration: 0.6, ease: 'neutral', overwrite: true });
                }
            });

            activeMedia = next;
        };

        const update = (progress) => {
            const opacities = getOpacities(progress, panels.length);

            opacities.forEach((opacity, i) => {
                fadeTo[i](opacity);
                contents[i].style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
            });

            const nextMedia = Math.min(panels.length - 1, Math.floor(progress * panels.length + (1 - HOLD) / 2));
            if (nextMedia !== activeMedia) showMedia(nextMedia);
        };

        gsap.from(images[0], {
            autoAlpha: 0,
            duration: 1,
            ease: 'neutral',
            scrollTrigger: {
                trigger: body,
                start: baunfire.anim.start,
                once: true
            }
        });

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

    script();
});
