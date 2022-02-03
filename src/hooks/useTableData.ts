import { TableData } from "@domain"
import { createGlobalState } from "react-use"

type data = {
    tableData: TableData[]
    balance: number
    profit: number
    profitPercent: number
}
const useTableData = createGlobalState<data>({
    tableData: [],
    balance: 0,
    profit: 0,
    profitPercent: 0,
})
export { useTableData }
