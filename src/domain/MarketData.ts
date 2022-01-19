export class MarketData {
    price: number
    priceChange24h: number
    priceChange7d: number
    priceChange14d: number
    priceChange30d: number
    priceChange60d: number
    priceChange200d: number
    priceChange1y: number
    ath: number
    athPercent: number
    image: string

    constructor() {
        this.price = 0
        this.priceChange24h = 0
        this.priceChange7d = 0
        this.priceChange14d = 0
        this.priceChange30d = 0
        this.priceChange60d = 0
        this.priceChange200d = 0
        this.priceChange1y = 0
        this.ath = 0
        this.athPercent = 0
        this.image = ""
    }
}
