import "./Table.scss"
import { Transaction } from "@domain"
import { Column, useTable } from "react-table"
import React, { useCallback, useEffect, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"

type TableData = {
    symbol: string
    profit$: number
    "profit%": number
    holdings: number
    price: number
    mktValue: number
    cost: number
    avgCost: number
    "portfolio%": number
}

function Table(): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const { getAllTransactions } = TransactionService

    const getTransactions = useCallback(() => {
        if (portfolio) {
            getAllTransactions(user.uid, portfolio).then((_transactions) => {
                setTransactions(_transactions)
            })
        }
    }, [getAllTransactions, portfolio, user.uid])

    useEffect(() => {
        getTransactions()
    }, [getTransactions, portfolio])

    const columns = React.useMemo<Column<TableData>[]>(
        () => [
            {
                Header: "Symbol",
                accessor: "symbol",
            },
            {
                Header: "Profit $",
                accessor: "profit$",
            },
            {
                Header: "Profit %",
                accessor: "profit%",
            },
            {
                Header: "Holdings",
                accessor: "holdings",
            },
            {
                Header: "Price",
                accessor: "price",
            },
            {
                Header: "Mkt Value",
                accessor: "mktValue",
            },
            {
                Header: "Cost",
                accessor: "cost",
            },
            {
                Header: "Avg Cost",
                accessor: "avgCost",
            },
            {
                Header: "Portfolio %",
                accessor: "portfolio%",
            },
        ],
        []
    )

    const data = React.useMemo<TableData[]>(() => {
        const data: TableData[] = []
        transactions.forEach((transaction) => {
            const transactionData = transaction.data
            data.push({
                symbol: transactionData.symbol,
                profit$: 1,
                "profit%": 1,
                holdings: transactionData.units,
                price: transactionData.price,
                mktValue: 1,
                cost: 1,
                avgCost: 1,
                "portfolio%": 1,
            })
        })
        return data
    }, [transactions])

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
