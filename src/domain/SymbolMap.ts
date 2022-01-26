import { Coin } from "./Coin"

export class SymbolMap {
    private static instance: SymbolMap
    public coinMap: Record<string, Coin> = {}
    public coinList: Coin[] = []

    private constructor() {
        /* singleton */
    }

    private static sortList(a: Coin, b: Coin) {
        const valueA = a.symbol.length
        const valueB = b.symbol.length
        return valueA - valueB
    }

    public static getInstance(): SymbolMap {
        if (!SymbolMap.instance) {
            SymbolMap.instance = new SymbolMap()
            fetch("https://api.coingecko.com/api/v3/coins/list")
                .then((response) => response.json())
                .then((data) => {
                    const filteredList = data.filter(
                        (coin: Coin) => coin.symbol && coin.id
                    )
                    const sortedList = filteredList.sort(this.sortList)
                    SymbolMap.instance.coinList = sortedList
                    sortedList.forEach((coin: Coin) => {
                        SymbolMap.instance.coinMap[coin.id] = coin
                    })
                })
        }
        return SymbolMap.instance
    }
}
