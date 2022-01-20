import { Coin } from "./Coin"
import { sortBy } from "lodash"

export class SymbolMap {
    private static instance: SymbolMap
    public coinMap: Record<string, Coin> = {}
    public coinList: Coin[] = []

    private constructor() {
        /* singleton */
    }

    public static getInstance(): SymbolMap {
        if (!SymbolMap.instance) {
            SymbolMap.instance = new SymbolMap()
            fetch("https://api.coingecko.com/api/v3/coins/list")
                .then((response) => response.json())
                .then((data) => {
                    SymbolMap.instance.coinList = sortBy(data, [
                        "symbol",
                    ]).filter((coin) => coin.symbol && coin.id)
                    data.forEach((coin: Coin) => {
                        SymbolMap.instance.coinMap[coin.id] = coin
                    })
                })
        }
        return SymbolMap.instance
    }
}
