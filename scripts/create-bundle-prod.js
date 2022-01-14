/* eslint-disable */
const { build, analyzeMetafile } = require("esbuild")
const { base } = require("./create-bundle-base")

;(async function () {
    // JavaScript bundler
    const bundler = await build({
        ...base,
        minify: true,
        sourcemap: true,
        metafile: true,
    })

    // analyze
    const text = await analyzeMetafile(bundler.metafile)
    console.info(text)
})()
