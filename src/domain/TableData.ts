export type TableData = {
    id: string
    symbol: string
    holdings: number
    cost: number

    avgCost?: number
    mktValue?: number
    profit?: number
    profitPercent?: number
    price?: number
    ath?: number
    athPercent?: number
    portfolioPercent?: number
}
