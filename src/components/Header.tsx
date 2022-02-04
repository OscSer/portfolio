import "./Header.scss"
import { FirebaseService, PortfolioService } from "@services"
import { signOut } from "firebase/auth"
import { usePortfolio, useUser } from "@hooks"
import FormSelect from "react-bootstrap/FormSelect"
import { PortfolioModal } from "./PortfolioModal"
import { ChangeEvent, useCallback, useRef, useState } from "react"
import { find } from "lodash"
import { Portfolio } from "@domain"
import { useEffectOnce } from "react-use"
import ExitToAppIcon from "@material-ui/icons/ExitToApp"
import { Dropdown, DropdownButton } from "react-bootstrap"

function Header(): JSX.Element {
    const [user] = useUser()
    const [portfolio, setPortfolio] = usePortfolio()
    const portfolioRef = useRef<Portfolio>()
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
                _portfolios.forEach((_portfolio) => {
                    const option = (
                        <option key={_portfolio.ref} value={_portfolio.ref || ""}>
                            {_portfolio.data.name}
                        </option>
                    )
                    _options.push(option)
                })
                setOptions(_options)
                const ref = window.localStorage.getItem("selectedPortfolio")
                const _portfolio = find(_portfolios, { ref }) as Portfolio
                setPortfolio(_portfolio || _portfolios[0])
            }
        })
    }, [getAllPortfolios, setPortfolio, user.uid])

    useEffectOnce(() => {
        getPortfolios()
    })

    const handleSignOut = () => {
        signOut(auth)
    }

    const handlePortfolioChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const ref = event.target.value
        const _portfolio = find(portfolios.current, { ref })
        if (_portfolio) {
            window.localStorage.setItem("selectedPortfolio", ref)
            portfolioRef.current = _portfolio
            setPortfolio(_portfolio)
        }
    }

    const handleModalHide = (shouldUpdate: boolean) => {
        shouldUpdate && getPortfolios()
    }

    const handlePortfolioEdit = () => {
        portfolioRef.current = portfolio
        setShowModal(true)
    }

    const handlePortfolioAdd = () => {
        portfolioRef.current = undefined
        setShowModal(true)
    }

    return (
        <div className="header">
            <div className="header__portfolio">
                <FormSelect onChange={handlePortfolioChange} value={portfolio?.ref || ""}>
                    {options}
                </FormSelect>
                <DropdownButton title="" variant="outline-secondary">
                    <Dropdown.Item onClick={handlePortfolioEdit}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={handlePortfolioAdd}>Create</Dropdown.Item>
                </DropdownButton>
            </div>
            <div className="header__user icon" onClick={handleSignOut}>
                <div className="header__username">{user.displayName}</div>
                <ExitToAppIcon />
            </div>
            {showModal ? (
                <PortfolioModal
                    show={showModal}
                    setShow={setShowModal}
                    portfolio={portfolioRef.current}
                    onHide={handleModalHide}
                />
            ) : null}
        </div>
    )
}

export { Header }
