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
    if (!price) return ""
    return price.toLocaleString("en-EN", {
        style: "currency",
        currency: "USD",
    })
}

const percentToString = (percent: number | undefined): string => {
    if (!percent) return ""
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
    const map: Record<string, TableData> = {}
    const buys: Transaction[] = []
    let count = 0
    transactions.forEach((transaction) => {
        if (transaction.data.type === "SELL") {
            count += transaction.data.units
        } else {
            buys.push(transaction)
        }
    })
    buys.forEach((transaction) => {
        const data = transaction.data
        if (!map[data.symbol]) {
            map[data.symbol] = {
                symbol: data.symbol,
                holdings: 0,
                cost: 0,
            }
        }

        if (count === 0 || count < data.units) {
            const units = data.units - count
            const cost = units * data.price
            map[data.symbol].holdings += units
            map[data.symbol].cost += cost
            count = 0
        } else {
            count -= data.units
        }
    })
    return map
}

export default {
    sleep,
    getUniqueId,
    priceToString,
    percentToString,
    buildTableDataMap,
}
