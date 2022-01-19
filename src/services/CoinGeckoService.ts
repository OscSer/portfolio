import { MarketData } from "@domain"

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
                            marketDataMap[id] = {} as MarketData
                        } else {
                            const marketData = data.market_data
                            marketDataMap[id] = {
                                price: marketData.current_price.usd,
                                ath: marketData.ath.usd,
                                athPercent:
                                    marketData.ath_change_percentage.usd,
                                image: data.image.thumb,
                                priceChange24h:
                                    marketData.price_change_percentage_24h,
                                priceChange7d:
                                    marketData.price_change_percentage_7d,
                                priceChange14d:
                                    marketData.price_change_percentage_14d,
                                priceChange30d:
                                    marketData.price_change_percentage_30d,
                                priceChange60d:
                                    marketData.price_change_percentage_60d,
                                priceChange200d:
                                    marketData.price_change_percentage_200d,
                                priceChange1y:
                                    marketData.price_change_percentage_1y,
                            }
                        }
                        resolve(true)
                    })
            })
        )
    })

    return new Promise((resolve) => {
        Promise.all(promises).then(() => {
            resolve(marketDataMap)
        })
    })
}

export default { getMarketData }
