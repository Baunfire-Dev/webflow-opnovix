import baunfire from '../app/baunfire.js';

export const Animation = {
    init() {
        this.handleNav();
        this.handleLogo();
        this.handleFooterGraphic();
    },

    handleNav() {
        const nav = document.querySelector("header");
        if (!nav) return;

        let lastScrollY = window.scrollY;
        let isScrolled = false;
        let scrollDirection = null;

        const links = nav.querySelectorAll(".g-nav-link");
        const parents = [...links].filter(link => link.querySelector(".g-nav-dd"));
        const singles = [...links].filter(link => !link.querySelector(".g-nav-dd"));

        const stateReset = () => {
            parents.forEach(p => p.classList.remove("open", "mob-open"));
        };

        const desktopDD = () => {
            const mm = gsap.matchMedia();

            mm.add("(min-width: 992px)", () => {
                const controller = new AbortController();
                const { signal } = controller;

                const region = nav.querySelector(".g-nav-inner");
                let current = null;
                let closeTimer = null;

                const handleOpen = (item) => {
                    clearTimeout(closeTimer);
                    if (current === item) return;

                    current?.classList.remove("open");
                    item.classList.add("open");
                    current = item;
                };

                const handleClose = () => {
                    clearTimeout(closeTimer);
                    current?.classList.remove("open");
                    current = null;
                };

                const scheduleClose = () => {
                    clearTimeout(closeTimer);
                    closeTimer = setTimeout(handleClose, 200);
                };

                parents.forEach((item) => {
                    item.querySelector(".g-nav-link-inner").addEventListener("mouseenter", () => handleOpen(item), { signal });
                    item.addEventListener("focusin", () => handleOpen(item), { signal });
                });

                singles.forEach((item) => {
                    item.addEventListener("mouseenter", handleClose, { signal });
                    item.addEventListener("focusin", handleClose, { signal });
                });

                region.addEventListener("mouseleave", scheduleClose, { signal });
                region.addEventListener("mouseenter", () => clearTimeout(closeTimer), { signal });
                region.addEventListener("focusout", (e) => {
                    if (!region.contains(e.relatedTarget)) handleClose();
                }, { signal });

                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") handleClose();
                }, { signal });

                return () => {
                    controller.abort();
                    handleClose();
                };
            });
        };

        const mobilePanel = () => {
            const burger = nav.querySelector(".g-nav-burger");
            const panelInner = nav.querySelector(".g-nav-panel-inner");
            if (!burger || !panelInner) return;

            const scrollPanelTo = (el) => {
                const elTop = Math.min(
                    el.getBoundingClientRect().top + panelInner.scrollTop - panelInner.getBoundingClientRect().top - 40,
                    panelInner.scrollHeight - panelInner.clientHeight
                );

                gsap.to(panelInner, {
                    duration: 0.6,
                    scrollTo: { y: elTop, autoKill: true },
                    ease: "power2-out",
                    overwrite: true
                });
            };

            const mm = gsap.matchMedia();

            mm.add("(max-width: 1199.98px)", () => {
                const controller = new AbortController();
                const { signal } = controller;

                const burgerLines = [...burger.querySelectorAll("svg path, svg line, svg rect")];

                if (burgerLines.length === 3) {
                    const sorted = burgerLines
                        .map((line) => {
                            const box = line.getBBox();
                            return { line, center: box.y + box.height / 2 };
                        })
                        .sort((a, b) => a.center - b.center);

                    const middle = sorted[1].center;
                    const rotations = ["45deg", "0deg", "-45deg"];

                    sorted.forEach(({ line, center }, i) => {
                        line.style.setProperty("--burger-shift", `${middle - center}px`);
                        line.style.setProperty("--burger-rotate", rotations[i]);
                        line.style.setProperty("--burger-opacity", i === 1 ? "0" : "1");
                    });
                }

                const showMobileNav = () => {
                    nav.classList.add("mob-active");
                    burger.setAttribute("aria-expanded", "true");
                    baunfire.Global.siteScrolling(false);
                };

                const hideMobileNav = () => {
                    nav.classList.remove("mob-active");
                    burger.setAttribute("aria-expanded", "false");
                    baunfire.Global.siteScrolling();
                    stateReset();
                };

                const toggleMobileNav = () => {
                    nav.classList.contains("mob-active") ? hideMobileNav() : showMobileNav();
                };

                burger.addEventListener("click", toggleMobileNav, { signal });
                burger.addEventListener("keydown", (e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    toggleMobileNav();
                }, { signal });

                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape" && nav.classList.contains("mob-active")) hideMobileNav();
                }, { signal });

                parents.forEach((el) => {
                    el.querySelector(".g-nav-link-inner").addEventListener("click", () => {
                        if (el.classList.contains("mob-open")) {
                            stateReset();
                            return;
                        }

                        stateReset();
                        el.classList.add("mob-open");
                        scrollPanelTo(el);
                    }, { signal });
                });

                return () => {
                    controller.abort();
                    gsap.killTweensOf(panelInner);
                    hideMobileNav();
                    burgerLines.forEach((line) => {
                        ["--burger-shift", "--burger-rotate", "--burger-opacity"].forEach(prop => line.style.removeProperty(prop));
                    });
                };
            });
        };

        desktopDD();
        mobilePanel();
    },

    handleLogo() {
        const header = document.querySelector(".g-nav-logo");
        const footer = document.querySelector(".footer-logo");

        if (header) {
            const paths = [...header.querySelectorAll("path")];
            const sparkles = paths.filter(path => path.getAttribute("d")?.startsWith("M90.1553"));
            const rings = paths.filter(path => path.getAttribute("d")?.startsWith("M87.666"));

            if (sparkles.length && rings.length) {
                const sparkle = sparkles.pop();
                rings.pop();
                [...sparkles, ...rings].forEach(path => path.remove());

                this.animateLogo(header, sparkle, "87.685 12.818");
            }
        }

        if (footer) {
            const ring = [...footer.querySelectorAll("path")].find(path => path.getAttribute("d")?.startsWith("M187.288"));
            const d = ring?.getAttribute("d") || "";
            const split = d.indexOf("M192.604");

            if (ring && split > 0) {
                const sparkle = ring.cloneNode();
                ring.setAttribute("d", d.slice(0, split));
                sparkle.setAttribute("d", d.slice(split));
                ring.after(sparkle);

                this.animateLogo(footer.closest("a") || footer, sparkle, "187.329 27.385");
            }
        }
    },

    animateLogo(trigger, sparkle, origin) {
        const orbit = document.createElementNS("http://www.w3.org/2000/svg", "g");
        sparkle.before(orbit);
        orbit.append(sparkle);

        gsap.set(orbit, { svgOrigin: origin });
        gsap.set(sparkle, { transformOrigin: "50% 50%" });

        const tl = gsap.timeline({ paused: true })
            .to(orbit, { rotation: 360, duration: 1, ease: "signature" }, 0)
            .to(sparkle, { rotation: 180, duration: 1, ease: "signature" }, 0)
            .to(sparkle, { keyframes: { scale: [0.4, 1.4, 1], easeEach: "sine.inOut" }, duration: 1.2, ease: "none" }, 0)
            .set([orbit, sparkle], { rotation: 0 }, 1.2);

        const play = () => {
            if (!tl.isActive()) tl.restart();
        };

        trigger.addEventListener("mouseenter", play);
        trigger.addEventListener("focus", play);
    },
    handleFooterGraphic() {
        const footer = document.querySelector("footer.g-footer");
        const svg = footer?.querySelector(".footer-graphic-img svg");
        if (!svg) return;

        const hexes = [...svg.querySelectorAll("path")];
        if (!hexes.length) return;

        const EXPLODE = {
            fragments: 2,
            minDistance: 0.08,
            maxDistance: 0.35,
            spread: 0.45,
            hexScale: [0.25, 0.45],
            fragmentScale: [0.12, 0.3],
            rotation: 90,
            duration: 2.6,
            stagger: 0.2,
            ease: "power2-out",
            reformSpeed: 1.4,
            bottomOffset: 4,
            seed: 2026
        };

        const createRandom = (seed) => {
            let state = seed;

            return () => {
                state |= 0;
                state = state + 0x6D2B79F5 | 0;
                let value = Math.imul(state ^ state >>> 15, 1 | state);
                value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
                return ((value ^ value >>> 14) >>> 0) / 4294967296;
            };
        };

        const between = (random, [min, max]) => min + random() * (max - min);

        const getDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

        const createPieces = (hex) => {
            const bounds = hex.getBBox();
            const origin = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

            const fragments = Array.from({ length: EXPLODE.fragments }, () => {
                const fragment = hex.cloneNode();
                hex.after(fragment);
                return { el: fragment, origin, isFragment: true };
            });

            return [{ el: hex, origin, isFragment: false }, ...fragments];
        };

        const random = createRandom(EXPLODE.seed);
        const view = svg.viewBox.baseVal;
        const size = Math.max(view.width, view.height);
        const center = { x: view.x + view.width / 2, y: view.y + view.height / 2 };
        const pieces = hexes.flatMap(hex => createPieces(hex));
        const tl = gsap.timeline({ paused: true });

        gsap.set(pieces.map(piece => piece.el), { transformOrigin: "50% 50%" });

        pieces.forEach(piece => {
            const outward = Math.atan2(piece.origin.y - center.y, piece.origin.x - center.x);
            const angle = outward + (random() * 2 - 1) * EXPLODE.spread;
            const closeness = Math.min(1, getDistance(piece.origin, center) / (size / 2));
            const reach = (closeness + random()) / 2;
            const distance = size * (EXPLODE.minDistance + (EXPLODE.maxDistance - EXPLODE.minDistance) * reach);
            const delay = EXPLODE.stagger * closeness;

            const to = {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                rotation: (random() * 2 - 1) * EXPLODE.rotation,
                scale: between(random, piece.isFragment ? EXPLODE.fragmentScale : EXPLODE.hexScale),
                opacity: 1,
                duration: EXPLODE.duration,
                ease: EXPLODE.ease
            };

            if (piece.isFragment) tl.fromTo(piece.el, { x: 0, y: 0, rotation: 0, scale: 0, opacity: 0 }, to, delay);
            else tl.to(piece.el, to, delay);
        });

        let isExploded = false;

        const setExploded = (state) => {
            if (state === isExploded) return;
            isExploded = state;

            if (state) tl.timeScale(1).play();
            else tl.timeScale(EXPLODE.reformSpeed).reverse();
        };

        const lenis = window.__lenis;

        if (lenis) {
            const check = () => setExploded(lenis.targetScroll >= lenis.limit - EXPLODE.bottomOffset);
            lenis.on("scroll", check);
            check();
            return;
        }

        if (!window.ScrollTrigger) return;

        ScrollTrigger.create({
            trigger: footer,
            start: `bottom bottom+=${EXPLODE.bottomOffset}`,
            onEnter: () => setExploded(true),
            onLeaveBack: () => setExploded(false)
        });
    },
};

baunfire.Animation = Animation;

export default Animation;
