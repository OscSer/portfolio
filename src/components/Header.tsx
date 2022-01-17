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
                        <option
                            key={portfolio.ref}
                            value={portfolio.ref ? portfolio.ref : ""}>
                            {portfolio.data.name}
                        </option>
                    )
                    _options.push(option)
                })
                setOptions(_options)
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
        setPortfolio(find(portfolios.current, { ref: event.target.value }))
    }

    const handleHide = () => {
        getPortfolios()
    }

    const handleEdit = () => {
        setShowModal(true)
    }

    const handleAdd = () => {
        setPortfolio(undefined)
        setShowModal(true)
    }

    return (
        <div className="header">
            <div className="header__portfolio">
                <FormSelect
                    onChange={handleChange}
                    defaultValue={portfolio?.ref ? portfolio.ref : ""}>
                    {options}
                </FormSelect>
                <EditIcon className="icon" onClick={handleEdit} />
                <AddIcon className="icon icon-add" onClick={handleAdd} />
            </div>
            <div className="header__user icon" onClick={handleSignOut}>
                <div className="header__username">{user.displayName}</div>
                <ExitToAppIcon />
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
