import "./Table.scss"
import { TableData, Utils } from "@domain"
import { Column, useTable } from "react-table"
import React, { useCallback, useEffect, useState } from "react"
import { CoinGeckoService, TransactionService } from "@services"
import { useBalance, usePortfolio, useUser } from "@hooks"
import { ProfitLoss } from "./ProfitLoss"
import { SymbolModal } from "./SymbolModal"

function Table(): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [data, setData] = useState<TableData[]>([])
    const [, setBalance] = useBalance()
    const [showModal, setShowModal] = useState(false)
    const [symbol, setSymbol] = useState("")
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
                        Object.keys(tableDataMap).forEach((id) => {
                            const tableData = tableDataMap[id]
                            const marketData = marketDataMap[id]
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
                        setBalance(_balance)
                        setData(
                            _data.map(
                                (item): TableData => ({
                                    ...item,
                                    portfolioPercent: item.mktValue
                                        ? 100 * (item.mktValue / _balance)
                                        : 0,
                                })
                            )
                        )
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

    const showSymbolModal = useCallback((symbol: string) => {
        setSymbol(symbol)
        setShowModal(true)
    }, [])

    const handleHide = useCallback(() => {
        setSymbol("")
        getTransactions()
    }, [getTransactions])

    const columns = React.useMemo<Column<TableData>[]>(
        () => [
            {
                Header: "Symbol",
                accessor: "symbol",
                Cell: ({ value }: { value: string }) => (
                    <div
                        className="symbol"
                        onClick={() => showSymbolModal(value)}>
                        {value.toUpperCase()}
                    </div>
                ),
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
                Cell: ({ value }) => Number(value.toFixed(8)),
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
        [percentToString, priceToString, showSymbolModal]
    )

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data })

    return (
        <>
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
                                        <td
                                            {...cell.getCellProps()}
                                            key={index}>
                                            {cell.render("Cell")}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {showModal ? (
                <SymbolModal
                    symbol={symbol}
                    show={showModal}
                    setShow={setShowModal}
                    onHide={handleHide}
                />
            ) : null}
        </>
    )
}

export { Table }
