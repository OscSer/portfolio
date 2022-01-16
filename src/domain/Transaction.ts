export type TransactionData = {
    date: number
    symbol: string
    units: number
    price: number
    type: "BUY" | "SELL"
}

export type Transaction = {
    ref: string | null
    data: TransactionData
}
