import "./Content.scss"
import Button from "react-bootstrap/Button"
import DropdownButton from "react-bootstrap/DropdownButton"
import Dropdown from "react-bootstrap/Dropdown"
import { useCallback, useRef, useState } from "react"
import { TransactionModal } from "./TransactionModal"
import { Table } from "./Table"
import { Utils } from "@domain"
import { useBalance } from "@hooks"

function Content(): JSX.Element {
    const [showModal, setShowModal] = useState(false)
    const tableRef = useRef(Utils.getUniqueId())
    const [balance] = useBalance()
    const { priceToString } = Utils

    const handleHide = useCallback(() => {
        tableRef.current = Utils.getUniqueId()
    }, [])

    return (
        <div className="content">
            <div className="content__info">
                <div>
                    <h1>Balance</h1>
                    <div className="content__price">
                        {priceToString(balance)}
                    </div>
                </div>
                <div className="content__actions">
                    <Button onClick={() => setShowModal(true)}>
                        Add Transaction
                    </Button>
                    <DropdownButton title="Settings" variant="outline-primary">
                        <Dropdown.Item
                            onClick={() => console.log("hola mundo")}>
                            Set Weightings
                        </Dropdown.Item>
                    </DropdownButton>
                </div>
            </div>
            <Table key={tableRef.current} />
            <TransactionModal
                show={showModal}
                setShow={setShowModal}
                onHide={handleHide}
            />
        </div>
    )
}

export { Content }
