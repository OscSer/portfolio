import { Portfolio, Transaction, TransactionData } from "@domain"
import {
    ref,
    get,
    set,
    query,
    orderByChild,
    push,
    update,
    equalTo,
    remove,
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
                        ref: child.key || undefined,
                        data: child.val() as TransactionData,
                    })
                })
            }
            resolve(portfolios)
        })
    })
}

const getTransactionsById = (
    uid: string,
    portfolio: Portfolio,
    coinId: string
): Promise<Transaction[]> => {
    return new Promise((resolve) => {
        if (!coinId) resolve([])

        const _query = query(
            ref(db, `users/${uid}/portfolios/${portfolio.ref}/transactions`),
            orderByChild("id"),
            equalTo(coinId)
        )

        get(_query).then((snapshot) => {
            const portfolios: Transaction[] = []
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    portfolios.push({
                        ref: child.key || undefined,
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

const deleteTransaction = (
    uid: string,
    portfolio: Portfolio,
    transaction: Transaction
): void => {
    const transactionPath = `users/${uid}/portfolios/${portfolio.ref}/transactions/${transaction.ref}`
    remove(ref(db, transactionPath))
}

export default {
    getAllTransactions,
    saveTransaction,
    getTransactionsById,
    deleteTransaction,
}
