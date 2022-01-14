/* eslint-disable */
const { sassPlugin } = require("esbuild-sass-plugin")

// pass environment variables to esbuild
const define = {}
for (const k in process.env) {
    define[`process.env.${k}`] = JSON.stringify(process.env[k])
}

exports.base = {
    define,
    bundle: true,
    treeShaking: true,
    entryPoints: ["src/index.tsx"],
    outdir: "public",
    inject: ["scripts/react-shim.js"],
    plugins: [sassPlugin()], 
    loader: {
        '.png':'file'
    } 
}
