import { SymbolMap } from "domain/SymbolMap"

type MarketData = {
    price: number
    ath: number
    athPercent: number
}

const getMarketData = (
    symbols: string[]
): Promise<Record<string, MarketData>> => {
    const symbolMap = SymbolMap.getInstance().map
    const promises: Promise<boolean>[] = []
    const marketDataMap: Record<string, MarketData> = {}
    symbols.forEach((symbol) => {
        promises.push(
            new Promise((resolve) => {
                const id = symbolMap[symbol.toLowerCase()]
                fetch(
                    `https://api.coingecko.com/api/v3/coins/${id}?market_data=true`
                )
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            marketDataMap[symbol] = {
                                price: NaN,
                                ath: NaN,
                                athPercent: NaN,
                            }
                        } else {
                            marketDataMap[symbol] = {
                                price: data.market_data.current_price.usd,
                                ath: data.market_data.ath.usd,
                                athPercent:
                                    data.market_data.ath_change_percentage.usd,
                            }
                        }
                        resolve(true)
                    })
            })
        )
    })

    return new Promise((resolve) => {
        Promise.all(promises).then(() => resolve(marketDataMap))
    })
}

export default { getMarketData }
