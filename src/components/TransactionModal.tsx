import "./TransactionModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import FormSelect from "react-bootstrap/FormSelect"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import {
    Coin,
    SymbolMap,
    Transaction,
    TransactionData,
    TransactionType,
} from "@domain"
import { DatePicker } from "./DatePicker"
import { Typeahead } from "react-bootstrap-typeahead"
import { InputGroup } from "react-bootstrap"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: (shouldUpdate: boolean) => void
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
    const continueAdding = useRef(false)
    const isNew = !transaction
    const initialData = useRef({
        type: TransactionType.Buy,
    } as TransactionData)
    const [data, setData] = useState<TransactionData>(initialData.current)
    const coinList = SymbolMap.getInstance().coinList
    const coinMap = SymbolMap.getInstance().coinMap
    const shouldUpdate = useRef(false)

    useEffect(() => {
        if (isNew) {
            setData({ ...initialData.current, date: new Date().getTime() })
        } else {
            setData(transaction.data)
        }
    }, [initialData, isNew, transaction, show])

    const handleSave = () => {
        if (portfolio) {
            const ref = isNew ? undefined : transaction.ref
            const _transaction: Transaction = { ref, data }
            saveTransaction(user.uid, portfolio, _transaction)
            shouldUpdate.current = true
            if (continueAdding.current) {
                setData({
                    ...initialData.current,
                    date: new Date().getTime(),
                })
            } else {
                handleHide()
            }
        }
    }

    const handleHide = () => {
        onHide(shouldUpdate.current)
        setShow(false)
    }

    return (
        <Modal show={show} onHide={handleHide} className="transaction-modal">
            <Modal.Header closeButton>
                <Modal.Title>{isNew ? "Add" : "Edit"} Transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body className="body">
                <Form>
                    <DatePicker
                        selected={data.date ? new Date(data.date) : new Date()}
                        onChange={(date) =>
                            setData((prev) => ({
                                ...prev,
                                date: date.getTime(),
                            }))
                        }
                    />

                    <InputGroup className="custom">
                        <InputGroup.Text>Type</InputGroup.Text>
                        <FormSelect
                            onChange={(event) =>
                                setData((prev) => ({
                                    ...prev,
                                    type: event.target.value as TransactionType,
                                }))
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
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Symbol</InputGroup.Text>
                        <Typeahead
                            selected={data.id ? [coinMap[data.id]] : []}
                            onChange={(selected) => {
                                const coin = selected[0] as Coin
                                if (coin) {
                                    setData((prev) => ({
                                        ...prev,
                                        id: coin.id,
                                        symbol: coin.symbol,
                                    }))
                                }
                            }}
                            labelKey={(option) => {
                                const o = option as Coin
                                return `${o.symbol.toUpperCase()} (${o.name})`
                            }}
                            filterBy={(option, props) => {
                                const o = option as Coin
                                const p = props as { text: string }
                                return o.symbol.startsWith(p.text.toLowerCase())
                            }}
                            options={coinList}
                        />
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Units</InputGroup.Text>
                        <Form.Control
                            type="number"
                            onChange={(event) => {
                                const value = event.target.value
                                setData((prev) => ({
                                    ...prev,
                                    units: value === "" ? NaN : Number(value),
                                }))
                            }}
                            value={data.units === undefined ? "" : data.units}
                        />
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Price</InputGroup.Text>
                        <Form.Control
                            type="number"
                            onChange={(event) => {
                                const value = event.target.value
                                setData((prev) => ({
                                    ...prev,
                                    price: value === "" ? NaN : Number(value),
                                }))
                            }}
                            value={data.price === undefined ? "" : data.price}
                        />
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Total</InputGroup.Text>
                        <Form.Control
                            type="number"
                            disabled
                            value={Number(data.price) * Number(data.units)}
                        />
                    </InputGroup>
                </Form>
            </Modal.Body>

            <Modal.Footer className="actions">
                {isNew ? (
                    <Form.Check
                        type="switch"
                        label="Continue adding"
                        onChange={(e) =>
                            (continueAdding.current = e.target.value === "on")
                        }
                    />
                ) : (
                    <div></div>
                )}
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={
                        Object.keys(data).length < 6 ||
                        isNaN(data.price) ||
                        isNaN(data.units)
                    }>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { TransactionModal }
