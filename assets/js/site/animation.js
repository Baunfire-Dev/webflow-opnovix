import baunfire from '../app/baunfire.js';

export const Animation = {
    init() {
        this.handleNav();
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

        const updateNavScroll = () => {
            const currentScrollY = window.scrollY;
            const direction = currentScrollY > lastScrollY ? "down" : currentScrollY < lastScrollY ? "up" : null;
            const scrolled = currentScrollY > 20;

            if (scrolled !== isScrolled) {
                nav.classList.toggle("nav-scrolled", scrolled);
                isScrolled = scrolled;
            }

            if (direction && direction !== scrollDirection) {
                nav.classList.toggle("nav-scrolling-down", direction === "down");
                nav.classList.toggle("nav-scrolling-up", direction === "up");
                scrollDirection = direction;
            }

            lastScrollY = currentScrollY;
        };

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
                    ease: "neutral",
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

        document.addEventListener("scroll", updateNavScroll, { passive: true });
        window.addEventListener("load", updateNavScroll);
        updateNavScroll();
    },
};

baunfire.Animation = Animation;

export default Animation;
