export enum TransactionType {
    BUY = "BUY",
    SELL = "SELL",
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
