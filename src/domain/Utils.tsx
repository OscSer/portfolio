import { ProfitLoss } from "@components"
import { Column, Row, SortByFn } from "react-table"
import { CustomColumns } from "./CustomColumns"
import { MarketData } from "./MarketData"
import { TableData } from "./TableData"
import { Transaction } from "./Transaction"
import { Weightings } from "./Weightings"

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
        const _transactions = idMap[id]
        const buyTransactions: Transaction[] = []
        let unitsSoldCounter = 0
        _transactions.forEach((transaction) => {
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
                } as TableData
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
            ...market,
            mktValue,
            profit,
            profitPercent: 100 * (profit / coin.cost),
            costAvg: coin.cost / coin.holdings,
        })
        balance += mktValue
    })
    return { tableData, balance }
}

const addWeightingProps = (
    tableData: TableData[],
    weightings: Weightings,
    balance: number
) => {
    return tableData.map((data): TableData => {
        const weightingCurrent = 100 * (Number(data.mktValue) / balance)
        const weightingDesired = weightings[data.id] || 0
        let weightingDiff = 0
        if (weightingCurrent && weightingDesired) {
            weightingDiff =
                balance * ((weightingDesired - weightingCurrent) / 100)
        }
        return {
            ...data,
            weightingCurrent,
            weightingDesired,
            weightingDiff,
        }
    })
}

const defaultCustomColumns = (): CustomColumns => {
    const defaultColumns: Array<keyof TableData> = [
        "symbol",
        "profitPercent",
        "profit",
        "holdings",
        "price",
        "mktValue",
        "cost",
        "costAvg",
    ]
    const customColumns: Record<string, boolean> = {}
    const tableData = new TableData()
    Object.keys(tableData).forEach((key) => {
        customColumns[key] = defaultColumns.includes(key as keyof TableData)
    })
    return customColumns as CustomColumns
}

const getColumns = (customColumns: CustomColumns): Column<TableData>[] => {
    const sortByfn: SortByFn<TableData> = (
        rowA: Row<TableData>,
        rowB: Row<TableData>,
        columnId: string
    ) => {
        const a: TableData = rowA.original
        const b: TableData = rowB.original
        const id = columnId as keyof TableData
        if (a[id] > b[id]) return 1
        if (b[id] > a[id]) return -1
        return 0
    }

    const columns: Column<TableData>[] = [
        {
            Header: "Profit %",
            accessor: "profitPercent",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "Profit",
            accessor: "profit",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{priceToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "Price",
            accessor: "price",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "ATH",
            accessor: "ath",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => priceToString(value),
        },
        {
            Header: "ATH %",
            accessor: "athChange",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "24h %",
            accessor: "priceChange24h",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "7d %",
            accessor: "priceChange7d",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "14d %",
            accessor: "priceChange14d",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "30d %",
            accessor: "priceChange30d",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "60d %",
            accessor: "priceChange60d",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "200d %",
            accessor: "priceChange200d",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "1y %",
            accessor: "priceChange1y",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "Holdings",
            accessor: "holdings",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => Number(value.toFixed(8)),
        },
        {
            Header: "Mkt Value",
            accessor: "mktValue",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Cost",
            accessor: "cost",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Avg Cost",
            accessor: "costAvg",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Current %",
            accessor: "weightingCurrent",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => percentToString(value),
        },
        {
            Header: "Desired %",
            accessor: "weightingDesired",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }) => (value ? percentToString(value) : ""),
        },
        {
            Header: "Weight Diff",
            accessor: "weightingDiff",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>
                    {value ? priceToString(value) : ""}
                </ProfitLoss>
            ),
        },
    ]

    return columns.filter((column) =>
        column.accessor
            ? customColumns[String(column.accessor) as keyof TableData]
            : true
    )
}

export default {
    getUniqueId,
    priceToString,
    percentToString,
    buildTableDataMap,
    buildTableData,
    addWeightingProps,
    getColumns,
    defaultCustomColumns,
}
