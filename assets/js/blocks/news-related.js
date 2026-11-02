import { defineBlock } from '../app/baunfire.js';
import { prepareNewsCards } from '../helpers/news.js';

export default defineBlock('section.news-related', (els) => {
    const script = () => {
        els.forEach(self => {
            hideCurrent(self);
            prepareNewsCards(self);
        });
    };

    const hideCurrent = (self) => {
        const slug = window.location.pathname.replace(/\/+$/, '').split('/').pop();
        if (!slug) return;

        self.querySelectorAll('[data-slug]').forEach(tile => {
            if (tile.dataset.slug.trim() !== slug) return;
            tile.closest('.nr-item')?.remove();
        });
    };

    script();
});
