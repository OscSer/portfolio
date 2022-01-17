import "./index.scss"
import "react-datepicker/dist/react-datepicker.css"
import { StrictMode } from "react"
import { render } from "react-dom"
import { App } from "@components"
import { SymbolMap } from "domain/SymbolMap"

/* init singleton */
SymbolMap.getInstance()

render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById("root")
)
