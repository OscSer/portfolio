import "./ColumnsModal.scss"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import FormControl from "react-bootstrap/FormControl"
import InputGroup from "react-bootstrap/InputGroup"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { usePortfolio, useUser } from "@hooks"
import { PortfolioService } from "@services"
import { CustomColumns, TableData, Utils } from "@domain"
import { useRef } from "react"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: () => void
}

const unavailableColumns: Array<keyof TableData> = ["id", "symbol"]

function ColumnsModal({ show, setShow, onHide }: Props): JSX.Element {
    const { defaultCustomColumns } = Utils
    const defaultColumns = useRef(defaultCustomColumns())
    const [customColumns, setCustomColumns] = useState<CustomColumns>(
        defaultColumns.current
    )
    const [user] = useUser()
    const [portfolio] = usePortfolio()
    const { getCustomColumns, saveCustomColumns } = PortfolioService

    useEffect(() => {
        if (portfolio) {
            getCustomColumns(user.uid, portfolio).then((_customColumns) => {
                if (_customColumns) {
                    const mergeCustomColumns: Record<string, boolean> = {}
                    Object.keys(defaultColumns.current).forEach((key) => {
                        const asKey = key as keyof TableData
                        if (!unavailableColumns.includes(asKey)) {
                            const customValue = _customColumns[asKey]
                            mergeCustomColumns[key] =
                                customValue !== undefined
                                    ? _customColumns[asKey]
                                    : defaultColumns.current[asKey]
                        }
                    })
                    setCustomColumns(mergeCustomColumns as CustomColumns)
                }
            })
        }
    }, [portfolio, user.uid, show, getCustomColumns, defaultColumns])

    const handleSave = () => {
        if (portfolio) {
            saveCustomColumns(user.uid, portfolio, customColumns)
            handleHide()
        }
    }

    const handleHide = () => {
        onHide()
        setShow(false)
    }

    return (
        <Modal show={show} onHide={handleHide} className="columns-modal">
            <Modal.Header closeButton>
                <Modal.Title>Columns</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form className="columns-modal__form">
                    {Object.keys(customColumns)
                        .sort()
                        .map((item) => {
                            const key = item as keyof TableData
                            return (
                                <InputGroup
                                    key={key}
                                    className="columns-modal__group">
                                    <InputGroup.Checkbox
                                        checked={customColumns[key]}
                                        onChange={() => {
                                            customColumns[key] =
                                                !customColumns[key]
                                            setCustomColumns({
                                                ...customColumns,
                                            })
                                        }}
                                    />
                                    <FormControl disabled value={key} />
                                </InputGroup>
                            )
                        })}
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

export { ColumnsModal }
