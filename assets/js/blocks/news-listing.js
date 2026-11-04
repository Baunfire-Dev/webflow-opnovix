import { defineBlock } from '../app/baunfire.js';
import { prepareNewsCards } from '../helpers/news.js';
import { customSelect } from '../helpers/dropdown.js';

export default defineBlock('section.news-listing', (els, baunfire) => {
    const FINSWEET_SRC = 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js';
    const MOBILE = window.matchMedia('(max-width: 47.9375rem)');
    const typeSyncs = new Map();
    let uid = 0;

    const script = () => {
        els.forEach(self => handleListing(self));
        loadFinsweet();
    };

    const loadFinsweet = () => {
        if (document.querySelector(`script[src="${FINSWEET_SRC}"]`)) return;

        window.FinsweetAttributes = window.FinsweetAttributes || [];
        window.FinsweetAttributes.push(['list', (instances) => {
            instances.forEach(instance => {
                instance.addHook?.('filter', (items) => {
                    const block = items?.[0]?.element?.closest('section.news-listing');
                    typeSyncs.get(block)?.(items.map(item => item.element));
                    return items;
                });

                instance.addHook?.('afterRender', (items) => {
                    items.forEach(item => item.element && prepareNewsCards(item.element));
                    baunfire.Global.screenSizeChange();
                    return items;
                });
            });
            baunfire.Global.screenSizeChange();
        }]);

        const tag = document.createElement('script');
        tag.type = 'module';
        tag.async = true;
        tag.src = FINSWEET_SRC;
        tag.setAttribute('fs-list', '');
        document.body.appendChild(tag);
    };

    const optionHTML = (radio) => `<option value="${radio.value}">${radio.closest('.nl-tab')?.textContent.trim() ?? ''}</option>`;

    const showHTML = (id, radios) => `
        <div class="nl-show">
            <label class="nl-field-label g-caption" for="${id}">Show</label>
            <select class="nl-select g-caption" id="${id}">
                ${radios.map(optionHTML).join('')}
            </select>
        </div>
    `;

    const normalize = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');

    const typeFromLabel = (radio, types) => {
        const label = radio.closest('.nl-tab')?.textContent.trim() ?? '';
        const key = normalize(label);
        const match = types.find(type => [key, key.replace(/s$/, ''), key.replace(/es$/, '')].includes(normalize(type)));
        return match ?? label.replace(/s$/i, '');
    };

    const handleListing = (self) => {
        prepareNewsCards(self);

        const tabs = self.querySelector('.nl-tabs');
        const form = tabs?.closest('form');
        const all = self.querySelector('[data-nl-all]');
        if (!form || !tabs) return;

        self.querySelectorAll('[fs-list-element="filters"]').forEach(el => el.removeAttribute('fs-list-element'));
        form.setAttribute('fs-list-element', 'filters');
        form.addEventListener('submit', (e) => e.preventDefault());

        const types = [...new Set([...self.querySelectorAll('.nl-tile [fs-list-field="type"]')].map(el => el.textContent.trim()))];
        const radios = [...tabs.querySelectorAll('input[type="radio"]')];

        radios.forEach(radio => {
            if (radio.hasAttribute('data-nl-all')) return;
            radio.setAttribute('fs-list-field', 'type');
            radio.value = radio.getAttribute('fs-list-value')?.trim() || typeFromLabel(radio, types);
            radio.setAttribute('fs-list-value', radio.value);
        });

        if (all) {
            all.value = '';
            all.checked = true;
            all.setAttribute('fs-list-element', 'clear');
        }

        const id = `nl-show-${++uid}`;
        tabs.insertAdjacentHTML('beforebegin', showHTML(id, radios));
        const select = self.querySelector(`#${id}`);
        const show = customSelect(select, 'nl');

        const sync = () => {
            const checked = radios.find(radio => radio.checked) ?? all;
            if (!checked) return;
            select.value = checked.value;
            show.refresh();
            radios.forEach(radio => radio.closest('.nl-tab')?.classList.toggle('is-active', radio === checked));
        };

        select.addEventListener('change', () => {
            const target = radios.find(radio => radio.value === select.value);
            target?.click();
        });

        all?.addEventListener('click', () => requestAnimationFrame(() => {
            all.checked = true;
            sync();
        }));

        form.addEventListener('change', sync);
        sync();

        handleTypes(self, radios, select, show);
        handleSort(self);
        handleEmpty(self);
    };

    const typesIn = (elements) => elements
        .filter(Boolean)
        .flatMap(el => [...el.querySelectorAll('.nl-tile [fs-list-field="type"]')])
        .map(el => normalize(el.textContent));

    const handleTypes = (self, radios, select, show) => {
        const present = new Set(typesIn([self]));

        const update = (elements = []) => {
            typesIn(elements).forEach(type => present.add(type));

            radios.forEach(radio => {
                if (radio.hasAttribute('data-nl-all')) return;
                const visible = present.has(normalize(radio.value));
                radio.closest('.nl-tab')?.classList.toggle('is-hidden', !visible);
                const option = [...select.options].find(item => item.value === radio.value);
                if (option) option.hidden = !visible;
            });

            show.refresh();
            self.classList.add('is-types-ready');
        };

        typeSyncs.set(self, update);
        update();
    };

    const handleEmpty = (self) => {
        const list = self.querySelector('.nl-grid');
        const empty = self.querySelector('[data-nl-empty]');
        if (!list || !empty) return;

        const update = () => {
            const isEmpty = !list.querySelector('.nl-item');
            self.classList.toggle('is-empty', isEmpty);
            empty.classList.toggle('is-visible', isEmpty);
        };

        new MutationObserver(update).observe(list, { childList: true });
        update();
    };

    const handleSort = (self) => {
        const sort = self.querySelector('[fs-list-element="sort-trigger"]');
        if (!sort) return;

        const options = [...sort.options];
        options.forEach(option => { option.dataset.long = option.textContent; });
        const dropdown = customSelect(sort, 'nl');

        const label = () => {
            options.forEach(option => {
                option.textContent = MOBILE.matches ? (option.dataset.short || option.dataset.long) : option.dataset.long;
            });
            dropdown.refresh();
        };

        MOBILE.addEventListener('change', label);
        label();
    };

    script();
});
