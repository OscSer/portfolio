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
                                price: marketData.current_price.usd || 0,
                                ath: marketData.ath.usd || 0,
                                athChange:
                                    marketData.ath_change_percentage.usd || 0,
                                priceChange24h:
                                    marketData.price_change_percentage_24h || 0,
                                priceChange7d:
                                    marketData.price_change_percentage_7d || 0,
                                priceChange14d:
                                    marketData.price_change_percentage_14d || 0,
                                priceChange30d:
                                    marketData.price_change_percentage_30d || 0,
                                priceChange60d:
                                    marketData.price_change_percentage_60d || 0,
                                priceChange200d:
                                    marketData.price_change_percentage_200d ||
                                    0,
                                priceChange1y:
                                    marketData.price_change_percentage_1y || 0,
                                image: data.image.thumb,
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
