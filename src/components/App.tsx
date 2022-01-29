import "./App.scss"
import { FirebaseService } from "@services"
import { signInWithRedirect, onAuthStateChanged } from "firebase/auth"
import { useEffectOnce } from "react-use"
import { useLoading, usePortfolio, useUser } from "@hooks"
import { Header } from "./Header"
import { Content } from "./Content"
import { Spinner } from "react-bootstrap"
import { useEffect } from "react"

function App(): JSX.Element {
    const [user, setUser] = useUser()
    const [portfolio] = usePortfolio()
    const [loading] = useLoading()
    const { auth, provider } = FirebaseService

    useEffectOnce(() => {
        onAuthStateChanged(auth, (_user) => {
            if (_user) {
                setUser(_user)
            } else {
                signInWithRedirect(auth, provider)
            }
        })
    })

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) location.reload()
        }, 10000)
        return clearTimeout(timeout)
    }, [loading])

    return (
        <>
            {user ? (
                <div
                    className="app"
                    data-testid="app"
                    style={{
                        display: loading ? "none" : "unset",
                    }}>
                    <div>
                        <Header />
                        {portfolio && <Content />}
                    </div>
                </div>
            ) : null}
            <Spinner
                className="custom-spinner"
                variant="primary"
                animation="border"
                style={{
                    display: loading ? "unset" : "none",
                }}
            />
        </>
    )
}

export { App }
