import "./index.scss"
import "react-datepicker/dist/react-datepicker.css"
import "react-bootstrap-typeahead/css/Typeahead.css"
import { StrictMode } from "react"
import { render } from "react-dom"
import { App } from "@components"
import { CoinGeckoList } from "@domain"

/* init singleton */
CoinGeckoList.getInstance()

render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById("root")
)
