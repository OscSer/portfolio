import "./SymbolModal.scss"
import Modal from "react-bootstrap/Modal"
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import { Transaction, Utils } from "@domain"
import { ListGroup } from "react-bootstrap"
import EditIcon from "@material-ui/icons/Edit"
import DeleteIcon from "@material-ui/icons/Delete"
import { TransactionModal } from "./TransactionModal"
import { ProfitLoss } from "./ProfitLoss"
import { sortBy } from "lodash"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: (shouldUpdate: boolean) => void
    symbol: string
    id: string
}

function SymbolModal({ show, setShow, symbol, id, onHide }: Props): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [transaction, setTransaction] = useState<Transaction>()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const shouldUpdate = useRef(false)
    const { getTransactionsById, deleteTransaction } = TransactionService
    const { priceToString, unitsToString } = Utils

    const handleHide = useCallback(() => {
        setTransactions([])
        setShow(false)
        onHide(shouldUpdate.current)
    }, [onHide, setShow])

    const getTransactions = useCallback(() => {
        getTransactionsById(user.uid, portfolio, id).then((_transactions) => {
            if (_transactions.length) {
                const orderedTransactions = sortBy(_transactions, ["data.date"]).reverse()
                setTransactions(orderedTransactions)
            } else {
                handleHide()
            }
        })
    }, [getTransactionsById, handleHide, portfolio, id, user.uid])

    useEffect(() => {
        getTransactions()
    }, [getTransactions, symbol])

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
        <Modal show={show} onHide={handleHide} className="symbol-modal">
            <Modal.Header closeButton>
                <Modal.Title>{symbol ? symbol.toUpperCase() : ""}</Modal.Title>
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
                                    {`Price: ${priceToString(_transaction.data.price)}`}
                                </div>
                                <div className="total">
                                    {`Total: ${priceToString(
                                        _transaction.data.units * _transaction.data.price
                                    )}`}
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
