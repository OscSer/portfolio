import "./Table.scss"
import { TableData, Utils } from "@domain"
import { Column, useTable } from "react-table"
import React, { useCallback, useEffect, useState } from "react"
import { CoinGeckoService, TransactionService } from "@services"
import { useBalance, usePortfolio, useUser } from "@hooks"
import { ProfitLoss } from "./ProfitLoss"

function Table(): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [data, setData] = useState<TableData[]>([])
    const [balance, setBalance] = useBalance()
    const { getAllTransactions } = TransactionService
    const { getMarketData } = CoinGeckoService
    const { priceToString, percentToString, buildTableDataMap } = Utils

    const getTransactions = useCallback(() => {
        if (portfolio) {
            getAllTransactions(user.uid, portfolio).then((transactions) => {
                const tableDataMap = buildTableDataMap(transactions)
                getMarketData(Object.keys(tableDataMap)).then(
                    (marketDataMap) => {
                        const _data: TableData[] = []
                        let _balance = 0
                        Object.keys(tableDataMap).forEach((key) => {
                            const tableData = tableDataMap[key]
                            const marketData = marketDataMap[key]
                            const mktValue =
                                tableData.holdings * marketData.price
                            const profit = mktValue - tableData.cost
                            _data.push({
                                ...tableData,
                                profit: profit,
                                profitPercent: 100 * (profit / tableData.cost),
                                price: marketData.price,
                                ath: marketData.ath,
                                athPercent: marketData.athPercent,
                                mktValue: mktValue,
                                avgCost: tableData.cost / tableData.holdings,
                            })
                            _balance += mktValue
                        })
                        setData(_data)
                        setBalance(_balance)
                    }
                )
            })
        }
    }, [
        portfolio,
        getAllTransactions,
        user.uid,
        buildTableDataMap,
        getMarketData,
        setBalance,
    ])

    useEffect(() => {
        getTransactions()
    }, [getTransactions, portfolio])

    useEffect(() => {
        setData(
            data.map(
                (item): TableData => ({
                    ...item,
                    portfolioPercent: item.mktValue
                        ? 100 * (item.mktValue / balance)
                        : 0,
                })
            )
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balance])

    const columns = React.useMemo<Column<TableData>[]>(
        () => [
            {
                Header: "Symbol",
                accessor: "symbol",
            },
            {
                Header: "Profit $",
                accessor: "profit",
                Cell: ({ value }: { value: number }) => (
                    <ProfitLoss value={value}>
                        {priceToString(value)}
                    </ProfitLoss>
                ),
            },
            {
                Header: "Profit %",
                accessor: "profitPercent",
                Cell: ({ value }: { value: number }) => (
                    <ProfitLoss value={value}>
                        {percentToString(value)}
                    </ProfitLoss>
                ),
            },
            {
                Header: "Holdings",
                accessor: "holdings",
                Cell: ({ value }) => value.toLocaleString(),
            },
            {
                Header: "Price",
                accessor: "price",
                Cell: ({ value }) => priceToString(value),
            },
            {
                Header: "ATH",
                accessor: "ath",
                Cell: ({ value }) => priceToString(value),
            },
            {
                Header: "ATH %",
                accessor: "athPercent",
                Cell: ({ value }) => percentToString(value),
            },
            {
                Header: "Mkt Value",
                accessor: "mktValue",
                Cell: ({ value }) => priceToString(value),
            },
            {
                Header: "Cost",
                accessor: "cost",
                Cell: ({ value }) => priceToString(value),
            },
            {
                Header: "Avg Cost",
                accessor: "avgCost",
                Cell: ({ value }) => priceToString(value),
            },
            {
                Header: "Portfolio %",
                accessor: "portfolioPercent",
                Cell: ({ value }) => percentToString(value),
            },
        ],
        [percentToString, priceToString]
    )

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data })

    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup, index) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                        {headerGroup.headers.map((column, index) => (
                            <th {...column.getHeaderProps()} key={index}>
                                {column.render("Header")}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, index) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()} key={index}>
                            {row.cells.map((cell, index) => {
                                return (
                                    <td {...cell.getCellProps()} key={index}>
                                        {cell.render("Cell")}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export { Table }
