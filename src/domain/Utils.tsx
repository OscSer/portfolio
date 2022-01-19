import { ProfitLoss } from "components/ProfitLoss"
import { Column } from "react-table"
import { MarketData } from "./MarketData"
import { TableData } from "./TableData"
import { Transaction } from "./Transaction"

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
    const idMap: Record<string, Transaction[]> = {}
    transactions.forEach((transaction) => {
        const id = transaction.data.id
        if (!idMap[id]) {
            idMap[id] = []
        }
        idMap[id].push(transaction)
    })

    const dataMap: Record<string, TableData> = {}
    Object.keys(idMap).forEach((id) => {
        const transactions = idMap[id]
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
            if (!dataMap[data.id]) {
                dataMap[data.id] = {
                    id: data.id,
                    symbol: data.symbol,
                    holdings: 0,
                    cost: 0,
                }
            }

            if (unitsSoldCounter === 0 || unitsSoldCounter < data.units) {
                const units = data.units - unitsSoldCounter
                const cost = units * data.price
                dataMap[data.id].holdings += units
                dataMap[data.id].cost += cost
                unitsSoldCounter = 0
            } else {
                unitsSoldCounter -= data.units
            }
        })
    })

    return dataMap
}

const buildTableData = (
    tableDataMap: Record<string, TableData>,
    marketDataMap: Record<string, MarketData>
) => {
    const tableData: TableData[] = []
    let balance = 0
    Object.keys(tableDataMap).forEach((id) => {
        const coin = tableDataMap[id]
        const market = marketDataMap[id]
        const mktValue = coin.holdings * market.price
        const profit = mktValue - coin.cost
        tableData.push({
            ...coin,
            mktValue,
            profit,
            profitPercent: 100 * (profit / coin.cost),
            price: market.price,
            ath: market.ath,
            athPercent: market.athPercent,
            avgCost: coin.cost / coin.holdings,
        })
        balance += mktValue
    })
    return { tableData, balance }
}

const addWeightingProps = (
    tableData: TableData[],
    weightings: Record<string, number>,
    balance: number
) => {
    return tableData.map((data): TableData => {
        const currentWeighting = 100 * (Number(data.mktValue) / balance)
        const desiredWeighting = weightings[data.id]
        let weightingDiff = undefined
        if (currentWeighting && desiredWeighting) {
            weightingDiff =
                balance * ((desiredWeighting - currentWeighting) / 100)
        }
        return {
            ...data,
            currentWeighting,
            desiredWeighting,
            weightingDiff,
        }
    })
}

const getColumns = (
    weightings: Record<string, number>
): Column<TableData>[] => {
    const base: Column<TableData>[] = [
        {
            Header: "Profit %",
            accessor: "profitPercent",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "Profit $",
            accessor: "profit",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{priceToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "Holdings",
            accessor: "holdings",
            sortDescFirst: true,
            Cell: ({ value }) => Number(value.toFixed(8)),
        },
        {
            Header: "Price",
            accessor: "price",
            sortDescFirst: true,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "ATH %",
            accessor: "athPercent",
            sortDescFirst: true,
            Cell: ({ value }) => percentToString(value),
        },
        {
            Header: "Mkt Value",
            accessor: "mktValue",
            sortDescFirst: true,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Cost",
            accessor: "cost",
            sortDescFirst: true,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Avg Cost",
            accessor: "avgCost",
            sortDescFirst: true,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Current %",
            accessor: "currentWeighting",
            sortDescFirst: true,
            Cell: ({ value }) => percentToString(value),
        },
    ]

    const weightingsColumns: Column<TableData>[] = [
        {
            Header: "Desired %",
            accessor: "desiredWeighting",
            sortDescFirst: true,
            Cell: ({ value }) => percentToString(value),
        },
        {
            Header: "Weight Diff",
            accessor: "weightingDiff",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{priceToString(value)}</ProfitLoss>
            ),
        },
    ]

    if (Object.keys(weightings).length) {
        return [...base, ...weightingsColumns]
    }

    return base
}

export default {
    getUniqueId,
    priceToString,
    percentToString,
    buildTableDataMap,
    buildTableData,
    addWeightingProps,
    getColumns,
}
