import "./Table.scss"
import { TableData, Utils } from "@domain"
import { Column, useTable, useSortBy, TableState } from "react-table"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    CoinGeckoService,
    PortfolioService,
    TransactionService,
} from "@services"
import {
    useBalance,
    useLoading,
    usePortfolio,
    useTableData,
    useUser,
} from "@hooks"
import { SymbolModal } from "./SymbolModal"
import ArrowDownIcon from "@material-ui/icons/ArrowDropDown"
import ArrowUpIcon from "@material-ui/icons/ArrowDropUp"

function Table(): JSX.Element {
    const {
        buildTableDataMap,
        buildTableData,
        addWeightingProps,
        getColumns,
        defaultCustomColumns,
    } = Utils
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [data, setData] = useTableData()
    const [, setLoading] = useLoading()
    const [showModal, setShowModal] = useState(false)
    const [symbol, setSymbol] = useState("")
    const [customColumns, setCustomColumns] = useState(defaultCustomColumns())
    const [, setBalance] = useBalance()
    const { getAllTransactions } = TransactionService
    const { getMarketData } = CoinGeckoService
    const { getWeightings, getCustomColumns } = PortfolioService

    const getTransactions = useCallback(() => {
        setLoading(true)
        const promises: Promise<boolean>[] = []

        promises.push(
            new Promise((resolve) => {
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
                                    resolve(true)
                                }
                            )
                        }
                    )
                })
            })
        )

        promises.push(
            new Promise((resolve) => {
                getCustomColumns(user.uid, portfolio).then((_customColumns) => {
                    if (_customColumns) {
                        setCustomColumns(_customColumns)
                    } else {
                        setCustomColumns(defaultCustomColumns())
                    }
                    resolve(true)
                })
            })
        )

        Promise.all(promises).then(() => {
            setLoading(false)
        })
    }, [
        portfolio,
        setLoading,
        getAllTransactions,
        user.uid,
        buildTableDataMap,
        getMarketData,
        buildTableData,
        getWeightings,
        setData,
        addWeightingProps,
        setBalance,
        getCustomColumns,
        defaultCustomColumns,
    ])

    useEffect(() => {
        getTransactions()
    }, [getTransactions, portfolio])

    const showSymbolModal = useCallback((symbol: string) => {
        setSymbol(symbol)
        setShowModal(true)
    }, [])

    const handleHide = useCallback(
        (shouldUpdate: boolean) => {
            if (shouldUpdate) {
                setSymbol("")
                getTransactions()
            }
        },
        [getTransactions]
    )

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
            ...getColumns(customColumns),
        ],
        [customColumns, getColumns, showSymbolModal]
    )

    const initialState: Partial<TableState<TableData>> = useMemo(() => {
        const storedItem = window.localStorage.getItem("sortBy")
        const lastSortBy = storedItem ? JSON.parse(storedItem) : undefined
        const defaultSortBy = { id: "mktValue", desc: true }
        return {
            sortBy: [lastSortBy || defaultSortBy],
        }
    }, [])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
    } = useTable(
        {
            columns,
            data,
            initialState,
            disableMultiSort: true,
            disableSortRemove: true,
        },
        useSortBy
    )

    useEffect(() => {
        window.localStorage.setItem("sortBy", JSON.stringify(state.sortBy[0]))
    }, [state.sortBy])

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
                                                <ArrowDownIcon className="header-icon" />
                                            ) : (
                                                <ArrowUpIcon className="header-icon" />
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
