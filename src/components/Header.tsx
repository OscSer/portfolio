import "./Header.scss"
import { FirebaseService, PortfolioService } from "@services"
import { signOut } from "firebase/auth"
import { usePortfolio, useUser } from "@hooks"
import Button from "react-bootstrap/Button"
import FormSelect from "react-bootstrap/FormSelect"
import { PortfolioModal } from "./PortfolioModal"
import { ChangeEvent, useCallback, useRef, useState } from "react"
import { find } from "lodash"
import { Portfolio } from "@domain"
import { useEffectOnce } from "react-use"
import EditIcon from "@material-ui/icons/Edit"

function Header(): JSX.Element {
    const [user] = useUser()
    const [portfolio, setPortfolio] = usePortfolio()
    const [showModal, setShowModal] = useState(false)
    const [options, setOptions] = useState<JSX.Element[]>([])
    const { auth } = FirebaseService
    const { getAllPortfolios } = PortfolioService
    const portfolios = useRef<Portfolio[]>([])

    const getPortfolios = useCallback(() => {
        getAllPortfolios(user.uid).then((_portfolios) => {
            if (!_portfolios.length) {
                setShowModal(true)
            } else {
                portfolios.current = _portfolios
                const _options: JSX.Element[] = []
                _portfolios.forEach((portfolio) => {
                    const option = (
                        <option
                            key={portfolio.ref}
                            value={portfolio.ref ? portfolio.ref : ""}>
                            {portfolio.data.name}
                        </option>
                    )
                    _options.push(option)
                })
                setOptions([
                    ..._options,
                    <option key={"create"} value={"create"}>
                        + Create Portfolio
                    </option>,
                ])
                setPortfolio(_portfolios[0])
            }
        })
    }, [getAllPortfolios, setPortfolio, user.uid])

    useEffectOnce(() => {
        getPortfolios()
    })

    const handleSignOut = () => {
        signOut(auth)
    }

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        if (value === "create") {
            setPortfolio(undefined)
            setShowModal(true)
        } else {
            setPortfolio(find(portfolios.current, { ref: value }))
        }
    }

    const handleHide = () => {
        getPortfolios()
    }

    return (
        <div className="header">
            <div className="header__portfolio">
                <FormSelect
                    onChange={handleChange}
                    defaultValue={portfolio?.ref ? portfolio.ref : ""}>
                    {options}
                </FormSelect>
                <Button
                    variant="outline-primary"
                    onClick={() => setShowModal(true)}>
                    <EditIcon />
                </Button>
            </div>
            <div className="header__user">
                <span>{user.displayName}</span>
                <Button variant="outline-secondary" onClick={handleSignOut}>
                    SignOut
                </Button>
            </div>
            <PortfolioModal
                show={showModal}
                setShow={setShowModal}
                portfolio={portfolio}
                onHide={handleHide}
            />
        </div>
    )
}

export { Header }
