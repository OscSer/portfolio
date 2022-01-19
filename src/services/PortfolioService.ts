import { CustomColumns, Portfolio, PortfolioData, Weightings } from "@domain"
import { ref, child, get, update, push, set } from "firebase/database"
import FirebaseService from "./FirebaseService"

const { db } = FirebaseService

const getAllPortfolios = (uid: string): Promise<Portfolio[]> => {
    const dbRef = ref(db)
    return new Promise((resolve) => {
        get(child(dbRef, `users/${uid}/portfolios/`)).then((snapshot) => {
            const portfolios: Portfolio[] = []
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    portfolios.push({
                        ref: child.key || undefined,
                        data: child.val() as PortfolioData,
                    })
                })
            }
            resolve(portfolios)
        })
    })
}

const savePortfolio = (uid: string, portfolio: Portfolio): void => {
    const portfoliosPath = `users/${uid}/portfolios`
    if (portfolio.ref) {
        const updates: Record<string, unknown> = {}
        updates[`${portfoliosPath}/${portfolio.ref}/name`] = portfolio.data.name
        updates[`${portfoliosPath}/${portfolio.ref}/type`] = portfolio.data.type
        update(ref(db), updates)
    } else {
        const transactionsRef = ref(db, portfoliosPath)
        const newTransactionRef = push(transactionsRef)
        set(newTransactionRef, portfolio.data)
    }
}

const getWeightings = (
    uid: string,
    portfolio: Portfolio
): Promise<Weightings> => {
    const dbRef = ref(db)
    const weightingsPath = `users/${uid}/portfolios/${portfolio.ref}/weightings`

    return new Promise((resolve) => {
        get(child(dbRef, weightingsPath)).then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val())
            } else {
                resolve({})
            }
        })
    })
}

const saveWeightings = (
    uid: string,
    portfolio: Portfolio,
    weightings: Weightings
): void => {
    const weightingsPath = `users/${uid}/portfolios/${portfolio.ref}/weightings`
    const weightingsRef = ref(db, weightingsPath)
    set(weightingsRef, weightings)
}

const getCustomColumns = (
    uid: string,
    portfolio: Portfolio
): Promise<CustomColumns | undefined> => {
    const _ref = ref(db)
    const path = `users/${uid}/portfolios/${portfolio.ref}/customColumns`

    return new Promise((resolve) => {
        get(child(_ref, path)).then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val())
            } else {
                resolve(undefined)
            }
        })
    })
}

const saveCustomColumns = (
    uid: string,
    portfolio: Portfolio,
    customColumns: CustomColumns
): void => {
    const path = `users/${uid}/portfolios/${portfolio.ref}/customColumns`
    const _ref = ref(db, path)
    set(_ref, customColumns)
}

export default {
    getAllPortfolios,
    savePortfolio,
    getWeightings,
    saveWeightings,
    getCustomColumns,
    saveCustomColumns,
}
