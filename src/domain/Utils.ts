import { TableData } from "./TableData"
import { Transaction } from "./Transaction"

const sleep = (ms: number): void => {
    const now = new Date().getTime()
    while (new Date().getTime() < now + ms) {
        /* Do nothing */
    }
}

const getUniqueId = (length = 20): string => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

const priceToString = (price: number | undefined): string => {
    if (price === undefined) return ""
    return price.toLocaleString("en-EN", {
        style: "currency",
        currency: "USD",
    })
}

const percentToString = (percent: number | undefined): string => {
    if (percent === undefined) return ""
    return (
        percent.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + "%"
    )
}

const buildTableDataMap = (
    transactions: Transaction[]
): Record<string, TableData> => {
    const symbolsMap: Record<string, Transaction[]> = {}
    transactions.forEach((transaction) => {
        const symbol = transaction.data.symbol
        if (!symbolsMap[symbol]) {
            symbolsMap[symbol] = []
        }
        symbolsMap[symbol].push(transaction)
    })

    const dataMap: Record<string, TableData> = {}
    Object.keys(symbolsMap).forEach((symbol) => {
        const transactions = symbolsMap[symbol]
        const buyTransactions: Transaction[] = []
        let unitsSoldCounter = 0
        transactions.forEach((transaction) => {
            if (transaction.data.type === "SELL") {
                unitsSoldCounter += transaction.data.units
            } else if (transaction.data.type === "BUY") {
                buyTransactions.push(transaction)
            }
        })
        buyTransactions.forEach((transaction) => {
            const data = transaction.data
            if (!dataMap[data.symbol]) {
                dataMap[data.symbol] = {
                    symbol: data.symbol,
                    holdings: 0,
                    cost: 0,
                }
            }

            if (unitsSoldCounter === 0 || unitsSoldCounter < data.units) {
                const units = data.units - unitsSoldCounter
                const cost = units * data.price
                dataMap[data.symbol].holdings += units
                dataMap[data.symbol].cost += cost
                unitsSoldCounter = 0
            } else {
                unitsSoldCounter -= data.units
            }
        })
    })

    return dataMap
}

export default {
    sleep,
    getUniqueId,
    priceToString,
    percentToString,
    buildTableDataMap,
}
