import "./Table.scss"
import { Portfolio } from "@domain"
import { ColumnInstance, useTable } from "react-table"

type Props = {
    columns: Array<ColumnInstance<Portfolio>>
    data: readonly Portfolio[]
}

function Table({ columns, data }: Props): JSX.Element {
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
