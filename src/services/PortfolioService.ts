import { Portfolio, PortfolioData, Utils } from "@domain"
import { ref, child, get, set } from "firebase/database"
import FirebaseService from "./FirebaseService"

const getAllPortfolios = (uid: string): Promise<Portfolio[]> => {
    const { database } = FirebaseService
    const dbRef = ref(database)
    return new Promise((resolve) => {
        const portfolios: Portfolio[] = []
        get(child(dbRef, `users/${uid}/portfolios/`)).then((snapshot) => {
            if (snapshot.val()) {
                for (const [key, value] of Object.entries(snapshot.val())) {
                    portfolios.push({
                        ref: key,
                        data: value as PortfolioData,
                    })
                }
            }
            resolve(portfolios)
        })
    })
}

const savePortfolio = (uid: string, portfolio: Portfolio): void => {
    const { database } = FirebaseService
    set(
        ref(database, `users/${uid}/portfolios/${portfolio.ref}`),
        portfolio.data
    )
}

export default { getAllPortfolios, savePortfolio }
