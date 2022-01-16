import { Portfolio, Transaction, TransactionData } from "@domain"
import { ref, child, get, set } from "firebase/database"
import FirebaseService from "./FirebaseService"

const getAllTransactions = (
    uid: string,
    portfolio: Portfolio
): Promise<Transaction[]> => {
    const { database } = FirebaseService
    const dbRef = ref(database)
    return new Promise((resolve) => {
        const portfolios: Transaction[] = []
        get(
            child(
                dbRef,
                `users/${uid}/portfolios/${portfolio.ref}/transactions`
            )
        ).then((snapshot) => {
            if (snapshot.val()) {
                for (const [key, value] of Object.entries(snapshot.val())) {
                    portfolios.push({
                        ref: key,
                        data: value as TransactionData,
                    })
                }
            }
            resolve(portfolios)
        })
    })
}

const saveTransaction = (
    uid: string,
    portfolio: Portfolio,
    transaction: Transaction
): void => {
    const { database } = FirebaseService
    set(
        ref(
            database,
            `users/${uid}/portfolios/${portfolio.ref}/transactions/${transaction.ref}`
        ),
        transaction.data
    )
}

export default { getAllTransactions, saveTransaction }
