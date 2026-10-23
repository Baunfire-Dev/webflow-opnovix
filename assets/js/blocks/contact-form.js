import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.contact-form', (els, baunfire) => {
    const FORM = {
        delay: 0.2,
        duration: 1.2,
        distance: 48,
        ease: 'power3-out'
    };

    const script = () => {
        els.forEach(self => handleForm(self));
    };

    const handleForm = (self) => {
        const form = self.querySelector('.cf-form');
        if (!form) return;

        gsap.fromTo(form,
            { autoAlpha: 0, y: FORM.distance },
            {
                autoAlpha: 1,
                y: 0,
                duration: FORM.duration,
                delay: FORM.delay,
                ease: FORM.ease,
                clearProps: 'transform',
                scrollTrigger: {
                    trigger: form,
                    start: baunfire.anim.start,
                    once: true
                }
            }
        );
    };

    script();
});
