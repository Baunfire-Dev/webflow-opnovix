import baunfire from '../app/baunfire.js';
import config from '../../../config.json';

const { templateURL } = config;

export const Global = {
    init() {
        this.handleAnchorLinks();
        this.observeCollectionLists();
        this.handleHubspotForms();
        this.observeForms();
        this.observePageHeight();
    },

    observePageHeight() {
        let height = document.body.offsetHeight;
        const refresh = gsap.delayedCall(0.25, () => this.screenSizeChange()).pause();

        new ResizeObserver(() => {
            const next = document.body.offsetHeight;
            if (Math.abs(next - height) < 1) return;
            height = next;
            refresh.restart(true);
        }).observe(document.body);
    },

    importSwiperScript(callback) {
        if (typeof Swiper !== 'undefined') {
            callback?.();
            return;
        }

        if (this._swiperLoading) {
            this._swiperQueue.push(callback);
            return;
        }

        this._swiperLoading = true;
        this._swiperQueue = [];

        this.fancyLog('Loading Swiper...');

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${templateURL}/assets/css/external/swiper-bundle.min.css`;
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = `${templateURL}/assets/js/external/swiper-bundle.min.js`;
        script.defer = true;

        script.onload = () => {
            this.fancyLog('Swiper loaded.');
            this._swiperLoading = false;
            callback?.();
            this._swiperQueue.forEach(cb => cb?.());
            this._swiperQueue = [];
        };

        script.onerror = () => {
            this._swiperLoading = false;
            console.error('Failed to load Swiper script.');
        };

        document.body.appendChild(script);
    },

    importHubspotScript(portalId) {
        window._hubspotPromises = window._hubspotPromises || {};

        if (window._hubspotPromises[portalId]) {
            return window._hubspotPromises[portalId];
        }

        window._hubspotPromises[portalId] = new Promise((resolve, reject) => {
            this.fancyLog('Loading Hubspot...');

            const script = document.createElement('script');
            script.src = `https://js.hsforms.net/forms/embed/developer/${portalId}.js`;
            script.defer = true;

            script.onload = () => {
                this.fancyLog('Hubspot Embed loaded.');
                resolve();
            };

            script.onerror = () => reject(new Error('Failed to load Hubspot Embed script.'));

            document.body.appendChild(script);
        });

        return window._hubspotPromises[portalId];
    },

    importVimeoScript(callback) {
        if (typeof Vimeo !== "undefined") {
            callback?.();
            return;
        }

        if (this._vimeoLoading) {
            this._vimeoQueue.push(callback);
            return;
        }

        this._vimeoLoading = true;
        this._vimeoQueue = [];

        this.fancyLog("Loading Vimeo Player...");

        const script = document.createElement("script");
        script.src = `${templateURL}/assets/js/external/vimeo-player.js`;
        script.defer = true;

        script.onload = () => {
            this.fancyLog("Vimeo Player loaded.");
            this._vimeoLoading = false;
            callback?.();
            this._vimeoQueue.forEach(cb => cb?.());
            this._vimeoQueue = [];
        };

        script.onerror = () => {
            this._vimeoLoading = false;
            console.error("Failed to load Vimeo Player script.");
        };

        document.body.appendChild(script);
    },

    handleAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const hash = anchor.getAttribute('href');
                if (!hash || hash === '#' || hash === '#0') return;

                const id = decodeURIComponent(hash.slice(1));
                const target = document.getElementById(id);
                if (!target) return;

                e.preventDefault();

                baunfire.lenis?.scrollTo(target, {
                    offset: -100,
                    duration: 0.6,
                    lock: true,
                    force: true,
                });

                history.pushState(null, '', hash);
            });
        });
    },

    handleTextCount(el, duration = 0.8, withTrigger = false, parent) {
        const counter = el.querySelector("[data-amount]");
        if (!counter) return;
        
        const rawAmount = counter.dataset.amount.toString();
        const clean = v => (v + "").replace(/[^\d\.-]/gi, "");
        const num = clean(rawAmount);
        const decimals = (num.split(".")[1] || "").length;

        const proxy = { val: parseFloat(clean(counter.textContent)) || 0 };

        const props = {
            val: +num,
            duration: duration,
            ease: "power1.inOut",
            once: true,
            onUpdate: () => {
                counter.textContent = this.formatNumber(proxy.val, decimals);
            }
        };

        if (withTrigger && parent) {
            props.scrollTrigger = {
                trigger: parent,
                start: baunfire.anim.start
            };
        }

        gsap.to(proxy, props);
    },

    observeForms() {
        const wraps = document.querySelectorAll(".cf-form");
        if (!wraps.length) return;

        let raf;
        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                this.screenSizeChange();
            });
        };

        const ro = new ResizeObserver(schedule);

        wraps.forEach((wrap) => {
            ro.observe(wrap);
        });
    },

    observeCollectionLists() {
        const wraps = document.querySelectorAll(".w-dyn-list");
        if (!wraps.length) return;

        let raf;
        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                this.screenSizeChange();
            });
        };

        const mo = new MutationObserver(schedule);
        const ro = new ResizeObserver(schedule);

        wraps.forEach((wrap) => {
            mo.observe(wrap, { childList: true });
            ro.observe(wrap);
        });
    },

    screenSizeChange() {
        if (this._screenSizePending) return;
        this._screenSizePending = true;

        requestAnimationFrame(() => {
            setTimeout(() => {
                this._screenSizePending = false;
                ScrollTrigger.refresh();
                baunfire.lenis?.resize();
            }, 0);
        });
    },

    siteScrolling(enabled = true) {
        if (enabled) {
            document.documentElement.classList.remove('disable-scrolling');
            baunfire.lenis?.start();
        } else {
            document.documentElement.classList.add('disable-scrolling');
            baunfire.lenis?.stop();
        }
    },

    callAfterResize(func, delay = 0.2) {
        const dc = gsap.delayedCall(delay, func).pause();
        const handler = () => dc.restart(true);
        window.addEventListener("resize", handler);
        return handler;
    },

    fancyLog(message, type = "info") {
        const styles = {
            info: {
                label: 'ℹ️ INFO:',
                style1: 'color: white; background-color: #2196F3; padding: 2px 6px; border-radius: 4px;',
                style2: 'color: #FFF;'
            },
            warn: {
                label: '⚠️ WARNING:',
                style1: 'color: black; background-color: #FFEB3B; padding: 2px 6px; border-radius: 4px;',
                style2: 'color: #000;'
            },
            error: {
                label: '⛔ ERROR:',
                style1: 'color: white; background-color: #F44336; padding: 2px 6px; border-radius: 4px;',
                style2: 'color: #FFF;'
            }
        };

        const { label, style1, style2 } = styles[type] || styles.info;

        if (typeof message === 'object') {
            console.log(`%c${label}`, style1);
            console.log(message);
        } else {
            console.log(`%c${label} %c ${message}`, style1, style2);
        }
    },

    formatNumber(value, decimals) {
        let s = (+value).toLocaleString("en-US").split(".");
        return decimals ? s[0] + "." + ((s[1] || "") + "00000000").substr(0, decimals) : s[0];
    },

    handleHubspotForms() {
        const forms = document.querySelectorAll(".g-hs-form");
        if (!forms.length) return;

        const stylizeBtn = (container) => {
            const submitBTN = container.querySelector('button.hsfc-Button[type="submit"]');
            if (!submitBTN || submitBTN.dataset.stylized) return;
            submitBTN.dataset.stylized = 'true';
        };

        const handleEntrance = (container) => {
            const formContainer = container.querySelector('[data-hs-island]');
            if (!formContainer) return;

            gsap.fromTo(formContainer,
                {
                    autoAlpha: 0,
                },
                {
                    autoAlpha: 1,
                    duration: 0.3,
                    ease: "power1.out"
                }
            )
        };

        const showError = (container) => {
            clearTimeout(container._hsTimeout);
            if (container.dataset.hsDone) return;
            container.dataset.hsDone = 'error';

            container.querySelector('.g-hs-error')?.classList.add('active');
            container.querySelector('.g-hs-loading')?.classList.add('disabled');
        };

        const showReady = (container) => {
            clearTimeout(container._hsTimeout);
            if (container.dataset.hsDone === 'ready') return;
            container.dataset.hsDone = 'ready';

            container.querySelectorAll('.g-hs-props, .g-hs-error, .g-hs-loading')
                .forEach(el => el.remove());

            stylizeBtn(container);
            handleEntrance(container);
        };

        const resolveContainer = (event) => {
            let instanceId = event.detail?.instanceId;
            if (!instanceId) {
                try {
                    instanceId = window.HubSpotFormsV4?.getFormFromEvent(event)?.getInstanceId?.();
                } catch (e) { }
            }
            if (!instanceId) return null;

            const island = document.getElementById('hs-form-island-' + instanceId);
            return island?.closest('.g-hs-form') || null;
        };

        window.addEventListener('hs-form-event:on-ready', (event) => {
            const container = resolveContainer(event);
            if (!container) return;

            showReady(container);

            if (!container._hsResizeObserver) {
                container._hsResizeObserver = new ResizeObserver(() => {
                    baunfire.Global.screenSizeChange();
                });

                container._hsResizeObserver.observe(container);
            }

            baunfire.Global.screenSizeChange();
        });

        window.addEventListener('hs-form-event:on-submission:success', (event) => {
            baunfire.Global.screenSizeChange();
        });

        forms.forEach(form => {
            form.classList.add('hs-form-frame');
            form._hsTimeout = setTimeout(() => showError(form), 10000);
            this.importHubspotScript(form.dataset.portalId).catch(() => showError(form));
        });
    },
};

baunfire.Global = Global;

export default Global;
