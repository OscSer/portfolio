import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import FormSelect from "react-bootstrap/FormSelect"
import { Dispatch, SetStateAction } from "react"
import { PortfolioService } from "@services"
import { useUser } from "@hooks"
import { Portfolio, PortfolioData, PortfolioType } from "@domain"

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
    const data = isNew
        ? ({ type: PortfolioType.Cryptocurrencies } as PortfolioData)
        : portfolio.data

    const handleSave = () => {
        if (Object.keys(data).length === 2) {
            const ref = isNew ? undefined : portfolio.ref
            const _portfolio = { ref, data } as Portfolio
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
                <Form.Label htmlFor="type">Type</Form.Label>
                <FormSelect
                    onChange={(event) =>
                        (data.type = event.target.value as PortfolioType)
                    }
                    id="type"
                    defaultValue={data.type}>
                    {Object.keys(PortfolioType).map((key: string) => (
                        <option
                            key={key}
                            value={
                                PortfolioType[key as keyof typeof PortfolioType]
                            }>
                            {key}
                        </option>
                    ))}
                </FormSelect>

                <Form.Label htmlFor="portfolioName">Name</Form.Label>
                <Form.Control
                    type="text"
                    id="portfolioName"
                    onChange={(event) => (data.name = event.target.value)}
                    defaultValue={data.name}
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
