import "./TransactionModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import FormSelect from "react-bootstrap/FormSelect"
import InputGroup from "react-bootstrap/InputGroup"
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TransactionService } from "@services"
import { usePortfolio, useUser } from "@hooks"
import { Coin, Transaction, TransactionData, TransactionType, Utils } from "@domain"
import { DatePicker } from "./DatePicker"
import { AsyncTypeahead } from "react-bootstrap-typeahead"
import { Option } from "react-bootstrap-typeahead/types/types"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: (shouldUpdate: boolean) => void
    transaction?: Transaction
}

function TransactionModal({ show, setShow, transaction, onHide }: Props): JSX.Element {
    const defaultData = useRef({
        type: TransactionType.Buy,
        units: NaN,
        price: NaN,
    } as TransactionData)
    const isNew = !transaction
    const { saveTransaction } = TransactionService
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [continueAdding, setContinueAdding] = useState<"on" | "off">("off")
    const [data, setData] = useState<TransactionData>(defaultData.current)
    const [selectedCoin, setSelectedCoin] = useState<Coin>()
    const [coinList, setCoinList] = useState<Coin[]>([])
    const shouldUpdate = useRef(false)
    const { priceToString, getMarketDataService } = Utils
    const marketDataService = useMemo(
        () => getMarketDataService(portfolio),
        [getMarketDataService, portfolio]
    )

    useEffect(() => {
        if (isNew) {
            setData({ ...defaultData.current, date: new Date().getTime() })
        } else {
            marketDataService.getSymbol(transaction.data.id).then((coin) => {
                setSelectedCoin(coin)
            })
            setData(transaction.data)
        }
    }, [defaultData, isNew, transaction, show, marketDataService])

    const handleHide = useCallback(() => {
        onHide(shouldUpdate.current)
        setShow(false)
    }, [onHide, setShow])

    const handleSave = useCallback(() => {
        const ref = isNew ? undefined : transaction.ref
        const _transaction: Transaction = { ref, data }
        saveTransaction(user.uid, portfolio, _transaction)
        shouldUpdate.current = true
        if (continueAdding === "on") {
            setData({
                ...defaultData.current,
                date: new Date().getTime(),
            })
            setSelectedCoin(undefined)
        } else {
            handleHide()
        }
    }, [continueAdding, data, handleHide, isNew, portfolio, saveTransaction, transaction, user.uid])

    const labelKey = (option: Option) => {
        const coin = option as Coin
        return `${coin.symbol.toUpperCase()} (${coin.name})`
    }

    const handleSymbolChange = (selected: Option[]) => {
        const coin = selected[0] as Coin
        setSelectedCoin(coin || undefined)
        setData((prev) => ({
            ...prev,
            id: coin?.id || "",
            symbol: coin?.symbol || "",
        }))
    }

    const handleSymbolSearch = (symbol: string) => {
        marketDataService.searchSymbol(symbol).then((_coinList) => {
            setCoinList(_coinList)
        })
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
                                    value={TransactionType[key as keyof typeof TransactionType]}>
                                    {key}
                                </option>
                            ))}
                        </FormSelect>
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Symbol</InputGroup.Text>
                        <AsyncTypeahead
                            id="symbol"
                            selected={selectedCoin ? [selectedCoin] : []}
                            isLoading={false}
                            onSearch={handleSymbolSearch}
                            onChange={handleSymbolChange}
                            labelKey={labelKey}
                            options={coinList}
                            maxResults={5}
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
                            value={isNaN(data.units) ? "" : data.units}
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
                            value={isNaN(data.price) ? "" : data.price}
                        />
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Total</InputGroup.Text>
                        <Form.Control
                            type="text"
                            disabled
                            value={
                                isNaN(data.price) || isNaN(data.units)
                                    ? 0
                                    : priceToString(data.price * data.units)
                            }
                        />
                    </InputGroup>
                </Form>
            </Modal.Body>

            <Modal.Footer className="actions">
                <Form.Check
                    type="switch"
                    label="Continue adding"
                    disabled={!isNew}
                    value={continueAdding}
                    onChange={(e) => setContinueAdding(e.target.value === "on" ? "off" : "on")}
                />
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={
                        Object.keys(data).length < 6 ||
                        isNaN(data.price) ||
                        isNaN(data.units) ||
                        !data.id ||
                        !data.symbol
                    }>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { TransactionModal }
