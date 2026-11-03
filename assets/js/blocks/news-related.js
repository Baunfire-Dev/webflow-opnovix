import { defineBlock } from '../app/baunfire.js';
import { prepareNewsCards } from '../helpers/news.js';

export default defineBlock('section.news-related', (els) => {
    const LIMIT = 3;

    const script = () => {
        els.forEach(self => {
            handleRelated(self);
            prepareNewsCards(self);
        });
    };

    const normalize = (text) => (text || '').trim().toLowerCase();

    const currentSlug = () => window.location.pathname.replace(/\/+$/, '').split('/').pop();

    const currentType = () => normalize(document.querySelector('.news-detail-hero .news-type')?.textContent);

    const typeOf = (item) => normalize(item.querySelector('.news-type')?.textContent);

    const slugOf = (item) => normalize(item.querySelector('[data-slug]')?.dataset.slug);

    const handleRelated = (self) => {
        const list = self.querySelector('.nr-grid');
        if (!list) return;

        const slug = normalize(currentSlug());
        const type = currentType();
        const items = [...list.querySelectorAll('.nr-item')];

        const others = items.filter(item => {
            if (slugOf(item) !== slug) return true;
            item.remove();
            return false;
        });

        const ranked = type
            ? [...others.filter(item => typeOf(item) === type), ...others.filter(item => typeOf(item) !== type)]
            : others;

        ranked.forEach((item, i) => {
            if (i < LIMIT) list.appendChild(item);
            else item.remove();
        });

        if (!ranked.length) self.classList.add('is-empty');
        self.classList.add('is-ready');
    };

    script();
});
