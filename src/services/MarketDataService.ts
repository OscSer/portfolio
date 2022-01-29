import { Coin, MarketData } from "@domain"

export interface MarketDataService {
    searchSymbol(symbol: string): Promise<Coin[]>
    getSymbol(id: string): Promise<Coin | undefined>
    getMarketData(ids: string[]): Promise<Record<string, MarketData>>
}
