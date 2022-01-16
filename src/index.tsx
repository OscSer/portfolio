import "./index.scss"
import "react-datepicker/dist/react-datepicker.css"
import { StrictMode } from "react"
import { render } from "react-dom"
import { App } from "@components"

render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById("root")
)
