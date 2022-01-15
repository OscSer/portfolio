import "./App.scss"
import { FirebaseService } from "@services"
import { signInWithRedirect, onAuthStateChanged } from "firebase/auth"
import { useEffectOnce } from "react-use"
import { useUser } from "@hooks"
import { Header } from "./Header"
import { Content } from "./Content"
import { Spinner } from "react-bootstrap"

function App(): JSX.Element {
    const [user, setUser] = useUser()
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

    return user ? (
        <div className="app">
            <Header />
            <Content />
        </div>
    ) : (
        <Spinner className="spinner" variant="primary" animation="border" />
    )
}

export { App }
