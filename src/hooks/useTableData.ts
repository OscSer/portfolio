import { TableData } from "@domain"
import { createGlobalState } from "react-use"

type data = {
    tableData: TableData[]
    balance: number
}
const useTableData = createGlobalState<data>({ tableData: [], balance: 0 })
export { useTableData }
