type MarketData = {
    price: number
    ath: number
    athPercent: number
}

const getMarketData = (ids: string[]): Promise<Record<string, MarketData>> => {
    const promises: Promise<boolean>[] = []
    const marketDataMap: Record<string, MarketData> = {}
    ids.forEach((id) => {
        promises.push(
            new Promise((resolve) => {
                fetch(
                    `https://api.coingecko.com/api/v3/coins/${id}?market_data=true`
                )
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            marketDataMap[id] = {
                                price: NaN,
                                ath: NaN,
                                athPercent: NaN,
                            }
                        } else {
                            marketDataMap[id] = {
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
