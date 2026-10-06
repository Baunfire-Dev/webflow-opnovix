import baunfire from '../app/baunfire.js';

export const withSwiper = (els, setup) => {
    baunfire.Global.importSwiperScript(() => {
        els.forEach((self) => setup(self));
    });
};

export const createCarousel = (self, target, options = {}) => {
    const swiperEl = typeof target === 'string' ? self.querySelector(target) : target;
    if (!swiperEl) return null;

    const { on = {}, nav = true, pagination = true, onBeforeReady, ...config } = options;

    if (nav) {
        config.navigation = {
            prevEl: self.querySelector(".swiper-button-prev"),
            nextEl: self.querySelector(".swiper-button-next"),
        };
    }

    if (pagination) {
        config.pagination = {
            el: self.querySelector(".swiper-pagination"),
            clickable: true,
        };
    }

    return new Swiper(swiperEl, {
        ...config,
        on: {
            ...on,
            afterInit(swiper) {
                onBeforeReady?.call(this, swiper);
                baunfire.Global.screenSizeChange();
                swiperEl.classList.add('is-ready');
                on.afterInit?.call(this, swiper);
            },
            resize(swiper) {
                baunfire.Global.screenSizeChange();
                on.resize?.call(this, swiper);
            },
        },
    });
};
