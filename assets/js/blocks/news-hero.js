import { defineBlock } from '../app/baunfire.js';
import { withSwiper, createCarousel } from '../helpers/carousel.js';
import { prepareNewsCards } from '../helpers/news.js';

export default defineBlock('section.news-hero', (els) => {
    const DELAY = 6;

    const script = () => {
        els.forEach(self => prepareNewsCards(self));
        withSwiper(els, handleCarousel);
    };

    const barHTML = (index) => `
        <button class="nh-bar" type="button" aria-label="Show featured story ${index + 1}">
            <span class="nh-bar-fill"></span>
        </button>
    `;

    const handleCarousel = (self) => {
        const carousel = self.querySelector('.nh-carousel');
        const list = self.querySelector('.nh-list');
        const slides = [...self.querySelectorAll('.nh-slide')];
        const progress = self.querySelector('.nh-progress');
        if (!carousel || !list || !slides.length) return;

        if (slides.length < 2) {
            progress?.classList.add('is-hidden');
            return;
        }

        carousel.classList.add('swiper');
        list.classList.add('swiper-wrapper');
        slides.forEach(slide => slide.classList.add('swiper-slide'));

        progress.insertAdjacentHTML('beforeend', slides.map((_, i) => barHTML(i)).join(''));
        const bars = [...progress.querySelectorAll('.nh-bar')];
        const fills = bars.map(bar => bar.querySelector('.nh-bar-fill'));
        let tween = null;

        const play = (swiper) => {
            tween?.kill();
            const index = swiper.realIndex;

            fills.forEach((fill, i) => gsap.set(fill, { scaleX: i < index ? 1 : 0 }));
            bars.forEach((bar, i) => bar.classList.toggle('is-active', i === index));

            tween = gsap.to(fills[index], {
                scaleX: 1,
                duration: DELAY,
                ease: 'none',
                onComplete: () => swiper.slideNext(),
            });
        };

        const swiper = createCarousel(self, carousel, {
            nav: false,
            pagination: false,
            loop: true,
            speed: 700,
            slidesPerView: 1,
            spaceBetween: 16,
            on: {
                afterInit: (s) => play(s),
                slideChange: (s) => play(s),
            },
        });

        bars.forEach((bar, i) => bar.addEventListener('click', () => swiper?.slideToLoop(i)));

        carousel.addEventListener('mouseenter', () => tween?.pause());
        carousel.addEventListener('mouseleave', () => tween?.resume());
        carousel.addEventListener('focusin', () => tween?.pause());
        carousel.addEventListener('focusout', () => tween?.resume());
    };

    script();
});
