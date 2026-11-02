import { defineBlock } from '../app/baunfire.js';
import { scrollToSection } from '../helpers/scroll.js';

export default defineBlock('section.news-detail-body', (els) => {
    const OFFSET = -112;
    const COPIED_TEXT = 'Copied';
    const COPIED_DURATION = 2000;

    const script = () => {
        els.forEach(self => {
            handleToc(self);
            handleShare(self);
        });
    };

    const slugify = (text) => text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const escapeHTML = (text) => text.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);

    const itemHTML = ({ id, label }, index) => `
        <a class="nd-toc-item${index === 0 ? ' is-active' : ''}" href="#${id}">
            <span class="nd-toc-index g-caption">${String(index + 1).padStart(2, '0')}</span>
            <span class="nd-toc-text g-p-sm">${escapeHTML(label)}</span>
        </a>
    `;

    const handleToc = (self) => {
        const list = self.querySelector('[data-nd-toc]');
        if (!list) return;

        const used = new Set();
        const content = self.querySelector('.nd-content');
        const entries = [...self.querySelectorAll('.nd-content .nd-label')]
            .map(section => {
                const label = section.querySelector('.nd-eyebrow')?.textContent.trim();
                if (!label) return null;

                const base = slugify(label) || 'section';
                let id = section.id || base;
                for (let n = 2; used.has(id) || (!section.id && document.getElementById(id)); n++) id = `${base}-${n}`;
                used.add(id);
                section.id = id;

                return { id, label, section };
            })
            .filter(Boolean);

        if (!entries.length) {
            list.closest('.nd-rail-group')?.classList.add('is-hidden');
            return;
        }

        list.innerHTML = entries.map(itemHTML).join('');
        const items = [...list.querySelectorAll('.nd-toc-item')];

        const setActive = (index) => {
            items.forEach((item, i) => {
                item.classList.toggle('is-active', i === index);
                if (i === index) item.setAttribute('aria-current', 'location');
                else item.removeAttribute('aria-current');
            });
        };

        items.forEach((item, i) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const { id, section } = entries[i];
                scrollToSection(section, OFFSET, 1);
                history.replaceState(null, '', `#${id}`);
                setActive(i);
            });
        });

        entries.forEach(({ section }, i) => {
            const next = entries[i + 1]?.section;
            ScrollTrigger.create({
                trigger: section,
                start: 'top 40%',
                endTrigger: next || content,
                end: next ? 'top 40%' : 'bottom 40%',
                onEnter: () => setActive(i),
                onEnterBack: () => setActive(i),
            });
        });

        const hash = decodeURIComponent(window.location.hash.slice(1));
        const fromHash = entries.findIndex(entry => entry.id === hash);
        if (fromHash > -1) {
            setActive(fromHash);
            requestAnimationFrame(() => scrollToSection(entries[fromHash].section, OFFSET, 0));
        }
    };

    const pageURL = () => `${window.location.origin}${window.location.pathname}`;

    const shareURL = (type) => {
        const url = encodeURIComponent(pageURL());
        const text = encodeURIComponent(document.title);
        if (type === 'linkedin') return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        if (type === 'x') return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        return null;
    };

    const copyText = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            const field = document.createElement('textarea');
            field.value = text;
            field.setAttribute('readonly', '');
            field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
            document.body.appendChild(field);
            field.select();
            const ok = document.execCommand('copy');
            field.remove();
            return ok;
        }
    };

    const handleShare = (self) => {
        self.querySelectorAll('[data-share]').forEach(link => {
            const type = link.dataset.share;
            const url = shareURL(type);

            if (url) {
                link.setAttribute('href', url);
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                return;
            }

            if (type !== 'copy') return;

            const label = link.textContent;
            let timer = null;
            link.setAttribute('role', 'button');
            link.setAttribute('aria-live', 'polite');

            link.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!(await copyText(pageURL()))) return;

                clearTimeout(timer);
                link.textContent = COPIED_TEXT;
                link.classList.add('is-copied');
                timer = setTimeout(() => {
                    link.textContent = label;
                    link.classList.remove('is-copied');
                }, COPIED_DURATION);
            });
        });
    };

    script();
});
