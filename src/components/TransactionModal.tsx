import "./TransactionModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import { Transaction, TransactionData } from "@domain"
import { FormSelect } from "react-bootstrap"
import DatePicker from "react-datepicker"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: () => void
    transaction?: Transaction
}

function TransactionModal({
    show,
    setShow,
    transaction,
    onHide,
}: Props): JSX.Element {
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const { saveTransaction } = TransactionService
    const isNew = !transaction
    const data: TransactionData = isNew
        ? ({ type: "BUY" } as TransactionData)
        : transaction.data
    const [date, setDate] = useState(
        isNew ? new Date().getTime() : new Date(data.date).getTime()
    )
    const handleSave = () => {
        if (Object.keys(data).length >= 4 && portfolio) {
            data.date = date
            const ref = isNew ? undefined : transaction.ref
            const _transaction = { ref, data } as Transaction
            saveTransaction(user.uid, portfolio, _transaction)
            handleHide()
        }
    }

    const handleHide = () => {
        onHide()
        setShow(false)
    }

    return (
        <Modal show={show} onHide={handleHide}>
            <Modal.Header closeButton>
                <Modal.Title>{isNew ? "Add" : "Edit"} Transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body className="modal-body">
                <Form.Label>Date</Form.Label>
                <DatePicker
                    className="form-control"
                    selected={new Date(date)}
                    onChange={(date: Date) => setDate(date.getTime())}
                />

                <Form.Label htmlFor="type">Type</Form.Label>
                <FormSelect
                    onChange={(event) =>
                        (data.type = event.target.value as "BUY" | "SELL")
                    }
                    id="type"
                    defaultValue={data.type}>
                    <option key="buy" value="BUY">
                        BUY
                    </option>
                    <option key="sell" value="SELL">
                        SELL
                    </option>
                </FormSelect>

                <Form.Label htmlFor="symbol">Symbol</Form.Label>
                <Form.Control
                    type="text"
                    id="symbol"
                    onChange={(event) =>
                        (data.symbol = event.target.value.toUpperCase())
                    }
                    defaultValue={data.symbol}
                />

                <Form.Label htmlFor="units">Units</Form.Label>
                <Form.Control
                    type="number"
                    id="units"
                    onChange={(event) =>
                        (data.units = Number(event.target.value))
                    }
                    defaultValue={data.units ? data.units.toString() : ""}
                />

                <Form.Label htmlFor="price">Price</Form.Label>
                <Form.Control
                    type="number"
                    id="price"
                    onChange={(event) =>
                        (data.price = Number(event.target.value))
                    }
                    defaultValue={data.price ? data.price.toString() : ""}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { TransactionModal }
