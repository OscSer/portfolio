import { TableData } from "@domain"
import { createGlobalState } from "react-use"

const useTableData = createGlobalState<TableData[]>([])
export { useTableData }
