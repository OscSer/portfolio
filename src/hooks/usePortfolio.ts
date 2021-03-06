import { Portfolio } from "@domain"
import { createGlobalState } from "react-use"

const usePortfolio = createGlobalState<Portfolio>()
export { usePortfolio }
