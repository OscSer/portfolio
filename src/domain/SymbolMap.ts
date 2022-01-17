import { Coin } from "./Coin"
import { sortBy } from "lodash"

export class SymbolMap {
    private static instance: SymbolMap
    public map: Record<string, Coin> = {}
    public list: Coin[] = []

    private constructor() {
        //void
    }

    public static getInstance(): SymbolMap {
        if (!SymbolMap.instance) {
            SymbolMap.instance = new SymbolMap()
            fetch("https://api.coingecko.com/api/v3/coins/list")
                .then((response) => response.json())
                .then((data) => {
                    SymbolMap.instance.list = sortBy(data, ["symbol"])
                    data.forEach((coin: Coin) => {
                        SymbolMap.instance.map[coin.id] = coin
                    })
                })
        }
        return SymbolMap.instance
    }
}
