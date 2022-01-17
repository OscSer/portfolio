import "./ProfitLoss.scss"

type Props = {
    value: number
    children: JSX.Element | string
}

function ProfitLoss({ value, children }: Props): JSX.Element {
    return (
        <div className={value >= 0 ? "profit-value" : "loss-value"}>
            {children}
        </div>
    )
}

export { ProfitLoss }
