let uid = 0;

export const customSelect = (select, prefix) => {
    const id = `${prefix}-dd-${++uid}`;

    const label = select.id ? document.querySelector(`label[for="${select.id}"]`) : null;
    const labelText = select.getAttribute('aria-label') || label?.textContent.trim() || '';

    const optionHTML = (option, index) => `
        <li class="${prefix}-dd-option g-caption" id="${id}-${index}" role="option" data-value="${option.value}" aria-selected="${option.selected}">${option.textContent.trim()}</li>
    `;

    const dropdownHTML = () => `
        <div class="${prefix}-dd">
            <button class="${prefix}-dd-btn g-caption" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}" aria-label="${labelText}">
                <span class="${prefix}-dd-value"></span>
            </button>
            <ul class="${prefix}-dd-list" id="${id}" role="listbox" tabindex="-1" aria-label="${labelText}">
                ${[...select.options].map(optionHTML).join('')}
            </ul>
        </div>
    `;

    select.insertAdjacentHTML('afterend', dropdownHTML());
    select.classList.add('is-replaced');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    const root = select.nextElementSibling;
    const button = root.querySelector('button');
    const value = root.querySelector(`.${prefix}-dd-value`);
    const list = root.querySelector('ul');
    const items = [...list.querySelectorAll('li')];
    let active = select.selectedIndex;

    label?.addEventListener('click', (e) => {
        e.preventDefault();
        button.focus();
    });

    const sync = () => {
        const options = [...select.options];
        items.forEach((item, i) => {
            item.textContent = options[i]?.textContent.trim() ?? '';
            item.hidden = Boolean(options[i]?.hidden);
            item.setAttribute('aria-selected', String(i === select.selectedIndex));
        });
        value.textContent = options[select.selectedIndex]?.textContent.trim() ?? '';
    };

    const highlight = (index, step = 1) => {
        const total = items.length;
        let next = (index + total) % total;
        for (let n = 0; n < total && items[next].hidden; n++) next = (next + step + total) % total;
        active = next;
        items.forEach((item, i) => item.classList.toggle('is-active', i === active));
        list.setAttribute('aria-activedescendant', items[active].id);
        items[active].scrollIntoView({ block: 'nearest' });
    };

    const open = () => {
        root.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        highlight(select.selectedIndex);
        list.focus();
    };

    const close = (focus = true) => {
        if (!root.classList.contains('is-open')) return;
        root.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        if (focus) button.focus();
    };

    const choose = (index) => {
        if (select.selectedIndex !== index) {
            select.selectedIndex = index;
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        sync();
        close();
    };

    button.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));

    button.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            open();
        }
    });

    list.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') highlight(active + 1);
        else if (e.key === 'ArrowUp') highlight(active - 1, -1);
        else if (e.key === 'Home') highlight(0);
        else if (e.key === 'End') highlight(items.length - 1, -1);
        else if (e.key === 'Enter' || e.key === ' ') choose(active);
        else if (e.key === 'Escape' || e.key === 'Tab') return close(e.key === 'Escape');
        else return;
        e.preventDefault();
    });

    items.forEach((item, i) => {
        item.addEventListener('click', () => choose(i));
        item.addEventListener('mousemove', () => highlight(i));
    });

    document.addEventListener('click', (e) => {
        if (!root.contains(e.target)) close(false);
    });

    select.addEventListener('change', sync);
    sync();

    return { refresh: sync };
};
