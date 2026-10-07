import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.split-scroll', (els, baunfire) => {
    const STEP = 0.6;
    const BLUR = 'blur(6px)';
    const SHIFT = 16;

    const script = () => {
        els.forEach(self => handlePanels(self));
    };

    const handlePanels = (self) => {
        const body = self.querySelector('.ss-body');
        const panels = [...self.querySelectorAll('.ss-panel')];
        if (!body || panels.length < 2) return;

        const medias = panels.map(panel => panel.querySelector('.ss-panel-media'));
        const images = panels.map(panel => panel.querySelector('.ss-panel-img'));
        const lines = panels.map(panel => [...(panel.querySelector('.ss-panel-content')?.children || [])]);
        let active = 0;

        self.classList.add('is-stacked');
        gsap.set(medias.slice(1), { autoAlpha: 0 });
        gsap.set(lines.slice(1).flat(), { autoAlpha: 0 });

        const showMedia = (next) => {
            medias.forEach((media, i) => {
                const isIn = i <= next;
                gsap.to(media, { autoAlpha: isIn ? 1 : 0, duration: 0.8, ease: 'neutral', overwrite: true });

                if (isIn && i > active) {
                    gsap.fromTo(images[i], { scale: 0.94 }, { scale: 1, duration: 1.2, ease: 'power3-out', overwrite: true });
                }
            });
        };

        const showText = (next, dir) => {
            lines.forEach((group, i) => {
                if (i === next) return;

                gsap.to(group, {
                    autoAlpha: 0,
                    y: -SHIFT * dir,
                    filter: BLUR,
                    duration: 0.35,
                    stagger: 0.04,
                    ease: 'power2-out',
                    overwrite: true
                });
            });

            gsap.fromTo(lines[next],
                { autoAlpha: 0, y: SHIFT * dir, filter: BLUR },
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.7,
                    delay: 0.2,
                    stagger: 0.06,
                    ease: 'power3-out',
                    overwrite: true
                }
            );
        };

        const show = (next) => {
            const dir = next > active ? 1 : -1;

            showMedia(next);
            showText(next, dir);
            active = next;
        };

        gsap.from(images[0], {
            scale: 0.9,
            autoAlpha: 0,
            duration: 1.2,
            ease: 'power3-out',
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
            self.style.setProperty('--ss-dist', `${window.innerHeight * STEP * panels.length}px`);
        };

        const stickyTop = () => parseFloat(getComputedStyle(body).top) || 0;

        measure();
        ScrollTrigger.addEventListener('refreshInit', measure);

        ScrollTrigger.create({
            trigger: track,
            start: () => `top ${stickyTop()}px`,
            end: () => `bottom ${stickyTop() + body.offsetHeight}px`,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
                const next = Math.min(panels.length - 1, Math.floor(progress * panels.length));
                if (next !== active) show(next);
            }
        });
    };

    script();
});
