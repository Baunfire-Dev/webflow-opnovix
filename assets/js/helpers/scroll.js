import baunfire from '../app/baunfire.js';

export const isHandheld = () => window.matchMedia("(max-width: 1200px)").matches;

export const scrollToSection = (el, offset = -100, duration = 1) => {
    baunfire.lenis?.stop();
    baunfire.lenis?.start();
    baunfire.lenis?.scrollTo(el, {
        duration,
        offset,
    });
};
