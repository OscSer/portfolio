import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { usePortfolio, useTableData, useUser } from "@hooks"
import { InputGroup } from "react-bootstrap"
import { PortfolioService } from "@services"
import { TableData, Weightings } from "@domain"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: (shouldUpdate: boolean) => void
}

function WeightingsModal({ show, setShow, onHide }: Props): JSX.Element {
    const [weightings, setWeightings] = useState<Weightings>({})
    const [total, setTotal] = useState(0)
    const [data] = useTableData()
    const tableData = useRef(data.tableData)
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const { getWeightings, saveWeightings } = PortfolioService
    const sortedData = useRef<TableData[]>([])

    useEffect(() => {
        getWeightings(user.uid, portfolio).then((_weightings) => {
            const newWeightings: Weightings = {}
            tableData.current.forEach((coin) => {
                const value = _weightings[coin.id]
                if (value) newWeightings[coin.id] = value
            })
            sortedData.current = tableData.current.sort((a: TableData, b: TableData) => {
                const valueA = newWeightings[a.id] || 0
                const valueB = newWeightings[b.id] || 0
                return valueB - valueA
            })
            setWeightings(newWeightings)
        })
    }, [getWeightings, portfolio, user.uid, show])

    useEffect(() => {
        let count = 0
        Object.keys(weightings).forEach((key) => {
            const value = weightings[key]
            count += value || 0
        })
        setTotal(count)
    }, [weightings])

    const handleSave = () => {
        saveWeightings(user.uid, portfolio, weightings)
        handleHide(true)
    }

    const handleHide = (shouldUpdate: boolean) => {
        onHide(shouldUpdate)
        setShow(false)
    }

    return (
        <Modal show={show} onHide={() => handleHide(false)} size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Weightings</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    {sortedData.current.map((item) => (
                        <InputGroup key={item.id} className="custom">
                            <InputGroup.Text>{item.symbol.toUpperCase()}</InputGroup.Text>
                            <Form.Control
                                type="number"
                                onChange={(event) => {
                                    const value = event.target.value
                                    weightings[item.id] = value === "" ? NaN : Number(value)
                                    setWeightings({ ...weightings })
                                }}
                                value={weightings[item.id] || ""}
                            />
                            <InputGroup.Text style={{ width: "auto" }}>%</InputGroup.Text>
                        </InputGroup>
                    ))}
                    <InputGroup className="custom">
                        <InputGroup.Text>Total</InputGroup.Text>
                        <Form.Control
                            disabled
                            type="number"
                            value={total}
                            style={{ color: total > 100 ? "red" : "" }}
                        />
                        <InputGroup.Text style={{ width: "auto" }}>%</InputGroup.Text>
                    </InputGroup>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleSave} disabled={total > 100}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { WeightingsModal }
