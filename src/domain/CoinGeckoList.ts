import { Coin } from "./Coin"

export class CoinGeckoList {
    private static instance: CoinGeckoList
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

    public static getInstance(): CoinGeckoList {
        if (!CoinGeckoList.instance) {
            CoinGeckoList.instance = new CoinGeckoList()
            fetch("https://api.coingecko.com/api/v3/coins/list")
                .then((response) => response.json())
                .then((data) => {
                    const filteredList = data.filter((coin: Coin) => coin.symbol && coin.id)
                    const sortedList = filteredList.sort(this.sortList)
                    CoinGeckoList.instance.coinList = sortedList
                    sortedList.forEach((coin: Coin) => {
                        CoinGeckoList.instance.coinMap[coin.id] = coin
                    })
                })
        }
        return CoinGeckoList.instance
    }
}
