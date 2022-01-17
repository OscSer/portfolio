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
import { SymbolMap } from "domain/SymbolMap"
import { TransactionModal } from "./TransactionModal"
import { ProfitLoss } from "./ProfitLoss"

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
    const symbolMap = SymbolMap.getInstance().map

    const getTransactions = useCallback(() => {
        if (portfolio) {
            getTransactionsBySymbol(user.uid, portfolio, symbol).then(
                (transactions) => {
                    setTransactions(transactions)
                }
            )
        }
    }, [getTransactionsBySymbol, portfolio, symbol, user.uid])

    useEffect(() => {
        getTransactions()
    }, [getTransactions, symbol])

    const handleHide = () => {
        onHide()
        setShow(false)
        setTransactions([])
    }

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
                <Modal.Title style={{ textTransform: "capitalize" }}>
                    {symbolMap[symbol.toLowerCase()]}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ListGroup>
                    {transactions.map((transaction) => (
                        <ListGroup.Item key={transaction.ref}>
                            <div className="group">
                                <div>
                                    {new Date(
                                        transaction.data.date
                                    ).toLocaleDateString()}
                                </div>
                                <div>
                                    <ProfitLoss
                                        value={
                                            transaction.data.type === "BUY"
                                                ? 1
                                                : -1
                                        }>
                                        {transaction.data.type}
                                    </ProfitLoss>
                                </div>
                                <div>{transaction.data.units}</div>
                                <div>
                                    {priceToString(transaction.data.price)}
                                </div>
                                <div className="actions">
                                    <EditIcon
                                        className="icon"
                                        onClick={() =>
                                            handleEditTransaction(transaction)
                                        }
                                    />
                                    <DeleteIcon
                                        className="icon delete"
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
                onHide={() => ""}
                transaction={transaction}
            />
        </Modal>
    )
}

export { SymbolModal }
