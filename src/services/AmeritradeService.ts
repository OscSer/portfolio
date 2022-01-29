import { Coin, MarketData } from "@domain"
import { isEmpty } from "lodash"
import { MarketDataService } from "./MarketDataService"

export class AmeritradeService implements MarketDataService {
    private api = "https://api.tdameritrade.com"
    private apiKey = process.env.AMERITRADE_API_KEY
    private usdSymbol: Coin = {
        id: "USD",
        name: "Dollar",
        symbol: "USD",
    }

    searchSymbol = (symbol: string): Promise<Coin[]> => {
        return new Promise((resolve) => {
            if (symbol.toLocaleLowerCase() === "usd") {
                resolve([this.usdSymbol])
            } else {
                fetch(
                    `${this.api}/v1/instruments?apikey=${this.apiKey}&symbol=${symbol}&projection=symbol-search`
                )
                    .then((response) => response.json())
                    .then((data) => {
                        if (isEmpty(data)) {
                            resolve([])
                        } else {
                            const coins: Coin[] = []
                            Object.keys(data).forEach((key) => {
                                const keyData = data[key]
                                coins.push({
                                    id: keyData.cusip,
                                    name: keyData.description,
                                    symbol: keyData.symbol,
                                })
                            })
                            resolve(coins)
                        }
                    })
            }
        })
    }

    getSymbol = (id: string): Promise<Coin | undefined> => {
        return new Promise((resolve) => {
            if (id.toLocaleLowerCase() === "usd") {
                resolve(this.usdSymbol)
            } else {
                fetch(`${this.api}/v1/instruments/${id}?apikey=${this.apiKey}`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (isEmpty(data)) {
                            resolve(undefined)
                        } else {
                            const _data = data[0]
                            resolve({
                                id: _data.cusip,
                                name: _data.description,
                                symbol: _data.symbol,
                            })
                        }
                    })
            }
        })
    }

    getMarketData = (symbols: string[]): Promise<Record<string, MarketData>> => {
        const promises: Promise<boolean>[] = []
        const marketDataMap: Record<string, MarketData> = {}
        symbols.forEach((id) => {
            if (id.toLowerCase() === "usd") {
                promises.push(
                    new Promise((resolve) => {
                        const marketData = new MarketData()
                        marketData.price = 1
                        marketDataMap[id] = marketData
                        resolve(true)
                    })
                )
            } else {
                promises.push(
                    new Promise((resolve) => {
                        fetch(`${this.api}/v1/marketdata/${id}/quotes?apikey=${this.apiKey}`)
                            .then((response) => response.json())
                            .then((data) => {
                                if (isEmpty(data)) {
                                    marketDataMap[id] = {} as MarketData
                                } else {
                                    const _data = data[id]
                                    const marketData = new MarketData()
                                    marketData.price = _data.lastPrice || 0
                                    marketDataMap[id] = marketData
                                }
                                resolve(true)
                            })
                    })
                )
            }
        })

        return new Promise((resolve) => {
            Promise.all(promises).then(() => {
                resolve(marketDataMap)
            })
        })
    }
}
