import { defineBlock } from '../app/baunfire.js';
import { prepareNewsCards } from '../helpers/news.js';

export default defineBlock('section.news-detail-hero', (els) => {
    const script = () => {
        if (redirectExternal()) return;
        els.forEach(self => prepareNewsCards(self));
    };

    const redirectExternal = () => {
        const el = document.querySelector('[data-redirect-url]');
        const url = el?.dataset.redirectUrl?.trim();
        if (!url || el.classList.contains('w-condition-invisible')) return false;
        window.location.replace(url);
        return true;
    };

    script();
});
