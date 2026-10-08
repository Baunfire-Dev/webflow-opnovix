import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.four-up-icon-card', (els, baunfire) => {
    const script = () => {
        els.forEach(self => handleEntrance(self));
    };

    const handleEntrance = (self) => {
        const card = self.querySelector('.four-up-icon-card-inner');
        if (!card) return;

        const items = card.querySelectorAll('.fuici-item');

        gsap.set(card, { autoAlpha: 0, y: 40 });
        gsap.set(items, { autoAlpha: 0, y: 20 });

        gsap.timeline({
            scrollTrigger: {
                trigger: self,
                start: baunfire.anim.start,
                once: true
            }
        })
            .to(card, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3-out' })
            .to(items, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3-out' }, '-=0.45');
    };

    script();
});
