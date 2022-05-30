import { ProfitLoss } from "@components"
import { AmeritradeService, CoinGeckoService, MarketDataService } from "@services"
import { Column, Row, SortByFn } from "react-table"
import { CustomColumns } from "./CustomColumns"
import { MarketData } from "./MarketData"
import { Portfolio, PortfolioType } from "./Portfolio"
import { TableData } from "./TableData"
import { Transaction } from "./Transaction"
import { Weightings } from "./Weightings"

const getUniqueId = (length = 20): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

const priceToString = (price: number | undefined, minimumFractionDigits = 2): string => {
    if (price === undefined) return ""
    return price.toLocaleString("en-EN", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits,
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

const unitsToString = (units: number): string => {
    if (units === undefined) return ""
    return Number(units.toFixed(8)).toString()
}

const buildTableDataMap = (
    transactions: Transaction[],
    portfolio: Portfolio
): Record<string, TableData> => {
    const idMap: Record<string, Transaction[]> = {}
    transactions.forEach((transaction) => {
        const key = transaction.data.id
        if (!idMap[key]) idMap[key] = []
        idMap[key].push(transaction)
    })

    const dataMap: Record<string, TableData> = {}
    Object.keys(idMap).forEach((id) => {
        const _transactions = idMap[id]
        let purchases = 0
        let sells = 0
        let holdings = 0
        _transactions.forEach((transaction) => {
            const cost = transaction.data.units * transaction.data.price
            if (transaction.data.type === "SELL") {
                sells += cost
                holdings -= transaction.data.units
            } else if (transaction.data.type === "BUY") {
                purchases += cost
                holdings += transaction.data.units
            }
        })

        const data = _transactions[0].data
        const _key = portfolio.data.type === PortfolioType.Crypto ? data.id : data.symbol
        if (!dataMap[_key]) {
            dataMap[_key] = {
                id: data.id,
                symbol: data.symbol,
                cost: purchases - sells,
                holdings,
            } as TableData
        }
    })

    Object.keys(dataMap).forEach((key) => {
        if (unitsToString(dataMap[key].holdings) === "0") delete dataMap[key]
    })

    return dataMap
}

const buildTableData = (
    tableDataMap: Record<string, TableData>,
    marketDataMap: Record<string, MarketData>,
    weightings: Weightings
) => {
    const tableData: TableData[] = []
    let balance = 0
    let totalProfit = 0
    let totalCost = 0
    Object.keys(tableDataMap).forEach((id) => {
        const coin = tableDataMap[id]
        const market = marketDataMap[id]
        const _holdings = Number(coin.holdings.toFixed(8))
        const holdings = _holdings === 0 ? 0 : _holdings
        const mktValue = holdings * market.price
        const profit = mktValue - coin.cost
        const profitPercent = coin.cost && 100 * (profit / coin.cost)
        const costAvg = holdings !== 0 ? coin.cost / holdings : 0
        tableData.push({
            ...coin,
            ...market,
            mktValue,
            profit,
            profitPercent,
            costAvg,
        })
        balance += mktValue
        totalCost += coin.cost
        totalProfit += profit
    })
    const totalProfitPercent = (totalCost && 100 * (totalProfit / totalCost)) || 0
    return {
        tableData: addWeightingProps(tableData, weightings, balance),
        balance,
        profit: totalProfit,
        profitPercent: totalProfitPercent,
    }
}

const addWeightingProps = (tableData: TableData[], weightings: Weightings, balance: number) => {
    return tableData.map((data): TableData => {
        const weightingCurrent = 100 * (Number(data.mktValue) / balance)
        const weightingDesired = weightings[data.id] || 0
        let weightingDiff = 0
        if (weightingCurrent && weightingDesired) {
            weightingDiff = balance * ((weightingDesired - weightingCurrent) / 100)
        }
        return {
            ...data,
            ...(weightingDesired && { weightingDesired }),
            ...(weightingDiff && { weightingDiff }),
            weightingCurrent,
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
        columnId: string,
        desc?: boolean
    ) => {
        const _rowA: TableData = rowA.original
        const _rowB: TableData = rowB.original
        const _columnId = columnId as keyof TableData

        const valueA = _rowA[_columnId]
        if (valueA === undefined) return desc ? -1 : 1
        const valueB = _rowB[_columnId]
        if (valueB === undefined) return desc ? 1 : -1

        if (valueA > valueB) return 1
        if (valueB > valueA) return -1
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
            Cell: ({ value }) => unitsToString(value),
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
            Cell: ({ value }) => percentToString(value),
        },
        {
            Header: "Weight Diff",
            accessor: "weightingDiff",
            sortDescFirst: true,
            sortType: sortByfn,
            Cell: ({ value }: { value: number }) => (
                <ProfitLoss value={value}>{priceToString(value)}</ProfitLoss>
            ),
        },
    ]

    return columns.filter((column) =>
        column.accessor ? customColumns[String(column.accessor) as keyof TableData] : true
    )
}

const getMarketDataService = (portfolio: Portfolio): MarketDataService => {
    const services = {
        defaul: new CoinGeckoService(),
        [PortfolioType.Crypto]: new CoinGeckoService(),
        [PortfolioType.StockMarket]: new AmeritradeService(),
    }
    return services[portfolio.data.type] || services.defaul
}

export default {
    getUniqueId,
    priceToString,
    percentToString,
    buildTableDataMap,
    buildTableData,
    getColumns,
    defaultCustomColumns,
    unitsToString,
    getMarketDataService,
}
