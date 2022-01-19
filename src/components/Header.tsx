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
import EditIcon from "@material-ui/icons/Edit"
import AddIcon from "@material-ui/icons/Add"
import ExitToAppIcon from "@material-ui/icons/ExitToApp"

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
                        <option key={portfolio.ref} value={portfolio.ref || ""}>
                            {portfolio.data.name}
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
        const portfolio = find(portfolios.current, { ref })
        window.localStorage.setItem("selectedPortfolio", ref)
        setPortfolio(portfolio)
    }

    const handleModalHide = () => {
        getPortfolios()
    }

    const handlePortfolioEdit = () => {
        setShowModal(true)
    }

    const handlePortfolioAdd = () => {
        setPortfolio(undefined)
        setShowModal(true)
    }

    return (
        <div className="header">
            <div className="header__portfolio">
                <FormSelect
                    onChange={handlePortfolioChange}
                    value={portfolio?.ref || ""}>
                    {options}
                </FormSelect>
                <EditIcon className="icon" onClick={handlePortfolioEdit} />
                <AddIcon
                    className="icon icon-add"
                    onClick={handlePortfolioAdd}
                />
            </div>
            <div className="header__user icon" onClick={handleSignOut}>
                <div className="header__username">{user.displayName}</div>
                <ExitToAppIcon />
            </div>
            <PortfolioModal
                show={showModal}
                setShow={setShowModal}
                portfolio={portfolio}
                onHide={handleModalHide}
            />
        </div>
    )
}

export { Header }
