import { ProfitLoss } from "components/ProfitLoss"
import { isEmpty } from "lodash"
import { Column } from "react-table"
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
        const currentWeighting = 100 * (Number(data.mktValue) / balance)
        const desiredWeighting = weightings[data.id]
        let weightingDiff = 0
        if (currentWeighting && desiredWeighting) {
            weightingDiff =
                balance * ((desiredWeighting - currentWeighting) / 100)
        }
        return {
            ...data,
            weightingCurrent: currentWeighting,
            weightingDesired: desiredWeighting,
            weightingDiff: weightingDiff,
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
    const columns: Column<TableData>[] = [
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
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "24h %",
            accessor: "priceChange24h",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "7d %",
            accessor: "priceChange7d",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "14d %",
            accessor: "priceChange14d",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "30d %",
            accessor: "priceChange30d",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "60d %",
            accessor: "priceChange60d",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "200d %",
            accessor: "priceChange200d",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
        },
        {
            Header: "1y %",
            accessor: "priceChange1y",
            sortDescFirst: true,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{percentToString(value)}</ProfitLoss>
            ),
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
            accessor: "costAvg",
            sortDescFirst: true,
            Cell: ({ value }) => priceToString(value),
        },
        {
            Header: "Current %",
            accessor: "weightingCurrent",
            sortDescFirst: true,
            Cell: ({ value }) => percentToString(value),
        },
        {
            Header: "Desired %",
            accessor: "weightingDesired",
            sortDescFirst: true,
            Cell: ({ value }) => percentToString(value),
        },
        {
            Header: "Weight Diff",
            accessor: "weightingDiff",
            sortDescFirst: true,
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
