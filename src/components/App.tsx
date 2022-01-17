import "./App.scss"
import { FirebaseService } from "@services"
import { signInWithRedirect, onAuthStateChanged } from "firebase/auth"
import { useEffectOnce } from "react-use"
import { useUser } from "@hooks"
import { Header } from "./Header"
import { Content } from "./Content"
import { Spinner } from "react-bootstrap"
import { Utils } from "@domain"

function App(): JSX.Element {
    const [user, setUser] = useUser()
    const { auth, provider } = FirebaseService

    useEffectOnce(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
                /* wait for the SymbolMap instance */
                Utils.sleep(1000)
            } else {
                signInWithRedirect(auth, provider)
            }
        })
    })

    return user ? (
        <div className="app" data-testid="app">
            <Header />
            <Content />
        </div>
    ) : (
        <Spinner className="spinner" variant="primary" animation="border" />
    )
}

export { App }
