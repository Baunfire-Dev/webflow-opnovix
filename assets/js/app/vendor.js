import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import motion from '../../../assets/json/motion.json';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

Object.entries(motion.ease).forEach(([name, curve]) => CustomEase.create(name, curve.join(',')));

const lenis = new Lenis({ anchors: true });
new ResizeObserver(() => lenis.resize()).observe(document.body);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.ScrollToPlugin = ScrollToPlugin;
window.CustomEase = CustomEase;
window.Lenis = Lenis;
window.__lenis = lenis;
window.__motion = motion;

export { gsap, ScrollTrigger, ScrollToPlugin, CustomEase, Lenis, motion };