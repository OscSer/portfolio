import { Coin, MarketData, CoinGeckoList } from "@domain"
import { MarketDataService } from "./MarketDataService"

export class CoinGeckoService implements MarketDataService {
    private api = "https://api.coingecko.com"
    private coinList = CoinGeckoList.getInstance().coinList

    searchSymbol = (symbol: string): Promise<Coin[]> => {
        return new Promise((resolve) => {
            const filtered = this.coinList.filter((coin) =>
                coin.symbol.toLowerCase().startsWith(symbol.toLowerCase())
            )
            resolve(filtered)
        })
    }

    getSymbol = (id: string): Promise<Coin | undefined> => {
        return new Promise((resolve) => {
            fetch(`${this.api}/api/v3/coins/${id}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        resolve(undefined)
                    } else {
                        resolve({
                            id: data.id,
                            name: data.name,
                            symbol: data.symbol,
                        })
                    }
                })
        })
    }

    getMarketData = (ids: string[]): Promise<Record<string, MarketData>> => {
        const promises: Promise<boolean>[] = []
        const marketDataMap: Record<string, MarketData> = {}
        ids.forEach((id) => {
            if (id === "crypto20") {
                const start = new Date(new Date().setUTCHours(0)).toISOString()
                const end = new Date(new Date().setUTCHours(23)).toISOString()
                promises.push(
                    new Promise((resolve) => {
                        fetch(
                            `https://api.invictuscapital.com/v2/funds/crypto20/assets-history?start=${start}&end=${end}`
                        )
                            .then((response) => response.json())
                            .then((json) => {
                                marketDataMap[id] = new MarketData()
                                if (json.data) {
                                    const marketData = json.data[1]
                                    marketDataMap[id].price = Number(marketData.nav_per_token) || 0
                                }
                                resolve(true)
                            })
                    })
                )
            } else {
                promises.push(
                    new Promise((resolve) => {
                        fetch(`${this.api}/api/v3/coins/${id}?market_data=true`)
                            .then((response) => response.json())
                            .then((json) => {
                                if (json.error) {
                                    marketDataMap[id] = {} as MarketData
                                } else {
                                    const marketData = json.market_data
                                    marketDataMap[id] = {
                                        price: marketData.current_price.usd || 0,
                                        ath: marketData.ath.usd || 0,
                                        athChange: marketData.ath_change_percentage.usd || 0,
                                        priceChange24h: marketData.price_change_percentage_24h || 0,
                                        priceChange7d: marketData.price_change_percentage_7d || 0,
                                        priceChange14d: marketData.price_change_percentage_14d || 0,
                                        priceChange30d: marketData.price_change_percentage_30d || 0,
                                        priceChange60d: marketData.price_change_percentage_60d || 0,
                                        priceChange200d:
                                            marketData.price_change_percentage_200d || 0,
                                        priceChange1y: marketData.price_change_percentage_1y || 0,
                                        image: json.image.thumb,
                                    }
                                }
                                resolve(true)
                            })
                    })
                )
            }
        })

        return new Promise((resolve) => {
            Promise.all(promises).then(() => resolve(marketDataMap))
        })
    }
}
