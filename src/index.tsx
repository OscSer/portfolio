import React from "react"
import { StrictMode } from "react"
import { render } from "react-dom"
import { App } from "@components"
import "./index.scss"

if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line
    const whyDidYouRender = require("@welldone-software/why-did-you-render")
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    })
}

render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById("root")
)
