import "./TransactionModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction } from "react"
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
    const initialData = {
        date: new Date().getTime(),
        type: TransactionType.Buy,
    } as TransactionData
    const data: TransactionData = isNew ? initialData : transaction.data

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = (event: any) => {
        event?.preventDefault()
        if (Object.keys(data).length >= 4 && portfolio) {
            const ref = isNew ? undefined : transaction.ref
            const _transaction = { ref, data: data } as Transaction
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
                        selected={new Date(data.date)}
                        onChange={(date) => (data.date = date.getTime())}
                    />

                    <Form.Label>Type</Form.Label>
                    <FormSelect
                        onChange={(event) =>
                            (data.type = event.target.value as TransactionType)
                        }
                        defaultValue={data.type}>
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
                            (data.symbol = event.target.value.toUpperCase())
                        }
                        defaultValue={data.symbol}
                    />

                    <Form.Label>Units</Form.Label>
                    <Form.Control
                        type="number"
                        onChange={(event) =>
                            (data.units = Number(event.target.value))
                        }
                        defaultValue={data.units}
                    />

                    <Form.Label>Price</Form.Label>
                    <Form.Control
                        type="number"
                        onChange={(event) =>
                            (data.price = Number(event.target.value))
                        }
                        defaultValue={data.price}
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
