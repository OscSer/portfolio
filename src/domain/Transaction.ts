export enum TransactionType {
    Buy = "BUY",
    Sell = "SELL",
}

export type TransactionData = {
    date: number
    symbol: string
    units: number
    price: number
    type: TransactionType
}

export type Transaction = {
    ref: string | null
    data: TransactionData
}
