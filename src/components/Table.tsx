import "./Table.scss"
import { TableData, Utils } from "@domain"
import { Column, useTable, useSortBy, TableState } from "react-table"
import React, { useCallback, useEffect, useState } from "react"
import {
    CoinGeckoService,
    PortfolioService,
    TransactionService,
} from "@services"
import { useBalance, usePortfolio, useTableData, useUser } from "@hooks"
import { SymbolModal } from "./SymbolModal"
import ArrowDownIcon from "@material-ui/icons/ArrowDropDown"
import ArrowUpIcon from "@material-ui/icons/ArrowDropUp"

function Table(): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [data, setData] = useTableData()
    const [showModal, setShowModal] = useState(false)
    const [symbol, setSymbol] = useState("")
    const [weightings, setWeightings] = useState<Record<string, number>>({})
    const [, setBalance] = useBalance()
    const { getAllTransactions } = TransactionService
    const { getMarketData } = CoinGeckoService
    const { getWeightings } = PortfolioService
    const { buildTableDataMap, buildTableData, addWeightingProps, getColumns } =
        Utils

    const getTransactions = useCallback(() => {
        if (portfolio) {
            getAllTransactions(user.uid, portfolio).then((transactions) => {
                const tableDataMap = buildTableDataMap(transactions)
                getMarketData(Object.keys(tableDataMap)).then(
                    (marketDataMap) => {
                        const { tableData, balance } = buildTableData(
                            tableDataMap,
                            marketDataMap
                        )
                        getWeightings(user.uid, portfolio).then(
                            (weightings) => {
                                setData(
                                    addWeightingProps(
                                        tableData,
                                        weightings,
                                        balance
                                    )
                                )
                                setBalance(balance)
                                setWeightings(weightings)
                            }
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
        buildTableData,
        getWeightings,
        setBalance,
        setData,
        addWeightingProps,
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
            ...getColumns(weightings),
        ],
        [getColumns, showSymbolModal, weightings]
    )

    const initialState: Partial<TableState<TableData>> = {
        sortBy: [{ id: "currentWeighting", desc: true }],
    }

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data, initialState }, useSortBy)

    return (
        <>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup, index) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                            {headerGroup.headers.map((column, index) => (
                                <th
                                    {...column.getHeaderProps(
                                        column.getSortByToggleProps()
                                    )}
                                    key={index}>
                                    {column.render("Header")}
                                    <span>
                                        {column.isSorted ? (
                                            column.isSortedDesc ? (
                                                <ArrowDownIcon
                                                    style={{ color: "#2D5ED7" }}
                                                />
                                            ) : (
                                                <ArrowUpIcon
                                                    style={{ color: "#2D5ED7" }}
                                                />
                                            )
                                        ) : (
                                            ""
                                        )}
                                    </span>
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
