import baunfire from '../app/baunfire.js';

export const Richtext = {
    OPEN: /^\[\[block:([a-z0-9-]+)\]\]$/i,
    CLOSE: /^\[\[\/block\]\]$/i,

    renderers: {},

    apply(root) {
        if (!root) return 0;

        const blocks = this.collect(root);

        blocks.forEach((block) => {
            const render = this.renderers[block.type];

            if (!render) {
                block.els.forEach((el) => el.remove());
                return;
            }

            const temp = document.createElement("div");
            temp.innerHTML = render(block.lines).trim();
            const node = temp.firstElementChild;

            if (node) root.insertBefore(node, block.anchor);
            block.els.forEach((el) => el.remove());
        });

        return blocks.length;
    },

    collect(root) {
        const lines = this.toLines(root);
        const blocks = [];
        let open = null;

        lines.forEach(({ el, text }) => {
            const openMatch = text.match(this.OPEN);

            if (openMatch) {
                open = { type: openMatch[1], lines: [], els: new Set([el]), anchor: el };
                return;
            }
            if (this.CLOSE.test(text) && open) {
                open.els.add(el);
                blocks.push(open);
                open = null;
                return;
            }
            if (open) {
                if (text) open.lines.push(text);
                open.els.add(el);
            }
        });

        return blocks;
    },

    toLines(root) {
        const out = [];

        [...root.children].forEach((el) => {
            const raw = el.innerHTML;

            if (/<br\s*\/?>/i.test(raw)) {
                raw.split(/<br\s*\/?>/i).forEach((chunk) => {
                    const tmp = document.createElement("div");
                    tmp.innerHTML = chunk;
                    out.push({ el, text: tmp.textContent.trim() });
                });
                return;
            }

            out.push({ el, text: el.textContent.trim() });
        });

        return out;
    },
};

baunfire.Richtext = Richtext;

export default Richtext;
