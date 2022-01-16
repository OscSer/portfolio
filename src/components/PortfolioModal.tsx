import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import { Dispatch, SetStateAction } from "react"
import { PortfolioService } from "@services"
import { useUser } from "@hooks"
import { Portfolio } from "@domain"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: () => void
    portfolio?: Portfolio
}

function PortfolioModal({
    show,
    setShow,
    portfolio,
    onHide,
}: Props): JSX.Element {
    const [user] = useUser()
    const { savePortfolio } = PortfolioService
    const isNew = !portfolio
    let name = isNew ? "" : portfolio.data.name

    const handleSave = () => {
        if (name) {
            const ref = isNew ? undefined : portfolio.ref
            const _portfolio = { ref, data: { name } } as Portfolio
            savePortfolio(user.uid, _portfolio)
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
                <Modal.Title>{isNew ? "Create" : "Edit"} Portfolio</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Label htmlFor="portfolioName">Name</Form.Label>
                <Form.Control
                    type="text"
                    id="portfolioName"
                    onChange={(event) => (name = event.target.value)}
                    defaultValue={name}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { PortfolioModal }
