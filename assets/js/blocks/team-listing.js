import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.team-listing', (els) => {
    let uid = 0;

    const script = () => {
        els.forEach(self => handleListing(self));
    };

    const handleListing = (self) => {
        handleGroup(self.querySelectorAll('.tl-card'), '.tl-card-overlay', '.tl-card-bio', true);
        handleGroup(self.querySelectorAll('.tl-advisor'), '.tl-advisor-bio', '.tl-advisor-para', false);
    };

    const handleGroup = (items, panelSelector, bioSelector, closeOutside) => {
        const entries = [...items]
            .map(item => setupItem(item, panelSelector, bioSelector))
            .filter(Boolean);

        entries.forEach(entry => {
            entry.item.addEventListener('click', () => {
                if (window.getSelection()?.toString()) return;

                const open = !entry.item.classList.contains('is-open');
                entries.forEach(other => {
                    if (other !== entry) toggle(other, false);
                });
                toggle(entry, open);
            });

            entry.item.addEventListener('keydown', (event) => {
                if (event.key !== 'Escape' || !entry.item.classList.contains('is-open')) return;
                toggle(entry, false);
                entry.button.focus();
            });
        });

        if (!closeOutside || !entries.length) return;

        document.addEventListener('click', (event) => {
            entries.forEach(entry => {
                if (entry.item.classList.contains('is-open') && !entry.item.contains(event.target)) toggle(entry, false);
            });
        });
    };

    const setupItem = (item, panelSelector, bioSelector) => {
        const button = item.querySelector('.tl-btn');
        const panel = item.querySelector(panelSelector);
        const bio = item.querySelector(bioSelector);
        if (!button || !panel) return null;

        if (!bio?.textContent.trim()) {
            item.classList.add('is-empty');
            return null;
        }

        const name = item.querySelector('.tl-name')?.textContent.trim() ?? '';
        const id = `tl-bio-${++uid}`;

        panel.id = id;
        panel.setAttribute('data-lenis-prevent', '');
        button.setAttribute('aria-controls', id);

        const entry = { item, button, name };
        toggle(entry, false);

        return entry;
    };

    const toggle = (entry, open) => {
        entry.item.classList.toggle('is-open', open);
        entry.button.setAttribute('aria-expanded', String(open));
        entry.button.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} bio for ${entry.name}`);
    };

    script();
});
