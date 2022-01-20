import "./App.scss"
import { FirebaseService } from "@services"
import { signInWithRedirect, onAuthStateChanged } from "firebase/auth"
import { useEffectOnce } from "react-use"
import { useLoading, useUser } from "@hooks"
import { Header } from "./Header"
import { Content } from "./Content"
import { Spinner } from "react-bootstrap"

function App(): JSX.Element {
    const [user, setUser] = useUser()
    const [loading] = useLoading()
    const { auth, provider } = FirebaseService

    useEffectOnce(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
            } else {
                signInWithRedirect(auth, provider)
            }
        })
    })

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
                        <Content />
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
