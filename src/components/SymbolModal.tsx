import "./SymbolModal.scss"
import Modal from "react-bootstrap/Modal"
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react"
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
    onHide: () => void
    symbol: string
}

function SymbolModal({ show, setShow, symbol, onHide }: Props): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [transaction, setTransaction] = useState<Transaction>()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const { getTransactionsBySymbol, deleteTransaction } = TransactionService
    const { priceToString } = Utils

    const handleHide = useCallback(() => {
        onHide()
        setShow(false)
        setTransactions([])
    }, [onHide, setShow])

    const getTransactions = useCallback(() => {
        if (portfolio) {
            getTransactionsBySymbol(user.uid, portfolio, symbol).then(
                (transactions) => {
                    if (transactions.length) {
                        const orderedTransactions = sortBy(transactions, [
                            "data.date",
                        ]).reverse()
                        setTransactions(orderedTransactions)
                    } else {
                        handleHide()
                    }
                }
            )
        }
    }, [getTransactionsBySymbol, handleHide, portfolio, symbol, user.uid])

    useEffect(() => {
        getTransactions()
    }, [getTransactions, symbol])

    const handleEditTransaction = (transaction: Transaction) => {
        setTransaction(transaction)
        setShowTransactionModal(true)
    }

    const handleDeleteTransaction = (transaction: Transaction) => {
        if (portfolio) {
            deleteTransaction(user.uid, portfolio, transaction)
            getTransactions()
        }
    }

    return (
        <Modal show={show} onHide={handleHide} className="symbol-modal">
            <Modal.Header closeButton>
                <Modal.Title>{symbol.toUpperCase()}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ListGroup>
                    {transactions.map((transaction) => (
                        <ListGroup.Item key={transaction.ref}>
                            <div className="group">
                                <div className="date">
                                    {new Date(
                                        transaction.data.date
                                    ).toLocaleString()}
                                </div>
                                <div className="type">
                                    <ProfitLoss
                                        value={
                                            transaction.data.type === "BUY"
                                                ? 1
                                                : -1
                                        }>
                                        {transaction.data.type}
                                    </ProfitLoss>
                                </div>
                                <div className="units">
                                    {transaction.data.units}
                                </div>
                                <div className="price">
                                    {`Price: ${priceToString(
                                        transaction.data.price
                                    )}`}
                                </div>
                                <div className="total">
                                    {`Total: ${priceToString(
                                        transaction.data.units *
                                            transaction.data.price
                                    )}`}
                                </div>
                                <div className="actions">
                                    <EditIcon
                                        className="icon"
                                        onClick={() =>
                                            handleEditTransaction(transaction)
                                        }
                                    />
                                    <DeleteIcon
                                        className="icon"
                                        onClick={() =>
                                            handleDeleteTransaction(transaction)
                                        }
                                    />
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <TransactionModal
                show={showTransactionModal}
                setShow={setShowTransactionModal}
                onHide={() => getTransactions()}
                transaction={transaction}
            />
        </Modal>
    )
}

export { SymbolModal }