const baunfire = {
    initialized: false,
    modules: [],
    anim: {
        start: "top 60%"
    },
    lenis: null,
    async init() {
        if (this.initialized) return;
        this.initialized = true;

        for (const mod of this.modules) {
            if (typeof mod.init !== 'function') continue;

            let els;

            if (mod.selector) {
                els = document.querySelectorAll(mod.selector);
                if (!els.length) continue;
            }

            try {
                mod.init(els, baunfire);
            } catch (err) {
                baunfire.Global?.fancyLog(err, 'error');
                console.error(err);
            }

            await yieldToMain();
        }

        window.ScrollTrigger?.refresh();
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
    async ready(callback) {
        baunfire.smoothScroll();
        await baunfire.init();
        if (typeof callback === 'function') callback(baunfire);
    }
};

const yieldToMain = () => (
    window.scheduler?.yield
        ? window.scheduler.yield()
        : new Promise(resolve => setTimeout(resolve, 0))
);

window.baunfire = baunfire;

export const defineBlock = (selector, setup) => ({ selector, init: setup });

export const registerModules = (entries) => {
    entries.forEach((mod) => {
        if (mod) baunfire.addModule(mod);
    });
};

export default baunfire;
