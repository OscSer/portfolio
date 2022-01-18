export enum TransactionType {
    Buy = "BUY",
    Sell = "SELL",
}

export type TransactionData = {
    date: number
    id: string
    symbol: string
    units: number
    price: number
    type: TransactionType
}

export type Transaction = {
    ref?: string
    data: TransactionData
}
