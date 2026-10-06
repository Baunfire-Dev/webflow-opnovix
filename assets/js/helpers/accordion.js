import baunfire from '../app/baunfire.js';
import { isHandheld, scrollToSection } from './scroll.js';

export const generateAccordion = (root, options = {}) => {
    const { item, offset = -100, onActivate } = options;

    const accs = [...root.querySelectorAll(item)];
    if (!accs.length) return;

    const setActive = (index) => {
        accs.forEach((a) => a.classList.remove("active"));
        accs[index]?.classList.add("active");
        onActivate?.(index);
    };

    accs.forEach((acc, index) => {
        acc.addEventListener("click", (e) => {
            if (e.target.closest("a, button")) return;
            if (acc.classList.contains("active")) return;

            setActive(index);

            if (isHandheld()) scrollToSection(acc, offset);
            baunfire.Global.screenSizeChange();
        });
    });

    setActive(0);
};
