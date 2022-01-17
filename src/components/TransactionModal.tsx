import "./TransactionModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import { Transaction, TransactionData, TransactionType } from "@domain"
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
    const dataRef = useRef<TransactionData>(
        isNew
            ? ({ type: TransactionType.Buy } as TransactionData)
            : transaction.data
    )
    const [date, setDate] = useState(
        isNew ? new Date().getTime() : new Date(dataRef.current.date).getTime()
    )

    const handleSave = () => {
        if (Object.keys(dataRef.current).length >= 4 && portfolio) {
            dataRef.current.date = date
            const ref = isNew ? undefined : transaction.ref
            const _transaction = { ref, data: dataRef.current } as Transaction
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
                        (dataRef.current.type = event.target
                            .value as TransactionType)
                    }
                    id="type"
                    defaultValue={dataRef.current.type}>
                    {Object.keys(TransactionType).map((key: string) => (
                        <option
                            key={key}
                            value={
                                TransactionType[
                                    key as keyof typeof TransactionType
                                ]
                            }>
                            {key}
                        </option>
                    ))}
                </FormSelect>

                <Form.Label htmlFor="symbol">Symbol</Form.Label>
                <Form.Control
                    type="text"
                    id="symbol"
                    onChange={(event) =>
                        (dataRef.current.symbol =
                            event.target.value.toUpperCase())
                    }
                    defaultValue={dataRef.current.symbol}
                />

                <Form.Label htmlFor="units">Units</Form.Label>
                <Form.Control
                    type="number"
                    id="units"
                    onChange={(event) =>
                        (dataRef.current.units = Number(event.target.value))
                    }
                    defaultValue={
                        dataRef.current.units
                            ? dataRef.current.units.toString()
                            : ""
                    }
                />

                <Form.Label htmlFor="price">Price</Form.Label>
                <Form.Control
                    type="number"
                    id="price"
                    onChange={(event) =>
                        (dataRef.current.price = Number(event.target.value))
                    }
                    defaultValue={
                        dataRef.current.price
                            ? dataRef.current.price.toString()
                            : ""
                    }
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
