export type TransactionData = {
    date: string
    symbol: string
    units: number
    price: number
    type: "BUY" | "SELL"
}

export type Transaction = {
    ref: string
    data: TransactionData
}
