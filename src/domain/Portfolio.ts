export enum PortfolioType {
    StockMarket = "STOCKS",
    Cryptocurrencies = "CRYPTO",
}

export type PortfolioData = {
    name: string
    type: PortfolioType
}

export type Portfolio = {
    ref?: string
    data: PortfolioData
}
