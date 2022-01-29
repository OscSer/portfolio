import "./Content.scss"
import Button from "react-bootstrap/Button"
import DropdownButton from "react-bootstrap/DropdownButton"
import Dropdown from "react-bootstrap/Dropdown"
import { useCallback, useRef, useState } from "react"
import { TransactionModal } from "./TransactionModal"
import { Table } from "./Table"
import { Utils } from "@domain"
import { WeightingsModal } from "./WeightingsModal"
import { ColumnsModal } from "./ColumnsModal"
import { Balance } from "./Balance"

function Content(): JSX.Element {
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [showWeightingsModal, setShowWeightingsModal] = useState(false)
    const [showColumnsModal, setShowColumnsModal] = useState(false)
    const tableRef = useRef(Utils.getUniqueId())

    const handleHide = useCallback((shouldUpdate: boolean) => {
        if (shouldUpdate) {
            tableRef.current = Utils.getUniqueId()
        }
    }, [])

    return (
        <div className="content">
            <div className="content__info">
                <Balance />
                <div className="content__actions">
                    <Button onClick={() => setShowTransactionModal(true)}>Add Transaction</Button>
                    <DropdownButton title="Settings" variant="outline-primary">
                        <Dropdown.Item onClick={() => setShowWeightingsModal(true)}>
                            Set Weightings
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => setShowColumnsModal(true)}>
                            Customize Columns
                        </Dropdown.Item>
                    </DropdownButton>
                </div>
            </div>
            <Table key={tableRef.current} />
            {showTransactionModal && (
                <TransactionModal
                    show={showTransactionModal}
                    setShow={setShowTransactionModal}
                    onHide={handleHide}
                />
            )}
            {showWeightingsModal && (
                <WeightingsModal
                    show={showWeightingsModal}
                    setShow={setShowWeightingsModal}
                    onHide={handleHide}
                />
            )}
            {showColumnsModal && (
                <ColumnsModal
                    show={showColumnsModal}
                    setShow={setShowColumnsModal}
                    onHide={handleHide}
                />
            )}
        </div>
    )
}

export { Content }
