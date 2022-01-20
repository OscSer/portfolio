/* eslint-disable */
const { build, analyzeMetafile } = require("esbuild")
const { base } = require("./create-bundle-base")

;(async function () {
    // JavaScript bundler
    const bundler = await build({
        ...base,
        define: {
            "process.env.NODE_ENV": '"production"',
            ...base.define,
        },
        minify: true,
        sourcemap: true,
        metafile: true,
    })

    // analyze
    const text = await analyzeMetafile(bundler.metafile)
    console.info(text)
})()
