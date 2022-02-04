import "./Table.scss"
import { TableData, Utils, Weightings } from "@domain"
import { Column, useTable, useSortBy, TableState, CellProps } from "react-table"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PortfolioService, TransactionService } from "@services"
import { useLoading, usePortfolio, useTableData, useUser } from "@hooks"
import { SymbolModal } from "./SymbolModal"
import ArrowDownIcon from "@material-ui/icons/ArrowDropDown"
import ArrowUpIcon from "@material-ui/icons/ArrowDropUp"
import CompareArrowsIcon from "@material-ui/icons/CompareArrows"
import { useWindowSize } from "react-use"

function Table(): JSX.Element {
    const {
        buildTableDataMap,
        buildTableData,
        getColumns,
        defaultCustomColumns,
        getMarketDataService,
    } = Utils
    const { width } = useWindowSize()
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [data, setData] = useTableData()
    const [, setLoading] = useLoading()
    const [showModal, setShowModal] = useState(false)
    const weightings = useRef<Weightings>({})
    const [symbolId, setSymbolId] = useState("")
    const [customColumns, setCustomColumns] = useState(defaultCustomColumns())
    const { getAllTransactions } = TransactionService
    const { getWeightings, getCustomColumns } = PortfolioService
    const tableDataMap = useRef({})
    const marketDataService = useMemo(
        () => getMarketDataService(portfolio),
        [getMarketDataService, portfolio]
    )

    const getMarketData = useCallback(async () => {
        const marketDataMap = await marketDataService.getMarketData(
            Object.keys(tableDataMap.current)
        )
        const { tableData, balance, profit, profitPercent } = buildTableData(
            tableDataMap.current,
            marketDataMap,
            weightings.current
        )
        setData({ tableData, balance, profit, profitPercent })
    }, [buildTableData, marketDataService, setData])

    const getTransactions = useCallback(async () => {
        setLoading(true)
        const transactions = await getAllTransactions(user.uid, portfolio)
        tableDataMap.current = buildTableDataMap(transactions, portfolio)
        await getMarketData()
        setLoading(false)
    }, [setLoading, getAllTransactions, user.uid, portfolio, buildTableDataMap, getMarketData])

    const fetchCustomColumns = useCallback(async () => {
        const _customColumns = await getCustomColumns(user.uid, portfolio)
        if (_customColumns) {
            setCustomColumns(_customColumns)
        } else {
            setCustomColumns(defaultCustomColumns())
        }
    }, [defaultCustomColumns, getCustomColumns, portfolio, user.uid])

    const fetchWeigtings = useCallback(async () => {
        weightings.current = await getWeightings(user.uid, portfolio)
    }, [getWeightings, portfolio, user.uid])

    useEffect(() => {
        fetchCustomColumns()
        fetchWeigtings()
        getTransactions()
        const interval = setInterval(() => getMarketData(), 45000)
        return () => clearInterval(interval)
    }, [fetchCustomColumns, fetchWeigtings, getMarketData, getTransactions, portfolio])

    const showSymbolModal = useCallback((_id: string) => {
        setSymbolId(_id)
        setShowModal(true)
    }, [])

    const handleHideSymbolModal = useCallback(
        (shouldUpdate: boolean) => {
            shouldUpdate && getTransactions()
            setShowModal(false)
        },
        [getTransactions]
    )

    const columns = React.useMemo<Column<TableData>[]>(
        () => [
            {
                Header: "Symbol",
                Cell: ({ row }: CellProps<TableData>) => row.original.symbol.toUpperCase(),
            },
            ...getColumns(customColumns),
            {
                Header: "Actions",
                Cell: ({ row }: CellProps<TableData>) => (
                    <div>
                        <CompareArrowsIcon
                            className="icon"
                            onClick={() => showSymbolModal(row.original.id)}
                        />
                    </div>
                ),
            },
        ],
        [customColumns, getColumns, showSymbolModal]
    )

    const initialState: Partial<TableState<TableData>> = useMemo(() => {
        const stored = window.localStorage.getItem("sortBy")
        const lastSortBy = stored ? JSON.parse(stored) : undefined
        const defaultSortBy = { id: "mktValue", desc: true }
        return {
            sortBy: [lastSortBy || defaultSortBy],
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]) /* data for interval */

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state } = useTable(
        {
            columns,
            data: data.tableData,
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
        <div className="table-container" style={width < 1000 ? { width: width - 40 } : {}}>
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup, hgIndex) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={hgIndex}>
                            {headerGroup.headers.map((column, hIndex) => (
                                <th
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    key={hIndex}>
                                    <span>
                                        {column.isSorted ? (
                                            column.isSortedDesc ? (
                                                <ArrowDownIcon className="sort-icon" />
                                            ) : (
                                                <ArrowUpIcon className="sort-icon" />
                                            )
                                        ) : (
                                            ""
                                        )}
                                    </span>
                                    {column.render("Header")}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, rIndex) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()} key={rIndex}>
                                {row.cells.map((cell, cIndex) => {
                                    return (
                                        <td {...cell.getCellProps()} key={cIndex}>
                                            {cell.render("Cell")}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {showModal && <SymbolModal symbolId={symbolId} onHide={handleHideSymbolModal} />}
        </div>
    )
}

export { Table }
