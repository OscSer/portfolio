import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import FormSelect from "react-bootstrap/FormSelect"
import { Dispatch, SetStateAction } from "react"
import { PortfolioService } from "@services"
import { useUser } from "@hooks"
import { Portfolio, PortfolioData, PortfolioType } from "@domain"
import { InputGroup } from "react-bootstrap"

type Props = {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    onHide: (shouldUpdate: boolean) => void
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
        const ref = isNew ? undefined : portfolio.ref
        const _portfolio = { ref, data } as Portfolio
        savePortfolio(user.uid, _portfolio)
        handleHide(true)
    }

    const handleHide = (shouldUpdate: boolean) => {
        onHide(shouldUpdate)
        setShow(false)
    }

    return (
        <Modal show={show} onHide={() => handleHide(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{isNew ? "Create" : "Edit"} Portfolio</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <InputGroup className="custom">
                        <InputGroup.Text>Type</InputGroup.Text>
                        <FormSelect
                            onChange={(event) =>
                                (data.type = event.target
                                    .value as PortfolioType)
                            }
                            defaultValue={data.type}>
                            {Object.keys(PortfolioType).map((key: string) => (
                                <option
                                    key={key}
                                    value={
                                        PortfolioType[
                                            key as keyof typeof PortfolioType
                                        ]
                                    }>
                                    {key}
                                </option>
                            ))}
                        </FormSelect>
                    </InputGroup>

                    <InputGroup className="custom">
                        <InputGroup.Text>Name</InputGroup.Text>
                        <Form.Control
                            type="text"
                            onChange={(event) =>
                                (data.name = event.target.value)
                            }
                            defaultValue={data.name}
                        />
                    </InputGroup>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={Object.keys(data).length < 2}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { PortfolioModal }
