const esbuild = require("esbuild");
const path = require("path");
const chokidar = require("chokidar");
const { generateManifest, MANIFEST_FILE } = require("./generate-manifest");

const SRC = path.resolve(__dirname, "../assets/js");
const OUT = path.join(SRC, "bundles");
const EXTERNAL = path.join(SRC, "external");
const CONFIG = path.resolve(__dirname, "../config.json");

function isInside(dir, filePath) {
    const rel = path.relative(dir, path.resolve(filePath));
    return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

// Source now sits directly under assets/js alongside the build output, so the
// watcher must skip bundles/ (which it writes) and external/ (vendor files).
function isIgnored(filePath) {
    const resolved = path.resolve(filePath);
    return resolved === MANIFEST_FILE || isInside(OUT, resolved) || isInside(EXTERNAL, resolved);
}

function bundleCustomScripts() {
    return esbuild.build({
        entryPoints: [path.join(SRC, "app/index.js")],
        outfile: path.join(OUT, "custom.min.js"),
        minify: true,
        bundle: true,
        sourcemap: false,
        format: "iife",
        logLevel: "silent",
    }).then(() => {
        console.log("✓ Bundled custom.min.js");
    }).catch((err) => {
        console.error("X Failed to bundle custom.min.js", err.message);
        process.exitCode = 1;
    });
}

function bundleCoreScripts() {
    return esbuild.build({
        entryPoints: [path.join(SRC, "app/vendor.js")],
        outfile: path.join(OUT, "core.min.js"),
        minify: true,
        bundle: true,
        sourcemap: false,
        format: "iife",
        globalName: "BFCore",
        logLevel: "silent",
    }).then(() => {
        console.log("✓ Bundled core.min.js");
    }).catch((err) => {
        console.error("X Failed to bundle core.min.js", err.message);
        process.exitCode = 1;
    });
}

async function buildAll() {
    let count;

    try {
        count = generateManifest();
    } catch (err) {
        console.error(`X ${err.message}`);
        process.exitCode = 1;
        return;
    }

    console.log(`✓ Manifest: ${count} blocks`);

    await Promise.all([bundleCustomScripts(), bundleCoreScripts()]);
}

async function startWatcher() {
    await buildAll();

    const watcher = chokidar.watch(
        [path.join(SRC, "**/*.js"), CONFIG],
        {
            ignoreInitial: true,
            ignored: isIgnored,
        }
    );

    watcher.on("add", filePath => {
        console.log(`File added: ${filePath}`);
        handleChange(filePath);
    });

    watcher.on("change", filePath => {
        console.log(`File changed: ${filePath}`);
        handleChange(filePath);
    });

    watcher.on("unlink", filePath => {
        console.log(`File removed: ${filePath}`);
        handleChange(filePath);
    });

    async function handleChange(filePath) {
        const rel = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

        if (rel.includes("app/vendor.js")) {
            await bundleCoreScripts();
            return;
        }

        if (rel === "config.json") {
            await bundleCustomScripts();
            return;
        }

        if (rel.startsWith("assets/js/")) {
            try {
                generateManifest();
            } catch (err) {
                console.error(`X ${err.message}`);
                return;
            }

            await bundleCustomScripts();
            return;
        }

        console.log(`(Ignored) ${rel}`);
    }
}

if (process.argv.includes("--watch")) {
    startWatcher();
} else {
    buildAll();
}
