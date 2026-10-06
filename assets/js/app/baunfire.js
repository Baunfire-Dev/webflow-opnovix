const baunfire = {
    initialized: false,
    modules: [],
    anim: {
        start: "top 60%"
    },
    lenis: null,
    init() {
        if (this.initialized) return;
        this.initialized = true;

        this.modules.forEach(mod => {
            if (typeof mod.init !== 'function') return;

            let els;

            if (mod.selector) {
                els = document.querySelectorAll(mod.selector);
                if (!els.length) return;
            }

            try {
                mod.init(els, baunfire);
            } catch (err) {
                baunfire.Global?.fancyLog(err, 'error');
                console.error(err);
            }
        });

        document.dispatchEvent(new CustomEvent('baunfire:ready'));
    },
    addModule(mod) {
        this.modules.push(mod);
    },
    load() {
        console.log('Baunfire loaded');
    },
    smoothScroll() {
        this.lenis = window.__lenis;
    },
    ready(callback) {
        baunfire.smoothScroll();
        baunfire.init();
        if (typeof callback === 'function') callback(baunfire);
    }
};

window.baunfire = baunfire;

export const defineBlock = (selector, setup) => ({ selector, init: setup });

export const registerModules = (entries) => {
    entries.forEach((mod) => {
        if (mod) baunfire.addModule(mod);
    });
};

export default baunfire;
