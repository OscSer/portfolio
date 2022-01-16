import { Portfolio, Transaction, TransactionData } from "@domain"
import {
    ref,
    get,
    set,
    query,
    orderByChild,
    push,
    update,
} from "firebase/database"
import FirebaseService from "./FirebaseService"

const { db } = FirebaseService

const getAllTransactions = (
    uid: string,
    portfolio: Portfolio
): Promise<Transaction[]> => {
    return new Promise((resolve) => {
        const _query = query(
            ref(db, `users/${uid}/portfolios/${portfolio.ref}/transactions`),
            orderByChild("date")
        )

        get(_query).then((snapshot) => {
            const portfolios: Transaction[] = []
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    portfolios.push({
                        ref: child.key,
                        data: child.val() as TransactionData,
                    })
                })
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
    const transactionsPath = `users/${uid}/portfolios/${portfolio.ref}/transactions`
    if (transaction.ref) {
        const updates: Record<string, unknown> = {}
        updates[`${transactionsPath}/${transaction.ref}`] = transaction.data
        update(ref(db), updates)
    } else {
        const transactionsRef = ref(db, transactionsPath)
        const newTransactionRef = push(transactionsRef)
        set(newTransactionRef, transaction.data)
    }
}

export default { getAllTransactions, saveTransaction }
