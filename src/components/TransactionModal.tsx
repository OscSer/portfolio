import "./TransactionModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction, useRef } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import { Transaction, TransactionData, TransactionType } from "@domain"
import { FormSelect } from "react-bootstrap"
import { DatePicker } from "./DatePicker"

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
    const { saveTransaction } = TransactionService
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const isNew = !transaction
    const initialState = {
        date: new Date().getTime(),
        type: TransactionType.Buy,
    } as TransactionData
    const dataRef = useRef<TransactionData>(initialState)
    if (isNew) {
        dataRef.current = initialState
    } else {
        dataRef.current = transaction.data
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = (event: any) => {
        event?.preventDefault()
        if (Object.keys(dataRef.current).length >= 4 && portfolio) {
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
                <Form onSubmit={handleSave}>
                    <DatePicker
                        selected={new Date(dataRef.current.date)}
                        onChange={(date) =>
                            (dataRef.current.date = date.getTime())
                        }
                    />

                    <Form.Label>Type</Form.Label>
                    <FormSelect
                        onChange={(event) =>
                            (dataRef.current.type = event.target
                                .value as TransactionType)
                        }
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

                    <Form.Label>Symbol</Form.Label>
                    <Form.Control
                        type="text"
                        onChange={(event) =>
                            (dataRef.current.symbol =
                                event.target.value.toUpperCase())
                        }
                        defaultValue={dataRef.current.symbol}
                    />

                    <Form.Label>Units</Form.Label>
                    <Form.Control
                        type="number"
                        onChange={(event) =>
                            (dataRef.current.units = Number(event.target.value))
                        }
                        defaultValue={dataRef.current.units}
                    />

                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        type="number"
                        onChange={(event) =>
                            (dataRef.current.price = Number(event.target.value))
                        }
                        defaultValue={dataRef.current.price}
                    />
                </Form>
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
