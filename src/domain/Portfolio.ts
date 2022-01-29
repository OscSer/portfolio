export enum PortfolioType {
    StockMarket = "STOCK_MARKET",
    Crypto = "CRYPTO",
}

export type PortfolioData = {
    name: string
    type: PortfolioType
}

export type Portfolio = {
    ref?: string
    data: PortfolioData
}
