import { Portfolio, PortfolioType, Transaction, TransactionType } from "@domain"
import Utils from "../Utils"

test("buildTableDataMap() | test1", () => {
    const portfolio = { data: { name: "test", type: PortfolioType.Crypto } } as Portfolio
    const symbol = "test"
    const transactions: Transaction[] = [
        {
            ref: symbol,
            data: {
                date: new Date().getTime(),
                id: symbol,
                symbol: symbol,
                type: TransactionType.Buy,
                units: 1,
                price: 5,
            },
        },
        {
            ref: symbol,
            data: {
                date: new Date().getTime(),
                id: symbol,
                symbol: symbol,
                type: TransactionType.Buy,
                units: 1,
                price: 15,
            },
        },
        {
            ref: symbol,
            data: {
                date: new Date().getTime(),
                id: symbol,
                symbol: symbol,
                type: TransactionType.Sell,
                units: 1,
                price: 10,
            },
        },
    ]

    const result = Utils.buildTableDataMap(transactions, portfolio)
    expect(result).toHaveProperty(symbol)
    expect(result[symbol].holdings).toBe(1)
    expect(result[symbol].cost).toBe(15)
    expect(result[symbol].cost / result[symbol].holdings).toBe(15)
})
