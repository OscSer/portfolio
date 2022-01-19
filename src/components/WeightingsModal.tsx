import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { usePortfolio, useTableData, useUser } from "@hooks"
import { InputGroup } from "react-bootstrap"
import { PortfolioService } from "@services"
import { isNumber } from "lodash"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: () => void
}

function WeightingsModal({ show, setShow, onHide }: Props): JSX.Element {
    const [weightings, setWeightings] = useState<Record<string, number>>({})
    const [data] = useTableData()
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const [total, setTotal] = useState(0)
    const { getWeightings, saveWeightings } = PortfolioService

    useEffect(() => {
        if (portfolio) {
            getWeightings(user.uid, portfolio).then((_weightings) => {
                const newWeightings: Record<string, number> = {}
                data.forEach((item) => {
                    const value = _weightings[item.id]
                    if (value) {
                        newWeightings[item.id] = value
                    }
                })
                setWeightings(newWeightings)
            })
        }
    }, [getWeightings, portfolio, user.uid, show, data])

    useEffect(() => {
        let count = 0
        Object.keys(weightings).forEach((key) => {
            const value = weightings[key]
            count += isNumber(value) ? value : 0
        })
        setTotal(count)
    }, [weightings])

    const handleSave = () => {
        if (portfolio) {
            saveWeightings(user.uid, portfolio, weightings)
            handleHide()
        }
    }

    const handleHide = () => {
        onHide()
        setShow(false)
    }

    return (
        <Modal show={show} onHide={handleHide} size="sm">
            <Modal.Header closeButton>
                <Modal.Title>Weightings</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    {data.map((item) => (
                        <InputGroup key={item.id}>
                            <InputGroup.Text>
                                {item.symbol.toUpperCase()}
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                onChange={(event) => {
                                    const value = event.target.value
                                    weightings[item.id] =
                                        value === "" ? NaN : Number(value)
                                    setWeightings({ ...weightings })
                                }}
                                value={weightings[item.id]}
                            />
                            <InputGroup.Text style={{ width: "auto" }}>
                                %
                            </InputGroup.Text>
                        </InputGroup>
                    ))}
                    <InputGroup>
                        <InputGroup.Text>Total</InputGroup.Text>
                        <Form.Control
                            disabled
                            type="number"
                            value={total}
                            style={{ color: total > 100 ? "red" : "" }}
                        />
                        <InputGroup.Text style={{ width: "auto" }}>
                            %
                        </InputGroup.Text>
                    </InputGroup>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={total > 100}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { WeightingsModal }
