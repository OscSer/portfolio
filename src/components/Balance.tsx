import "./Balance.scss"
import { Utils } from "@domain"
import { useTableData } from "@hooks"
import React from "react"
import { ProfitLoss } from "./ProfitLoss"

const Balance = React.memo(function _Balance(): JSX.Element {
    const [data] = useTableData()
    const { priceToString, percentToString } = Utils

    return (
        <div className="balance">
            <div className="balance__value">{priceToString(data.balance)}</div>
            <ProfitLoss value={data.profit}>
                {`${percentToString(data.profitPercent)} (${priceToString(data.profit)})`}
            </ProfitLoss>
        </div>
    )
})

export { Balance }
