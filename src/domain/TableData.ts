import { MarketData } from "./MarketData"

export class TableData extends MarketData {
    id: string
    symbol: string
    holdings: number
    cost: number
    costAvg: number
    mktValue: number
    profit: number
    profitPercent: number
    weightingCurrent: number
    weightingDesired: number
    weightingDiff: number

    constructor() {
        super()
        this.id = ""
        this.symbol = ""
        this.holdings = 0
        this.cost = 0
        this.costAvg = 0
        this.mktValue = 0
        this.profit = 0
        this.profitPercent = 0
        this.weightingCurrent = 0
        this.weightingDesired = 0
        this.weightingDiff = 0
    }
}
