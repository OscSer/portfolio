type Coin = {
    symbol: string
    id: string
}

export class SymbolMap {
    private static instance: SymbolMap
    public map: Record<string, string> = {}

    private constructor() {
        //void
    }

    public static getInstance(): SymbolMap {
        if (!SymbolMap.instance) {
            SymbolMap.instance = new SymbolMap()
            fetch("https://api.coingecko.com/api/v3/coins/list")
                .then((response) => response.json())
                .then((data) => {
                    data.forEach((coin: Coin) => {
                        SymbolMap.instance.map[coin.symbol] = coin.id
                    })
                })
        }
        return SymbolMap.instance
    }
}
