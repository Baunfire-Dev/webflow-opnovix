import fluid, { extract, fontSize } from "fluid-tailwind";
import motion from "./assets/json/motion.json";

const motionEases = Object.fromEntries(
    Object.entries(motion.ease).map(([name, curve]) => [name, `cubic-bezier(${curve.join(", ")})`])
);

module.exports = {
    corePlugins: {
        container: false,
        preflight: false,
    },
    content: {
        extract,
    },
    theme: {
        fontSize,
        screens: {
            "sm": "23.4375rem",
            "md": "48rem",
            "lg": "62rem",
            "xl": "75rem",
            "1xl": "81.25rem",
            "2xl": "90rem",
        },
        extend: {
            transitionTimingFunction: {
                ...motionEases,
            }
        },
    },
    plugins: [
        fluid
    ],
};