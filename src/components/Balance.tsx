import "./Balance.scss"
import { Utils } from "@domain"
import { useTableData } from "@hooks"
import React from "react"

const Balance = React.memo(function _Balance(): JSX.Element {
    const [data] = useTableData()
    const { priceToString } = Utils

    return (
        <div className="balance">
            <h1>Balance</h1>
            <div className="balance__value">{priceToString(data.balance)}</div>
        </div>
    )
})

export { Balance }
