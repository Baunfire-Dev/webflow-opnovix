import { defineBlock } from '../app/baunfire.js';

export default defineBlock('section.team-listing', (els, baunfire) => {
    const ALL = 'all';
    const REVEAL = { duration: 0.35, distance: 6, stagger: 0.03, ease: 'power2-out' };
    let uid = 0;

    const script = () => {
        els.forEach(self => handleListing(self));
    };

    const slugify = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const optionHTML = (tab) => `<option value="${tab.dataset.role}">${tab.textContent.trim()}</option>`;

    const filterHTML = (id, tabs) => `
        <div class="tl-filter">
            <label class="tl-filter-label g-caption" for="${id}">Show</label>
            <select class="tl-filter-select g-caption" id="${id}">
                ${tabs.map(optionHTML).join('')}
            </select>
        </div>
    `;

    const handleListing = (self) => {
        const cards = [...self.querySelectorAll('.tl-card')];
        if (!cards.length) return;

        const tabs = [...self.querySelectorAll('.tl-tab')];
        const tabRow = self.querySelector('.tl-tabs');

        tabs.forEach(tab => {
            tab.dataset.role = tab.dataset.role || slugify(tab.textContent);
            tab.setAttribute('type', 'button');
        });

        const memberships = getMemberships(self);

        cards.forEach(card => {
            const slug = card.querySelector('.tl-card-slug')?.textContent.trim() ?? '';
            card.dataset.roles = (memberships.get(slug) ?? []).join(' ');
        });

        let select = null;

        if (tabRow && tabs.length) {
            const id = `tl-filter-${++uid}`;
            tabRow.insertAdjacentHTML('beforebegin', filterHTML(id, tabs));
            select = self.querySelector(`#${id}`);
            select.addEventListener('change', () => setFilter(select.value));
        }

        const setFilter = (role) => {
            tabs.forEach(tab => {
                const active = tab.dataset.role === role;
                tab.classList.toggle('is-active', active);
                tab.setAttribute('aria-pressed', String(active));
            });

            if (select) select.value = role;

            const shown = cards.filter(card => {
                const match = role === ALL || card.dataset.roles.split(' ').includes(role);
                card.classList.toggle('is-hidden', !match);
                return match;
            });

            gsap.fromTo(shown,
                { autoAlpha: 0, y: REVEAL.distance },
                { autoAlpha: 1, y: 0, duration: REVEAL.duration, stagger: REVEAL.stagger, ease: REVEAL.ease, overwrite: true, clearProps: 'transform,opacity,visibility' }
            );

            ScrollTrigger.refresh();
        };

        tabs.forEach(tab => tab.addEventListener('click', () => setFilter(tab.dataset.role)));

        handleModal(self, cards);
    };

    const getMemberships = (self) => {
        const memberships = new Map();

        self.querySelectorAll('.tl-role-list').forEach(list => {
            const role = list.dataset.role;

            list.querySelectorAll('.tl-role-member').forEach(member => {
                const slug = member.textContent.trim();
                memberships.set(slug, [...(memberships.get(slug) ?? []), role]);
            });
        });

        return memberships;
    };

    const handleModal = (self, cards) => {
        const modal = self.querySelector('.tl-modal');
        if (!modal || typeof modal.showModal !== 'function') return;

        const name = modal.querySelector('.tl-modal-name');
        const role = modal.querySelector('.tl-modal-role');
        const bio = modal.querySelector('.tl-modal-bio');
        let trigger = null;

        const open = (card, button) => {
            trigger = button;
            name.textContent = card.querySelector('.tl-name')?.textContent.trim() ?? '';
            role.textContent = card.querySelector('.tl-role')?.textContent.trim() ?? '';
            bio.innerHTML = card.querySelector('.tl-card-bio')?.innerHTML ?? '';
            modal.showModal();
            modal.scrollTop = 0;
            baunfire.Global?.siteScrolling(false);
        };

        const close = () => {
            if (modal.open) modal.close();
        };

        modal.addEventListener('close', () => {
            baunfire.Global?.siteScrolling(true);
            trigger?.focus();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        modal.querySelector('.tl-modal-close')?.addEventListener('click', close);

        cards.forEach(card => {
            const button = card.querySelector('.tl-btn');
            if (!button) return;

            const person = card.querySelector('.tl-name')?.textContent.trim() ?? '';
            button.setAttribute('aria-label', `Read ${person}'s bio`);
            button.addEventListener('click', () => open(card, button));
        });
    };

    script();
});
