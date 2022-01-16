import "./Content.scss"
import Button from "react-bootstrap/Button"
import { useRef, useState } from "react"
import { TransactionModal } from "./TransactionModal"
import { Table } from "./Table"
import { Utils } from "@domain"

function Content(): JSX.Element {
    const [showModal, setShowModal] = useState(false)
    const tableRef = useRef(Utils.getUniqueId())

    return (
        <div className="content">
            <div className="content__actions">
                <div>
                    <h1>Balance</h1>
                    <div className="content__price">
                        ${(1000.5).toLocaleString()}
                    </div>
                </div>
                <div>
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowModal(true)}>
                        Add Transaction
                    </Button>
                </div>
            </div>
            <Table key={tableRef.current} />
            <TransactionModal
                show={showModal}
                setShow={setShowModal}
                onHide={() => (tableRef.current = Utils.getUniqueId())}
            />
        </div>
    )
}

export { Content }
