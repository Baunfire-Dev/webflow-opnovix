import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.content-timeline', (els, baunfire) => {
    const DESKTOP = '(min-width: 62rem)';
    const MOBILE = '(max-width: 61.9375rem)';
    const POP = 0.3;
    const LINE = 0.4;
    const FADE = 0.6;
    const RISE = 1;
    const START = 'top 75%';
    const END = 'bottom 55%';
    const SEG_END = 'bottom 75%';

    const script = () => {
        els.forEach(self => handleTimeline(self));
    };

    const handleTimeline = (self) => {
        const track = self.querySelector('.ctl-track');
        const steps = [...self.querySelectorAll('.ctl-step')];
        if (!track || !steps.length) return;

        const mm = gsap.matchMedia();

        mm.add(DESKTOP, () => handleDesktop(track, steps));
        mm.add(MOBILE, () => handleMobile(steps));
    };

    const handleDesktop = (track, steps) => {
        const rail = track.querySelector('.ctl-rail');
        const beats = steps.map(step => createBeat(step, true));
        let marks = measure(track, steps);

        const render = (progress, instant) => {
            if (rail) rail.style.clipPath = `inset(0% ${round((1 - progress) * 100)}% 0% 0%)`;
            beats.forEach((beat, i) => toggle(beat, progress >= marks[i], instant));
        };

        render(0, true);

        const trigger = ScrollTrigger.create({
            trigger: track,
            start: START,
            end: END,
            onUpdate: (st) => render(st.progress),
            onRefresh: (st) => {
                marks = measure(track, steps);
                render(st.progress, true);
            }
        });

        render(trigger.progress, true);

        return () => {
            if (rail) rail.style.clipPath = '';
        };
    };

    const handleMobile = (steps) => {
        const segs = [];

        steps.forEach(step => {
            const beat = createBeat(step, false);
            const seg = step.querySelector('.ctl-seg');
            if (seg) segs.push(seg);

            const render = (st, instant) => {
                if (seg) seg.style.clipPath = `inset(0% 0% ${round((1 - st.progress) * 100)}% 0%)`;
                toggle(beat, st.progress > 0, instant);
            };

            const trigger = ScrollTrigger.create({
                trigger: step,
                start: START,
                end: SEG_END,
                onUpdate: (st) => render(st),
                onRefresh: (st) => render(st, true)
            });

            render(trigger, true);
        });

        return () => {
            segs.forEach(seg => {
                seg.style.clipPath = '';
            });
        };
    };

    const createBeat = (step, desktop) => {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const hex = step.querySelector('.ctl-hex');
        const beat = step.querySelector('.ctl-beat');
        const hairline = step.querySelector('.ctl-hairline');
        const below = beat?.classList.contains('is-below');
        const tl = gsap.timeline({ paused: true });

        if (hex) {
            gsap.set(hex, { scale: 0, transformOrigin: '50% 50%' });
            tl.to(hex, { scale: 1, duration: POP, ease: 'back.out(2)' }, 0);
        }

        if (desktop && hairline) {
            gsap.set(hairline, { scaleY: 0, transformOrigin: below ? '50% 0%' : '50% 100%' });
            tl.to(hairline, { scaleY: 1, duration: LINE, ease: 'power2-out' }, 0.1);
        }

        if (beat) {
            gsap.set(beat, { autoAlpha: 0, y: RISE * rem });
            tl.to(beat, { autoAlpha: 1, y: 0, duration: FADE, ease: 'power3-out' }, 0.2);
        }

        return { tl, shown: false };
    };

    const toggle = (beat, show, instant) => {
        if (instant) {
            beat.shown = show;
            beat.tl.pause().progress(show ? 1 : 0);
            return;
        }

        if (beat.shown === show) return;

        beat.shown = show;
        show ? beat.tl.play() : beat.tl.reverse();
    };

    const measure = (track, steps) => {
        const box = track.getBoundingClientRect();

        return steps.map(step => {
            const node = step.querySelector('.ctl-node');
            if (!node || !box.width) return 0;

            const rect = node.getBoundingClientRect();
            return (rect.left + rect.width / 2 - box.left) / box.width;
        });
    };

    const round = (value) => Math.round(value * 1000) / 1000;

    script();
});
