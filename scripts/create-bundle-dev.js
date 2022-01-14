/* eslint-disable */
const { build } = require("esbuild")
const { watch } = require("chokidar")
const { start } = require("live-server")
const { base } = require("./create-bundle-base")

;(async function () {
    // JavaScript bundler
    const bundler = await build({
        ...base,
        minify: false,
        incremental: true,
    })

    // watcher source changes.
    watch("src/**/*.{ts,tsx,scss,png}", { ignoreInitial: true }).on("all", () => {
        bundler.rebuild()
    })

    // local server for live reload.
    start({
        open: true,
        host: "localhost",
        port: 5000,
        root: "public",
    })
})()
