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
                type: TransactionType.BUY,
                units: 2,
                price: 5,
            },
        },
        {
            ref: symbol,
            data: {
                date: new Date().getTime(),
                id: symbol,
                symbol: symbol,
                type: TransactionType.BUY,
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
                type: TransactionType.SELL,
                units: 1,
                price: 20,
            },
        },
    ]

    const result = Utils.buildTableDataMap(transactions, portfolio)
    expect(result).toHaveProperty(symbol)

    const { holdings, cost } = result[symbol]
    expect(holdings).toBe(2)
    expect(cost).toBe(5)
    expect(cost / holdings).toBe(2.5)
})
