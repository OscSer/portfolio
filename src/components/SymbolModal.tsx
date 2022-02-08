import "./SymbolModal.scss"
import Modal from "react-bootstrap/Modal"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import { Coin, Transaction, Utils } from "@domain"
import { ListGroup } from "react-bootstrap"
import EditIcon from "@material-ui/icons/Edit"
import DeleteIcon from "@material-ui/icons/Delete"
import { TransactionModal } from "./TransactionModal"
import { ProfitLoss } from "./ProfitLoss"
import { sortBy } from "lodash"

type Props = {
    onHide: (shouldUpdate: boolean) => void
    symbolId: string
}

function SymbolModal({ symbolId, onHide }: Props): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [transaction, setTransaction] = useState<Transaction>()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const shouldUpdate = useRef(false)
    const { getTransactionsById, deleteTransaction } = TransactionService
    const { priceToString, unitsToString, getMarketDataService } = Utils
    const marketDataService = useMemo(
        () => getMarketDataService(portfolio),
        [getMarketDataService, portfolio]
    )
    const [coin, setCoin] = useState<Coin | undefined>()

    const handleHide = useCallback(() => {
        onHide(shouldUpdate.current)
    }, [onHide])

    const getTransactions = useCallback(() => {
        getTransactionsById(user.uid, portfolio, symbolId).then((_transactions) => {
            if (_transactions.length) {
                const orderedTransactions = sortBy(_transactions, ["data.date"]).reverse()
                setTransactions(orderedTransactions)
            } else {
                handleHide()
            }
        })
    }, [getTransactionsById, handleHide, portfolio, symbolId, user.uid])

    useEffect(() => {
        marketDataService.getSymbol(symbolId).then((_coin) => setCoin(_coin))
        getTransactions()
    }, [getTransactions, marketDataService, symbolId])

    const handleEditTransaction = (_transaction: Transaction) => {
        setTransaction(_transaction)
        setShowTransactionModal(true)
    }

    const handleDeleteTransaction = (_transaction: Transaction) => {
        deleteTransaction(user.uid, portfolio, _transaction)
        shouldUpdate.current = true
        getTransactions()
    }

    const handleTransactionModalHide = (_shouldUpdate: boolean) => {
        if (_shouldUpdate) {
            getTransactions()
            shouldUpdate.current = true
        }
    }

    return (
        <Modal show={true} onHide={handleHide} className="symbol-modal">
            <Modal.Header closeButton>
                <Modal.Title>{coin && `${coin.symbol.toUpperCase()} (${coin.name})`}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ListGroup>
                    {transactions.map((_transaction) => (
                        <ListGroup.Item key={_transaction.ref}>
                            <div className="group">
                                <div className="date">
                                    {new Date(_transaction.data.date).toLocaleString()}
                                </div>
                                <div className="type">
                                    <ProfitLoss value={_transaction.data.type === "BUY" ? 1 : -1}>
                                        {_transaction.data.type}
                                    </ProfitLoss>
                                </div>
                                <div className="units">
                                    {unitsToString(_transaction.data.units)}
                                </div>
                                <div className="price">
                                    {_transaction.data.price
                                        ? `Price: ${priceToString(_transaction.data.price)}`
                                        : "-"}
                                </div>
                                <div className="total">
                                    {_transaction.data.price
                                        ? `Total: ${priceToString(
                                              _transaction.data.units * _transaction.data.price
                                          )}`
                                        : "-"}
                                </div>
                                <div className="actions">
                                    <EditIcon
                                        className="icon"
                                        onClick={() => handleEditTransaction(_transaction)}
                                    />
                                    <DeleteIcon
                                        className="icon"
                                        onClick={() => handleDeleteTransaction(_transaction)}
                                    />
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            {showTransactionModal ? (
                <TransactionModal
                    show={showTransactionModal}
                    setShow={setShowTransactionModal}
                    onHide={handleTransactionModalHide}
                    transaction={transaction}
                />
            ) : null}
        </Modal>
    )
}

export { SymbolModal }
